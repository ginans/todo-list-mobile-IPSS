import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  dialog: {
    backgroundColor: paperPalette.paperSheet,
    borderRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: semanticColors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 6,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: semanticColors.warningLight,
    borderWidth: 1,
    borderColor: '#EED8AC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: paperPalette.inkDark,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: paperPalette.inkMedium,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 6,
  },
});
