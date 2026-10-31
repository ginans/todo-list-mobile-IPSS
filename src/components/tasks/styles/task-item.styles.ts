import { StyleSheet } from 'react-native';
import { semanticColors } from '../../../theme/app-theme';

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 5,
  },
  completedCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    opacity: 0.85,
  },
  cardContent: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: semanticColors.mutedText,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
    backgroundColor: '#FFFFFF',
  },
  checkboxCompleted: {
    backgroundColor: semanticColors.success,
    borderColor: semanticColors.success,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  titleArea: {
    flex: 1,
    marginRight: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 22,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: semanticColors.mutedText,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeSpacer: {
    width: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
    width: 34,
    height: 34,
  },
  description: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 38,
    marginBottom: 8,
  },
  descriptionCompleted: {
    color: '#94A3B8',
  },
  footerRow: {
    marginLeft: 38,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
