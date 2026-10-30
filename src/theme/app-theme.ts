import { MD3LightTheme, MD3Theme } from 'react-native-paper';

/**
 * Tema personalizado basado en Material Design 3 (React Native Paper)
 * Asegura contraste accesible (WCAG AA), balance cromático y jerarquía visual.
 */
export const appTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E40AF', // Azul institucional formal (Deep Indigo)
    onPrimary: '#FFFFFF',
    primaryContainer: '#DBEAFE',
    onPrimaryContainer: '#1E3A8A',
    secondary: '#0D9488', // Teal moderno para acentos secundarios
    onSecondary: '#FFFFFF',
    secondaryContainer: '#CCFBF1',
    onSecondaryContainer: '#115E59',
    background: '#F8FAFC', // Slate muy suave para fondos (no blanco chillón)
    surface: '#FFFFFF',
    onSurface: '#0F172A',
    surfaceVariant: '#F1F5F9',
    onSurfaceVariant: '#475569',
    outline: '#CBD5E1',
    error: '#DC2626',
    onError: '#FFFFFF',
    errorContainer: '#FEE2E2',
    onErrorContainer: '#991B1B',
  },
};

export const semanticColors = {
  success: '#16A34A',
  successLight: '#DCFCE7',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  info: '#2563EB',
  infoLight: '#DBEAFE',
  mutedText: '#64748B',
  border: '#E2E8F0',
};
