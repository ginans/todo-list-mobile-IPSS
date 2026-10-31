import { StyleSheet } from 'react-native';
import { semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 253, 248, 0.90)',
    borderRadius: 14,
    borderWidth: 1,
    borderBottomWidth: 2.5,
    borderColor: semanticColors.border,
    marginVertical: 6,
    shadowColor: '#5C4033',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
