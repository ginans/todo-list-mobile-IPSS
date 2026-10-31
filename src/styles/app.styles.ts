import { StyleSheet } from 'react-native';
import { appTheme } from '../theme/app-theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appTheme.colors.background,
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
    borderRadius: 28,
  },
  snackbar: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    marginBottom: 20,
  },
});
