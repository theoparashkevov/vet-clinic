import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, RegisterDto } from './dto';
import { UsersService } from '../users/users.service';
import { AuthUser, CurrentAuthUser } from './auth.types';
import { verifyPassword, hashPassword } from './password';
import { PrismaService } from '../prisma/prisma.service';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(dto.email);

    if (!user?.passwordHash || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];

    const payload: AuthUser = {
      sub: user.id,
      email: user.email,
      roles,
      name: user.name,
      isSuperAdmin: user.isSuperAdmin,
    };

    return {
      token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        roles,
        name: user.name,
        isSuperAdmin: user.isSuperAdmin,
      },
    };
  }

  async register(dto: RegisterDto, currentUserId: string) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: currentUserId },
      select: { isSuperAdmin: true, userRoles: { select: { role: { select: { name: true } } } } },
    });

    if (!currentUser) {
      throw new UnauthorizedException('User not found');
    }

    const currentRoles = currentUser.userRoles.map((ur) => ur.role.name);
    const isAdmin = currentRoles.includes('admin') || currentUser.isSuperAdmin;

    if (!isAdmin) {
      throw new ForbiddenException('Admin or superadmin access required');
    }

    const passwordHash = hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        isSuperAdmin: dto.isSuperAdmin ?? false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isSuperAdmin: true,
        userRoles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (dto.roleIds && dto.roleIds.length > 0) {
      await this.rolesService.assignRolesToUser(user.id, dto.roleIds, currentUserId);
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
      roles,
    };
  }

  async getCurrentUser(userId: string): Promise<CurrentAuthUser> {
    const user = await this.usersService.findPublicById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const roles = user.userRoles?.map((ur) => ur.role.name) ?? [];

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles,
      isSuperAdmin: user.isSuperAdmin,
    };
  }
}
