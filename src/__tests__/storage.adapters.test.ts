import crypto from 'node:crypto';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { TaskPriority } from '../core/task/enums/task-priority.enum';
import { TaskStatus } from '../core/task/enums/task-status.enum';
import { ProfileStorageAdapter, isValidPin } from '../infra/storage/profile-storage.adapter';
import { TaskStorageAdapter } from '../infra/storage/task-storage.adapter';
import { TaskAdapterFactory } from '../infra/api/factories/task-adapter.factory';
import { deletePersistedPhoto } from '../infra/device/camera.service';

const mockMemoryStore = new Map<string, string>();
const mockSecureStore = new Map<string, string>();

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockMemoryStore.get(key) ?? null)),
  setItem: jest.fn((key: string, value: string) => {
    mockMemoryStore.set(key, value);
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    mockMemoryStore.delete(key);
    return Promise.resolve();
  }),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_algorithm: string, value: string) =>
    crypto.createHash('sha256').update(value).digest('hex')
  ),
}));

jest.mock('expo-secure-store', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  setItemAsync: jest.fn((key: string, value: string) => {
    mockSecureStore.set(key, value);
    return Promise.resolve();
  }),
  getItemAsync: jest.fn((key: string) => Promise.resolve(mockSecureStore.get(key) ?? null)),
  deleteItemAsync: jest.fn((key: string) => {
    mockSecureStore.delete(key);
    return Promise.resolve();
  }),
}));

jest.mock('../infra/device/camera.service', () => ({
  deletePersistedPhoto: jest.fn(() => Promise.resolve()),
}));

describe('Almacenamiento Local — Perfiles Seguros (SHA-256 + SecureStore) y Tareas Aisladas', () => {
  beforeEach(() => {
    mockMemoryStore.clear();
    mockSecureStore.clear();
    TaskAdapterFactory.resetInstance();
    (Platform as { OS: string }).OS = 'android';
    jest.clearAllMocks();
  });

  describe('Seguridad de perfiles, hashing SHA-256, SecureStore y rate limiting', () => {
    it('debería validar PIN de 4 dígitos, hashearlo con SHA-256 y almacenarlo en SecureStore sin exponer texto plano', async () => {
      expect(isValidPin('1234')).toBe(true);
      expect(isValidPin('12a4')).toBe(false);
      expect(isValidPin('123')).toBe(false);

      const profileAdapter = new ProfileStorageAdapter();
      const profile = await profileAdapter.createProfile({
        name: 'Gina',
        pin: '4321',
        biometricEnabled: true,
      });

      expect(profile.pinHash).toBe('[secure-store]');
      expect(SecureStore.setItemAsync).toHaveBeenCalledTimes(1);
      const storedSecret = Array.from(mockSecureStore.values())[0];
      expect(storedSecret.startsWith('sha256_')).toBe(true);
      expect(storedSecret).not.toContain('4321');

      expect(await profileAdapter.verifyPin(profile.id, '4321')).toBe(true);
      expect(await profileAdapter.verifyPin(profile.id, '0000')).toBe(false);
    });

    it('debería bloquear temporalmente el perfil tras 5 intentos consecutivos de PIN incorrecto', async () => {
      const profileAdapter = new ProfileStorageAdapter();
      const profile = await profileAdapter.createProfile({
        name: 'Gina',
        pin: '4321',
        biometricEnabled: false,
      });

      for (let attempt = 0; attempt < 4; attempt += 1) {
        expect(await profileAdapter.verifyPin(profile.id, '0000')).toBe(false);
      }

      await expect(profileAdapter.verifyPin(profile.id, '0000')).rejects.toThrow(
        /Demasiados intentos fallidos/
      );
      await expect(profileAdapter.verifyPin(profile.id, '4321')).rejects.toThrow(
        /Demasiados intentos fallidos/
      );
    });

    it('debería rechazar la creación de perfiles con nombre duplicado (insensible a mayúsculas)', async () => {
      const profileAdapter = new ProfileStorageAdapter();
      await profileAdapter.createProfile({ name: 'Gina', pin: '1111' });

      await expect(
        profileAdapter.createProfile({ name: 'gina', pin: '2222' })
      ).rejects.toThrow(/Ya existe un perfil/);
    });

    it('debería imponer exclusividad biométrica de 1 solo propietario principal por dispositivo', async () => {
      const profileAdapter = new ProfileStorageAdapter();
      const primary = await profileAdapter.createProfile({
        name: 'Gina',
        pin: '1111',
        biometricEnabled: true,
      });
      const secondary = await profileAdapter.createProfile({
        name: 'Invitado',
        pin: '2222',
        biometricEnabled: true,
      });

      expect(primary.biometricEnabled).toBe(true);
      expect(secondary.biometricEnabled).toBe(false);
    });

    it('debería eliminar fotos físicas en disco, hash en SecureStore y caché de TaskAdapterFactory al borrar un perfil', async () => {
      const profileAdapter = new ProfileStorageAdapter();
      const profile = await profileAdapter.createProfile({
        name: 'Gina',
        pin: '1234',
        biometricEnabled: true,
      });

      const repo = TaskAdapterFactory.getRepository(profile.id);
      await repo.create({
        title: 'Tarea con foto',
        priority: TaskPriority.HIGH,
        photoUri: 'file:///app/documents/task-photos/task-photo-perfil.jpg',
        photoSizeKb: 120,
      });

      const deleted = await profileAdapter.deleteProfile(profile.id);

      expect(deleted).toBe(true);
      expect(deletePersistedPhoto).toHaveBeenCalledWith(
        'file:///app/documents/task-photos/task-photo-perfil.jpg'
      );
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
      expect(await profileAdapter.getProfiles()).toHaveLength(0);

      // Si se solicita de nuevo el repositorio del mismo ID, debe ser una instancia limpia
      const freshRepo = TaskAdapterFactory.getRepository(profile.id);
      expect(await freshRepo.getAll()).toHaveLength(0);
    });
  });

  describe('Aislamiento multiusuario, limpieza de fotos y resiliencia en TaskStorageAdapter', () => {
    it('debería aislar tareas entre perfiles y persistir foto adjunta junto con coordenadas GPS', async () => {
      const repoA = new TaskStorageAdapter('user-a');
      const repoB = new TaskStorageAdapter('user-b');

      const created = await repoA.create({
        title: 'Comprar café',
        description: 'Grano molido',
        priority: TaskPriority.HIGH,
        photoUri: 'file:///app/documents/task-photos/task-photo-1.jpg',
        photoSizeKb: 145,
        location: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 10,
          address: 'Santiago Centro',
          capturedAt: new Date().toISOString(),
        },
      });

      const tasksA = await repoA.getAll();
      const tasksB = await repoB.getAll();

      expect(tasksA).toHaveLength(1);
      expect(tasksA[0].photoUri).toBe(created.photoUri);
      expect(tasksA[0].location?.address).toBe('Santiago Centro');
      expect(tasksB).toHaveLength(0);

      await repoA.update(created.id, { status: TaskStatus.COMPLETED });
      const updated = await repoA.getById(created.id);
      expect(updated?.status).toBe(TaskStatus.COMPLETED);

      await repoA.delete(created.id);
      expect(deletePersistedPhoto).toHaveBeenCalledWith(
        'file:///app/documents/task-photos/task-photo-1.jpg'
      );
      expect(await repoA.getAll()).toHaveLength(0);
    });

    it('debería eliminar la foto anterior del disco cuando una tarea reemplaza o quita su imagen adjunta', async () => {
      const repo = new TaskStorageAdapter('user-photo');
      const created = await repo.create({
        title: 'Revisar factura',
        priority: TaskPriority.MEDIUM,
        photoUri: 'file:///app/documents/task-photos/task-photo-old.jpg',
        photoSizeKb: 95,
      });

      await repo.update(created.id, {
        photoUri: 'file:///app/documents/task-photos/task-photo-new.jpg',
        photoSizeKb: 110,
      });
      expect(deletePersistedPhoto).toHaveBeenCalledWith(
        'file:///app/documents/task-photos/task-photo-old.jpg'
      );

      await repo.update(created.id, { photoUri: null, photoSizeKb: null });
      expect(deletePersistedPhoto).toHaveBeenCalledWith(
        'file:///app/documents/task-photos/task-photo-new.jpg'
      );
      expect((await repo.getById(created.id))?.photoUri).toBeUndefined();
    });

    it('debería propagar el error sin corromper la memoria interna si AsyncStorage.setItem falla', async () => {
      const repo = new TaskStorageAdapter('user-error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('QuotaExceededError'));

      await expect(
        repo.create({ title: 'Tarea que falla al guardar', priority: TaskPriority.LOW })
      ).rejects.toThrow(/No se pudo guardar/);

      expect(await repo.getAll()).toHaveLength(0);
    });
  });
});
