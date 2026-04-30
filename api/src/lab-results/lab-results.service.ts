import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateLabPanelDto,
  CreateLabResultDto,
  ListLabResultsQuery,
  UpdateLabPanelDto,
  UpdateLabResultDto,
} from './dto';

@Injectable()
export class LabResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPanels(species?: string) {
    const where: Prisma.LabPanelWhereInput = {};
    if (species) {
      where.OR = [{ species }, { species: null }];
    }
    return this.prisma.labPanel.findMany({
      where,
      include: { tests: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ isCommon: 'desc' }, { category: 'asc' }, { name: 'asc' }],
    });
  }

  async createPanel(dto: CreateLabPanelDto) {
    const { tests, ...panelData } = dto;
    return this.prisma.labPanel.create({
      data: {
        ...panelData,
        isCommon: panelData.isCommon ?? false,
        tests: tests?.length
          ? { create: tests.map((t) => ({ ...t, sortOrder: t.sortOrder ?? 0 })) }
          : undefined,
      },
      include: { tests: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async updatePanel(id: string, dto: UpdateLabPanelDto) {
    const existing = await this.prisma.labPanel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab panel not found');
    return this.prisma.labPanel.update({
      where: { id },
      data: dto,
      include: { tests: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  async deletePanel(id: string) {
    const existing = await this.prisma.labPanel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab panel not found');
    await this.prisma.labTest.deleteMany({ where: { panelId: id } });
    await this.prisma.labPanel.delete({ where: { id } });
    return { ok: true };
  }

  async listResults(query: ListLabResultsQuery) {
    const where: Prisma.LabResultWhereInput = {};
    if (query.patientId) where.patientId = query.patientId;
    if (query.status) where.status = query.status;
    if (query.panelId) where.panelId = query.panelId;
    if (query.fromDate || query.toDate) {
      where.testDate = {};
      if (query.fromDate) where.testDate.gte = new Date(query.fromDate);
      if (query.toDate) where.testDate.lte = new Date(query.toDate);
    }

    const page = Math.max(1, parseInt(query.page ?? '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? '20', 10)));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.labResult.findMany({
        where,
        include: {
          panel: true,
          patient: { select: { id: true, name: true, species: true } },
          values: { include: { test: true } },
        },
        orderBy: { testDate: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.labResult.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getResult(id: string) {
    const result = await this.prisma.labResult.findUnique({
      where: { id },
      include: {
        panel: { include: { tests: { orderBy: { sortOrder: 'asc' } } } },
        patient: { select: { id: true, name: true, species: true } },
        values: { include: { test: true } },
      },
    });
    if (!result) throw new NotFoundException('Lab result not found');
    return result;
  }

  async createResult(dto: CreateLabResultDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: dto.patientId },
      select: { id: true, species: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const panel = await this.prisma.labPanel.findUnique({
      where: { id: dto.panelId },
      include: { tests: true },
    });
    if (!panel) throw new NotFoundException('Lab panel not found');

    let abnormalCount = 0;
    let criticalCount = 0;
    const valueData: Prisma.LabResultValueCreateManyLabResultInput[] = [];

    for (const v of dto.values) {
      const test = panel.tests.find((t) => t.id === v.testId);
      if (!test) continue;

      const { status, refMin, refMax } = this.calculateStatus(v.value, test, patient.species);

      if (status === 'critical_low' || status === 'critical_high') {
        criticalCount++;
        abnormalCount++;
      } else if (status === 'low' || status === 'high') {
        abnormalCount++;
      }

      valueData.push({
        testId: v.testId,
        value: v.value,
        displayValue: v.value.toFixed(2),
        status,
        refRangeMin: refMin,
        refRangeMax: refMax,
        notes: v.notes,
      });
    }

    let status = 'normal';
    if (criticalCount > 0) status = 'critical';
    else if (abnormalCount > 0) status = 'abnormal';

    return this.prisma.labResult.create({
      data: {
        patientId: dto.patientId,
        appointmentId: dto.appointmentId,
        panelId: dto.panelId,
        testDate: new Date(dto.testDate),
        externalLab: dto.externalLab,
        notes: dto.notes,
        status,
        abnormalCount,
        criticalCount,
        values: { create: valueData },
      },
      include: {
        panel: true,
        patient: { select: { id: true, name: true, species: true } },
        values: { include: { test: true } },
      },
    });
  }

  async updateResult(id: string, dto: UpdateLabResultDto) {
    const existing = await this.prisma.labResult.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab result not found');

    const data: Prisma.LabResultUpdateInput = {};
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.reviewedDate !== undefined) data.reviewedDate = new Date(dto.reviewedDate);
    if (dto.reviewedBy !== undefined) data.reviewedBy = dto.reviewedBy;
    if (dto.interpretation !== undefined) data.interpretation = dto.interpretation;
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.labResult.update({
      where: { id },
      data,
      include: {
        panel: true,
        patient: { select: { id: true, name: true, species: true } },
        values: { include: { test: true } },
      },
    });
  }

  async deleteResult(id: string) {
    const existing = await this.prisma.labResult.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Lab result not found');
    await this.prisma.labResult.delete({ where: { id } });
    return { ok: true };
  }

  async getPatientLabResults(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    return this.prisma.labResult.findMany({
      where: { patientId },
      include: {
        panel: true,
        values: { include: { test: true } },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  private calculateStatus(
    value: number,
    test: any,
    species: string,
  ): { status: string; refMin: number | null; refMax: number | null } {
    let refMin: number | null = null;
    let refMax: number | null = null;

    if (species === 'Dog' || species === 'dog') {
      refMin = test.refRangeDogMin;
      refMax = test.refRangeDogMax;
    } else if (species === 'Cat' || species === 'cat') {
      refMin = test.refRangeCatMin;
      refMax = test.refRangeCatMax;
    } else {
      refMin = test.refRangeDogMin;
      refMax = test.refRangeDogMax;
    }

    if (test.criticalLow !== null && value <= test.criticalLow) {
      return { status: 'critical_low', refMin, refMax };
    }
    if (test.criticalHigh !== null && value >= test.criticalHigh) {
      return { status: 'critical_high', refMin, refMax };
    }

    if (test.warningLow !== null && value <= test.warningLow) {
      return { status: 'low', refMin, refMax };
    }
    if (test.warningHigh !== null && value >= test.warningHigh) {
      return { status: 'high', refMin, refMax };
    }

    if (refMin !== null && value < refMin) {
      return { status: 'low', refMin, refMax };
    }
    if (refMax !== null && value > refMax) {
      return { status: 'high', refMin, refMax };
    }

    return { status: 'normal', refMin, refMax };
  }
}
