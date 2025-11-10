import { DataSource } from 'typeorm';
import { getDatabaseConfig } from './src/config/database.config';

const config = getDatabaseConfig();

export default new DataSource({
  ...config,
  migrations: ['src/migrations/*.ts'],
  migrationsTableName: 'migrations',
} as any);