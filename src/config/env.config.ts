export type DataSourceMode = 'local' | 'api';

export const envConfig = {
  dataSource: (process.env.EXPO_PUBLIC_DATA_SOURCE === 'api'
    ? 'api'
    : 'local') as DataSourceMode,
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  appEnv: process.env.EXPO_PUBLIC_APP_ENV || 'development',
} as const;
