import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import {
  IPeripheralResult,
  IPhotoCaptureData,
} from '../../core/device/interfaces/peripheral-result.interface';

const MAX_IMAGE_WIDTH = 1080;
const JPEG_COMPRESSION = 0.7;
const PHOTOS_DIR_NAME = 'task-photos';

const mapExpoPermission = (status: ImagePicker.PermissionStatus): PermissionStatus => {
  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return PermissionStatus.GRANTED;
  }
  if (status === ImagePicker.PermissionStatus.DENIED) {
    return PermissionStatus.DENIED;
  }
  return PermissionStatus.UNDETERMINED;
};

export const checkCameraPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    return PermissionStatus.GRANTED;
  }
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return mapExpoPermission(status);
};

export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    return PermissionStatus.GRANTED;
  }
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  return mapExpoPermission(status);
};

export const requestMediaLibraryPermission = async (): Promise<PermissionStatus> => {
  if (Platform.OS === 'web') {
    return PermissionStatus.GRANTED;
  }
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return mapExpoPermission(status);
};

export const optimizeAndPersistImage = async (
  sourceUri: string,
  originalWidth?: number
): Promise<IPhotoCaptureData> => {
  const actions =
    !originalWidth || originalWidth > MAX_IMAGE_WIDTH
      ? [{ resize: { width: MAX_IMAGE_WIDTH } }]
      : [];

  const manipulated = await manipulateAsync(sourceUri, actions, {
    compress: JPEG_COMPRESSION,
    format: SaveFormat.JPEG,
    base64: Platform.OS === 'web',
  });

  if (Platform.OS === 'web') {
    const estimatedBytes = manipulated.base64
      ? Math.round((manipulated.base64.length * 3) / 4)
      : 0;
    return {
      uri: manipulated.uri,
      width: manipulated.width,
      height: manipulated.height,
      sizeKb: Math.max(1, Math.round(estimatedBytes / 1024)),
    };
  }

  const photosDir = new Directory(Paths.document, PHOTOS_DIR_NAME);
  if (!photosDir.exists) {
    photosDir.create({ idempotent: true });
  }

  const fileName = `task-photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}.jpg`;
  const sourceFile = new File(manipulated.uri);
  const destinationFile = new File(photosDir, fileName);
  sourceFile.copy(destinationFile);

  const sizeBytes = destinationFile.size ?? 0;

  return {
    uri: destinationFile.uri,
    width: manipulated.width,
    height: manipulated.height,
    sizeKb: Math.max(1, Math.round(sizeBytes / 1024)),
  };
};

export const captureFromCamera = async (): Promise<IPeripheralResult<IPhotoCaptureData>> => {
  try {
    const permissionStatus = await requestCameraPermission();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        error: 'Permiso de cámara denegado.',
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        permissionStatus,
        canceled: true,
      };
    }

    const asset = result.assets[0];
    const optimized = await optimizeAndPersistImage(asset.uri, asset.width);

    return {
      success: true,
      permissionStatus,
      data: optimized,
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: error instanceof Error ? error.message : 'No se pudo acceder a la cámara.',
    };
  }
};

export const pickFromGallery = async (): Promise<IPeripheralResult<IPhotoCaptureData>> => {
  try {
    const permissionStatus = await requestMediaLibraryPermission();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        error: 'Permiso de galería denegado.',
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        permissionStatus,
        canceled: true,
      };
    }

    const asset = result.assets[0];
    const optimized = await optimizeAndPersistImage(asset.uri, asset.width);

    return {
      success: true,
      permissionStatus,
      data: optimized,
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: error instanceof Error ? error.message : 'No se pudo abrir la galería.',
    };
  }
};

export const deletePersistedPhoto = async (photoUri?: string | null): Promise<void> => {
  if (!photoUri || Platform.OS === 'web') {
    return;
  }

  try {
    if (!photoUri.includes(PHOTOS_DIR_NAME)) {
      return;
    }
    const file = new File(photoUri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.warn('[CameraService] No se pudo eliminar la imagen local:', error);
  }
};
