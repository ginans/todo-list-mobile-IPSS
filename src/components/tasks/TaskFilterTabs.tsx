import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TaskFilterType } from '../../core/task/interfaces/task-filter.interface';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { appTheme, paperPalette, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/task-filter-tabs.styles';

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
      activeBg: paperPalette.accentPrimaryLight,
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
        placeholderTextColor={paperPalette.inkMuted}
        iconColor={paperPalette.inkMedium}
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
                  { color: isActive ? option.activeColor : paperPalette.inkMedium },
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
