import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe, RequestMethod } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../../src/app.module';
import { hashPassword } from '../../src/auth/password';
import { AuditLogInterceptor } from '../../src/audit-log/audit-log.interceptor';

describe('Happy Path Integration Test', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = new PrismaClient();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('v1', {
      exclude: [{ path: 'health', method: RequestMethod.GET }],
    });

    const auditLogInterceptor = app.get(AuditLogInterceptor);
    app.useGlobalInterceptors(auditLogInterceptor);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('covers the full happy path', async () => {
    const roleNames = ['doctor', 'admin', 'superadmin', 'nurse', 'registrar', 'client'];
    for (const name of roleNames) {
      await prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, isSystem: true },
      });
    }

    const doctorUser = await prisma.user.create({
      data: {
        name: 'Dr. Test',
        email: 'doctor@test.com',
        passwordHash: hashPassword('doctorpass123'),
        isSuperAdmin: false,
        userRoles: {
          create: {
            role: { connect: { name: 'doctor' } },
          },
        },
      },
    });
    const doctorId = doctorUser.id;

    const superadminUser = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: 'superadmin@test.com',
        passwordHash: hashPassword('superadminpass123'),
        isSuperAdmin: true,
      },
    });

    let doctorToken: string;
    let superadminToken: string;
    let ownerId: string;
    let patientId: string;
    let appointmentId: string;
    let medicalRecordId: string;
    let prescriptionId: string;
    let invoiceId: string;

    const loginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'doctor@test.com', password: 'doctorpass123' })
      .expect(200);

    expect(loginRes.body.token).toBeDefined();
    expect(typeof loginRes.body.token).toBe('string');
    expect(loginRes.body.user.email).toBe('doctor@test.com');
    expect(loginRes.body.user.name).toBe('Dr. Test');
    expect(loginRes.body.user.roles).toContain('doctor');
    expect(loginRes.body.user.isSuperAdmin).toBe(false);
    doctorToken = loginRes.body.token;

    const today = new Date().toISOString().slice(0, 10);
    const apptListRes = await request(app.getHttpServer())
      .get(`/v1/appointments?date=${today}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .expect(200);

    expect(Array.isArray(apptListRes.body.data)).toBe(true);
    expect(apptListRes.body.meta).toBeDefined();
    expect(apptListRes.body.meta.total).toBe(0);

    const ownerRes = await request(app.getHttpServer())
      .post('/v1/owners')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        name: 'Jane Doe',
        phone: '555-0100',
        email: 'jane@example.com',
      })
      .expect(201);

    expect(ownerRes.body.data.name).toBe('Jane Doe');
    expect(ownerRes.body.data.phone).toBe('555-0100');
    expect(ownerRes.body.data.email).toBe('jane@example.com');
    ownerId = ownerRes.body.data.id;

    const patientRes = await request(app.getHttpServer())
      .post('/v1/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        name: 'Rex',
        species: 'Dog',
        breed: 'Labrador',
        ownerId,
      })
      .expect(201);

    expect(patientRes.body.data.name).toBe('Rex');
    expect(patientRes.body.data.species).toBe('Dog');
    expect(patientRes.body.data.ownerId).toBe(ownerId);
    patientId = patientRes.body.data.id;

    const slotStart = `${today}T10:00:00.000Z`;
    const slotEnd = `${today}T10:30:00.000Z`;

    const appointmentRes = await request(app.getHttpServer())
      .post('/v1/appointments')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId,
        ownerId,
        doctorId,
        startsAt: slotStart,
        endsAt: slotEnd,
        reason: 'Annual checkup',
      })
      .expect(201);

    expect(appointmentRes.body.data.patientId).toBe(patientId);
    expect(appointmentRes.body.data.ownerId).toBe(ownerId);
    expect(appointmentRes.body.data.doctorId).toBe(doctorId);
    expect(appointmentRes.body.data.reason).toBe('Annual checkup');
    appointmentId = appointmentRes.body.data.id;

    const medicalRecordRes = await request(app.getHttpServer())
      .post('/v1/medical-records')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId,
        appointmentId,
        visitDate: today,
        summary: 'Annual checkup completed. Patient is healthy.',
        diagnoses: 'Healthy',
        treatments: 'None required',
      })
      .expect(201);

    expect(medicalRecordRes.body.data.patientId).toBe(patientId);
    expect(medicalRecordRes.body.data.appointmentId).toBe(appointmentId);
    expect(medicalRecordRes.body.data.summary).toBe(
      'Annual checkup completed. Patient is healthy.',
    );
    expect(medicalRecordRes.body.data.createdBy.id).toBe(doctorId);
    medicalRecordId = medicalRecordRes.body.data.id;

    const prescriptionRes = await request(app.getHttpServer())
      .post(`/v1/patients/${patientId}/prescriptions`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        medication: 'Carprofen',
        dosage: '75mg',
        frequency: 'Once daily',
        duration: '14 days',
        instructions: 'Give with food',
      })
      .expect(201);

    expect(prescriptionRes.body.patientId).toBe(patientId);
    expect(prescriptionRes.body.medication).toBe('Carprofen');
    expect(prescriptionRes.body.dosage).toBe('75mg');
    expect(prescriptionRes.body.frequency).toBe('Once daily');
    expect(prescriptionRes.body.duration).toBe('14 days');
    prescriptionId = prescriptionRes.body.id;

    const invoiceRes = await request(app.getHttpServer())
      .post('/v1/invoices')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        patientId,
        ownerId,
        appointmentId,
        createdById: doctorId,
        issueDate: today,
        dueDate: today,
        items: [
          {
            description: 'Consultation',
            quantity: 1,
            unitPrice: 50,
          },
        ],
      })
      .expect(201);

    expect(invoiceRes.body.data.patientId).toBe(patientId);
    expect(invoiceRes.body.data.ownerId).toBe(ownerId);
    expect(invoiceRes.body.data.appointmentId).toBe(appointmentId);
    expect(invoiceRes.body.data.status).toBe('draft');
    expect(invoiceRes.body.data.items.length).toBe(1);
    expect(invoiceRes.body.data.items[0].description).toBe('Consultation');
    expect(invoiceRes.body.data.items[0].quantity).toBe(1);
    expect(invoiceRes.body.data.items[0].unitPrice).toBe(50);
    invoiceId = invoiceRes.body.data.id;

    const superadminLoginRes = await request(app.getHttpServer())
      .post('/v1/auth/login')
      .send({ email: 'superadmin@test.com', password: 'superadminpass123' })
      .expect(200);

    expect(superadminLoginRes.body.token).toBeDefined();
    expect(typeof superadminLoginRes.body.token).toBe('string');
    expect(superadminLoginRes.body.user.email).toBe('superadmin@test.com');
    expect(superadminLoginRes.body.user.isSuperAdmin).toBe(true);
    superadminToken = superadminLoginRes.body.token;

    await new Promise((r) => setTimeout(r, 300));

    const auditLogRes = await request(app.getHttpServer())
      .get('/v1/audit-logs')
      .set('Authorization', `Bearer ${superadminToken}`)
      .expect(200);

    expect(Array.isArray(auditLogRes.body.data)).toBe(true);
    expect(auditLogRes.body.data.length).toBeGreaterThan(0);
    expect(auditLogRes.body.meta.total).toBeGreaterThan(0);
  });
});
