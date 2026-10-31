import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
    borderLeftWidth: 4,
    borderLeftColor: paperPalette.accentPrimary,
  },
  completedCard: {
    backgroundColor: '#F9F5ED',
    borderColor: paperPalette.paperLines,
    borderLeftColor: semanticColors.success,
    opacity: 0.88,
  },
  cardContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: semanticColors.mutedText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: paperPalette.paperSheet,
  },
  checkboxCompleted: {
    backgroundColor: semanticColors.success,
    borderColor: semanticColors.success,
  },
  checkmark: {
    color: '#FFFDF8',
    fontWeight: '800',
    fontSize: 15,
  },
  titleArea: {
    flex: 1,
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: paperPalette.inkDark,
    marginBottom: 6,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: semanticColors.mutedText,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeSpacer: {
    width: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    width: 34,
    height: 34,
  },
  description: {
    fontSize: 14,
    color: paperPalette.inkMedium,
    lineHeight: 20,
    marginLeft: 38,
    marginBottom: 8,
  },
  descriptionCompleted: {
    textDecorationLine: 'line-through',
    textDecorationStyle: 'solid',
    color: paperPalette.inkMuted,
  },
  footerRow: {
    marginLeft: 38,
    borderTopWidth: 1,
    borderTopColor: paperPalette.paperMuted,
    paddingTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: paperPalette.inkMuted,
    fontWeight: '500',
  },
});
