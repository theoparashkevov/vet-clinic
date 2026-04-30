import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

const SAMPLE_USER = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  roles: ['doctor'],
  isSuperAdmin: false,
};

function makeService(): any {
  return {
    login: jest.fn().mockResolvedValue({
      token: 'mock-jwt-token',
      user: SAMPLE_USER,
    }),
    register: jest.fn().mockResolvedValue({
      id: 'new-user-1',
      name: 'Bob',
      email: 'bob@example.com',
      roles: ['nurse'],
      isSuperAdmin: false,
    }),
    getCurrentUser: jest.fn().mockResolvedValue(SAMPLE_USER),
  };
}

const MOCK_AUTH_USER = {
  sub: 'user-1',
  email: 'alice@example.com',
  name: 'Alice',
  roles: ['doctor'],
  isSuperAdmin: false,
};

async function buildApp(service: any): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AuthController],
    providers: [{ provide: AuthService, useValue: service }],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = MOCK_AUTH_USER;
        return true;
      },
    })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  const app = module.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  await app.init();
  return app;
}

describe('POST /auth/login', () => {
  it('returns 200 with token and user when credentials are valid', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' })
      .expect(200);

    expect(res.body.token).toBe('mock-jwt-token');
    expect(res.body.user.id).toBe('user-1');
    expect(res.body.user.roles).toEqual(['doctor']);
    expect(res.body.user.isSuperAdmin).toBe(false);
    await app.close();
  });

  it('returns 400 when email is invalid', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'not-an-email', password: 'password123' })
      .expect(400);
    await app.close();
  });

  it('returns 400 when password is too short', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'short' })
      .expect(400);
    await app.close();
  });
});

describe('POST /auth/register', () => {
  it('returns 201 when body is valid', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Bob', email: 'bob@example.com', password: 'password123' })
      .expect(201);

    expect(res.body.id).toBe('new-user-1');
    await app.close();
  });

  it('returns 400 when required fields are missing', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'bob@example.com' })
      .expect(400);
    await app.close();
  });
});

describe('GET /auth/me', () => {
  it('returns 200 with current user', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer()).get('/auth/me').expect(200);

    expect(res.body.id).toBe('user-1');
    expect(res.body.roles).toEqual(['doctor']);
    await app.close();
  });
});
