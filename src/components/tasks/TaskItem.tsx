import React from 'react';
import { Image, Text, View, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ITask } from '../../core/task/interfaces/task.interface';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { formatCoordinates } from '../../infra/device/location.service';
import { AppCard } from '../ui/AppCard';
import { AppBadge } from '../ui/AppBadge';
import { appTheme, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/task-item.styles';

interface TaskItemProps {
  task: ITask;
  onToggleStatus: (id: string) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
  onPreviewPhoto?: (uri: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onPreviewPhoto,
}) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const hasDescription = Boolean(task.description?.trim());
  const hasAttachments = Boolean(task.photoUri || task.location);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const locationLabel = task.location
    ? task.location.address
      ? `${task.location.address}${
          task.location.accuracy !== null ? ` (±${task.location.accuracy}m)` : ''
        }`
      : `${formatCoordinates(task.location.latitude, task.location.longitude)}${
          task.location.accuracy !== null ? ` (±${task.location.accuracy}m)` : ''
        }`
    : null;

  return (
    <AppCard
      style={[styles.card, isCompleted && styles.completedCard]}
      contentStyle={styles.cardContent}
    >
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => onToggleStatus(task.id)}
          style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: isCompleted }}
          accessibilityLabel={`Marcar tarea ${task.title} como ${isCompleted ? 'pendiente' : 'completada'}`}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        <View style={styles.titleArea}>
          <Text
            key={`title-${isCompleted}`}
            style={[styles.title, isCompleted && styles.titleCompleted]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.badgeRow}>
            <AppBadge type="status" value={task.status} />
            <View style={styles.badgeSpacer} />
            <AppBadge type="priority" value={task.priority} />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <IconButton
            icon="pencil-outline"
            size={20}
            iconColor={appTheme.colors.primary}
            onPress={() => onEdit(task)}
            accessibilityLabel={`Editar tarea ${task.title}`}
            style={styles.actionButton}
          />
          <IconButton
            icon="trash-can-outline"
            size={20}
            iconColor={semanticColors.danger}
            onPress={() => onDelete(task)}
            accessibilityLabel={`Eliminar tarea ${task.title}`}
            style={styles.actionButton}
          />
        </View>
      </View>

      {hasDescription && (
        <Text
          key={`desc-${isCompleted}`}
          style={[styles.description, isCompleted && styles.descriptionCompleted]}
        >
          {task.description}
        </Text>
      )}

      {hasAttachments && (
        <View style={styles.attachmentsArea}>
          {task.photoUri && (
            <Pressable
              onPress={() => onPreviewPhoto?.(task.photoUri!)}
              style={styles.photoWrapper}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Ver foto de ${task.title}`}
            >
              <Image
                source={{ uri: task.photoUri }}
                style={styles.photoThumb}
                resizeMode="cover"
              />
              {task.photoSizeKb !== undefined && (
                <View style={styles.photoBadgeOverlay}>
                  <MaterialCommunityIcons name="camera" size={11} color="#FFFDF8" />
                  <Text style={styles.photoBadgeText}>{task.photoSizeKb} KB</Text>
                </View>
              )}
            </Pressable>
          )}

          {locationLabel && (
            <View style={styles.locationChip}>
              <MaterialCommunityIcons
                name="map-marker-outline"
                size={14}
                color={semanticColors.success}
              />
              <Text style={styles.locationChipText} numberOfLines={1}>
                {locationLabel}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>Creada: {formatDate(task.createdAt)}</Text>
      </View>
    </AppCard>
  );
};
