import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserOptions {
  name?: string;
  email?: string;
  role?: string;
  passwordHash?: string | null;
  ownerId?: string | null;
}

export async function createUser(options: CreateUserOptions = {}): Promise<User> {
  const now = Date.now();
  return prisma.user.create({
    data: {
      name: options.name ?? `Test User ${now}`,
      email: options.email ?? `user-${now}@test.com`,
      role: options.role ?? 'doctor',
      passwordHash: options.passwordHash ?? null,
      ownerId: options.ownerId ?? null,
    },
  });
}
