import React from 'react';
import { Text, View } from 'react-native';
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
        <Text style={styles.title}>Mis Tareas</Text>
        <Text style={styles.subtitle}>Organiza tus pendientes diarios</Text>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>Progreso general</Text>
          <Text style={styles.progressPercent}>{stats.progressPercentage}%</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.progressPercentage}%`,
                backgroundColor:
                  stats.progressPercentage === 100
                    ? semanticColors.success
                    : appTheme.colors.primary,
              },
            ]}
          />
        </View>

        <View style={styles.statsBoxesRow}>
          <View style={[styles.statBox, styles.statBoxTotal]}>
            <Text style={[styles.statBoxNumber, { color: appTheme.colors.primary }]}>
              {stats.total}
            </Text>
            <Text style={styles.statBoxLabel}>Totales</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxPending]}>
            <Text style={[styles.statBoxNumber, { color: semanticColors.warning }]}>
              {stats.pending}
            </Text>
            <Text style={styles.statBoxLabel}>Pendientes</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxCompleted]}>
            <Text style={[styles.statBoxNumber, { color: semanticColors.success }]}>
              {stats.completed}
            </Text>
            <Text style={styles.statBoxLabel}>Completadas</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
