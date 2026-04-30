import { PrismaClient, type User } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateUserOptions {
  name?: string;
  email?: string;
  passwordHash?: string | null;
  ownerId?: string | null;
  isSuperAdmin?: boolean;
  roleNames?: string[];
}

export async function createUser(options: CreateUserOptions = {}): Promise<User> {
  const now = Date.now();
  const user = await prisma.user.create({
    data: {
      name: options.name ?? `Test User ${now}`,
      email: options.email ?? `user-${now}@test.com`,
      passwordHash: options.passwordHash ?? null,
      ownerId: options.ownerId ?? null,
      isSuperAdmin: options.isSuperAdmin ?? false,
    },
  });

  if (options.roleNames && options.roleNames.length > 0) {
    const roles = await prisma.role.findMany({
      where: { name: { in: options.roleNames } },
      select: { id: true },
    });

    if (roles.length > 0) {
      await prisma.userRole.createMany({
        data: roles.map((role) => ({
          userId: user.id,
          roleId: role.id,
        })),
      });
    }
  }

  return user;
}

export async function createUser(options: CreateUserOptions = {}): Promise<User> {
  const now = Date.now();
  const user = await prisma.user.create({
    data: {
      name: options.name ?? `Test User ${now}`,
      email: options.email ?? `user-${now}@test.com`,
      passwordHash: options.passwordHash ?? null,
      ownerId: options.ownerId ?? null,
      isSuperAdmin: options.isSuperAdmin ?? false,
    },
  });

  if (options.roleNames && options.roleNames.length > 0) {
    const roles = await prisma.role.findMany({
      where: { name: { in: options.roleNames } },
      select: { id: true },
    });

    if (roles.length > 0) {
      await prisma.userRole.createMany({
        data: roles.map((role) => ({
          userId: user.id,
          roleId: role.id,
        })),
      });
    }
  }

  return user;
}
