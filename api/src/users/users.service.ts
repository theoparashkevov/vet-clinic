import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { authUserSelect, publicUserSelect } from './user-selects';
import { hashPassword } from '../auth/password';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(pagination?: { page?: string; limit?: string }): Promise<PaginatedResult<any>> {
    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        select: publicUserSelect,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count(),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  listDoctors() {
    return this.prisma.user.findMany({
      where: {
        userRoles: {
          some: {
            role: {
              name: 'doctor',
            },
          },
        },
      },
      select: publicUserSelect,
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = hashPassword(dto.password);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: publicUserSelect,
    });

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findByIdOrThrow(id);

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
        select: { id: true },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already registered');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      select: publicUserSelect,
    });

    return user;
  }

  async remove(id: string) {
    await this.findByIdOrThrow(id);

    const hasAppointments = await this.prisma.appointment.findFirst({
      where: { doctorId: id },
      select: { id: true },
    });

    if (hasAppointments) {
      throw new ConflictException('Cannot delete user with assigned appointments');
    }

    await this.prisma.user.delete({ where: { id } });
    return { ok: true };
  }

  async resetPassword(id: string, dto: ResetPasswordDto) {
    await this.findByIdOrThrow(id);

    const passwordHash = hashPassword(dto.newPassword);

    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return { ok: true };
  }

  findByEmailForAuth(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: authUserSelect,
    });
  }

  findPublicById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  private async findByIdOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
