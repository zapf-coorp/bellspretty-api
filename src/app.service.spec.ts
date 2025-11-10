import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AppService', () => {
  let service: AppService;
  
  // Mock do DataSource
  const mockDataSource = {
    isInitialized: true,
    hasMetadata: true,
    migrations: [],
    options: {
      type: 'sqlite',
      database: ':memory:',
    },
    query: jest.fn().mockResolvedValue([{ '1': 1 }]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return welcome message', () => {
    expect(service.getHello()).toBe('BellsPretty API is running!');
  });

  it('should return health status with database info', async () => {
    const health = await service.getHealth();
    
    expect(health.status).toBe('ok');
    expect(health.service).toBe('bellspretty-api');
    expect(health.version).toBe('1.0.0');
    expect(health.timestamp).toBeDefined();
    expect(health.database).toBeDefined();
    expect(health.database.status).toBe('connected');
    expect(health.database.type).toBe('sqlite');
    expect(health.database.isInitialized).toBe(true);
  });

  it('should handle database connection error', async () => {
    // Mock error no query
    mockDataSource.query.mockRejectedValueOnce(new Error('Connection failed'));
    
    const health = await service.getHealth();
    
    expect(health.status).toBe('ok');
    expect(health.database.status).toBe('error');
    expect(health.database.error).toBe('Connection failed');
  });
});