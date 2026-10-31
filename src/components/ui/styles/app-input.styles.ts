import { StyleSheet } from 'react-native';
import { paperPalette } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  input: {
    backgroundColor: paperPalette.paperSheet,
    fontSize: 15,
  },
  helper: {
    paddingHorizontal: 4,
    paddingTop: 2,
    fontSize: 12,
  },
});
