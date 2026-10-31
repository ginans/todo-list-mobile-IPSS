import { StyleSheet } from 'react-native';
import { appTheme, paperPalette, semanticColors } from '../../../theme/app-theme';

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
    fontSize: 27,
    fontWeight: '800',
    color: paperPalette.inkDark,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 13,
    color: semanticColors.mutedText,
    marginTop: 2,
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 253, 248, 0.90)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderBottomWidth: 2.5,
    borderColor: semanticColors.border,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    color: paperPalette.inkMedium,
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
    backgroundColor: paperPalette.paperMuted,
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
    backgroundColor: paperPalette.accentPrimaryLight,
    borderColor: '#E2CEBE',
  },
  statBoxPending: {
    backgroundColor: semanticColors.warningLight,
    borderColor: '#EED8AC',
  },
  statBoxCompleted: {
    backgroundColor: semanticColors.successLight,
    borderColor: '#C8DEC9',
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: '800',
  },
  statBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: paperPalette.inkMedium,
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
