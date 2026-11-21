import { StyleSheet } from 'react-native';
import { appTheme, paperPalette } from '../theme/app-theme';

export const styles = StyleSheet.create({
  paperBackground: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 90,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 12,
    backgroundColor: appTheme.colors.primary,
    borderRadius: 24,
  },
  snackbar: {
    backgroundColor: paperPalette.inkDark,
    borderRadius: 12,
    marginBottom: 20,
  },
  photoModalContainer: {
    backgroundColor: paperPalette.paperSheet,
    marginHorizontal: 18,
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: paperPalette.paperLines,
  },
  photoModalImage: {
    width: '100%',
    height: 360,
    borderRadius: 14,
    backgroundColor: paperPalette.paperMuted,
  },
});
