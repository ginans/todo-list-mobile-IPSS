import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import { Card } from 'react-native-paper';
import { styles } from './styles/app-card.styles';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: () => void;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

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
