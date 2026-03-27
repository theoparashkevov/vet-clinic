import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVaccinationDto, UpdateVaccinationDto, VaccinationResponse, VaccinationStatus, VaccinationStatusSummary } from './dto';

@Injectable()
export class VaccinationsService {
  constructor(private readonly prisma: PrismaService) {}

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
    // Verify patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const vaccination = await this.prisma.vaccination.create({
      data: {
        patientId,
        name: dto.name,
        type: dto.type || 'core',
        givenDate: new Date(dto.administeredAt),
        dueDate: new Date(dto.dueDate),
        notes: dto.notes,
      },
    });

    return {
      ...vaccination,
      status: this.calculateStatus(vaccination.dueDate),
      administeredAt: vaccination.givenDate.toISOString(),
      dueDate: vaccination.dueDate.toISOString(),
      createdAt: vaccination.createdAt.toISOString(),
      updatedAt: vaccination.updatedAt.toISOString(),
    };
  }

  async update(id: string, dto: UpdateVaccinationDto): Promise<VaccinationResponse> {
    const existing = await this.prisma.vaccination.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Vaccination not found');
    }

    const vaccination = await this.prisma.vaccination.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.administeredAt && { givenDate: new Date(dto.administeredAt) }),
        ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });

    return {
      ...vaccination,
      status: this.calculateStatus(vaccination.dueDate),
      administeredAt: vaccination.givenDate.toISOString(),
      dueDate: vaccination.dueDate.toISOString(),
      createdAt: vaccination.createdAt.toISOString(),
      updatedAt: vaccination.updatedAt.toISOString(),
    };
  }

  async remove(id: string): Promise<void> {
    const existing = await this.prisma.vaccination.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Vaccination not found');
    }

    await this.prisma.vaccination.delete({
      where: { id },
    });
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
