import { StyleSheet } from 'react-native';
import { appTheme, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    marginBottom: 14,
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
  progressTrack: {
    height: 8,
    width: '100%',
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsBoxesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  statBoxTotal: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statBoxPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statBoxCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: semanticColors.mutedText,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
