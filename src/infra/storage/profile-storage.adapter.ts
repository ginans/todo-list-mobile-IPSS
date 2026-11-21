import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { IUserProfile } from '../../core/auth/interfaces/user-profile.interface';
import { CreateProfileInput } from '../../core/auth/types/create-profile.type';
import { ITask } from '../../core/task/interfaces/task.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';
import { deletePersistedPhoto } from '../device/camera.service';
import { TASKS_STORAGE_BASE_KEY } from './task-storage.adapter';
import { TaskAdapterFactory } from '../api/factories/task-adapter.factory';

const PROFILES_STORAGE_KEY = '@todo_profiles_v1';
const LAST_PROFILE_KEY = '@todo_last_profile_v1';
const SECURE_PIN_PREFIX = 'todo_pin_';
const SECURE_STORE_SENTINEL = '[secure-store]';

const MAX_FAILED_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MS = 30_000;

const AVATAR_PALETTE = [
  '#8C583A',
  '#3B6E4C',
  '#B86B19',
  '#3A5A78',
  '#7A4B63',
  '#B84030',
];

interface IPinAttemptState {
  failures: number;
  lockedUntil: number | null;
}

export const isValidPin = (pin: string): boolean => /^\d{4}$/.test(pin);

const legacyDjb2HashPin = (pin: string, salt: string): string => {
  const raw = `${salt}:${pin}:ipss-notebook-v2`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return `pin_${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export const hashPin = async (pin: string, salt: string): Promise<string> => {
  const raw = `${salt}:${pin}:ipss-notebook-v2`;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    raw
  );
  return `sha256_${digest}`;
};

const canUseSecureStore = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    return false;
  }
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
};

const getSecurePinKey = (profileId: string): string =>
  `${SECURE_PIN_PREFIX}${profileId.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

export class ProfileStorageAdapter {
  private pinAttempts = new Map<string, IPinAttemptState>();

  resetPinAttempts(profileId?: string): void {
    if (profileId) {
      this.pinAttempts.delete(profileId);
      return;
    }
    this.pinAttempts.clear();
  }

  private async storePinHash(profileId: string, pinHash: string): Promise<string> {
    if (await canUseSecureStore()) {
      await SecureStore.setItemAsync(getSecurePinKey(profileId), pinHash);
      return SECURE_STORE_SENTINEL;
    }
    return pinHash;
  }

  private async readPinHash(profile: IUserProfile): Promise<string | null> {
    if (profile.pinHash === SECURE_STORE_SENTINEL) {
      if (!(await canUseSecureStore())) {
        return null;
      }
      return SecureStore.getItemAsync(getSecurePinKey(profile.id));
    }
    return profile.pinHash;
  }

  private async deleteSecurePinHash(profileId: string): Promise<void> {
    if (await canUseSecureStore()) {
      try {
        await SecureStore.deleteItemAsync(getSecurePinKey(profileId));
      } catch {
        // Ignorar si la clave no existía en SecureStore
      }
    }
  }

  async getProfiles(): Promise<IUserProfile[]> {
    try {
      const stored = await AsyncStorage.getItem(PROFILES_STORAGE_KEY);
      if (!stored) return [];
      const parsed = JSON.parse(stored) as IUserProfile[];

      let foundBiometricOwner = false;
      let needsSave = false;
      const normalized = parsed.map((profile) => {
        if (profile.biometricEnabled) {
          if (!foundBiometricOwner) {
            foundBiometricOwner = true;
            return profile;
          }
          needsSave = true;
          return { ...profile, biometricEnabled: false };
        }
        return profile;
      });

      if (needsSave) {
        await this.saveProfiles(normalized);
      }

      return normalized;
    } catch {
      return [];
    }
  }

  private async saveProfiles(profiles: IUserProfile[]): Promise<void> {
    await AsyncStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles));
  }

  async createProfile(input: CreateProfileInput): Promise<IUserProfile> {
    const cleanName = input.name.trim();
    if (cleanName.length < 2) {
      throw new Error(APP_MESSAGES.AUTH.PROFILE_NAME_MIN);
    }

    if (!isValidPin(input.pin)) {
      throw new Error(APP_MESSAGES.AUTH.PIN_INVALID_FORMAT);
    }

    const profiles = await this.getProfiles();
    const duplicate = profiles.some(
      (profile) => profile.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      throw new Error(APP_MESSAGES.AUTH.PROFILE_DUPLICATE);
    }

    // Regla de seguridad multiperfil: solo el propietario principal del dispositivo
    // puede vincular biometría para evitar desbloquear perfiles de terceros con su huella/rostro.
    const hasBiometricOwner = profiles.some((profile) => profile.biometricEnabled);
    const id = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const computedHash = await hashPin(input.pin, id);
    const persistedPinField = await this.storePinHash(id, computedHash);

    const newProfile: IUserProfile = {
      id,
      name: cleanName,
      avatarColor: AVATAR_PALETTE[profiles.length % AVATAR_PALETTE.length],
      pinHash: persistedPinField,
      biometricEnabled: Boolean(input.biometricEnabled) && !hasBiometricOwner,
      createdAt: new Date().toISOString(),
    };

    await this.saveProfiles([...profiles, newProfile]);
    return newProfile;
  }

  async verifyPin(profileId: string, pin: string): Promise<boolean> {
    const now = Date.now();
    const currentAttempts = this.pinAttempts.get(profileId);
    if (currentAttempts?.lockedUntil && currentAttempts.lockedUntil > now) {
      const remainingSeconds = Math.ceil((currentAttempts.lockedUntil - now) / 1000);
      throw new Error(APP_MESSAGES.AUTH.PIN_LOCKED(remainingSeconds));
    }

    if (!isValidPin(pin)) {
      return false;
    }

    const profiles = await this.getProfiles();
    const index = profiles.findIndex((item) => item.id === profileId);
    if (index === -1) {
      return false;
    }

    const profile = profiles[index];
    const storedHash = await this.readPinHash(profile);
    if (!storedHash) {
      return false;
    }

    let isMatch = false;
    if (storedHash.startsWith('pin_')) {
      // Migración transparente desde hash legacy DJB2 hacia SHA-256 + SecureStore
      isMatch = storedHash === legacyDjb2HashPin(pin, profile.id);
      if (isMatch) {
        const upgradedHash = await hashPin(pin, profile.id);
        const persistedPinField = await this.storePinHash(profile.id, upgradedHash);
        const updatedProfiles = [...profiles];
        updatedProfiles[index] = { ...profile, pinHash: persistedPinField };
        await this.saveProfiles(updatedProfiles);
      }
    } else {
      const candidateHash = await hashPin(pin, profile.id);
      isMatch = storedHash === candidateHash;
    }

    if (isMatch) {
      this.pinAttempts.delete(profileId);
      return true;
    }

    const nextFailures = (currentAttempts?.failures ?? 0) + 1;
    if (nextFailures >= MAX_FAILED_PIN_ATTEMPTS) {
      this.pinAttempts.set(profileId, {
        failures: 0,
        lockedUntil: now + PIN_LOCKOUT_MS,
      });
      throw new Error(APP_MESSAGES.AUTH.PIN_LOCKED(Math.ceil(PIN_LOCKOUT_MS / 1000)));
    }

    this.pinAttempts.set(profileId, { failures: nextFailures, lockedUntil: null });
    return false;
  }

  async getLastProfileId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(LAST_PROFILE_KEY);
    } catch {
      return null;
    }
  }

  async setLastProfileId(profileId: string | null): Promise<void> {
    if (!profileId) {
      await AsyncStorage.removeItem(LAST_PROFILE_KEY);
      return;
    }
    await AsyncStorage.setItem(LAST_PROFILE_KEY, profileId);
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    const profiles = await this.getProfiles();
    const filtered = profiles.filter((item) => item.id !== profileId);
    if (filtered.length === profiles.length) {
      return false;
    }

    const tasksStorageKey = `${TASKS_STORAGE_BASE_KEY}_${profileId}`;
    try {
      const rawTasks = await AsyncStorage.getItem(tasksStorageKey);
      if (rawTasks) {
        const parsedTasks = JSON.parse(rawTasks) as ITask[];
        await Promise.all(
          parsedTasks
            .filter((task) => Boolean(task.photoUri))
            .map((task) => deletePersistedPhoto(task.photoUri))
        );
      }
    } catch {
      // Continuar borrado del perfil incluso si los datos de tareas estuvieran corruptos
    }

    await this.saveProfiles(filtered);
    await AsyncStorage.removeItem(tasksStorageKey);
    await this.deleteSecurePinHash(profileId);
    TaskAdapterFactory.evictRepository(profileId);
    this.pinAttempts.delete(profileId);

    const lastId = await this.getLastProfileId();
    if (lastId === profileId) {
      const fallbackId = filtered[0]?.id;
      if (fallbackId) {
        await AsyncStorage.setItem(LAST_PROFILE_KEY, fallbackId);
      } else {
        await AsyncStorage.removeItem(LAST_PROFILE_KEY);
      }
    }

    return true;
  }
}

export const profileStorage = new ProfileStorageAdapter();
