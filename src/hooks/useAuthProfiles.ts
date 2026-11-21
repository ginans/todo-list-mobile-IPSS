import { useState, useEffect, useCallback } from 'react';
import { IUserProfile } from '../core/auth/interfaces/user-profile.interface';
import { CreateProfileInput } from '../core/auth/types/create-profile.type';
import { IBiometricCapability } from '../core/device/interfaces/peripheral-result.interface';
import { profileStorage } from '../infra/storage/profile-storage.adapter';
import {
  authenticateWithBiometrics,
  getBiometricCapability,
} from '../infra/device/biometric.service';
import { APP_MESSAGES } from '../constants/messages.constants';

export const useAuthProfiles = () => {
  const [profiles, setProfiles] = useState<IUserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<IUserProfile | null>(null);
  const [lastProfileId, setLastProfileId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [biometricCapability, setBiometricCapability] = useState<IBiometricCapability>({
    available: false,
    hasHardware: false,
    isEnrolled: false,
    biometryType: 'none',
    label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE,
  });

  const initializeAuth = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const [storedProfiles, capability, savedLastId] = await Promise.all([
        profileStorage.getProfiles(),
        getBiometricCapability(),
        profileStorage.getLastProfileId(),
      ]);

      setProfiles(storedProfiles);
      setBiometricCapability(capability);
      // Por seguridad, al abrir la app no se restaura sesión automáticamente:
      // se preselecciona el último perfil y se exige PIN o biometría.
      setLastProfileId(savedLastId ?? storedProfiles[0]?.id ?? null);
      setActiveProfile(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const createProfile = useCallback(async (input: CreateProfileInput): Promise<boolean> => {
    setAuthError(null);
    try {
      const created = await profileStorage.createProfile(input);
      await profileStorage.setLastProfileId(created.id);
      setProfiles((prev) => [...prev, created]);
      setActiveProfile(created);
      setLastProfileId(created.id);
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : APP_MESSAGES.AUTH.PIN_INVALID_FORMAT);
      return false;
    }
  }, []);

  const unlockWithPin = useCallback(
    async (profileId: string, pin: string): Promise<boolean> => {
      setAuthError(null);
      try {
        const isValid = await profileStorage.verifyPin(profileId, pin);
        if (!isValid) {
          setAuthError(APP_MESSAGES.AUTH.PIN_INCORRECT);
          return false;
        }
      } catch (err) {
        setAuthError(err instanceof Error ? err.message : APP_MESSAGES.AUTH.PIN_INCORRECT);
        return false;
      }

      const target = profiles.find((p) => p.id === profileId) || null;
      if (!target) {
        return false;
      }

      await profileStorage.setLastProfileId(target.id);
      setActiveProfile(target);
      setLastProfileId(target.id);
      return true;
    },
    [profiles]
  );

  const unlockWithBiometrics = useCallback(async (profile: IUserProfile): Promise<boolean> => {
    setAuthError(null);
    const result = await authenticateWithBiometrics(
      `${APP_MESSAGES.AUTH.BIOMETRIC_PROMPT} (${profile.name})`
    );

    if (!result.success) {
      if (!result.canceled && result.error) {
        setAuthError(result.error);
      }
      return false;
    }

    await profileStorage.setLastProfileId(profile.id);
    setActiveProfile(profile);
    setLastProfileId(profile.id);
    return true;
  }, []);

  const deleteProfile = useCallback(
    async (profileId: string): Promise<boolean> => {
      setAuthError(null);
      const deleted = await profileStorage.deleteProfile(profileId);
      if (!deleted) return false;

      const remaining = profiles.filter((p) => p.id !== profileId);
      setProfiles(remaining);

      if (activeProfile?.id === profileId) {
        setActiveProfile(null);
      }
      if (lastProfileId === profileId) {
        setLastProfileId(remaining[0]?.id ?? null);
      }

      return true;
    },
    [profiles, activeProfile, lastProfileId]
  );

  const logout = useCallback(async () => {
    setActiveProfile(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    profiles,
    activeProfile,
    lastProfileId,
    isAuthLoading,
    authError,
    biometricCapability,
    createProfile,
    unlockWithPin,
    unlockWithBiometrics,
    deleteProfile,
    logout,
    clearAuthError,
  };
};
