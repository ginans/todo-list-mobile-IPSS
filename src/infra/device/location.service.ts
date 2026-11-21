import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import { IPeripheralResult } from '../../core/device/interfaces/peripheral-result.interface';
import { ITaskLocation } from '../../core/task/interfaces/task-location.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';

const GPS_TIMEOUT_MS = 5000;
const FRESH_CACHE_MAX_AGE_MS = 120_000;
const FRESH_CACHE_MAX_ACCURACY_M = 200;
const FALLBACK_CACHE_MAX_AGE_MS = 600_000;

interface ILocationPermissionDetail {
  status: PermissionStatus;
  canAskAgain: boolean;
}

const mapExpoLocationPermission = (status: Location.PermissionStatus): PermissionStatus => {
  if (status === Location.PermissionStatus.GRANTED) {
    return PermissionStatus.GRANTED;
  }
  if (status === Location.PermissionStatus.DENIED) {
    return PermissionStatus.DENIED;
  }
  return PermissionStatus.UNDETERMINED;
};

export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    !(latitude === 0 && longitude === 0) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

export const formatCoordinates = (latitude: number, longitude: number): string => {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
};

export const checkLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return mapExpoLocationPermission(status);
  } catch {
    return PermissionStatus.UNAVAILABLE;
  }
};

const requestLocationPermissionDetail = async (): Promise<ILocationPermissionDetail> => {
  try {
    const response = await Location.requestForegroundPermissionsAsync();
    return {
      status: mapExpoLocationPermission(response.status),
      canAskAgain: response.canAskAgain ?? true,
    };
  } catch {
    return { status: PermissionStatus.UNAVAILABLE, canAskAgain: false };
  }
};

export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  const { status } = await requestLocationPermissionDetail();
  return status;
};

const resolveReadableAddress = async (
  latitude: number,
  longitude: number
): Promise<string | undefined> => {
  if (Platform.OS === 'web') {
    return undefined;
  }

  try {
    const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
    const first = geocoded?.[0];
    if (!first) {
      return undefined;
    }

    const parts = [
      first.street && first.streetNumber
        ? `${first.street} ${first.streetNumber}`
        : first.street,
      first.district || first.city || first.subregion,
      first.region,
    ].filter((part): part is string => Boolean(part && part.trim()));

    const uniqueParts = Array.from(new Set(parts));
    return uniqueParts.length > 0 ? uniqueParts.slice(0, 2).join(', ') : undefined;
  } catch {
    return undefined;
  }
};

const fetchPositionFastOrTimeout = async (): Promise<Location.LocationObject | null> => {
  // Estrategia Fresh-Cache-First en nativo: si el SO ya posee una lectura reciente y precisa
  // (<= 2 min y <= 200 m), responde en milisegundos sin hacer esperar al usuario en el formulario.
  if (Platform.OS !== 'web') {
    try {
      const freshCached = await Location.getLastKnownPositionAsync({
        maxAge: FRESH_CACHE_MAX_AGE_MS,
        requiredAccuracy: FRESH_CACHE_MAX_ACCURACY_M,
      });
      if (freshCached) {
        return freshCached;
      }
    } catch {
      // Continuar hacia lectura activa si falla la consulta de caché
    }
  }

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), GPS_TIMEOUT_MS);
  });

  try {
    const current = await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }),
      timeoutPromise,
    ]);

    if (current) {
      return current;
    }

    if (Platform.OS !== 'web') {
      return await Location.getLastKnownPositionAsync({
        maxAge: FALLBACK_CACHE_MAX_AGE_MS,
      });
    }

    return null;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

export const getCurrentLocation = async (): Promise<IPeripheralResult<ITaskLocation>> => {
  try {
    const { status: permissionStatus, canAskAgain } =
      await requestLocationPermissionDetail();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        canAskAgain,
        error: APP_MESSAGES.DEVICE.LOCATION_DENIED,
      };
    }

    if (Platform.OS !== 'web') {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        return {
          success: false,
          permissionStatus,
          error: APP_MESSAGES.DEVICE.LOCATION_SERVICES_DISABLED,
        };
      }
    }

    const position = await fetchPositionFastOrTimeout();
    if (!position) {
      return {
        success: false,
        permissionStatus,
        error: APP_MESSAGES.DEVICE.LOCATION_TIMEOUT,
      };
    }

    const { latitude, longitude, accuracy } = position.coords;
    if (!isValidCoordinates(latitude, longitude)) {
      return {
        success: false,
        permissionStatus,
        error: APP_MESSAGES.DEVICE.LOCATION_INVALID_COORDS,
      };
    }

    const address = await resolveReadableAddress(latitude, longitude);

    return {
      success: true,
      permissionStatus,
      data: {
        latitude,
        longitude,
        accuracy: accuracy !== null && accuracy !== undefined ? Math.round(accuracy) : null,
        address,
        capturedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error:
        error instanceof Error
          ? error.message
          : APP_MESSAGES.DEVICE.LOCATION_ERROR,
    };
  }
};
