import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { Modal, Portal, SegmentedButtons } from 'react-native-paper';
import { ITask } from '../../core/task/interfaces/task.interface';
import { TaskPriority } from '../../core/task/enums/task-priority.enum';
import { CreateTaskInput } from '../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../core/task/types/update-task.type';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { semanticColors } from '../../theme/app-theme';

interface TaskFormModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<boolean>;
  initialTask?: ITask | null;
  loading?: boolean;
}

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
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description);
        setPriority(initialTask.priority);
      } else {
        setTitle('');
        setDescription('');
        setPriority(TaskPriority.MEDIUM);
      }
      setErrors({});
    }
  }, [visible, initialTask]);

  const validate = (): boolean => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título de la tarea es obligatorio.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres.';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria.';
    } else if (description.trim().length < 5) {
      newErrors.description = 'La descripción debe tener al menos 5 caracteres.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: CreateTaskInput = {
      title: title.trim(),
      description: description.trim(),
      priority,
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
              ? 'Modifica los datos de la tarea seleccionada.'
              : 'Ingresa el título y descripción para agregarla a tu lista.'}
          </Text>

          <AppInput
            label="Título *"
            placeholder="Ej: Comprar café o revisar pendientes"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            maxLength={60}
            disabled={loading}
          />

          <AppInput
            label="Descripción *"
            placeholder="Detalles sobre lo que debes realizar..."
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
            }}
            error={errors.description}
            multiline
            numberOfLines={3}
            maxLength={200}
            disabled={loading}
          />

          <View style={styles.prioritySection}>
            <Text style={styles.priorityLabel}>Prioridad:</Text>
            <SegmentedButtons
              value={priority}
              onValueChange={(val) => setPriority(val as TaskPriority)}
              buttons={[
                { value: TaskPriority.LOW, label: 'Baja' },
                { value: TaskPriority.MEDIUM, label: 'Media' },
                { value: TaskPriority.HIGH, label: 'Alta' },
              ]}
              style={styles.segmented}
            />
          </View>

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
              icon={isEditing ? 'check' : 'plus'}
              style={styles.actionButton}
            />
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 13,
    color: semanticColors.mutedText,
    marginTop: 4,
    marginBottom: 12,
  },
  prioritySection: {
    marginVertical: 10,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  segmented: {
    backgroundColor: '#F8FAFC',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  actionButton: {
    minWidth: 110,
  },
});
