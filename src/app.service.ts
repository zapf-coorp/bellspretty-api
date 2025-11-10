import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { HealthStatus } from './common/interfaces/api-response.interface';

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  getHello(): string {
    return 'BellsPretty API is running!';
  }

  async getHealth(): Promise<HealthStatus & { database: any }> {
    let databaseStatus = 'disconnected';
    let databaseInfo = {};

    try {
      if (this.dataSource.isInitialized) {
        // Testa a conexão executando uma query simples
        await this.dataSource.query('SELECT 1');
        databaseStatus = 'connected';
        
        databaseInfo = {
          type: this.dataSource.options.type,
          database: this.dataSource.options.type === 'sqlite' 
            ? (this.dataSource.options as any).database 
            : (this.dataSource.options as any).database,
          isInitialized: this.dataSource.isInitialized,
          hasMetadata: this.dataSource.hasMetadata,
          migrations: this.dataSource.migrations.length,
        };
      }
    } catch (error) {
      databaseStatus = 'error';
      databaseInfo = { error: error.message };
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'bellspretty-api',
      version: '1.0.0',
      database: {
        status: databaseStatus,
        ...databaseInfo,
      },
    };
  }
}