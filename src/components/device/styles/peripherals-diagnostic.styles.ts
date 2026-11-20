import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: paperPalette.paperSheet,
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 20,
    maxHeight: '86%',
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: semanticColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
    color: paperPalette.inkDark,
  },
  subtitle: {
    fontSize: 12,
    color: semanticColors.mutedText,
    marginBottom: 14,
  },
  cardsStack: {
    gap: 10,
  },
  diagCard: {
    backgroundColor: paperPalette.paperMuted,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: semanticColors.border,
  },
  diagCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  diagTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  diagCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: paperPalette.inkDark,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  diagDetail: {
    fontSize: 12,
    color: paperPalette.inkMedium,
    lineHeight: 18,
  },
  diagHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: semanticColors.success,
    marginTop: 4,
  },
  diagActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: paperPalette.paperSheet,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: semanticColors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: paperPalette.accentPrimary,
  },
  footer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },
});
