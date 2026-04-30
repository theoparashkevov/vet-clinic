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
      count: jest.fn().mockResolvedValue(0),
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
    expect(result.slots).toHaveLength(18);
  });

  it('removes a slot that is exactly booked', async () => {
    const baseDate = '2026-03-26';
    const booked = [
      {
        startsAt: new Date(`${baseDate}T09:00:00`),
        endsAt: new Date(`${baseDate}T09:30:00`),
      },
    ];
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue(booked) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots(baseDate);

    expect(result.slots).toHaveLength(17);
    expect(
      result.slots.some((s) => new Date(s).getHours() === 9 && new Date(s).getMinutes() === 0),
    ).toBe(false);
  });

  it('removes a slot that is partially overlapped by a booking', async () => {
    const baseDate = '2026-03-26';
    const booked = [
      {
        startsAt: new Date(`${baseDate}T09:15:00`),
        endsAt: new Date(`${baseDate}T09:45:00`),
      },
    ];
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue(booked) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots(baseDate);

    expect(result.slots).toHaveLength(16);
  });

  it('does not remove a slot for a cancelled appointment (filtered by DB query)', async () => {
    const prisma = makePrisma({ findMany: jest.fn().mockResolvedValue([]) });
    const svc = new AppointmentsService(prisma);

    const result = await svc.getSlots('2026-03-26');

    expect(result.slots).toHaveLength(18);

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

  it('includes room and notes when provided', async () => {
    const created = { ...SAMPLE_APPT, room: 'Room A', notes: 'Bring records' };
    const prisma = makePrisma({ create: jest.fn().mockResolvedValue(created) });
    const svc = new AppointmentsService(prisma);

    await svc.create({
      patientId: 'p1',
      ownerId: 'o1',
      startsAt: '2026-03-26T09:00:00.000Z',
      endsAt: '2026-03-26T09:30:00.000Z',
      room: 'Room A',
      notes: 'Bring records',
    });

    const data = (prisma.appointment.create as jest.Mock).mock.calls[0][0].data;
    expect(data.room).toBe('Room A');
    expect(data.notes).toBe('Bring records');
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

// ---------------------------------------------------------------------------
// cancel
// ---------------------------------------------------------------------------
describe('AppointmentsService.cancel', () => {
  it('sets status to cancelled and sets cancelledAt', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_APPT),
      update: jest.fn().mockResolvedValue({ ...SAMPLE_APPT, status: 'cancelled', cancelledAt: new Date() }),
    });
    const svc = new AppointmentsService(prisma);

    await svc.cancel('appt-1', 'user-1', 'Client requested');

    const data = (prisma.appointment.update as jest.Mock).mock.calls[0][0].data;
    expect(data.status).toBe('cancelled');
    expect(data.cancelledAt).toBeInstanceOf(Date);
    expect(data.cancelledBy).toBe('user-1');
    expect(data.cancellationReason).toBe('Client requested');
  });

  it('throws NotFoundException when appointment does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new AppointmentsService(prisma);

    await expect(svc.cancel('bad-id')).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when appointment is already cancelled', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue({ ...SAMPLE_APPT, status: 'cancelled' }),
    });
    const svc = new AppointmentsService(prisma);

    await expect(svc.cancel('appt-1')).rejects.toThrow('Appointment is already cancelled');
  });
});
