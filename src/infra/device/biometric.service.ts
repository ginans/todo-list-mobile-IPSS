import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import {
  IBiometricCapability,
  IPeripheralResult,
} from '../../core/device/interfaces/peripheral-result.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';

export const getBiometricCapability = async (): Promise<IBiometricCapability> => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE_WEB,
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const types = hasHardware
      ? await LocalAuthentication.supportedAuthenticationTypesAsync()
      : [];
    const hasFingerprint = types.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT
    );
    const isEnrolled = hasFingerprint
      ? await LocalAuthentication.isEnrolledAsync()
      : false;

    return {
      available: hasFingerprint && isEnrolled,
      hasHardware: hasFingerprint,
      isEnrolled,
      label: hasFingerprint ? 'Huella Digital' : APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE,
    };
  }
};

export const authenticateWithBiometrics = async (
  promptMessage: string = APP_MESSAGES.AUTH.BIOMETRIC_PROMPT
): Promise<IPeripheralResult<boolean>> => {
  const capability = await getBiometricCapability();
  if (!capability.available) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: capability.hasHardware
        ? APP_MESSAGES.AUTH.BIOMETRIC_NOT_ENROLLED
        : APP_MESSAGES.AUTH.BIOMETRIC_NO_HARDWARE,
    };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: APP_MESSAGES.AUTH.BIOMETRIC_CANCEL,
      fallbackLabel: APP_MESSAGES.AUTH.BIOMETRIC_CANCEL,
      disableDeviceFallback: true,
    });

    if (result.success) {
      return {
        success: true,
        permissionStatus: PermissionStatus.GRANTED,
        data: true,
      };
    }

    return {
      success: false,
      permissionStatus: PermissionStatus.DENIED,
      canceled: result.error === 'user_cancel' || result.error === 'system_cancel',
      error: APP_MESSAGES.AUTH.BIOMETRIC_FAILED,
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error:
        error instanceof Error
          ? error.message
          : APP_MESSAGES.AUTH.BIOMETRIC_ERROR,
    };
  }
};
