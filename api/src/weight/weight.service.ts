import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto, WeightRecordResponse, WeightSummary } from './dto';
import { createPaginatedResult, getPaginationParams } from '../common/pagination';

@Injectable()
export class WeightService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { patientId?: string; page?: string; limit?: string }) {
    const where = filters.patientId ? { patientId: filters.patientId } : {};
    const { page, limit, skip } = getPaginationParams({ page: filters.page, limit: filters.limit });

    const [data, total] = await Promise.all([
      this.prisma.weightRecord.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.weightRecord.count({ where }),
    ]);

    return createPaginatedResult(data.map(r => this.toResponse(r)), total, page, limit);
  }

  async get(id: string): Promise<WeightRecordResponse> {
    const record = await this.prisma.weightRecord.findUnique({ where: { id } });
    if (!record) throw new NotFoundException('Weight record not found');
    return this.toResponse(record);
  }

  async findByPatient(patientId: string): Promise<WeightRecordResponse[]> {
    const records = await this.prisma.weightRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    return records.map(r => this.toResponse(r));
  }

  async getSummary(patientId: string): Promise<WeightSummary> {
    const records = await this.prisma.weightRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    if (records.length === 0) {
      return {
        current: null,
        previous: null,
        trend: null,
        records: [],
      };
    }

    const current = records[0].weight;
    const previous = records.length > 1 ? records[1].weight : null;

    let trend = null;
    if (previous !== null) {
      const diff = current - previous;
      const percentage = (diff / previous) * 100;

      if (Math.abs(percentage) < 2) {
        trend = {
          direction: 'stable' as const,
          percentage: Math.abs(percentage),
          message: 'Weight is stable',
        };
      } else if (percentage > 0) {
        trend = {
          direction: 'up' as const,
          percentage,
          message: percentage > 10 ? 'Significant weight gain' : 'Moderate weight gain',
        };
      } else {
        trend = {
          direction: 'down' as const,
          percentage: Math.abs(percentage),
          message: percentage < -10 ? 'Significant weight loss' : 'Moderate weight loss',
        };
      }
    }

    return {
      current,
      previous,
      trend,
      records: records.map(r => this.toResponse(r)),
    };
  }

  async create(patientId: string, dto: CreateWeightRecordDto): Promise<WeightRecordResponse> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const record = await this.prisma.weightRecord.create({
      data: {
        patientId,
        weight: dto.weight,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });

    return this.toResponse(record);
  }

  async update(id: string, dto: UpdateWeightRecordDto): Promise<WeightRecordResponse> {
    const existing = await this.prisma.weightRecord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Weight record not found');

    const record = await this.prisma.weightRecord.update({
      where: { id },
      data: {
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return this.toResponse(record);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.weightRecord.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Weight record not found');
    await this.prisma.weightRecord.delete({ where: { id } });
  }

  private toResponse(r: any): WeightRecordResponse {
    return {
      id: r.id,
      patientId: r.patientId,
      weight: r.weight,
      date: r.date.toISOString(),
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }
}
