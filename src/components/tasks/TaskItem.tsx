import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { IconButton } from 'react-native-paper';
import { ITask } from '../../core/task/interfaces/task.interface';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { AppCard } from '../ui/AppCard';
import { AppBadge } from '../ui/AppBadge';
import { appTheme, semanticColors } from '../../theme/app-theme';

interface TaskItemProps {
  task: ITask;
  onToggleStatus: (id: string) => void;
  onEdit: (task: ITask) => void;
  onDelete: (task: ITask) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
}) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;

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

      <Text style={[styles.description, isCompleted && styles.descriptionCompleted]}>
        {task.description}
      </Text>

      <View style={styles.footerRow}>
        <Text style={styles.dateText}>Creada: {formatDate(task.createdAt)}</Text>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
  },
  completedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  cardContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: semanticColors.mutedText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: semanticColors.success,
    borderColor: semanticColors.success,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  titleArea: {
    flex: 1,
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: semanticColors.mutedText,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeSpacer: {
    width: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    width: 34,
    height: 34,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 38,
    marginBottom: 8,
  },
  descriptionCompleted: {
    color: '#94A3B8',
  },
  footerRow: {
    marginLeft: 38,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
