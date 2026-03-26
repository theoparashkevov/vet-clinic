import { NotFoundException } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    patient: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      ...overrides,
    },
  } as unknown as PrismaService;
}

const SAMPLE_PATIENT = {
  id: 'pat-1',
  name: 'Rex',
  species: 'dog',
  breed: 'Labrador',
  ownerId: 'o1',
  birthdate: new Date('2020-01-01'),
  owner: {},
};

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------
describe('PatientsService.list', () => {
  it('passes no where clause when no search term is given', () => {
    const prisma = makePrisma();
    const svc = new PatientsService(prisma);

    svc.list();

    const callArg = (prisma.patient.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.where).toBeUndefined();
  });

  it('builds an OR clause matching name and species case-insensitively', () => {
    const prisma = makePrisma();
    const svc = new PatientsService(prisma);

    svc.list('rex');

    const where = (prisma.patient.findMany as jest.Mock).mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { name: { contains: 'rex', mode: 'insensitive' } },
      { species: { contains: 'rex', mode: 'insensitive' } },
    ]);
  });

  it('orders results by createdAt descending', () => {
    const prisma = makePrisma();
    const svc = new PatientsService(prisma);

    svc.list();

    const callArg = (prisma.patient.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ createdAt: 'desc' });
  });
});

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------
describe('PatientsService.get', () => {
  it('returns the patient when found', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(SAMPLE_PATIENT) });
    const svc = new PatientsService(prisma);

    const result = await svc.get('pat-1');

    expect(result).toBe(SAMPLE_PATIENT);
  });

  it('throws NotFoundException when patient does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new PatientsService(prisma);

    await expect(svc.get('nonexistent')).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------
describe('PatientsService.create', () => {
  it('converts birthdate string to a Date object', () => {
    const prisma = makePrisma({ create: jest.fn().mockResolvedValue(SAMPLE_PATIENT) });
    const svc = new PatientsService(prisma);

    svc.create({ ownerId: 'o1', name: 'Rex', species: 'dog', birthdate: '2020-01-01' });

    const data = (prisma.patient.create as jest.Mock).mock.calls[0][0].data;
    expect(data.birthdate).toBeInstanceOf(Date);
  });

  it('leaves birthdate undefined when not provided', () => {
    const prisma = makePrisma({ create: jest.fn().mockResolvedValue(SAMPLE_PATIENT) });
    const svc = new PatientsService(prisma);

    svc.create({ ownerId: 'o1', name: 'Rex', species: 'dog' });

    const data = (prisma.patient.create as jest.Mock).mock.calls[0][0].data;
    expect(data.birthdate).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------
describe('PatientsService.update', () => {
  it('throws NotFoundException when patient does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new PatientsService(prisma);

    await expect(svc.update('bad-id', { name: 'Max' })).rejects.toThrow(NotFoundException);
  });

  it('converts birthdate string to Date on update', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_PATIENT),
      update: jest.fn().mockResolvedValue(SAMPLE_PATIENT),
    });
    const svc = new PatientsService(prisma);

    await svc.update('pat-1', { birthdate: '2021-06-15' });

    const data = (prisma.patient.update as jest.Mock).mock.calls[0][0].data;
    expect(data.birthdate).toBeInstanceOf(Date);
  });
});
