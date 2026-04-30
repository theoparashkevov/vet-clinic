import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';

@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    search?: string,
    pagination?: { page?: string; limit?: string },
  ): Promise<PaginatedResult<any>> {
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : undefined;

    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    const [data, total] = await Promise.all([
      this.prisma.owner.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.owner.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async get(id: string) {
    const found = await this.prisma.owner.findUnique({
      where: { id },
      include: { patients: true },
    });
    if (!found) throw new NotFoundException('Owner not found');
    return found;
  }

  create(dto: CreateOwnerDto) {
    return this.prisma.owner.create({ data: dto });
  }

  async update(id: string, dto: UpdateOwnerDto) {
    await this.get(id);
    return this.prisma.owner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.get(id);

    try {
      await this.prisma.owner.delete({ where: { id } });
    } catch (error: any) {
      if (error?.code === 'P2003') {
        throw new ConflictException('Cannot delete owner with linked patients or appointments');
      }
      throw error;
    }

    return { ok: true };
  }
}
