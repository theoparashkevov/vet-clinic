import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  list(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { species: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    return this.prisma.patient.findMany({
      where,
      include: { owner: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: string) {
    const found = await this.prisma.patient.findUnique({
      where: { id },
      include: { owner: true },
    });
    if (!found) throw new NotFoundException('Patient not found');
    return found;
  }

  create(dto: CreatePatientDto) {
    return this.prisma.patient.create({
      data: {
        ...dto,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
      include: { owner: true },
    });
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.get(id);
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthdate: dto.birthdate ? new Date(dto.birthdate) : undefined,
      },
      include: { owner: true },
    });
  }

  async remove(id: string) {
    await this.get(id);

    try {
      await this.prisma.patient.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Cannot delete patient with linked appointments or medical records');
      }

      throw error;
    }

    return { ok: true };
  }
}
