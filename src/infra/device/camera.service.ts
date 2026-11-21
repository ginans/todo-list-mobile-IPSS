import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Directory, File, Paths } from 'expo-file-system';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import {
  IPeripheralResult,
  IPhotoCaptureData,
} from '../../core/device/interfaces/peripheral-result.interface';
import { APP_MESSAGES } from '../../constants/messages.constants';

const MAX_IMAGE_WIDTH = 1080;
const JPEG_COMPRESSION = 0.7;
const PHOTOS_DIR_NAME = 'task-photos';
export const MAX_IMAGE_SIZE_MB = 15;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const UUID_FILENAME_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i;

const resolveSourceSizeBytes = (uri: string, assetFileSize?: number): number | null => {
  if (typeof assetFileSize === 'number' && assetFileSize > 0) {
    return assetFileSize;
  }
  if (Platform.OS !== 'web') {
    try {
      const file = new File(uri);
      if (typeof file.size === 'number' && file.size > 0) {
        return file.size;
      }
    } catch {
      return null;
    }
  }
  return null;
};

export const validateImageSize = (
  uri: string,
  assetFileSize?: number
): { valid: boolean; error?: string } => {
  const sizeBytes = resolveSourceSizeBytes(uri, assetFileSize);
  if (sizeBytes !== null && sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: APP_MESSAGES.DEVICE.IMAGE_TOO_LARGE(MAX_IMAGE_SIZE_MB),
    };
  }
  return { valid: true };
};

const buildFriendlyPhotoName = (): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `Foto_${pad(now.getDate())}-${pad(now.getMonth() + 1)}_${pad(now.getHours())}-${pad(now.getMinutes())}.jpg`;
};

const extractFileNameFromUri = (uri?: string | null): string | null => {
  if (!uri || uri.startsWith('data:') || uri.startsWith('blob:')) {
    return null;
  }
  const clean = uri.split('?')[0];
  const segment = clean.split('/').pop()?.trim();
  if (!segment) return null;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

export const getPhotoDisplayName = (
  photoName?: string | null,
  photoUri?: string | null
): string => {
  const candidate = photoName?.trim();
  if (candidate && !UUID_FILENAME_REGEX.test(candidate)) {
    return candidate;
  }
  const fromUri = extractFileNameFromUri(photoUri);
  if (fromUri && !UUID_FILENAME_REGEX.test(fromUri)) {
    return fromUri;
  }
  return buildFriendlyPhotoName();
};

interface IPermissionDetail {
  status: PermissionStatus;
  canAskAgain: boolean;
}

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
  // En navegador web expo-image-picker delega la selección a <input type="file">,
  // controlado directamente por el usuario sin diálogo de permisos de SO.
  if (Platform.OS === 'web') {
    return PermissionStatus.GRANTED;
  }
  const { status } = await ImagePicker.getCameraPermissionsAsync();
  return mapExpoPermission(status);
};

const requestCameraPermissionDetail = async (): Promise<IPermissionDetail> => {
  if (Platform.OS === 'web') {
    return { status: PermissionStatus.GRANTED, canAskAgain: true };
  }
  const response = await ImagePicker.requestCameraPermissionsAsync();
  return {
    status: mapExpoPermission(response.status),
    canAskAgain: response.canAskAgain ?? true,
  };
};

const requestMediaLibraryPermissionDetail = async (): Promise<IPermissionDetail> => {
  if (Platform.OS === 'web') {
    return { status: PermissionStatus.GRANTED, canAskAgain: true };
  }
  const response = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return {
    status: mapExpoPermission(response.status),
    canAskAgain: response.canAskAgain ?? true,
  };
};

export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  const { status } = await requestCameraPermissionDetail();
  return status;
};

export const requestMediaLibraryPermission = async (): Promise<PermissionStatus> => {
  const { status } = await requestMediaLibraryPermissionDetail();
  return status;
};

export const optimizeAndPersistImage = async (
  sourceUri: string,
  originalWidth?: number,
  originalFileName?: string | null
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

  const displayFileName = getPhotoDisplayName(originalFileName, sourceUri);

  if (Platform.OS === 'web') {
    const estimatedBytes = manipulated.base64
      ? Math.round((manipulated.base64.length * 3) / 4)
      : 0;
    const persistentWebUri = manipulated.base64
      ? `data:image/jpeg;base64,${manipulated.base64}`
      : manipulated.uri;

    return {
      uri: persistentWebUri,
      fileName: displayFileName,
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
  await sourceFile.copy(destinationFile);

  const sizeBytes = destinationFile.size ?? 0;

  try {
    if (sourceFile.exists && sourceFile.uri !== destinationFile.uri) {
      sourceFile.delete();
    }
  } catch {
    // Limpieza best-effort del archivo temporal generado por ImageManipulator
  }

  return {
    uri: destinationFile.uri,
    fileName: displayFileName,
    width: manipulated.width,
    height: manipulated.height,
    sizeKb: Math.max(1, Math.round(sizeBytes / 1024)),
  };
};

export const captureFromCamera = async (): Promise<IPeripheralResult<IPhotoCaptureData>> => {
  try {
    const { status: permissionStatus, canAskAgain } = await requestCameraPermissionDetail();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        canAskAgain,
        error: APP_MESSAGES.DEVICE.CAMERA_DENIED,
      };
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        permissionStatus,
        canceled: true,
      };
    }

    const asset = result.assets[0];
    const sizeCheck = validateImageSize(asset.uri, asset.fileSize);
    if (!sizeCheck.valid) {
      return {
        success: false,
        permissionStatus,
        error: sizeCheck.error,
      };
    }

    const optimized = await optimizeAndPersistImage(asset.uri, asset.width, asset.fileName);

    return {
      success: true,
      permissionStatus,
      data: optimized,
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: error instanceof Error ? error.message : APP_MESSAGES.DEVICE.CAMERA_ERROR,
    };
  }
};

export const pickFromGallery = async (): Promise<IPeripheralResult<IPhotoCaptureData>> => {
  try {
    const { status: permissionStatus, canAskAgain } =
      await requestMediaLibraryPermissionDetail();
    if (permissionStatus !== PermissionStatus.GRANTED) {
      return {
        success: false,
        permissionStatus,
        canAskAgain,
        error: APP_MESSAGES.DEVICE.GALLERY_DENIED,
      };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.[0]) {
      return {
        success: false,
        permissionStatus,
        canceled: true,
      };
    }

    const asset = result.assets[0];
    const sizeCheck = validateImageSize(asset.uri, asset.fileSize);
    if (!sizeCheck.valid) {
      return {
        success: false,
        permissionStatus,
        error: sizeCheck.error,
      };
    }

    const optimized = await optimizeAndPersistImage(asset.uri, asset.width, asset.fileName);

    return {
      success: true,
      permissionStatus,
      data: optimized,
    };
  } catch (error) {
    return {
      success: false,
      permissionStatus: PermissionStatus.UNAVAILABLE,
      error: error instanceof Error ? error.message : APP_MESSAGES.DEVICE.GALLERY_ERROR,
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
