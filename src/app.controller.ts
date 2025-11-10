import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthStatus } from './common/interfaces/api-response.interface';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check with database status' })
  @ApiResponse({ status: 200, description: 'Service and database health status' })
  async getHealth(): Promise<HealthStatus & { database: any }> {
    return this.appService.getHealth();
  }
}