import AsyncStorage from '@react-native-async-storage/async-storage';
import { IUserProfile } from '../../core/auth/interfaces/user-profile.interface';
import { CreateProfileInput } from '../../core/auth/types/create-profile.type';
import { APP_MESSAGES } from '../../constants/messages.constants';

const PROFILES_STORAGE_KEY = '@todo_profiles_v1';
const ACTIVE_PROFILE_KEY = '@todo_active_profile_v1';

const AVATAR_PALETTE = [
  '#8C583A',
  '#3B6E4C',
  '#B86B19',
  '#3A5A78',
  '#7A4B63',
  '#B84030',
];

export const isValidPin = (pin: string): boolean => /^\d{4}$/.test(pin);

export const hashPin = (pin: string, salt: string): string => {
  const raw = `${salt}:${pin}:ipss-notebook-v2`;
  let hash = 5381;
  for (let i = 0; i < raw.length; i += 1) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return `pin_${(hash >>> 0).toString(16).padStart(8, '0')}`;
};

export class ProfileStorageAdapter {
  async getProfiles(): Promise<IUserProfile[]> {
    try {
      const stored = await AsyncStorage.getItem(PROFILES_STORAGE_KEY);
      return stored ? (JSON.parse(stored) as IUserProfile[]) : [];
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

    const id = `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newProfile: IUserProfile = {
      id,
      name: cleanName,
      avatarColor: AVATAR_PALETTE[profiles.length % AVATAR_PALETTE.length],
      pinHash: hashPin(input.pin, id),
      biometricEnabled: Boolean(input.biometricEnabled),
      createdAt: new Date().toISOString(),
    };

    await this.saveProfiles([...profiles, newProfile]);
    return newProfile;
  }

  async verifyPin(profileId: string, pin: string): Promise<boolean> {
    if (!isValidPin(pin)) {
      return false;
    }

    const profiles = await this.getProfiles();
    const profile = profiles.find((item) => item.id === profileId);
    if (!profile) {
      return false;
    }

    return profile.pinHash === hashPin(pin, profile.id);
  }

  async updateBiometricPreference(
    profileId: string,
    enabled: boolean
  ): Promise<IUserProfile | null> {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex((item) => item.id === profileId);
    if (index === -1) {
      return null;
    }

    const updated: IUserProfile = {
      ...profiles[index],
      biometricEnabled: enabled,
    };
    profiles[index] = updated;
    await this.saveProfiles(profiles);
    return updated;
  }

  async getActiveProfileId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
    } catch {
      return null;
    }
  }

  async setActiveProfileId(profileId: string | null): Promise<void> {
    if (!profileId) {
      await AsyncStorage.removeItem(ACTIVE_PROFILE_KEY);
      return;
    }
    await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
  }
}

export const profileStorage = new ProfileStorageAdapter();
