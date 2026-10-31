import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  dialog: {
    backgroundColor: paperPalette.paperSheet,
    borderRadius: 18,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: semanticColors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: paperPalette.inkDark,
  },
  message: {
    fontSize: 14,
    color: semanticColors.mutedText,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: 8,
    paddingBottom: 8,
    flexDirection: 'row',
  },
  spacer: {
    width: 8,
  },
});
