import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { PermissionStatus } from '../core/device/enums/permission-status.enum';
import {
  checkLocationPermission,
  formatCoordinates,
  getCurrentLocation,
  isValidCoordinates,
} from '../infra/device/location.service';

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-location', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  Accuracy: {
    Balanced: 3,
  },
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  hasServicesEnabledAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  getLastKnownPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
}));

describe('LocationService — Geolocalización GPS, Precisión, Permisos y Tolerancia a Fallos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'android';
    (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(true);
    (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);
  });

  describe('Validación matemática y formateo de coordenadas geográficas', () => {
    it('debería validar rangos geográficos reales y rechazar coordenadas fuera de rango, NaN, Infinity y Null Island (0, 0)', () => {
      expect(isValidCoordinates(-33.4489, -70.6693)).toBe(true);
      expect(isValidCoordinates(90, -180)).toBe(true);
      expect(isValidCoordinates(91, -70.6693)).toBe(false);
      expect(isValidCoordinates(-33.4489, 181)).toBe(false);
      expect(isValidCoordinates(Number.NaN, -70.6693)).toBe(false);
      expect(isValidCoordinates(Number.POSITIVE_INFINITY, -70.6693)).toBe(false);
      expect(isValidCoordinates(0, 0)).toBe(false);
    });

    it('debería formatear latitud y longitud a 4 decimales de precisión (~11 m)', () => {
      expect(formatCoordinates(-33.4488897, -70.6692655)).toBe('-33.4489, -70.6693');
    });
  });

  describe('Permisos de ubicación y verificación de servicios del sistema', () => {
    it('debería consultar correctamente el estado actual del permiso de ubicación en primer plano', async () => {
      (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });

      expect(await checkLocationPermission()).toBe(PermissionStatus.GRANTED);
    });

    it('debería retornar DENIED con canAskAgain=false y no invocar el GPS cuando el permiso fue rechazado permanentemente', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.DENIED,
        canAskAgain: false,
      });

      const result = await getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.DENIED);
      expect(result.canAskAgain).toBe(false);
      expect(Location.hasServicesEnabledAsync).not.toHaveBeenCalled();
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('debería informar de inmediato cuando el usuario tiene el switch de GPS apagado en el dispositivo', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
        canAskAgain: true,
      });
      (Location.hasServicesEnabledAsync as jest.Mock).mockResolvedValue(false);

      const result = await getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.GRANTED);
      expect(result.error).toContain('desactivada');
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });
  });

  describe('Estrategia Fresh-Cache-First, precisión, geocodificación offline y timeout', () => {
    it('debería responder instantáneamente usando la última lectura reciente en caché (<= 2 min) sin bloquear el formulario', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValueOnce({
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 18.4,
        },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        { street: 'Alameda', streetNumber: '1000', district: 'Santiago' },
      ]);

      const result = await getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data?.accuracy).toBe(18);
      expect(result.data?.address).toBe('Alameda 1000, Santiago');
      expect(Location.getCurrentPositionAsync).not.toHaveBeenCalled();
    });

    it('debería capturar coordenadas GPS en vivo, redondear precisión en metros y resolver dirección legible', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: -33.4372,
          longitude: -70.6506,
          accuracy: 11.6,
        },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([
        {
          street: 'Av. Providencia',
          streetNumber: '1234',
          district: 'Providencia',
          region: 'Región Metropolitana',
        },
      ]);

      const result = await getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data?.latitude).toBe(-33.4372);
      expect(result.data?.longitude).toBe(-70.6506);
      expect(result.data?.accuracy).toBe(12);
      expect(result.data?.address).toBe('Av. Providencia 1234, Providencia');
    });

    it('debería conservar coordenadas y precisión cuando la geocodificación inversa falla sin conexión a internet', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: -33.4489,
          longitude: -70.6693,
          accuracy: 8.2,
        },
      });
      (Location.reverseGeocodeAsync as jest.Mock).mockRejectedValue(
        new Error('Sin conexión')
      );

      const result = await getCurrentLocation();

      expect(result.success).toBe(true);
      expect(result.data?.address).toBeUndefined();
      expect(result.data?.accuracy).toBe(8);
    });

    it('debería hacer fallback a la última ubicación conocida si el GPS en vivo excede el timeout de 5 segundos', async () => {
      jest.useFakeTimers();
      try {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
          status: Location.PermissionStatus.GRANTED,
        });
        // 1ra llamada (fresh cache): null; 2da llamada (fallback tras timeout): ubicación válida
        (Location.getLastKnownPositionAsync as jest.Mock)
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            coords: {
              latitude: -33.45,
              longitude: -70.67,
              accuracy: 35,
            },
          });
        (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
          () => new Promise(() => undefined)
        );
        (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([]);

        const locationPromise = getCurrentLocation();
        await jest.advanceTimersByTimeAsync(5100);
        const result = await locationPromise;

        expect(result.success).toBe(true);
        expect(result.data?.latitude).toBe(-33.45);
        expect(result.data?.accuracy).toBe(35);
      } finally {
        jest.useRealTimers();
      }
    });

    it('debería retornar error de timeout cuando el GPS no responde en 5 segundos y tampoco existe ubicación en caché', async () => {
      jest.useFakeTimers();
      try {
        (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
          status: Location.PermissionStatus.GRANTED,
        });
        (Location.getLastKnownPositionAsync as jest.Mock).mockResolvedValue(null);
        (Location.getCurrentPositionAsync as jest.Mock).mockImplementation(
          () => new Promise(() => undefined)
        );

        const locationPromise = getCurrentLocation();
        await jest.advanceTimersByTimeAsync(5100);
        const result = await locationPromise;

        expect(result.success).toBe(false);
        expect(result.error).toContain('tardó demasiado');
      } finally {
        jest.useRealTimers();
      }
    });

    it('debería rechazar lecturas GPS corruptas con coordenadas fuera de rango geográfico', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: Location.PermissionStatus.GRANTED,
      });
      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
        coords: {
          latitude: 120.5,
          longitude: -70.6693,
          accuracy: 5,
        },
      });

      const result = await getCurrentLocation();

      expect(result.success).toBe(false);
      expect(result.error).toContain('no son válidas');
    });
  });
});
