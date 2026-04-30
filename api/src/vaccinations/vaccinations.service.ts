import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationDto, UpdateVaccinationDto, VaccinationResponse, VaccinationStatus, VaccinationStatusSummary } from './dto';
import { createPaginatedResult, getPaginationParams } from '../common/pagination';

@Injectable()
export class VaccinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: { patientId?: string; page?: string; limit?: string }) {
    const where = filters.patientId ? { patientId: filters.patientId } : {};
    const { page, limit, skip } = getPaginationParams({ page: filters.page, limit: filters.limit });

    const [data, total] = await Promise.all([
      this.prisma.vaccination.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.vaccination.count({ where }),
    ]);

    return createPaginatedResult(
      data.map(v => this.toResponse(v)),
      total,
      page,
      limit,
    );
  }

  async get(id: string): Promise<VaccinationResponse> {
    const vaccination = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!vaccination) throw new NotFoundException('Vaccination not found');
    return this.toResponse(vaccination);
  }

  async findByPatient(patientId: string): Promise<VaccinationResponse[]> {
    const vaccinations = await this.prisma.vaccination.findMany({
      where: { patientId },
      orderBy: { dueDate: 'asc' },
    });

    return vaccinations.map(v => ({
      ...v,
      status: this.calculateStatus(v.dueDate),
      administeredAt: v.givenDate.toISOString(),
      dueDate: v.dueDate.toISOString(),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    }));
  }

  async getStatusSummary(patientId: string): Promise<VaccinationStatusSummary> {
    const vaccinations = await this.prisma.vaccination.findMany({
      where: { patientId },
      orderBy: { dueDate: 'asc' },
    });

    const vaccinationStatuses = vaccinations.map(v => ({
      id: v.id,
      name: v.name,
      dueDate: v.dueDate.toISOString(),
      status: this.calculateStatus(v.dueDate),
    }));

    const summary = {
      current: vaccinationStatuses.filter(v => v.status === 'current').length,
      dueSoon: vaccinationStatuses.filter(v => v.status === 'due-soon').length,
      overdue: vaccinationStatuses.filter(v => v.status === 'overdue').length,
      total: vaccinationStatuses.length,
    };

    const overallStatus = this.calculateOverallStatus(vaccinationStatuses.map(v => v.status));

    return {
      status: overallStatus,
      summary,
      vaccinations: vaccinationStatuses,
    };
  }

  async create(patientId: string, dto: CreateVaccinationDto): Promise<VaccinationResponse> {
    const patient = await this.prisma.patient.findUnique({ where: { id: patientId } });
    if (!patient) throw new NotFoundException('Patient not found');

    const vaccination = await this.prisma.vaccination.create({
      data: {
        patientId,
        name: dto.name,
        type: dto.type || 'core',
        givenDate: new Date(dto.administeredAt),
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
        batchNumber: dto.batchNumber,
        veterinarian: dto.veterinarian,
      },
    });

    return this.toResponse(vaccination);
  }

  async update(id: string, dto: UpdateVaccinationDto): Promise<VaccinationResponse> {
    const existing = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vaccination not found');

    const vaccination = await this.prisma.vaccination.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.administeredAt && { givenDate: new Date(dto.administeredAt) }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.batchNumber !== undefined && { batchNumber: dto.batchNumber }),
        ...(dto.veterinarian !== undefined && { veterinarian: dto.veterinarian }),
      },
    });

    return this.toResponse(vaccination);
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.vaccination.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Vaccination not found');
    await this.prisma.vaccination.delete({ where: { id } });
  }

  private toResponse(v: any): VaccinationResponse {
    return {
      id: v.id,
      patientId: v.patientId,
      name: v.name,
      type: v.type,
      administeredAt: v.givenDate.toISOString(),
      dueDate: v.dueDate.toISOString(),
      notes: v.notes,
      batchNumber: v.batchNumber,
      veterinarian: v.veterinarian,
      status: this.calculateStatus(v.dueDate),
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    };
  }

  private calculateStatus(dueDate: Date): VaccinationStatus {
    const now = new Date();
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 30) return 'due-soon';
    return 'current';
  }

  private calculateOverallStatus(statuses: VaccinationStatus[]): VaccinationStatus {
    if (statuses.length === 0) return 'current';
    if (statuses.includes('overdue')) return 'overdue';
    if (statuses.includes('due-soon')) return 'due-soon';
    return 'current';
  }
}
