/**
 * Configuración de Variables de Entorno y Feature Flags
 * Utiliza el prefijo EXPO_PUBLIC_ para acceso seguro en cliente.
 */
export const envConfig = {
  /**
   * Feature Flag: Modo Demo
   * true: utiliza TaskMockAdapter con datos simulados y persistencia en AsyncStorage.
   * false: utiliza TaskHttpAdapter para conectar a un backend REST (ej. NestJS).
   */
  isDemoMode: process.env.EXPO_PUBLIC_DEMO_MODE !== 'false',

  /**
   * URL base de la API REST para cuando isDemoMode es false.
   */
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

  /**
   * Ambiente de ejecución (development, staging, production).
   */
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
} as const;
