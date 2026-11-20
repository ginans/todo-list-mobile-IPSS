import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import {
  IBiometricCapability,
  IPeripheralResult,
} from '../../core/device/interfaces/peripheral-result.interface';

export const getBiometricCapability = async (): Promise<IBiometricCapability> => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: 'No disponible en Web',
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = hasHardware ? await LocalAuthentication.isEnrolledAsync() : false;
    const types = hasHardware
      ? await LocalAuthentication.supportedAuthenticationTypesAsync()
      : [];

    let label = 'Biometría';
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      label = Platform.OS === 'ios' ? 'Face ID' : 'Reconocimiento Facial';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      label = Platform.OS === 'ios' ? 'Touch ID' : 'Huella Digital';
    }

    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      label,
    };
  } catch {
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      label: 'No disponible',
    };
  }
};

export const authenticateWithBiometrics = async (
  promptMessage = 'Desbloquea tu cuaderno de tareas'
): Promise<IPeripheralResult<boolean>> => {
  const capability = await getBiometricCapability();
  if (!capability.available) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: capability.hasHardware
        ? 'No hay huellas ni rostro registrados en el dispositivo.'
        : 'Este dispositivo no cuenta con sensor biométrico.',
    };
  }

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Usar PIN',
      fallbackLabel: 'Usar PIN',
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
      error: 'Autenticación biométrica cancelada o no reconocida.',
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error:
        error instanceof Error
          ? error.message
          : 'Error al invocar el sensor biométrico.',
    };
  }
};
