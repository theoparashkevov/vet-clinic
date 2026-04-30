import { PrismaClient, type Owner } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateOwnerOptions {
  name?: string;
  phone?: string;
  email?: string | null;
}

export async function createOwner(options: CreateOwnerOptions = {}): Promise<Owner> {
  const now = Date.now();
  return prisma.owner.create({
    data: {
      name: options.name ?? `Test Owner ${now}`,
      phone: options.phone ?? `555-${now.toString().slice(-4)}`,
      email: options.email ?? `owner-${now}@test.com`,
    },
  });
}
