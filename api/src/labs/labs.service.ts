import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLabPanelDto, CreateLabTestDto, CreateLabResultDto, UpdateLabResultDto, UpdateLabPanelDto, UpdateLabTestDto } from './dto';

@Injectable()
export class LabsService {
  private readonly logger = new Logger(LabsService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Lab Panels ─────────────────────────────────────────────────────────────

  async findAllPanels(species?: string) {
    const where: any = {};
    if (species) {
      where.OR = [
        { species: species },
        { species: null },
      ];
    }

    return this.prisma.labPanel.findMany({
      where,
      include: {
        tests: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [
        { isCommon: 'desc' },
        { category: 'asc' },
        { name: 'asc' },
      ],
    });
  }

  async findCommonPanels(species?: string) {
    const where: any = { isCommon: true };
    if (species) {
      where.OR = [
        { species: species },
        { species: null },
      ];
    }

    return this.prisma.labPanel.findMany({
      where,
      include: {
        tests: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async createPanel(dto: CreateLabPanelDto) {
    return this.prisma.labPanel.create({
      data: {
        name: dto.name,
        category: dto.category,
        description: dto.description,
        species: dto.species,
        isCommon: dto.isCommon ?? false,
      },
    });
  }

  async updatePanel(id: string, dto: UpdateLabPanelDto) {
    const existing = await this.prisma.labPanel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lab panel not found');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.species !== undefined) data.species = dto.species;
    if (dto.isCommon !== undefined) data.isCommon = dto.isCommon;

    return this.prisma.labPanel.update({ where: { id }, data });
  }

  async deletePanel(id: string) {
    const existing = await this.prisma.labPanel.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lab panel not found');
    }

    // Check if there are any tests associated with this panel
    const testCount = await this.prisma.labTest.count({ where: { panelId: id } });
    if (testCount > 0) {
      // Delete all tests first
      await this.prisma.labTest.deleteMany({ where: { panelId: id } });
    }

    await this.prisma.labPanel.delete({ where: { id } });
    return { ok: true };
  }

  // ── Lab Tests ──────────────────────────────────────────────────────────────

  async findTestsByPanel(panelId: string) {
    return this.prisma.labTest.findMany({
      where: { panelId },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createTest(dto: CreateLabTestDto) {
    const panel = await this.prisma.labPanel.findUnique({
      where: { id: dto.panelId },
    });

    if (!panel) {
      throw new NotFoundException('Lab panel not found');
    }

    return this.prisma.labTest.create({
      data: {
        panelId: dto.panelId,
        name: dto.name,
        abbreviation: dto.abbreviation,
        unit: dto.unit,
        refRangeDogMin: dto.refRangeDogMin,
        refRangeDogMax: dto.refRangeDogMax,
        refRangeCatMin: dto.refRangeCatMin,
        refRangeCatMax: dto.refRangeCatMax,
        criticalLow: dto.criticalLow,
        criticalHigh: dto.criticalHigh,
        warningLow: dto.warningLow,
        warningHigh: dto.warningHigh,
        sortOrder: dto.sortOrder ?? 0,
      },
    });
  }

  async updateTest(id: string, dto: UpdateLabTestDto) {
    const existing = await this.prisma.labTest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lab test not found');
    }

    const data: any = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.abbreviation !== undefined) data.abbreviation = dto.abbreviation;
    if (dto.unit !== undefined) data.unit = dto.unit;
    if (dto.refRangeDogMin !== undefined) data.refRangeDogMin = dto.refRangeDogMin;
    if (dto.refRangeDogMax !== undefined) data.refRangeDogMax = dto.refRangeDogMax;
    if (dto.refRangeCatMin !== undefined) data.refRangeCatMin = dto.refRangeCatMin;
    if (dto.refRangeCatMax !== undefined) data.refRangeCatMax = dto.refRangeCatMax;
    if (dto.criticalLow !== undefined) data.criticalLow = dto.criticalLow;
    if (dto.criticalHigh !== undefined) data.criticalHigh = dto.criticalHigh;
    if (dto.warningLow !== undefined) data.warningLow = dto.warningLow;
    if (dto.warningHigh !== undefined) data.warningHigh = dto.warningHigh;
    if (dto.sortOrder !== undefined) data.sortOrder = dto.sortOrder;

    return this.prisma.labTest.update({ where: { id }, data });
  }

  async deleteTest(id: string) {
    const existing = await this.prisma.labTest.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Lab test not found');
    }

    await this.prisma.labTest.delete({ where: { id } });
    return { ok: true };
  }

  // ── Lab Results ────────────────────────────────────────────────────────────

  async findByPatient(patientId: string) {
    return this.prisma.labResult.findMany({
      where: { patientId },
      include: {
        panel: true,
        values: {
          include: {
            test: true,
          },
        },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.labResult.findUnique({
      where: { id },
      include: {
        panel: {
          include: {
            tests: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        patient: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
        values: {
          include: {
            test: true,
          },
          orderBy: {
            test: {
              sortOrder: 'asc',
            },
          },
        },
      },
    });

    if (!result) {
      throw new NotFoundException('Lab result not found');
    }

    return result;
  }

  async create(patientId: string, dto: CreateLabResultDto, veterinarian?: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      select: { id: true, species: true },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const panel = await this.prisma.labPanel.findUnique({
      where: { id: dto.panelId },
      include: {
        tests: true,
      },
    });

    if (!panel) {
      throw new NotFoundException('Lab panel not found');
    }

    // Calculate statuses for each value
    let abnormalCount = 0;
    let criticalCount = 0;
    const valueData: any[] = [];

    for (const valueDto of dto.values) {
      const test = panel.tests.find(t => t.id === valueDto.testId);
      if (!test) continue;

      const { status, refMin, refMax } = this.calculateStatus(
        valueDto.value,
        test,
        patient.species,
      );

      if (status === 'critical_low' || status === 'critical_high') {
        criticalCount++;
        abnormalCount++;
      } else if (status === 'low' || status === 'high') {
        abnormalCount++;
      }

      valueData.push({
        testId: valueDto.testId,
        value: valueDto.value,
        displayValue: valueDto.value.toFixed(2),
        status,
        refRangeMin: refMin,
        refRangeMax: refMax,
        notes: valueDto.notes,
      });
    }

    // Determine overall status
    let status = 'normal';
    if (criticalCount > 0) {
      status = 'critical';
    } else if (abnormalCount > 0) {
      status = 'abnormal';
    }

    return this.prisma.labResult.create({
      data: {
        patientId,
        appointmentId: dto.appointmentId,
        panelId: dto.panelId,
        testDate: new Date(dto.testDate),
        externalLab: dto.externalLab,
        notes: dto.notes,
        reviewedBy: veterinarian,
        status,
        abnormalCount,
        criticalCount,
        values: {
          create: valueData,
        },
      },
      include: {
        panel: true,
        values: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateLabResultDto) {
    const existing = await this.prisma.labResult.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Lab result not found');
    }

    const data: any = {};
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
        values: {
          include: {
            test: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.labResult.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Lab result not found');
    }

    await this.prisma.labResult.delete({ where: { id } });
    return { ok: true };
  }

  // ── Trends & History ───────────────────────────────────────────────────────

  async getTestHistory(patientId: string, testId: string, limit: number = 10) {
    const history = await this.prisma.labResultValue.findMany({
      where: {
        testId,
        labResult: {
          patientId,
        },
      },
      include: {
        labResult: {
          select: {
            testDate: true,
          },
        },
        test: true,
      },
      orderBy: {
        labResult: {
          testDate: 'desc',
        },
      },
      take: limit,
    });

    return history.map(h => ({
      date: h.labResult.testDate,
      value: h.value,
      status: h.status,
    }));
  }

  async getPendingLabResults(patientId: string) {
    return this.prisma.labResult.findMany({
      where: {
        patientId,
        status: { in: ['pending', 'abnormal', 'critical'] },
      },
      include: {
        panel: true,
        values: {
          include: {
            test: true,
          },
        },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  // ── Helper Methods ─────────────────────────────────────────────────────────

  private calculateStatus(
    value: number,
    test: any,
    species: string,
  ): { status: string; refMin: number | null; refMax: number | null } {
    // Get reference range based on species
    let refMin: number | null = null;
    let refMax: number | null = null;

    if (species === 'Dog' || species === 'dog') {
      refMin = test.refRangeDogMin;
      refMax = test.refRangeDogMax;
    } else if (species === 'Cat' || species === 'cat') {
      refMin = test.refRangeCatMin;
      refMax = test.refRangeCatMax;
    } else {
      // Use dog ranges as default if species not specified
      refMin = test.refRangeDogMin;
      refMax = test.refRangeDogMax;
    }

    // Check critical values first
    if (test.criticalLow !== null && value <= test.criticalLow) {
      return { status: 'critical_low', refMin, refMax };
    }
    if (test.criticalHigh !== null && value >= test.criticalHigh) {
      return { status: 'critical_high', refMin, refMax };
    }

    // Check warning thresholds
    if (test.warningLow !== null && value <= test.warningLow) {
      return { status: 'low', refMin, refMax };
    }
    if (test.warningHigh !== null && value >= test.warningHigh) {
      return { status: 'high', refMin, refMax };
    }

    // Check reference range
    if (refMin !== null && value < refMin) {
      return { status: 'low', refMin, refMax };
    }
    if (refMax !== null && value > refMax) {
      return { status: 'high', refMin, refMax };
    }

    return { status: 'normal', refMin, refMax };
  }
}
