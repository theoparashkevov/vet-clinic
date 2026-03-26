import { NotFoundException } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { PrismaService } from '../prisma/prisma.service';

function makePrisma(overrides: Partial<Record<string, jest.Mock>> = {}) {
  return {
    owner: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    },
  } as unknown as PrismaService;
}

const SAMPLE_OWNER = { id: 'own-1', name: 'Alice', phone: '555-1234', email: 'alice@example.com' };

// ---------------------------------------------------------------------------
// list
// ---------------------------------------------------------------------------
describe('OwnersService.list', () => {
  it('orders by createdAt descending', () => {
    const prisma = makePrisma();
    const svc = new OwnersService(prisma);

    svc.list();

    const callArg = (prisma.owner.findMany as jest.Mock).mock.calls[0][0];
    expect(callArg.orderBy).toEqual({ createdAt: 'desc' });
  });
});

// ---------------------------------------------------------------------------
// get
// ---------------------------------------------------------------------------
describe('OwnersService.get', () => {
  it('returns the owner when found', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(SAMPLE_OWNER) });
    const svc = new OwnersService(prisma);

    const result = await svc.get('own-1');

    expect(result).toBe(SAMPLE_OWNER);
  });

  it('throws NotFoundException when owner does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new OwnersService(prisma);

    await expect(svc.get('nonexistent')).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// create
// ---------------------------------------------------------------------------
describe('OwnersService.create', () => {
  it('passes dto data to prisma.create', () => {
    const prisma = makePrisma({ create: jest.fn().mockResolvedValue(SAMPLE_OWNER) });
    const svc = new OwnersService(prisma);

    svc.create({ name: 'Alice', phone: '555-1234', email: 'alice@example.com' });

    const data = (prisma.owner.create as jest.Mock).mock.calls[0][0].data;
    expect(data.name).toBe('Alice');
    expect(data.phone).toBe('555-1234');
  });
});

// ---------------------------------------------------------------------------
// update
// ---------------------------------------------------------------------------
describe('OwnersService.update', () => {
  it('throws NotFoundException when owner does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new OwnersService(prisma);

    await expect(svc.update('bad-id', { name: 'Bob' })).rejects.toThrow(NotFoundException);
  });

  it('calls prisma.update with the given data when owner exists', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_OWNER),
      update: jest.fn().mockResolvedValue({ ...SAMPLE_OWNER, name: 'Bob' }),
    });
    const svc = new OwnersService(prisma);

    await svc.update('own-1', { name: 'Bob' });

    expect(prisma.owner.update as jest.Mock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'own-1' }, data: { name: 'Bob' } }),
    );
  });
});

// ---------------------------------------------------------------------------
// remove
// ---------------------------------------------------------------------------
describe('OwnersService.remove', () => {
  it('returns { ok: true } when owner is successfully deleted', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_OWNER),
      delete: jest.fn().mockResolvedValue(undefined),
    });
    const svc = new OwnersService(prisma);

    const result = await svc.remove('own-1');

    expect(result).toEqual({ ok: true });
  });

  it('throws NotFoundException when owner does not exist', async () => {
    const prisma = makePrisma({ findUnique: jest.fn().mockResolvedValue(null) });
    const svc = new OwnersService(prisma);

    await expect(svc.remove('nonexistent')).rejects.toThrow(NotFoundException);
  });

  it('calls prisma.delete with the correct id', async () => {
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue(SAMPLE_OWNER),
      delete: jest.fn().mockResolvedValue(undefined),
    });
    const svc = new OwnersService(prisma);

    await svc.remove('own-1');

    expect(prisma.owner.delete as jest.Mock).toHaveBeenCalledWith({ where: { id: 'own-1' } });
  });
});
