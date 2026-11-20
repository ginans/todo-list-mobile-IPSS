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
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [biometricCapability, setBiometricCapability] = useState<IBiometricCapability>({
    available: false,
    hasHardware: false,
    isEnrolled: false,
    label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE,
  });

  const initializeAuth = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const [storedProfiles, capability, savedActiveId] = await Promise.all([
        profileStorage.getProfiles(),
        getBiometricCapability(),
        profileStorage.getActiveProfileId(),
      ]);

      setProfiles(storedProfiles);
      setBiometricCapability(capability);

      if (savedActiveId) {
        const found = storedProfiles.find((p) => p.id === savedActiveId) || null;
        setActiveProfile(found);
      }
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
      await profileStorage.setActiveProfileId(created.id);
      setProfiles((prev) => [...prev, created]);
      setActiveProfile(created);
      return true;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : APP_MESSAGES.AUTH.PIN_INVALID_FORMAT);
      return false;
    }
  }, []);

  const unlockWithPin = useCallback(
    async (profileId: string, pin: string): Promise<boolean> => {
      setAuthError(null);
      const isValid = await profileStorage.verifyPin(profileId, pin);
      if (!isValid) {
        setAuthError(APP_MESSAGES.AUTH.PIN_INCORRECT);
        return false;
      }

      const target = profiles.find((p) => p.id === profileId) || null;
      if (!target) {
        return false;
      }

      await profileStorage.setActiveProfileId(target.id);
      setActiveProfile(target);
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

    await profileStorage.setActiveProfileId(profile.id);
    setActiveProfile(profile);
    return true;
  }, []);

  const logout = useCallback(async () => {
    await profileStorage.setActiveProfileId(null);
    setActiveProfile(null);
    setAuthError(null);
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  return {
    profiles,
    activeProfile,
    isAuthLoading,
    authError,
    biometricCapability,
    createProfile,
    unlockWithPin,
    unlockWithBiometrics,
    logout,
    clearAuthError,
  };
};
