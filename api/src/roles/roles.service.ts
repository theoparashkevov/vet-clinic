import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async create(data: { name: string; description?: string }) {
    const existing = await this.prisma.role.findUnique({
      where: { name: data.name },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Role with this name already exists');
    }

    return this.prisma.role.create({
      data,
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async assignRolesToUser(userId: string, roleIds: string[], assignedById?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true },
    });

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('One or more roles not found');
    }

    const existingAssignments = await this.prisma.userRole.findMany({
      where: { userId },
      select: { roleId: true },
    });

    const existingRoleIds = new Set(existingAssignments.map((a) => a.roleId));
    const newRoleIds = roleIds.filter((id) => !existingRoleIds.has(id));

    if (newRoleIds.length === 0) {
      return this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
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
    }

    await this.prisma.userRole.createMany({
      data: newRoleIds.map((roleId) => ({
        userId,
        roleId,
        assignedById: assignedById ?? null,
      })),
    });

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
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
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.userRole.deleteMany({
      where: { userId, roleId },
    });

    return { ok: true };
  }
}
