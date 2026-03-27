import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWeightRecordDto, UpdateWeightRecordDto, WeightRecordResponse, WeightSummary } from './dto';

@Injectable()
export class WeightService {
  constructor(private readonly prisma: PrismaService) {}

  async findByPatient(patientId: string): Promise<WeightRecordResponse[]> {
    const records = await this.prisma.weightRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });

    return records.map(r => ({
      id: r.id,
      weight: r.weight,
      date: r.date.toISOString(),
      notes: r.notes,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
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
      records: records.map(r => ({
        id: r.id,
        weight: r.weight,
        date: r.date.toISOString(),
        notes: r.notes,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
    };
  }

  async create(patientId: string, dto: CreateWeightRecordDto): Promise<WeightRecordResponse> {
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const record = await this.prisma.weightRecord.create({
      data: {
        patientId,
        weight: dto.weight,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });

    return {
      id: record.id,
      weight: record.weight,
      date: record.date.toISOString(),
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateWeightRecordDto): Promise<WeightRecordResponse> {
    const existing = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Weight record not found');
    }

    const record = await this.prisma.weightRecord.update({
      where: { id },
      data: {
        ...(dto.weight !== undefined && { weight: dto.weight }),
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return {
      id: record.id,
      weight: record.weight,
      date: record.date.toISOString(),
      notes: record.notes,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.weightRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Weight record not found');
    }

    await this.prisma.weightRecord.delete({
      where: { id },
    });
  }
}
