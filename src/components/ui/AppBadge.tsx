import React from 'react';
import { StyleSheet, Text, View, ViewStyle, StyleProp } from 'react-native';
import { TaskStatus } from '../../core/task/enums/task-status.enum';
import { TaskPriority } from '../../core/task/enums/task-priority.enum';
import { semanticColors } from '../../theme/app-theme';

type BadgeType = 'status' | 'priority' | 'custom';

interface AppBadgeProps {
  type?: BadgeType;
  value: TaskStatus | TaskPriority | string;
  label?: string;
  colorScheme?: 'success' | 'warning' | 'danger' | 'info' | 'muted';
  style?: StyleProp<ViewStyle>;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  value,
  label,
  colorScheme,
  style,
}) => {
  const getBadgeConfig = () => {
    if (value === TaskStatus.COMPLETED) {
      return {
        bg: semanticColors.successLight,
        text: semanticColors.success,
        displayText: label || 'Completada',
      };
    }
    if (value === TaskStatus.PENDING) {
      return {
        bg: semanticColors.warningLight,
        text: semanticColors.warning,
        displayText: label || 'Pendiente',
      };
    }
    if (value === TaskPriority.HIGH) {
      return {
        bg: semanticColors.dangerLight,
        text: semanticColors.danger,
        displayText: label || 'Alta',
      };
    }
    if (value === TaskPriority.MEDIUM) {
      return {
        bg: semanticColors.infoLight,
        text: semanticColors.info,
        displayText: label || 'Media',
      };
    }
    if (value === TaskPriority.LOW) {
      return {
        bg: '#F1F5F9',
        text: semanticColors.mutedText,
        displayText: label || 'Baja',
      };
    }

    switch (colorScheme) {
      case 'success':
        return { bg: semanticColors.successLight, text: semanticColors.success, displayText: label || String(value) };
      case 'danger':
        return { bg: semanticColors.dangerLight, text: semanticColors.danger, displayText: label || String(value) };
      case 'warning':
        return { bg: semanticColors.warningLight, text: semanticColors.warning, displayText: label || String(value) };
      case 'info':
        return { bg: semanticColors.infoLight, text: semanticColors.info, displayText: label || String(value) };
      default:
        return { bg: '#F1F5F9', text: semanticColors.mutedText, displayText: label || String(value) };
    }
  };

  const { bg, text, displayText } = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color: text }]}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
});
