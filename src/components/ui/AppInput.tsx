import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { appTheme, semanticColors } from '../../theme/app-theme';

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  helperText,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  disabled = false,
  style,
}) => {
  const hasError = Boolean(error);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        error={hasError}
        multiline={multiline}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        disabled={disabled}
        outlineColor={semanticColors.border}
        activeOutlineColor={appTheme.colors.primary}
        style={styles.input}
        theme={{
          roundness: 12,
        }}
      />
      {hasError ? (
        <HelperText type="error" visible={hasError} style={styles.helper}>
          {error}
        </HelperText>
      ) : helperText ? (
        <HelperText type="info" visible={true} style={styles.helper}>
          {helperText}
        </HelperText>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    fontSize: 15,
  },
  helper: {
    paddingHorizontal: 4,
    paddingTop: 2,
    fontSize: 12,
  },
});
