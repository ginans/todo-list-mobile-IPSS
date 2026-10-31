import { StyleSheet } from 'react-native';
import { paperPalette, semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchbar: {
    backgroundColor: paperPalette.paperSheet,
    borderWidth: 1,
    borderBottomWidth: 2,
    borderColor: semanticColors.border,
    borderRadius: 12,
    marginBottom: 10,
    height: 44,
  },
  searchInput: {
    fontSize: 14,
    minHeight: 0,
    color: paperPalette.inkDark,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: paperPalette.paperSheet,
    borderWidth: 1.5,
    borderColor: semanticColors.border,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
});
