export interface AppConfig {
  port: number;
  apiPrefix: string;
  nodeEnv: string;
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  apiPrefix: process.env.API_PREFIX || 'api',
  nodeEnv: process.env.NODE_ENV || 'development',
});