import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { createPaginatedResult, getPaginationParams, PaginatedResult } from '../common/pagination';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    filters: { patientId?: string; from?: string; to?: string },
    pagination?: { page?: string; limit?: string }
  ): Promise<PaginatedResult<any>> {
    const where: Record<string, unknown> = {};
    if (filters.patientId) where.patientId = filters.patientId;
    if (filters.from || filters.to) {
      where.visitDate = {};
      if (filters.from) (where.visitDate as any).gte = new Date(filters.from);
      if (filters.to) (where.visitDate as any).lte = new Date(filters.to);
    }

    const { page, limit, skip } = getPaginationParams(pagination ?? {});

    const [data, total] = await Promise.all([
      this.prisma.medicalRecord.findMany({
        where,
        include: {
          patient: true,
          createdBy: { select: { id: true, name: true } },
          vitalSigns: true,
        },
        orderBy: { visitDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.medicalRecord.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async get(id: string) {
    const found = await this.prisma.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        createdBy: { select: { id: true, name: true } },
        updatedBy: { select: { id: true, name: true } },
        vitalSigns: true,
      },
    });
    if (!found) throw new NotFoundException('Medical record not found');
    return found;
  }

  async create(dto: CreateMedicalRecordDto, userId: string) {
    const { vitalSigns, ...recordData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const record = await tx.medicalRecord.create({
        data: {
          patientId: recordData.patientId,
          visitDate: new Date(recordData.visitDate),
          summary: recordData.summary,
          diagnoses: recordData.diagnoses,
          treatments: recordData.treatments,
          prescriptions: recordData.prescriptions,
          appointmentId: recordData.appointmentId,
          bodyConditionScore: recordData.bodyConditionScore,
          nextVisitRecommended: recordData.nextVisitRecommended
            ? new Date(recordData.nextVisitRecommended)
            : undefined,
          createdById: userId,
        },
        include: { patient: true, vitalSigns: true },
      });

      if (vitalSigns) {
        await tx.vitalSigns.create({
          data: {
            patientId: record.patientId,
            appointmentId: record.appointmentId,
            medicalRecordId: record.id,
            recordedAt: vitalSigns.recordedAt
              ? new Date(vitalSigns.recordedAt)
              : record.visitDate,
            temperature: vitalSigns.temperature,
            heartRate: vitalSigns.heartRate,
            respiratoryRate: vitalSigns.respiratoryRate,
            bloodPressureSystolic: vitalSigns.bloodPressureSystolic,
            bloodPressureDiastolic: vitalSigns.bloodPressureDiastolic,
            weight: vitalSigns.weight,
            bodyConditionScore: vitalSigns.bodyConditionScore,
            notes: vitalSigns.notes,
            recordedById: userId,
          },
        });
      }

      return tx.medicalRecord.findUnique({
        where: { id: record.id },
        include: {
          patient: true,
          createdBy: { select: { id: true, name: true } },
          vitalSigns: true,
        },
      });
    });
  }

  async update(id: string, dto: UpdateMedicalRecordDto, userId: string) {
    const { vitalSigns, ...recordData } = dto;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.medicalRecord.findUnique({ where: { id } });
      if (!existing) throw new NotFoundException('Medical record not found');

      const data: Record<string, unknown> = {};
      if (recordData.visitDate !== undefined) data.visitDate = new Date(recordData.visitDate);
      if (recordData.summary !== undefined) data.summary = recordData.summary;
      if (recordData.diagnoses !== undefined) data.diagnoses = recordData.diagnoses;
      if (recordData.treatments !== undefined) data.treatments = recordData.treatments;
      if (recordData.prescriptions !== undefined) data.prescriptions = recordData.prescriptions;
      if (recordData.appointmentId !== undefined) data.appointmentId = recordData.appointmentId;
      if (recordData.bodyConditionScore !== undefined) data.bodyConditionScore = recordData.bodyConditionScore;
      if (recordData.nextVisitRecommended !== undefined) {
        data.nextVisitRecommended = recordData.nextVisitRecommended
          ? new Date(recordData.nextVisitRecommended)
          : null;
      }
      data.updatedById = userId;

      const record = await tx.medicalRecord.update({
        where: { id },
        data,
        include: { patient: true, vitalSigns: true },
      });

      if (vitalSigns) {
        const existingVitals = await tx.vitalSigns.findUnique({
          where: { medicalRecordId: id },
        });

        const vitalsData: Record<string, unknown> = {};
        if (vitalSigns.temperature !== undefined) vitalsData.temperature = vitalSigns.temperature;
        if (vitalSigns.heartRate !== undefined) vitalsData.heartRate = vitalSigns.heartRate;
        if (vitalSigns.respiratoryRate !== undefined) vitalsData.respiratoryRate = vitalSigns.respiratoryRate;
        if (vitalSigns.bloodPressureSystolic !== undefined) vitalsData.bloodPressureSystolic = vitalSigns.bloodPressureSystolic;
        if (vitalSigns.bloodPressureDiastolic !== undefined) vitalsData.bloodPressureDiastolic = vitalSigns.bloodPressureDiastolic;
        if (vitalSigns.weight !== undefined) vitalsData.weight = vitalSigns.weight;
        if (vitalSigns.bodyConditionScore !== undefined) vitalsData.bodyConditionScore = vitalSigns.bodyConditionScore;
        if (vitalSigns.notes !== undefined) vitalsData.notes = vitalSigns.notes;
        vitalsData.recordedById = userId;
        if (vitalSigns.recordedAt !== undefined) vitalsData.recordedAt = new Date(vitalSigns.recordedAt);

        if (existingVitals) {
          await tx.vitalSigns.update({
            where: { id: existingVitals.id },
            data: vitalsData,
          });
        } else {
          await tx.vitalSigns.create({
            data: {
              patientId: record.patientId,
              appointmentId: record.appointmentId,
              medicalRecordId: record.id,
              recordedAt: vitalSigns.recordedAt
                ? new Date(vitalSigns.recordedAt)
                : record.visitDate,
              temperature: vitalSigns.temperature,
              heartRate: vitalSigns.heartRate,
              respiratoryRate: vitalSigns.respiratoryRate,
              bloodPressureSystolic: vitalSigns.bloodPressureSystolic,
              bloodPressureDiastolic: vitalSigns.bloodPressureDiastolic,
              weight: vitalSigns.weight,
              bodyConditionScore: vitalSigns.bodyConditionScore,
              notes: vitalSigns.notes,
              recordedById: userId,
            },
          });
        }
      }

      return tx.medicalRecord.findUnique({
        where: { id: record.id },
        include: {
          patient: true,
          createdBy: { select: { id: true, name: true } },
          updatedBy: { select: { id: true, name: true } },
          vitalSigns: true,
        },
      });
    });
  }

  async remove(id: string) {
    await this.get(id);
    await this.prisma.vitalSigns.deleteMany({ where: { medicalRecordId: id } });
    await this.prisma.medicalRecord.delete({ where: { id } });
    return { ok: true };
  }

  async listForPatient(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      include: {
        patient: true,
        createdBy: { select: { id: true, name: true } },
        vitalSigns: true,
      },
      orderBy: { visitDate: 'desc' },
    });
  }
}
