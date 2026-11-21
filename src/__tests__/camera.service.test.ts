import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { PermissionStatus } from '../core/device/enums/permission-status.enum';
import {
  captureFromCamera,
  checkCameraPermission,
  deletePersistedPhoto,
  optimizeAndPersistImage,
  pickFromGallery,
} from '../infra/device/camera.service';

const mockCopy = jest.fn().mockResolvedValue(undefined);
const mockDelete = jest.fn();
const mockDirCreate = jest.fn();

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-image-picker', () => ({
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
    UNDETERMINED: 'undetermined',
  },
  getCameraPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg', PNG: 'png' },
  manipulateAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => ({
  Paths: { document: { uri: 'file:///app/documents' } },
  Directory: jest.fn().mockImplementation(() => ({
    exists: false,
    create: mockDirCreate,
  })),
  File: jest.fn().mockImplementation((...args: unknown[]) => {
    const uri =
      args.length === 1
        ? String(args[0])
        : `file:///app/documents/task-photos/${String(args[1])}`;
    return {
      uri,
      exists: true,
      size: 184320,
      copy: mockCopy,
      delete: mockDelete,
    };
  }),
}));

describe('CameraService — Cámara, Galería, Permisos y Optimización de Imágenes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Platform as { OS: string }).OS = 'android';
  });

  describe('Gestión de permisos de cámara y galería', () => {
    it('debería retornar GRANTED al verificar que el permiso de cámara ya fue concedido', async () => {
      (ImagePicker.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });

      const status = await checkCameraPermission();
      expect(status).toBe(PermissionStatus.GRANTED);
    });

    it('debería bloquear la apertura de cámara y propagar canAskAgain=false cuando el permiso está denegado permanentemente', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.DENIED,
        canAskAgain: false,
      });

      const result = await captureFromCamera();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.DENIED);
      expect(result.canAskAgain).toBe(false);
      expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    });

    it('debería bloquear el acceso a la galería y propagar canAskAgain=true tras un rechazo temporal', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.DENIED,
        canAskAgain: true,
      });

      const result = await pickFromGallery();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.DENIED);
      expect(result.canAskAgain).toBe(true);
      expect(ImagePicker.launchImageLibraryAsync).not.toHaveBeenCalled();
    });
  });

  describe('Optimización, compresión única y persistencia física', () => {
    it('debería redimensionar imágenes pesadas (> 1080px), comprimir a JPEG 70%, guardar en task-photos y eliminar el archivo temporal', async () => {
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/optimized.jpg',
        width: 1080,
        height: 1440,
      });

      const optimized = await optimizeAndPersistImage('file:///camera/raw-15mb.jpg', 4000);

      expect(manipulateAsync).toHaveBeenCalledWith(
        'file:///camera/raw-15mb.jpg',
        [{ resize: { width: 1080 } }],
        expect.objectContaining({
          compress: 0.7,
          format: SaveFormat.JPEG,
        })
      );
      expect(mockDirCreate).toHaveBeenCalledWith({ idempotent: true });
      expect(mockCopy).toHaveBeenCalledTimes(1);
      expect(mockDelete).toHaveBeenCalledTimes(1);
      expect(mockCopy.mock.invocationCallOrder[0]).toBeLessThan(
        mockDelete.mock.invocationCallOrder[0]
      );
      expect(optimized.uri).toContain('task-photos/task-photo-');
      expect(optimized.sizeKb).toBe(180);
    });

    it('debería evitar upscaling (sin acción resize) cuando la imagen original ya tiene ancho <= 1080px', async () => {
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/small.jpg',
        width: 800,
        height: 600,
      });

      const optimized = await optimizeAndPersistImage('file:///camera/small.jpg', 800);

      expect(manipulateAsync).toHaveBeenCalledWith(
        'file:///camera/small.jpg',
        [],
        expect.objectContaining({
          compress: 0.7,
          format: SaveFormat.JPEG,
        })
      );
      expect(optimized.width).toBe(800);
      expect(optimized.height).toBe(600);
    });

    it('debería persistir un Data URI base64 en plataforma Web para sobrevivir recargas del navegador', async () => {
      (Platform as { OS: string }).OS = 'web';
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'blob:http://localhost:8081/temp-blob',
        width: 640,
        height: 480,
        base64: 'AAAA'.repeat(1024),
      });

      const optimized = await optimizeAndPersistImage('blob:http://localhost:8081/raw', 640);

      expect(optimized.uri.startsWith('data:image/jpeg;base64,')).toBe(true);
      expect(optimized.sizeKb).toBeGreaterThanOrEqual(1);
      expect(mockCopy).not.toHaveBeenCalled();
    });
  });

  describe('Captura desde cámara, selección en galería y limpieza segura', () => {
    it('debería capturar foto con cámara nativa sin doble compresión (quality: 1) ni recorte forzado', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
        canAskAgain: true,
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [{ uri: 'file:///camera/shot.jpg', width: 3000, height: 4000 }],
      });
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/shot-opt.jpg',
        width: 1080,
        height: 1440,
      });

      const result = await captureFromCamera();

      expect(ImagePicker.launchCameraAsync).toHaveBeenCalledWith(
        expect.objectContaining({ allowsEditing: false, quality: 1 })
      );
      expect(result.success).toBe(true);
      expect(result.data?.sizeKb).toBe(180);
      expect(result.data?.width).toBe(1080);
    });

    it('debería seleccionar y optimizar correctamente una imagen existente desde la galería', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
        canAskAgain: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///gallery/boleta-cafe.png',
            fileName: 'boleta-cafe.png',
            width: 2000,
            height: 1500,
          },
        ],
      });
      (manipulateAsync as jest.Mock).mockResolvedValue({
        uri: 'file:///cache/doc-opt.jpg',
        width: 1080,
        height: 810,
      });

      const result = await pickFromGallery();

      expect(result.success).toBe(true);
      expect(result.data?.uri).toContain('task-photos/task-photo-');
      expect(result.data?.fileName).toBe('boleta-cafe.png');
      expect(result.data?.width).toBe(1080);
    });

    it('debería rechazar imágenes que superen el límite máximo de 15 MB antes de procesarlas para evitar desbordamiento de memoria', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
        canAskAgain: true,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'file:///gallery/archivo-gigante.png',
            fileName: 'archivo-gigante.png',
            fileSize: 800 * 1024 * 1024,
            width: 8000,
            height: 6000,
          },
        ],
      });

      const result = await pickFromGallery();

      expect(result.success).toBe(false);
      expect(result.error).toContain('15 MB');
      expect(manipulateAsync).not.toHaveBeenCalled();
    });

    it('debería marcar canceled=true cuando el usuario cierra la galería sin elegir imagen', async () => {
      (ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });
      (ImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await pickFromGallery();

      expect(result.success).toBe(false);
      expect(result.canceled).toBe(true);
    });

    it('debería retornar UNAVAILABLE con el mensaje de error si el módulo nativo de cámara lanza una excepción', async () => {
      (ImagePicker.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
      });
      (ImagePicker.launchCameraAsync as jest.Mock).mockRejectedValue(
        new Error('Cámara no disponible en emulador')
      );

      const result = await captureFromCamera();

      expect(result.success).toBe(false);
      expect(result.permissionStatus).toBe(PermissionStatus.UNAVAILABLE);
      expect(result.error).toBe('Cámara no disponible en emulador');
    });

    it('debería eliminar únicamente archivos dentro del directorio administrado task-photos/', async () => {
      await deletePersistedPhoto('file:///app/documents/task-photos/task-photo-123.jpg');
      expect(mockDelete).toHaveBeenCalledTimes(1);

      mockDelete.mockClear();
      await deletePersistedPhoto('file:///external/other-photo.jpg');
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
