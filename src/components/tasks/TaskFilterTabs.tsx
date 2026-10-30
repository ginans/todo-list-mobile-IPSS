import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SegmentedButtons, Searchbar } from 'react-native-paper';
import { TaskFilterType } from '../../core/task/interfaces/task-filter.interface';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { appTheme, semanticColors } from '../../theme/app-theme';

interface TaskFilterTabsProps {
  filter: TaskFilterType;
  onFilterChange: (newFilter: TaskFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    pending: number;
    completed: number;
  };
}

/**
 * Componente: TaskFilterTabs
 * Provee filtrado rápido por estado y búsqueda textual instantánea.
 */
export const TaskFilterTabs: React.FC<TaskFilterTabsProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
}) => {
  return (
    <View style={styles.container}>
      {/* Barra de Búsqueda */}
      <Searchbar
        placeholder="Buscar tarea por título o descripción..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        elevation={0}
      />

      {/* Botones Segmentados de Filtro */}
      <SegmentedButtons
        value={filter}
        onValueChange={(val) => onFilterChange(val as TaskFilterType)}
        buttons={[
          {
            value: 'ALL',
            label: `Todas (${counts.all})`,
            checkedColor: appTheme.colors.primary,
          },
          {
            value: TaskStatus.PENDING,
            label: `Pendientes (${counts.pending})`,
            checkedColor: semanticColors.warning,
          },
          {
            value: TaskStatus.COMPLETED,
            label: `Hechas (${counts.completed})`,
            checkedColor: semanticColors.success,
          },
        ]}
        style={styles.segmented}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchbar: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: semanticColors.border,
    borderRadius: 12,
    marginBottom: 10,
    height: 44,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
  },
  segmented: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 2,
  },
});
