export const envConfig = {
  isDemoMode: process.env.EXPO_PUBLIC_DEMO_MODE !== 'false',
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
} as const;
