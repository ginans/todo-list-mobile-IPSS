import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: paperPalette.paperSheet,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: semanticColors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: paperPalette.inkDark,
  },
  subtitle: {
    fontSize: 13,
    color: semanticColors.mutedText,
    marginTop: 4,
    marginBottom: 12,
  },
  prioritySection: {
    marginVertical: 10,
  },
  priorityLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: paperPalette.inkMedium,
    marginBottom: 6,
  },
  segmented: {
    backgroundColor: paperPalette.paperBg,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 18,
    gap: 8,
  },
  actionButton: {
    minWidth: 110,
  },
});
