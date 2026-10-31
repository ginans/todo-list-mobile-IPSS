import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { appTheme, semanticColors } from '../../theme/app-theme';
import { envConfig } from '../../config/env.config';
import { AppButton } from '../ui/AppButton';

interface TaskHeaderProps {
  stats: {
    total: number;
    completed: number;
    pending: number;
    progress: number;
    progressPercentage: number;
  };
  onResetDemo: () => void;
  isResetting?: boolean;
}

export const TaskHeader: React.FC<TaskHeaderProps> = ({
  stats,
  onResetDemo,
  isResetting = false,
}) => {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.demoBanner,
          {
            backgroundColor: envConfig.isDemoMode
              ? semanticColors.infoLight
              : semanticColors.successLight,
          },
        ]}
      >
        <View style={styles.demoBannerContent}>
          <Text
            style={[
              styles.demoBannerText,
              {
                color: envConfig.isDemoMode
                  ? semanticColors.info
                  : semanticColors.success,
              },
            ]}
          >
            {envConfig.isDemoMode
              ? '⚡ Modo Local: Almacenamiento en dispositivo'
              : '🌐 Modo API: Conectado a servidor remoto'}
          </Text>

          {envConfig.isDemoMode && (
            <AppButton
              label="Restablecer Seed"
              onPress={onResetDemo}
              variant="outline"
              compact
              loading={isResetting}
              style={styles.resetButton}
            />
          )}
        </View>
      </View>

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  demoBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 14,
  },
  demoBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  demoBannerText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    flex: 1,
  },
  resetButton: {
    marginVertical: 0,
    backgroundColor: '#FFFFFF',
    borderColor: semanticColors.info,
    borderWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: semanticColors.mutedText,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeContainer: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  badgeNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: appTheme.colors.primary,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: semanticColors.mutedText,
    textTransform: 'uppercase',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: semanticColors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '800',
    color: appTheme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  statItem: {
    fontSize: 12,
    color: semanticColors.mutedText,
  },
  statBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  statSeparator: {
    marginHorizontal: 8,
    color: '#CBD5E1',
  },
});
