import React, { useState, useEffect } from 'react';
import { Image, Text, View, ScrollView, Pressable } from 'react-native';
import { ActivityIndicator, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ITask } from '../../core/task/interfaces/task.interface';
import { ITaskLocation } from '../../core/task/interfaces/task-location.interface';
import { TaskPriority } from '../../core/task/enums/task-priority.enum';
import { PermissionStatus } from '../../core/device/enums/permission-status.enum';
import { CreateTaskInput } from '../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../core/task/types/update-task.type';
import { captureFromCamera, pickFromGallery } from '../../infra/device/camera.service';
import { formatCoordinates, getCurrentLocation } from '../../infra/device/location.service';
import { APP_MESSAGES } from '../../constants/messages.constants';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { AppPermissionDialog } from '../ui/AppPermissionDialog';
import { paperPalette, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/task-form-modal.styles';

interface TaskFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<boolean>;
  initialTask?: ITask | null;
  loading?: boolean;
}

interface PriorityOption {
  value: TaskPriority;
  label: string;
  color: string;
  activeBg: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  {
    value: TaskPriority.LOW,
    label: 'Baja',
    color: semanticColors.success,
    activeBg: semanticColors.successLight,
  },
  {
    value: TaskPriority.MEDIUM,
    label: 'Media',
    color: semanticColors.warning,
    activeBg: semanticColors.warningLight,
  },
  {
    value: TaskPriority.HIGH,
    label: 'Alta',
    color: semanticColors.danger,
    activeBg: semanticColors.dangerLight,
  },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  visible,
  onDismiss,
  onSubmit,
  initialTask,
  loading = false,
}) => {
  const isEditing = Boolean(initialTask);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoSizeKb, setPhotoSizeKb] = useState<number | null>(null);
  const [location, setLocation] = useState<ITaskLocation | null>(null);

  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [peripheralError, setPeripheralError] = useState<string | null>(null);
  const [permissionAlert, setPermissionAlert] = useState<{
    title: string;
    message: string;
  } | null>(null);
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
        setPriority(initialTask.priority);
        setPhotoUri(initialTask.photoUri ?? null);
        setPhotoSizeKb(initialTask.photoSizeKb ?? null);
        setLocation(initialTask.location ?? null);
      } else {
        setTitle('');
        setDescription('');
        setPriority(TaskPriority.MEDIUM);
        setPhotoUri(null);
        setPhotoSizeKb(null);
        setLocation(null);
      }
      setErrors({});
      setPeripheralError(null);
      setPermissionAlert(null);
    }
  }, [visible, initialTask]);

  const validate = (): boolean => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título de la tarea es obligatorio.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCapturePhoto = async (source: 'camera' | 'gallery') => {
    setPeripheralError(null);
    setIsCapturingPhoto(true);
    try {
      const result =
        source === 'camera' ? await captureFromCamera() : await pickFromGallery();

      if (result.canceled) {
        return;
      }

      if (result.permissionStatus === PermissionStatus.DENIED) {
        setPermissionAlert({
          title: source === 'camera' ? 'Permiso de Cámara' : 'Permiso de Galería',
          message:
            source === 'camera'
              ? APP_MESSAGES.DEVICE.CAMERA_DENIED_DETAIL
              : APP_MESSAGES.DEVICE.GALLERY_DENIED_DETAIL,
        });
        return;
      }

      if (!result.success || !result.data) {
        setPeripheralError(result.error || APP_MESSAGES.DEVICE.CAMERA_ERROR);
        return;
      }

      setPhotoUri(result.data.uri);
      setPhotoSizeKb(result.data.sizeKb);
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const handleCaptureLocation = async () => {
    setPeripheralError(null);
    setIsCapturingLocation(true);
    try {
      const result = await getCurrentLocation();

      if (result.permissionStatus === PermissionStatus.DENIED) {
        setPermissionAlert({
          title: 'Permiso de Ubicación GPS',
          message: APP_MESSAGES.DEVICE.LOCATION_DENIED_DETAIL,
        });
        return;
      }

      if (!result.success || !result.data) {
        setPeripheralError(result.error || APP_MESSAGES.DEVICE.LOCATION_ERROR);
        return;
      }

      setLocation(result.data);
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isEditing) {
      const payload: UpdateTaskInput = {
        title: title.trim(),
        description: description.trim(),
        priority,
        photoUri: photoUri ?? null,
        photoSizeKb: photoSizeKb ?? null,
        location: location ?? null,
      };
      const success = await onSubmit(payload);
      if (success) {
        onDismiss();
      }
      return;
    }

    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim(),
      priority,
      ...(photoUri ? { photoUri } : {}),
      ...(photoSizeKb !== null ? { photoSizeKb } : {}),
      ...(location ? { location } : {}),
    };

    const success = await onSubmit(payload);
    if (success) {
      onDismiss();
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={loading ? undefined : onDismiss}
        contentContainerStyle={styles.modalContainer}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>
            {isEditing ? 'Editar Tarea' : 'Nueva Tarea'}
          </Text>
          <Text style={styles.subtitle}>
            {isEditing
              ? 'Modifica los datos, foto o ubicación de la tarea.'
              : 'Ingresa el título y, si deseas, adjunta descripción, foto o GPS.'}
          </Text>

          <AppInput
            label="Título *"
            placeholder="Ej: Comprar café o revisar pendientes"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors({});
            }}
            error={errors.title}
            maxLength={60}
            disabled={loading}
          />

          <AppInput
            label="Descripción (opcional)"
            placeholder="Detalles sobre lo que debes realizar..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
            maxLength={200}
            disabled={loading}
          />

          <View style={styles.prioritySection}>
            <Text style={styles.sectionLabel}>Prioridad:</Text>
            <View style={styles.priorityRow}>
              {PRIORITY_OPTIONS.map((option) => {
                const isSelected = priority === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setPriority(option.value)}
                    disabled={loading}
                    style={[
                      styles.priorityButton,
                      isSelected && {
                        backgroundColor: option.activeBg,
                        borderColor: option.color,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityButtonText,
                        {
                          color: isSelected
                            ? option.color
                            : paperPalette.inkMedium,
                        },
                        isSelected && styles.priorityButtonTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.peripheralSection}>
            <Text style={styles.sectionLabel}>Foto adjunta (opcional):</Text>
            {photoUri ? (
              <View style={styles.photoPreviewCard}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreviewThumb}
                  resizeMode="cover"
                />
                <View style={styles.photoPreviewMeta}>
                  <Text style={styles.photoPreviewTitle}>Imagen optimizada</Text>
                  <Text style={styles.photoPreviewSub}>
                    {photoSizeKb ? `Peso guardado: ${photoSizeKb} KB` : 'Lista para guardar'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setPhotoUri(null);
                    setPhotoSizeKb(null);
                  }}
                  style={styles.removeChipBtn}
                  accessibilityLabel="Quitar foto adjunta"
                  disabled={loading || isCapturingPhoto}
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={22}
                    color={semanticColors.danger}
                  />
                </Pressable>
              </View>
            ) : (
              <View style={styles.peripheralButtonsRow}>
                <Pressable
                  onPress={() => handleCapturePhoto('camera')}
                  style={styles.peripheralButton}
                  disabled={loading || isCapturingPhoto}
                  accessibilityRole="button"
                >
                  {isCapturingPhoto ? (
                    <ActivityIndicator size="small" color={paperPalette.accentPrimary} />
                  ) : (
                    <MaterialCommunityIcons
                      name="camera-outline"
                      size={18}
                      color={paperPalette.accentPrimary}
                    />
                  )}
                  <Text style={styles.peripheralButtonText}>Tomar Foto</Text>
                </Pressable>

                <Pressable
                  onPress={() => handleCapturePhoto('gallery')}
                  style={styles.peripheralButton}
                  disabled={loading || isCapturingPhoto}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name="image-outline"
                    size={18}
                    color={paperPalette.accentPrimary}
                  />
                  <Text style={styles.peripheralButtonText}>Galería</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.peripheralSection}>
            <Text style={styles.sectionLabel}>Ubicación GPS (opcional):</Text>
            {location ? (
              <View style={styles.locationCard}>
                <MaterialCommunityIcons
                  name="map-marker-check-outline"
                  size={20}
                  color={semanticColors.success}
                />
                <View style={styles.locationMeta}>
                  <Text style={styles.locationAddress} numberOfLines={1}>
                    {location.address || 'Ubicación registrada'}
                  </Text>
                  <Text style={styles.locationCoords}>
                    {formatCoordinates(location.latitude, location.longitude)}
                    {location.accuracy !== null ? ` (±${location.accuracy} m)` : ''}
                  </Text>
                </View>
                <Pressable
                  onPress={handleCaptureLocation}
                  style={styles.removeChipBtn}
                  accessibilityLabel="Actualizar ubicación GPS"
                  disabled={loading || isCapturingLocation}
                >
                  {isCapturingLocation ? (
                    <ActivityIndicator size={16} color={semanticColors.success} />
                  ) : (
                    <MaterialCommunityIcons
                      name="refresh"
                      size={20}
                      color={semanticColors.success}
                    />
                  )}
                </Pressable>
                <Pressable
                  onPress={() => setLocation(null)}
                  style={styles.removeChipBtn}
                  accessibilityLabel="Quitar ubicación GPS"
                  disabled={loading}
                >
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={20}
                    color={semanticColors.danger}
                  />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleCaptureLocation}
                style={styles.peripheralButton}
                disabled={loading || isCapturingLocation}
                accessibilityRole="button"
              >
                {isCapturingLocation ? (
                  <ActivityIndicator size="small" color={semanticColors.success} />
                ) : (
                  <MaterialCommunityIcons
                    name="map-marker-radius-outline"
                    size={18}
                    color={semanticColors.success}
                  />
                )}
                <Text style={styles.peripheralButtonText}>
                  {isCapturingLocation
                    ? 'Obteniendo coordenadas GPS...'
                    : 'Registrar ubicación actual'}
                </Text>
              </Pressable>
            )}
          </View>

          {peripheralError && (
            <Text style={styles.peripheralError}>{peripheralError}</Text>
          )}

          <View style={styles.actionsContainer}>
            <AppButton
              label="Cancelar"
              onPress={onDismiss}
              variant="ghost"
              disabled={loading}
              style={styles.actionButton}
            />
            <AppButton
              label={isEditing ? 'Guardar Cambios' : 'Crear Tarea'}
              onPress={handleSubmit}
              variant="primary"
              loading={loading}
              disabled={loading}
              icon={isEditing ? 'check' : 'plus'}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </Modal>

      <AppPermissionDialog
        visible={Boolean(permissionAlert)}
        title={permissionAlert?.title ?? ''}
        message={permissionAlert?.message ?? ''}
        onDismiss={() => setPermissionAlert(null)}
      />
    </Portal>
  );
};
