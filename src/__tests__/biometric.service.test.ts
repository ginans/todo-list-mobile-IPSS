import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { PermissionStatus } from '../core/device/enums/permission-status.enum';
import {
  authenticateWithBiometrics,
  getBiometricCapability,
} from '../infra/device/biometric.service';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-local-authentication', () => ({
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

describe('BiometricService — Autenticación Biométrica (Huella Digital y Reconocimiento Facial)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'android';
  });

  describe('Detección de hardware y capacidades del dispositivo', () => {
    it('debería detectar Huella Digital disponible cuando el dispositivo Android tiene sensor y biometría registrada', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const capability = await getBiometricCapability();

      expect(capability.available).toBe(true);
      expect(capability.hasHardware).toBe(true);
      expect(capability.isEnrolled).toBe(true);
      expect(capability.biometryType).toBe('fingerprint');
      expect(capability.label).toBe('Huella Digital');
    });

    it('debería detectar Face ID disponible cuando el dispositivo iOS expone reconocimiento facial', async () => {
      (Platform as { OS: string }).OS = 'ios';
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const capability = await getBiometricCapability();

      expect(capability.available).toBe(true);
      expect(capability.biometryType).toBe('facial');
      expect(capability.label).toBe('Face ID');
    });

    it('debería detectar Reconocimiento Facial en dispositivos Android con biometría facial', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const capability = await getBiometricCapability();

      expect(capability.available).toBe(true);
      expect(capability.biometryType).toBe('facial');
      expect(capability.label).toBe('Reconocimiento Facial');
    });

    it('debería deshabilitar la biometría en plataforma Web sin invocar módulos nativos', async () => {
      (Platform as { OS: string }).OS = 'web';

      const capability = await getBiometricCapability();

      expect(capability.available).toBe(false);
      expect(capability.biometryType).toBe('none');
      expect(LocalAuthentication.hasHardwareAsync).not.toHaveBeenCalled();
    });

    it('debería informar hardware presente pero no disponible cuando el usuario no tiene biometría registrada en el SO', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const capability = await getBiometricCapability();

      expect(capability.available).toBe(false);
      expect(capability.hasHardware).toBe(true);
      expect(capability.isEnrolled).toBe(false);
    });
  });

  describe('Flujo de autenticación y tolerancia a fallos', () => {
    it('debería conceder acceso (GRANTED) cuando el sensor biométrico valida correctamente al usuario', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(true);
      expect(result.permissionStatus).toBe(PermissionStatus.GRANTED);
      expect(result.data).toBe(true);
    });

    it('debería retornar UNAVAILABLE con mensaje claro cuando el dispositivo no posee hardware biométrico', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.UNAVAILABLE);
      expect(result.error).toContain('no cuenta con sensor biométrico');
      expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled();
    });

    it('debería retornar UNAVAILABLE solicitando registro cuando hay sensor pero sin biometría enrollada', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.UNAVAILABLE);
      expect(result.error).toContain('No hay datos biométricos registrados');
    });

    it('debería marcar canceled=true cuando el usuario cancela manualmente el prompt biométrico', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.canceled).toBe(true);
      expect(result.permissionStatus).toBe(PermissionStatus.DENIED);
    });

    it('debería retornar DENIED con canceled=false cuando la biometría no coincide', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({
        success: false,
        error: 'authentication_failed',
      });

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.canceled).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.DENIED);
    });

    it('debería capturar excepciones inesperadas del módulo nativo sin derribar la aplicación', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.supportedAuthenticationTypesAsync as jest.Mock).mockResolvedValue([
        LocalAuthentication.AuthenticationType.FINGERPRINT,
      ]);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Hardware ocupado')
      );

      const result = await authenticateWithBiometrics();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.UNAVAILABLE);
      expect(result.error).toBe('Hardware ocupado');
    });
  });
});
