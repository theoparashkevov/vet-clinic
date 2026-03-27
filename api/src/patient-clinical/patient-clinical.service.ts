import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePatientAlertDto,
  UpdatePatientAlertDto,
  CreateVaccinationDto,
  UpdateVaccinationDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
} from './dto';

@Injectable()
export class PatientClinicalService {
  constructor(private readonly prisma: PrismaService) {}

  // Alerts
  async getAlerts(patientId: string) {
    return this.prisma.patientAlert.findMany({
      where: { patientId },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async createAlert(patientId: string, dto: CreatePatientAlertDto) {
    return this.prisma.patientAlert.create({
      data: {
        patientId,
        type: dto.type,
        severity: dto.severity,
        description: dto.description,
      },
    });
  }

  async updateAlert(patientId: string, alertId: string, dto: UpdatePatientAlertDto) {
    const alert = await this.prisma.patientAlert.findFirst({
      where: { id: alertId, patientId },
    });
    if (!alert) throw new NotFoundException('Alert not found');

    return this.prisma.patientAlert.update({
      where: { id: alertId },
      data: dto,
    });
  }

  async deleteAlert(patientId: string, alertId: string) {
    const alert = await this.prisma.patientAlert.findFirst({
      where: { id: alertId, patientId },
    });
    if (!alert) throw new NotFoundException('Alert not found');

    await this.prisma.patientAlert.delete({ where: { id: alertId } });
    return { ok: true };
  }

  // Vaccinations
  async getVaccinations(patientId: string) {
    return this.prisma.vaccination.findMany({
      where: { patientId },
      orderBy: { givenDate: 'desc' },
    });
  }

  async createVaccination(patientId: string, dto: CreateVaccinationDto) {
    return this.prisma.vaccination.create({
      data: {
        patientId,
        type: dto.type,
        name: dto.name,
        givenDate: new Date(dto.givenDate),
        dueDate: new Date(dto.dueDate),
        batchNumber: dto.batchNumber,
        veterinarian: dto.veterinarian,
        notes: dto.notes,
      },
    });
  }

  async updateVaccination(patientId: string, vacId: string, dto: UpdateVaccinationDto) {
    const vac = await this.prisma.vaccination.findFirst({
      where: { id: vacId, patientId },
    });
    if (!vac) throw new NotFoundException('Vaccination not found');

    return this.prisma.vaccination.update({
      where: { id: vacId },
      data: {
        ...dto,
        givenDate: dto.givenDate ? new Date(dto.givenDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async deleteVaccination(patientId: string, vacId: string) {
    const vac = await this.prisma.vaccination.findFirst({
      where: { id: vacId, patientId },
    });
    if (!vac) throw new NotFoundException('Vaccination not found');

    await this.prisma.vaccination.delete({ where: { id: vacId } });
    return { ok: true };
  }

  async getVaccinationStatus(patientId: string) {
    const vaccinations = await this.prisma.vaccination.findMany({
      where: { patientId },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let status: 'current' | 'due-soon' | 'overdue' = 'current';

    for (const vac of vaccinations) {
      if (vac.dueDate < now) {
        status = 'overdue';
        break;
      } else if (vac.dueDate <= thirtyDaysFromNow && status === 'current') {
        status = 'due-soon';
      }
    }

    return {
      status,
      vaccinations,
    };
  }

  // Weight Records
  async getWeightHistory(patientId: string) {
    return this.prisma.weightRecord.findMany({
      where: { patientId },
      orderBy: { date: 'desc' },
    });
  }

  async createWeightRecord(patientId: string, dto: CreateWeightRecordDto) {
    return this.prisma.weightRecord.create({
      data: {
        patientId,
        weight: dto.weight,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async updateWeightRecord(patientId: string, recordId: string, dto: UpdateWeightRecordDto) {
    const record = await this.prisma.weightRecord.findFirst({
      where: { id: recordId, patientId },
    });
    if (!record) throw new NotFoundException('Weight record not found');

    return this.prisma.weightRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async deleteWeightRecord(patientId: string, recordId: string) {
    const record = await this.prisma.weightRecord.findFirst({
      where: { id: recordId, patientId },
    });
    if (!record) throw new NotFoundException('Weight record not found');

    await this.prisma.weightRecord.delete({ where: { id: recordId } });
    return { ok: true };
  }
}
