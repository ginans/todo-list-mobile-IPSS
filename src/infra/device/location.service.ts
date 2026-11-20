import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import { IPeripheralResult } from '../../core/device/interfaces/peripheral-result.interface';
import { ITaskLocation } from '../../core/task/interfaces/task-location.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';

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
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
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

export const requestLocationPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return mapExpoLocationPermission(status);
  } catch {
    return PermissionStatus.UNAVAILABLE;
  }
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

export const getCurrentLocation = async (): Promise<IPeripheralResult<ITaskLocation>> => {
  try {
    const permissionStatus = await requestLocationPermission();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        error: APP_MESSAGES.DEVICE.LOCATION_DENIED,
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

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
