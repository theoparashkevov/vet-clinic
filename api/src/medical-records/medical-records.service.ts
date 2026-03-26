import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  listForPatient(patientId: string) {
    return this.prisma.medicalRecord.findMany({
      where: { patientId },
      orderBy: { visitDate: 'desc' },
    });
  }

  create(patientId: string, dto: CreateMedicalRecordDto) {
    return this.prisma.medicalRecord.create({
      data: {
        patientId,
        visitDate: new Date(dto.visitDate),
        summary: dto.summary,
        diagnoses: dto.diagnoses,
        treatments: dto.treatments,
        prescriptions: dto.prescriptions,
        appointmentId: dto.appointmentId,
      },
    });
  }

  async update(id: string, dto: UpdateMedicalRecordDto) {
    const found = await this.prisma.medicalRecord.findUnique({ where: { id } });
    if (!found) throw new NotFoundException('Medical record not found');

    const data: Record<string, unknown> = {};
    if (dto.visitDate !== undefined) data.visitDate = new Date(dto.visitDate);
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.diagnoses !== undefined) data.diagnoses = dto.diagnoses;
    if (dto.treatments !== undefined) data.treatments = dto.treatments;
    if (dto.prescriptions !== undefined) data.prescriptions = dto.prescriptions;

    return this.prisma.medicalRecord.update({ where: { id }, data });
  }
}
