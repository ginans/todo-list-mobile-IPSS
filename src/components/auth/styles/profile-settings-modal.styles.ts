import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: paperPalette.paperSheet,
    marginHorizontal: 22,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: semanticColors.border,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFDF8',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: paperPalette.inkDark,
  },
  profileSubtitle: {
    fontSize: 12,
    color: semanticColors.mutedText,
    marginTop: 2,
  },
  summaryBox: {
    backgroundColor: paperPalette.paperMuted,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: semanticColors.border,
    marginBottom: 16,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: semanticColors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: paperPalette.inkDark,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
});
