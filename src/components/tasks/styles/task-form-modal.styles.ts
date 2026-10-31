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
    borderBottomWidth: 3,
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
    fontWeight: '700',
    color: paperPalette.inkMedium,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: paperPalette.paperSheet,
    borderWidth: 1.5,
    borderBottomWidth: 2.5,
    borderColor: semanticColors.border,
  },
  priorityButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityButtonTextActive: {
    fontWeight: '800',
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
