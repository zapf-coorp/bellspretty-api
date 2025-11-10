import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Configuração base comum
  const baseConfig: Partial<TypeOrmModuleOptions> = {
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    migrationsRun: false,
    synchronize: nodeEnv !== 'production',
    logging: nodeEnv === 'development' ? ['query', 'error'] : ['error'],
    autoLoadEntities: true,
  };

  // Configuração específica por ambiente
  switch (nodeEnv) {
    case 'production':
      return {
        ...baseConfig,
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
        synchronize: false, // Nunca usar synchronize em produção
        migrationsRun: true,
      } as TypeOrmModuleOptions;

    case 'test':
      return {
        ...baseConfig,
        type: 'sqlite',
        database: ':memory:',
        dropSchema: true,
        synchronize: true,
        logging: false,
      } as TypeOrmModuleOptions;

    default: // development
      return {
        ...baseConfig,
        type: 'sqlite',
        database: process.env.DB_DATABASE || 'data/development.sqlite',
        synchronize: true,
      } as TypeOrmModuleOptions;
  }
};

// Exporta a configuração padrão
export const databaseConfig = getDatabaseConfig();

// Configuração para CLI do TypeORM
export const dataSourceConfig: DataSourceOptions = getDatabaseConfig() as DataSourceOptions;

// DataSource para migrações
export default new DataSource(dataSourceConfig);