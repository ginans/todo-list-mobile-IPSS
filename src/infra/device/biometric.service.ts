import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import {
  BiometryType,
  IBiometricCapability,
  IPeripheralResult,
} from '../../core/device/interfaces/peripheral-result.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';

const resolveBiometryMeta = (
  types: LocalAuthentication.AuthenticationType[]
): { biometryType: BiometryType; label: string } => {
  const hasFingerprint = types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT);
  const hasFacial = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  const hasIris = types.includes(LocalAuthentication.AuthenticationType.IRIS);

  if (hasFingerprint && hasFacial) {
    return { biometryType: 'fingerprint', label: 'Biometría' };
  }
  if (hasFacial) {
    return {
      biometryType: 'facial',
      label: Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento Facial',
    };
  }
  if (hasFingerprint) {
    return { biometryType: 'fingerprint', label: 'Huella Digital' };
  }
  if (hasIris) {
    return { biometryType: 'iris', label: 'Reconocimiento de Iris' };
  }

  return { biometryType: 'none', label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE };
};

export const getBiometricCapability = async (): Promise<IBiometricCapability> => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      biometryType: 'none',
      label: APP_MESSAGES.AUTH.BIOMETRIC_UNAVAILABLE_WEB,
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const types = hasHardware
      ? await LocalAuthentication.supportedAuthenticationTypesAsync()
      : [];

    const { biometryType, label } = resolveBiometryMeta(types);
    const hasSupportedSensor = hasHardware && biometryType !== 'none';
    const isEnrolled = hasSupportedSensor
      ? await LocalAuthentication.isEnrolledAsync()
      : false;

    return {
      available: hasSupportedSensor && isEnrolled,
      hasHardware: hasSupportedSensor,
      isEnrolled,
      biometryType,
      label,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      biometryType: 'none',
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
        error instanceof Error ? error.message : APP_MESSAGES.AUTH.BIOMETRIC_ERROR,
    };
  }
};
