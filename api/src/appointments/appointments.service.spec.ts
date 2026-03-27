import { NotFoundException } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    appointment: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      ...overrides,
    },
  } as unknown as PrismaService;
}

const SAMPLE_APPT = {
  id: 'appt-1',
  patientId: 'p1',
  ownerId: 'o1',
  doctorId: 'd1',
  startsAt: new Date('2026-03-26T09:00:00.000Z'),
  endsAt: new Date('2026-03-26T09:30:00.000Z'),
  reason: 'checkup',
  status: 'scheduled',
  patient: {},
  owner: {},
  doctor: {},
};

// ---------------------------------------------------------------------------
// getSlots
// ---------------------------------------------------------------------------
describe('AppointmentsService.getSlots', () => {
  it('returns 18 slots for an empty day (09:00–17:30 every 30 min)', async () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots('2026-03-26');

    expect(result.date).toBe('2026-03-26');
    // 9 hours × 2 slots = 18 total (09:00 … 17:30, guard `minute > 30` never triggers
    // because the minute loop only produces 0 and 30)
    expect(result.slots).toHaveLength(18);
  });

  it('removes a slot that is exactly booked', async () => {
    const baseDate = '2026-03-26';
    // 09:00–09:30 is booked
    const booked = [
      {
        // Date strings without timezone are interpreted as local time.
        startsAt: new Date(`${baseDate}T09:00:00`),
        endsAt: new Date(`${baseDate}T09:30:00`),
      },
    ];
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue(booked) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots(baseDate);

    expect(result.slots).toHaveLength(17);
    // The 09:00 local slot should be absent
    expect(
      result.slots.some((s) => new Date(s).getHours() === 9 && new Date(s).getMinutes() === 0),
    ).toBe(false);
  });

  it('removes a slot that is partially overlapped by a booking', async () => {
    const baseDate = '2026-03-26';
    // Booking starts at 09:15 — overlaps with both 09:00 and 09:30 slots
    const booked = [
      {
        startsAt: new Date(`${baseDate}T09:15:00`),
        endsAt: new Date(`${baseDate}T09:45:00`),
      },
    ];
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue(booked) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots(baseDate);

    // Both 09:00 and 09:30 overlap with the 09:15–09:45 booking
    expect(result.slots).toHaveLength(16);
  });

  it('does not remove a slot for a cancelled appointment (filtered by DB query)', async () => {
    // The service passes `status: { not: 'cancelled' }` to the DB.
    // We simulate the DB already honouring that filter — findMany returns empty.
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue([]) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots('2026-03-26');

    // All 18 slots available since no non-cancelled bookings returned
    expect(result.slots).toHaveLength(18);

    // Verify the query included the status filter
    const callArg = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where.status).toEqual({ not: 'cancelled' });
  });

  it('passes doctorId filter to the DB query when provided', async () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    await svc.getSlots('2026-03-26', 'doc-42');

    const callArg = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where.doctorId).toBe('doc-42');
  });

  it('does NOT include doctorId in the query when not provided', async () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    await svc.getSlots('2026-03-26');

    const callArg = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where.doctorId).toBeUndefined();
  });

  it('last generated slot starts at 17:30 and first starts at 09:00', async () => {
    // The loop runs hour=9..17, minute=[0,30], with guard `if (hour===17 && minute>30) continue`
    // Since minutes are only 0 and 30, the guard never fires; 17:30 IS included.
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots('2026-03-26');

    const times = result.slots.map((s) => {
      const d = new Date(s);
      return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    });
    expect(times[0]).toBe('9:00');
    expect(times[times.length - 1]).toBe('17:30');
  });

  it('returns no slots when the entire day is blocked', async () => {
    const baseDate = '2026-03-26';
    // One long appointment covers 09:00 to 18:00
    const booked = [
      {
        startsAt: new Date(`${baseDate}T09:00:00`),
        endsAt: new Date(`${baseDate}T18:00:00`),
      },
    ];
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue(booked) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots(baseDate);

    expect(result.slots).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------
describe('AppointmentsService.list', () => {
  it('passes no where clause when no filters are given', () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    svc.list({});

    const callArg = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where).toEqual({});
  });

  it('builds a date range where clause from a date string', () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    svc.list({ date: '2026-03-26' });

    const where = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0].where;
    expect(where.startsAt.gte).toBeInstanceOf(Date);
    expect(where.startsAt.lte).toBeInstanceOf(Date);
    // gte should be midnight, lte should be end of day
    expect((where.startsAt.gte as Date).getHours()).toBe(0);
    expect((where.startsAt.lte as Date).getHours()).toBe(23);
  });

  it('includes doctorId filter when provided', () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    svc.list({ doctorId: 'doc-1' });

    const where = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0].where;
    expect(where.doctorId).toBe('doc-1');
  });

  it('includes status filter when provided', () => {
    const prisma = makePrisma();
    const svc = new AppointmentsService(prisma);

    svc.list({ status: 'completed' });

    const where = (prisma.appointment.findMany as jest.Mock).mock.calls[0][0].where;
    expect(where.status).toBe('completed');
  });
});

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------
describe('AppointmentsService.get', () => {
  it('returns the appointment when found', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(SAMPLE_APPT) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.get('appt-1');

    expect(result).toBe(SAMPLE_APPT);
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new AppointmentsService(prisma);

    await expect(svc.get('nonexistent')).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------
describe('AppointmentsService.create', () => {
  it('converts startsAt and endsAt strings to Date objects', async () => {
    const created = { ...SAMPLE_APPT };
    const prisma = makePrisma({ create: jest.fn().mockResolvedValue(created) });
    const svc = new AppointmentsService(prisma);

    await svc.create({
      patientId: 'p1',
      ownerId: 'o1',
      doctorId: 'd1',
      startsAt: '2026-03-26T09:00:00.000Z',
      endsAt: '2026-03-26T09:30:00.000Z',
      reason: 'checkup',
    });

    const data = (prisma.appointment.create as jest.Mock).mock.calls[0][0].data;
    expect(data.startsAt).toBeInstanceOf(Date);
    expect(data.endsAt).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------
describe('AppointmentsService.update', () => {
  it('throws NotFoundException when the appointment does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new AppointmentsService(prisma);

    await expect(svc.update('bad-id', { status: 'cancelled' })).rejects.toThrow(NotFoundException);
  });

  it('only includes defined DTO fields in the update data', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_APPT),
      update: jest.fn().mockResolvedValue(SAMPLE_APPT),
    });
    const svc = new AppointmentsService(prisma);

    await svc.update('appt-1', { status: 'completed' });

    const data = (prisma.appointment.update as jest.Mock).mock.calls[0][0].data;
    expect(data.status).toBe('completed');
    expect(data.reason).toBeUndefined();
    expect(data.startsAt).toBeUndefined();
  });

  it('converts startsAt and endsAt strings to Date objects on update', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_APPT),
      update: jest.fn().mockResolvedValue(SAMPLE_APPT),
    });
    const svc = new AppointmentsService(prisma);

    await svc.update('appt-1', { startsAt: '2026-03-26T10:00:00.000Z', endsAt: '2026-03-26T10:30:00.000Z' });

    const data = (prisma.appointment.update as jest.Mock).mock.calls[0][0].data;
    expect(data.startsAt).toBeInstanceOf(Date);
    expect(data.endsAt).toBeInstanceOf(Date);
  });
});
