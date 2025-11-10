import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Aplicar as mesmas configurações do main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect('BellsPretty API is running!');
  });

  it('/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
      
    expect(response.body.status).toBe('ok');
    expect(response.body.service).toBe('bellspretty-api');
    expect(response.body.database).toBeDefined();
    expect(response.body.database.status).toBe('connected');
  });

  describe('Authentication (e2e)', () => {
    const testUser = {
      name: 'Teste Usuario',
      email: 'teste@exemplo.com',
      password: 'senhateste123',
    };

    it('/auth/register (POST)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
    });

    it('/auth/register (POST) - Email já existe', async () => {
      // Primeiro registro
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Segundo registro com o mesmo email
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('/auth/login (POST)', async () => {
      // Primeiro registrar o usuário
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Então fazer login
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body.accessToken).toBeDefined();
      expect(response.body.refreshToken).toBeDefined();
      expect(response.body.user.email).toBe(testUser.email);
    });

    it('/auth/login (POST) - Credenciais inválidas', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'naoexiste@exemplo.com',
          password: 'senhaerrada',
        })
        .expect(401);
    });

    it('/auth/profile (GET) - Com token válido', async () => {
      // Registrar usuário
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      const { accessToken } = registerResponse.body;

      // Acessar perfil com token
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
    });

    it('/auth/profile (GET) - Sem token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });
  });
});