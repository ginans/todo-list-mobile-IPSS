import React from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Button } from 'react-native-paper';
import { appTheme, semanticColors } from '../../theme/app-theme';

export type AppButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: AppButtonVariant;
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  compact = false,
}) => {
  const getMode = () => {
    switch (variant) {
      case 'outline':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          buttonColor: appTheme.colors.primary,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          buttonColor: appTheme.colors.secondary,
          textColor: '#FFFFFF',
        };
      case 'danger':
        return {
          buttonColor: semanticColors.danger,
          textColor: '#FFFFFF',
        };
      case 'outline':
      case 'ghost':
        return {
          buttonColor: 'transparent',
          textColor: appTheme.colors.primary,
        };
    }
  };

  const { buttonColor, textColor } = getColors();

  return (
    <Button
      mode={getMode()}
      onPress={onPress}
      icon={icon}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={buttonColor}
      textColor={textColor}
      compact={compact}
      style={[
        styles.button,
        variant === 'outline' && styles.outlinedBorder,
        style,
      ]}
      labelStyle={styles.label}
    >
      {label}
    </Button>
  );
};

const styles = StyleSheet.create({
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
