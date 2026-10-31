import { StyleSheet } from 'react-native';
import { semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
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
