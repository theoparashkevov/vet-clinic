import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { OwnersController } from './owners.controller';
import { OwnersService } from './owners.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

const SAMPLE_OWNER = { id: 'own-1', name: 'Alice', phone: '555-1234', email: 'alice@example.com' };

function makeService(): Partial<OwnersService> {
  return {
    list: jest.fn().mockResolvedValue([SAMPLE_OWNER]),
    get: jest.fn().mockResolvedValue(SAMPLE_OWNER),
    create: jest.fn().mockResolvedValue(SAMPLE_OWNER),
    update: jest.fn().mockResolvedValue({ ...SAMPLE_OWNER, name: 'Bob' }),
    remove: jest.fn().mockResolvedValue({ ok: true }),
  };
}

async function buildApp(service: Partial<OwnersService>): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [OwnersController],
    providers: [{ provide: OwnersService, useValue: service }],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
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

// ---------------------------------------------------------------------------
// GET /owners
// ---------------------------------------------------------------------------
describe('GET /owners', () => {
  it('returns 200 with a list of owners', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer()).get('/owners').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// GET /owners/:id
// ---------------------------------------------------------------------------
describe('GET /owners/:id', () => {
  it('returns 200 with the owner when found', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer()).get('/owners/own-1').expect(200);
    expect(res.body.data.id).toBe('own-1');
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// POST /owners
// ---------------------------------------------------------------------------
describe('POST /owners', () => {
  it('returns 201 when body is valid', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/owners')
      .send({ name: 'Alice', phone: '555-1234' })
      .expect(201);
    await app.close();
  });

  it('returns 400 when required fields are missing', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/owners')
      .send({ email: 'alice@example.com' }) // missing name & phone
      .expect(400);
    await app.close();
  });

  it('returns 400 when email is invalid', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/owners')
      .send({ name: 'Alice', phone: '555-1234', email: 'not-an-email' })
      .expect(400);
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// PUT /owners/:id
// ---------------------------------------------------------------------------
describe('PUT /owners/:id', () => {
  it('returns 200 with updated owner', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer())
      .put('/owners/own-1')
      .send({ name: 'Bob' })
      .expect(200);
    expect(res.body.data.name).toBe('Bob');
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// DELETE /owners/:id
// ---------------------------------------------------------------------------
describe('DELETE /owners/:id', () => {
  it('returns 200 with { ok: true } when owner is removed', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer()).delete('/owners/own-1').expect(200);
    expect(res.body.ok).toBe(true);
    await app.close();
  });
});
