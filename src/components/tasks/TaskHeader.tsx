import React from 'react';
import { Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { appTheme, semanticColors } from '../../theme/app-theme';
import { styles } from './styles/task-header.styles';

interface TaskHeaderProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    progress: number;
    progressPercentage: number;
  };
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.title}>Mis Tareas</Text>
          <Text style={styles.subtitle}>Organiza tus pendientes diarios</Text>
        </View>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeNumber}>{stats.pending}</Text>
          <Text style={styles.badgeLabel}>Pendientes</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>Progreso general</Text>
          <Text style={styles.progressPercent}>{stats.progressPercentage}%</Text>
        </View>
        <ProgressBar
          progress={stats.progress}
          color={stats.progressPercentage === 100 ? semanticColors.success : appTheme.colors.primary}
          style={styles.progressBar}
        />
        <View style={styles.statsRow}>
          <Text style={styles.statItem}>
            Total: <Text style={styles.statBold}>{stats.total}</Text>
          </Text>
          <Text style={styles.statSeparator}>•</Text>
          <Text style={styles.statItem}>
            Completadas: <Text style={[styles.statBold, { color: semanticColors.success }]}>{stats.completed}</Text>
          </Text>
          <Text style={styles.statSeparator}>•</Text>
          <Text style={styles.statItem}>
            Pendientes: <Text style={[styles.statBold, { color: semanticColors.warning }]}>{stats.pending}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
