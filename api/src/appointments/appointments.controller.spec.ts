import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

const SAMPLE_APPT = {
  id: 'appt-1',
  patientId: 'p1',
  ownerId: 'o1',
  doctorId: 'd1',
  startsAt: '2026-03-26T09:00:00.000Z',
  endsAt: '2026-03-26T09:30:00.000Z',
  reason: 'checkup',
  status: 'scheduled',
};

const SAMPLE_SLOTS = { date: '2026-03-26', slots: ['2026-03-26T09:00:00.000Z'] };

function makeService(): Partial<AppointmentsService> {
  return {
    list: jest.fn().mockResolvedValue({
      data: [SAMPLE_APPT],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    }),
    get: jest.fn().mockResolvedValue(SAMPLE_APPT),
    create: jest.fn().mockResolvedValue(SAMPLE_APPT),
    update: jest.fn().mockResolvedValue({ ...SAMPLE_APPT, status: 'completed' }),
    getSlots: jest.fn().mockResolvedValue(SAMPLE_SLOTS),
  };
}

async function buildApp(service: Partial<AppointmentsService>): Promise<INestApplication> {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AppointmentsController],
    providers: [{ provide: AppointmentsService, useValue: service }],
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
// GET /appointments
// ---------------------------------------------------------------------------
describe('GET /appointments', () => {
  it('returns 200 with paginated appointments', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer()).get('/appointments').expect(200);
    expect(res.body.data).toBeDefined();
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
    await app.close();
  });

  it('passes date, doctorId, and status query params to the service', async () => {
    const service = makeService();
    const app = await buildApp(service);
    await request(app.getHttpServer())
      .get('/appointments?date=2026-03-26&doctorId=d1&status=scheduled')
      .expect(200);
    expect(service.list).toHaveBeenCalledWith(
      {
        date: '2026-03-26',
        doctorId: 'd1',
        status: 'scheduled',
      },
      expect.any(Object),
    );
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// GET /appointments/slots
// ---------------------------------------------------------------------------
describe('GET /appointments/slots', () => {
  it('returns 200 with slots for a given date', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer())
      .get('/appointments/slots?date=2026-03-26')
      .expect(200);
    expect(res.body.date).toBe('2026-03-26');
    expect(Array.isArray(res.body.slots)).toBe(true);
    await app.close();
  });

  it('passes doctorId to getSlots when provided', async () => {
    const service = makeService();
    const app = await buildApp(service);
    await request(app.getHttpServer())
      .get('/appointments/slots?date=2026-03-26&doctorId=d1')
      .expect(200);
    expect(service.getSlots).toHaveBeenCalledWith('2026-03-26', 'd1');
    await app.close();
  });

  it('defaults to today when date query param is absent', async () => {
    const service = makeService();
    const app = await buildApp(service);
    await request(app.getHttpServer()).get('/appointments/slots').expect(200);
    const calledDate = (service.getSlots as jest.Mock).mock.calls[0][0];
    // Should be a YYYY-MM-DD string (today's date)
    expect(calledDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// POST /appointments
// ---------------------------------------------------------------------------
describe('POST /appointments', () => {
  it('returns 201 when body is valid', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/appointments')
      .send({
        patientId: 'p1',
        ownerId: 'o1',
        startsAt: '2026-03-26T09:00:00.000Z',
        endsAt: '2026-03-26T09:30:00.000Z',
      })
      .expect(201);
    await app.close();
  });

  it('returns 400 when required fields are missing', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/appointments')
      .send({ patientId: 'p1' }) // missing ownerId, startsAt, endsAt
      .expect(400);
    await app.close();
  });

  it('returns 400 when startsAt is not an ISO date string', async () => {
    const app = await buildApp(makeService());
    await request(app.getHttpServer())
      .post('/appointments')
      .send({
        patientId: 'p1',
        ownerId: 'o1',
        startsAt: 'not-a-date',
        endsAt: '2026-03-26T09:30:00.000Z',
      })
      .expect(400);
    await app.close();
  });
});

// ---------------------------------------------------------------------------
// PUT /appointments/:id
// ---------------------------------------------------------------------------
describe('PUT /appointments/:id', () => {
  it('returns 200 with updated appointment', async () => {
    const app = await buildApp(makeService());
    const res = await request(app.getHttpServer())
      .put('/appointments/appt-1')
      .send({ status: 'completed' })
      .expect(200);
    expect(res.body.data.status).toBe('completed');
    await app.close();
  });
});
