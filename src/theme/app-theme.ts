import { MD3LightTheme, MD3Theme } from 'react-native-paper';

export const paperPalette = {
  paperBg: '#F4EFE6',
  paperSheet: '#FFFDF8',
  paperMuted: '#EFE9DE',
  paperLines: '#E5DEC9',
  inkDark: '#2C221E',
  inkMedium: '#5C4F44',
  inkMuted: '#8A7B6E',
  accentPrimary: '#8C583A',
  accentPrimaryLight: '#F2E5DC',
};

export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: paperPalette.accentPrimary,
    onPrimary: '#FFFDF8',
    primaryContainer: paperPalette.accentPrimaryLight,
    onPrimaryContainer: '#4A2C18',
    secondary: '#4A6B53',
    onSecondary: '#FFFDF8',
    secondaryContainer: '#E4EFE7',
    onSecondaryContainer: '#263D2C',
    background: paperPalette.paperBg,
    surface: paperPalette.paperSheet,
    onSurface: paperPalette.inkDark,
    surfaceVariant: paperPalette.paperMuted,
    onSurfaceVariant: paperPalette.inkMedium,
    outline: paperPalette.paperLines,
    error: '#B84030',
    onError: '#FFFDF8',
    errorContainer: '#F9E3DF',
    onErrorContainer: '#6E1F14',
  },
};

export const semanticColors = {
  success: '#3B6E4C',
  successLight: '#E6F0E8',
  warning: '#B86B19',
  warningLight: '#FBF0D9',
  danger: '#B84030',
  dangerLight: '#F9E3DF',
  info: '#8C583A',
  infoLight: '#F2E5DC',
  mutedText: paperPalette.inkMuted,
  border: paperPalette.paperLines,
};
