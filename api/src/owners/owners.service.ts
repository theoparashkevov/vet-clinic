import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';

@Injectable()
export class OwnersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.owner.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async get(id: string) {
    const found = await this.prisma.owner.findUnique({ where: { id } });
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
    await this.prisma.owner.delete({ where: { id } });
    return { ok: true };
  }
}
