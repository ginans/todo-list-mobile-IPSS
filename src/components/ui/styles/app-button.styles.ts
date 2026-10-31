import { StyleSheet } from 'react-native';
import { appTheme } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginVertical: 4,
  },
  outlinedBorder: {
    borderColor: appTheme.colors.primary,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 2,
  },
});
