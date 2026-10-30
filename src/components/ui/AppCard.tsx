import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { Card } from 'react-native-paper';
import { semanticColors } from '../../theme/app-theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

/**
 * Componente Reutilizable: AppCard
 * Encapsula la tarjeta visual con bordes suaves, sombra y contenedor de contenido.
 */
export const AppCard: React.FC<AppCardProps> = ({
  children,
  style,
  contentStyle,
  onPress,
  elevation = 1,
}) => {
  return (
    <Card
      mode="elevated"
      elevation={elevation}
      style={[styles.card, style]}
      onPress={onPress}
    >
      <Card.Content style={[styles.content, contentStyle]}>
        {children}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
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
