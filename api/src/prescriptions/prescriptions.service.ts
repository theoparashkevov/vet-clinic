import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto, CreateFromTemplateDto } from './dto';
import { createPaginatedResult, getPaginationParams } from '../common/pagination';

@Injectable()
export class PrescriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: {
    patientId?: string;
    medication?: string;
    prescribedById?: string;
    active?: boolean;
    isControlled?: boolean;
    page?: string;
    limit?: string;
  }) {
    const where: Prisma.PrescriptionWhereInput = {};

    if (filters.patientId) {
      where.patientId = filters.patientId;
    }

    if (filters.medication) {
      where.medication = { contains: filters.medication };
    }

    if (filters.prescribedById) {
      where.prescribedById = filters.prescribedById;
    }

    if (filters.active !== undefined) {
      where.expiresAt = filters.active ? { gte: new Date() } : { lt: new Date() };
    }

    if (filters.isControlled !== undefined) {
      where.isControlled = filters.isControlled;
    }

    const { page, limit, skip } = getPaginationParams({
      page: filters.page,
      limit: filters.limit,
    });

    const [data, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        orderBy: { prescribedAt: 'desc' },
        skip,
        take: limit,
        include: { patient: { select: { name: true, species: true } } },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return createPaginatedResult(data, total, page, limit);
  }

  async listForPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return this.prisma.prescription.findMany({
      where: { patientId },
      orderBy: { prescribedAt: 'desc' },
    });
  }

  async get(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
      include: { patient: { include: { owner: true } } },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  async create(dto: CreatePrescriptionDto, userId?: string) {
    const patientId = dto.patientId;
    if (!patientId) {
      throw new NotFoundException('Patient ID is required');
    }

    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: { owner: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    let medication = dto.medication;
    let dosage = dto.dosage;
    let frequency = dto.frequency;
    let duration = dto.duration;
    let instructions = dto.instructions;

    if (dto.medicationTemplateId) {
      const template = await this.prisma.medicationTemplate.findUnique({
        where: { id: dto.medicationTemplateId },
      });

      if (!template) {
        throw new NotFoundException('Medication template not found');
      }

      medication = template.name;
      dosage = template.dosage;
      frequency = template.frequency;
      duration = template.duration;
      instructions = template.instructions ?? instructions;
    }

    if (!medication || !dosage || !frequency || !duration) {
      throw new ConflictException('Medication, dosage, frequency, and duration are required when not using a template');
    }

    let veterinarian = dto.veterinarian;
    if (!veterinarian && userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      veterinarian = user?.name || 'Unknown';
    }

    return this.prisma.prescription.create({
      data: {
        patientId,
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        refillsTotal: dto.refillsTotal ?? 0,
        refillsRemaining: dto.refillsTotal ?? 0,
        isControlled: dto.isControlled ?? false,
        prescribedById: userId,
        veterinarian: veterinarian || 'Unknown',
        notes: dto.notes,
      },
    });
  }

  async createFromTemplate(patientId: string, dto: CreateFromTemplateDto, userId?: string) {
    const template = await this.prisma.medicationTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Medication template not found');
    }

    let veterinarian = dto.veterinarian;
    if (!veterinarian && userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      veterinarian = user?.name || 'Unknown';
    }

    return this.prisma.prescription.create({
      data: {
        patientId,
        medication: template.name,
        dosage: template.dosage,
        frequency: template.frequency,
        duration: template.duration,
        instructions: template.instructions,
        expiresAt: new Date(dto.expiresAt),
        refillsTotal: 0,
        refillsRemaining: 0,
        isControlled: false,
        prescribedById: userId,
        veterinarian: veterinarian || 'Unknown',
        notes: dto.notes,
      },
    });
  }

  async update(id: string, dto: UpdatePrescriptionDto) {
    const existing = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    const data: Prisma.PrescriptionUpdateInput = {};

    if (dto.medication !== undefined) data.medication = dto.medication;
    if (dto.dosage !== undefined) data.dosage = dto.dosage;
    if (dto.frequency !== undefined) data.frequency = dto.frequency;
    if (dto.duration !== undefined) data.duration = dto.duration;
    if (dto.instructions !== undefined) data.instructions = dto.instructions;
    if (dto.expiresAt !== undefined) data.expiresAt = new Date(dto.expiresAt);
    if (dto.refillsRemaining !== undefined) data.refillsRemaining = dto.refillsRemaining;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.prescription.update({
      where: { id },
      data,
    });
  }

  async refill(id: string) {
    const prescription = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    if (prescription.refillsRemaining <= 0) {
      throw new ConflictException('No refills remaining');
    }

    return this.prisma.prescription.update({
      where: { id },
      data: {
        refillsRemaining: { decrement: 1 },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.prescription.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Prescription not found');
    }

    await this.prisma.prescription.delete({ where: { id } });
    return { ok: true };
  }

  async checkDrugInteractions(patientId: string, medicationName: string): Promise<string[]> {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        prescriptions: {
          where: {
            expiresAt: { gte: new Date() },
          },
        },
      },
    });

    if (!patient) {
      return [];
    }

    const warnings: string[] = [];
    const allergies = patient.allergies?.toLowerCase() || '';
    const currentMeds = patient.prescriptions.map(p => p.medication.toLowerCase());

    if (allergies.includes(medicationName.toLowerCase())) {
      warnings.push(`ALLERGY ALERT: Patient is allergic to ${medicationName}`);
    }

    const drugPairs: Record<string, string[]> = {
      'carprofen': ['aspirin', 'meloxicam', 'deramaxx', 'previcox'],
      'meloxicam': ['carprofen', 'aspirin', 'prednisone'],
      'prednisone': ['meloxicam', 'carprofen', 'aspirin'],
      'amoxicillin': ['penicillin'],
      'clavamox': ['penicillin'],
    };

    const medLower = medicationName.toLowerCase();
    if (drugPairs[medLower]) {
      for (const currentMed of currentMeds) {
        for (const dangerous of drugPairs[medLower]) {
          if (currentMed.includes(dangerous)) {
            warnings.push(`DRUG INTERACTION: ${medicationName} + ${currentMed} may cause GI ulceration or kidney damage`);
          }
        }
      }
    }

    const nsaids = ['carprofen', 'meloxicam', 'deramaxx', 'previcox', 'aspirin'];
    const conditions = patient.chronicConditions?.toLowerCase() || '';
    if (nsaids.some(n => medLower.includes(n)) && conditions.includes('kidney')) {
      warnings.push('CONTRAINDICATION: NSAIDs may worsen kidney disease - consider alternatives');
    }

    if (nsaids.some(n => medLower.includes(n)) && conditions.includes('dehydration')) {
      warnings.push('CAUTION: NSAIDs in dehydrated patients increase kidney risk - ensure hydration');
    }

    return warnings;
  }
}
