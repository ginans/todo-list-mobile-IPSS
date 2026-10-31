import React from 'react';
import { Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { appTheme } from '../../theme/app-theme';
import { AppButton } from '../ui/AppButton';
import { styles } from './styles/task-empty-state.styles';

interface TaskEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddTask?: () => void;
}

export const TaskEmptyState: React.FC<TaskEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
  onAddTask,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <IconButton
          icon={hasFilters ? 'filter-variant-remove' : 'clipboard-text-outline'}
          size={36}
          iconColor={appTheme.colors.primary}
        />
      </View>
      <Text style={styles.title}>
        {hasFilters
          ? 'No se encontraron tareas'
          : '¡Aún no tienes tareas pendientes!'}
      </Text>
      <Text style={styles.description}>
        {hasFilters
          ? 'Intenta cambiar el filtro o el término de búsqueda para ver más resultados.'
          : 'Comienza agregando tu primera tarea con el botón inferior para organizar tu jornada.'}
      </Text>

      {hasFilters && onClearFilters ? (
        <AppButton
          label="Limpiar Filtros"
          variant="outline"
          onPress={onClearFilters}
          style={styles.actionButton}
          compact
        />
      ) : onAddTask ? (
        <AppButton
          label="Crear Primera Tarea"
          variant="primary"
          icon="plus"
          onPress={onAddTask}
          style={styles.actionButton}
          compact
        />
      ) : null}
    </View>
  );
};
