import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { appTheme, semanticColors } from '../../theme/app-theme';
import { AppButton } from '../ui/AppButton';

interface TaskEmptyStateProps {
  hasFilters: boolean;
  onClearFilters?: () => void;
  onAddTask?: () => void;
}

/**
 * Componente: TaskEmptyState
 * Estado vacío amigable e ilustrativo para guiar al usuario
 * cuando no existen tareas creadas o cuando un filtro no arroja resultados.
 */
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: semanticColors.mutedText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
  },
});
