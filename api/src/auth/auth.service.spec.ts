import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';
import { hashPassword } from './password';

function makeUsersService(overrides: any = {}) {
  return {
    findByEmailForAuth: jest.fn().mockResolvedValue(null),
    findPublicById: jest.fn().mockResolvedValue(null),
    ...overrides,
  } as unknown as UsersService;
}

function makeJwtService() {
  return {
    signAsync: jest.fn().mockResolvedValue('mock-jwt-token'),
  } as unknown as JwtService;
}

function makePrisma(overrides: any = {}) {
  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      ...overrides,
    },
  } as unknown as PrismaService;
}

function makeRolesService(overrides: any = {}) {
  return {
    assignRolesToUser: jest.fn().mockResolvedValue({}),
    ...overrides,
  } as unknown as RolesService;
}

const SAMPLE_USER = {
  id: 'user-1',
  name: 'Alice',
  email: 'alice@example.com',
  passwordHash: hashPassword('password123'),
  isSuperAdmin: false,
  userRoles: [{ role: { name: 'doctor' } }],
};

describe('AuthService.login', () => {
  it('returns token and user with roles when credentials are valid', async () => {
    const usersService = makeUsersService({
      findByEmailForAuth: jest.fn().mockResolvedValue(SAMPLE_USER),
    });
    const jwtService = makeJwtService();
    const prisma = makePrisma();
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    const result = await svc.login({ email: 'alice@example.com', password: 'password123' });

    expect(result.token).toBe('mock-jwt-token');
    expect(result.user.id).toBe('user-1');
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.name).toBe('Alice');
    expect(result.user.roles).toEqual(['doctor']);
    expect(result.user.isSuperAdmin).toBe(false);
    expect(jwtService.signAsync).toHaveBeenCalled();
  });

  it('throws UnauthorizedException when user is not found', async () => {
    const usersService = makeUsersService();
    const jwtService = makeJwtService();
    const prisma = makePrisma();
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    await expect(svc.login({ email: 'unknown@example.com', password: 'password123' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('throws UnauthorizedException when password is invalid', async () => {
    const usersService = makeUsersService({
      findByEmailForAuth: jest.fn().mockResolvedValue(SAMPLE_USER),
    });
    const jwtService = makeJwtService();
    const prisma = makePrisma();
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    await expect(svc.login({ email: 'alice@example.com', password: 'wrongpassword' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});

describe('AuthService.register', () => {
  it('creates user and assigns roles when current user is admin', async () => {
    const usersService = makeUsersService();
    const jwtService = makeJwtService();
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue({
        isSuperAdmin: false,
        userRoles: [{ role: { name: 'admin' } }],
      }),
      create: jest.fn().mockResolvedValue({
        id: 'new-user-1',
        name: 'Bob',
        email: 'bob@example.com',
        isSuperAdmin: false,
        userRoles: [],
      }),
    });
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    const result = await svc.register(
      { name: 'Bob', email: 'bob@example.com', password: 'password123', roleIds: ['role-1'] },
      'admin-user-id',
    );

    expect(result.id).toBe('new-user-1');
    expect(result.name).toBe('Bob');
    expect(result.email).toBe('bob@example.com');
    expect(rolesService.assignRolesToUser).toHaveBeenCalledWith('new-user-1', ['role-1'], 'admin-user-id');
  });

  it('creates user when current user is superadmin', async () => {
    const usersService = makeUsersService();
    const jwtService = makeJwtService();
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue({
        isSuperAdmin: true,
        userRoles: [],
      }),
      create: jest.fn().mockResolvedValue({
        id: 'new-user-2',
        name: 'Charlie',
        email: 'charlie@example.com',
        isSuperAdmin: true,
        userRoles: [],
      }),
    });
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    const result = await svc.register(
      { name: 'Charlie', email: 'charlie@example.com', password: 'password123', isSuperAdmin: true },
      'superadmin-user-id',
    );

    expect(result.id).toBe('new-user-2');
    expect(result.isSuperAdmin).toBe(true);
  });

  it('throws ForbiddenException when current user is not admin or superadmin', async () => {
    const usersService = makeUsersService();
    const jwtService = makeJwtService();
    const prisma = makePrisma({
      findUnique: jest.fn().mockResolvedValue({
        isSuperAdmin: false,
        userRoles: [{ role: { name: 'doctor' } }],
      }),
    });
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    await expect(
      svc.register(
        { name: 'Bob', email: 'bob@example.com', password: 'password123' },
        'doctor-user-id',
      ),
    ).rejects.toThrow(ForbiddenException);
  });
});

describe('AuthService.getCurrentUser', () => {
  it('returns current user with roles and isSuperAdmin', async () => {
    const usersService = makeUsersService({
      findPublicById: jest.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        isSuperAdmin: true,
        userRoles: [{ role: { name: 'admin' } }, { role: { name: 'doctor' } }],
      }),
    });
    const jwtService = makeJwtService();
    const prisma = makePrisma();
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    const result = await svc.getCurrentUser('user-1');

    expect(result.id).toBe('user-1');
    expect(result.name).toBe('Alice');
    expect(result.email).toBe('alice@example.com');
    expect(result.roles).toEqual(['admin', 'doctor']);
    expect(result.isSuperAdmin).toBe(true);
  });

  it('throws UnauthorizedException when user is not found', async () => {
    const usersService = makeUsersService();
    const jwtService = makeJwtService();
    const prisma = makePrisma();
    const rolesService = makeRolesService();
    const svc = new AuthService(usersService, jwtService, prisma, rolesService);

    await expect(svc.getCurrentUser('nonexistent')).rejects.toThrow(UnauthorizedException);
  });
});
