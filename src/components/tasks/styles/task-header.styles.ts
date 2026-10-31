import { StyleSheet } from 'react-native';
import { appTheme, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
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
