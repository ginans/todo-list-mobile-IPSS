import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Modal, Portal, SegmentedButtons } from 'react-native-paper';
import { ITask } from '../../core/task/interfaces/task.interface';
import { TaskPriority } from '../../core/task/enums/task-priority.enum';
import { CreateTaskInput } from '../../core/task/types/create-task.type';
import { UpdateTaskInput } from '../../core/task/types/update-task.type';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import { styles } from './styles/task-form-modal.styles';

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
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (visible) {
      if (initialTask) {
        setTitle(initialTask.title);
        setDescription(initialTask.description || '');
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
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título de la tarea es obligatorio.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres.';
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
              : 'Ingresa el título y, si deseas, una descripción adicional.'}
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
