import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

interface FilterOption {
  value: TaskFilterType;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  activeColor: string;
  activeBg: string;
}

export const TaskFilterTabs: React.FC<TaskFilterTabsProps> = ({
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
}) => {
  const options: FilterOption[] = [
    {
      value: 'ALL',
      label: 'Todas',
      icon: 'format-list-bulleted',
      activeColor: appTheme.colors.primary,
      activeBg: '#DBEAFE',
    },
    {
      value: TaskStatus.PENDING,
      label: 'Pendientes',
      icon: 'clock-outline',
      activeColor: semanticColors.warning,
      activeBg: semanticColors.warningLight,
    },
    {
      value: TaskStatus.COMPLETED,
      label: 'Hechas',
      icon: 'check-circle-outline',
      activeColor: semanticColors.success,
      activeBg: semanticColors.successLight,
    },
  ];

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar tarea por título o descripción..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        elevation={0}
      />

      <View style={styles.tabsRow}>
        {options.map((option) => {
          const isActive = filter === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onFilterChange(option.value)}
              style={[
                styles.tabButton,
                isActive && {
                  backgroundColor: option.activeBg,
                  borderColor: option.activeColor,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={option.icon}
                size={16}
                color={option.activeColor}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? option.activeColor : '#334155' },
                  isActive && styles.tabLabelActive,
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
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
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: semanticColors.border,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
