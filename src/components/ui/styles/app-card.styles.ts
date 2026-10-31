import { StyleSheet } from 'react-native';
import { semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: semanticColors.border,
    marginVertical: 6,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
