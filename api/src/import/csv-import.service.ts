import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CsvLabPanelDto,
  CsvLabTestDto,
  CsvMedicationTemplateDto,
  CsvNoteTemplateDto,
} from './dto';

interface CsvImportResult {
  success: number;
  errors: number;
  messages: string[];
}

@Injectable()
export class CsvImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importLabPanels(data: CsvLabPanelDto[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      if (!row.name) {
        result.errors++;
        result.messages.push(`Error: Missing panel name`);
      }
    }

    if (result.errors > 0) {
      return result;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const row of data) {
          const existing = await tx.labPanel.findFirst({
            where: { name: row.name },
          });

          const panelData = {
            name: row.name,
            category: row.category || 'Other',
            description: row.description || null,
            species: row.species || null,
            isCommon: this.parseBoolean(row.isCommon, false),
          };

          if (existing) {
            await tx.labPanel.update({
              where: { id: existing.id },
              data: panelData,
            });
          } else {
            await tx.labPanel.create({
              data: panelData,
            });
          }

          result.success++;
        }
      });
    } catch (error: any) {
      result.errors = data.length - result.success;
      result.messages.push(`Transaction failed: ${error.message}`);
    }

    return result;
  }

  async importLabTests(data: CsvLabTestDto[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      if (!row.name || !row.panelName) {
        result.errors++;
        result.messages.push(`Error: Missing test name or panel name`);
      }
    }

    if (result.errors > 0) {
      return result;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const panels = await tx.labPanel.findMany({
          select: { id: true, name: true },
        });
        const panelMap = new Map(panels.map((p) => [p.name, p.id]));

        for (const row of data) {
          const panelId = panelMap.get(row.panelName);
          if (!panelId) {
            throw new Error(`Panel "${row.panelName}" not found. Create the panel first.`);
          }

          const existingTest = await tx.labTest.findFirst({
            where: {
              panelId,
              name: row.name,
            },
          });

          const sortOrder = row.sortOrder ?? 0;

          const testData = {
            panelId,
            name: row.name,
            abbreviation: row.abbreviation || null,
            unit: row.unit || '',
            refRangeDogMin: row.refRangeDogMin ?? null,
            refRangeDogMax: row.refRangeDogMax ?? null,
            refRangeCatMin: row.refRangeCatMin ?? null,
            refRangeCatMax: row.refRangeCatMax ?? null,
            criticalLow: row.criticalLow ?? null,
            criticalHigh: row.criticalHigh ?? null,
            warningLow: row.warningLow ?? null,
            warningHigh: row.warningHigh ?? null,
            sortOrder,
          };

          if (existingTest) {
            await tx.labTest.update({
              where: { id: existingTest.id },
              data: testData,
            });
          } else {
            await tx.labTest.create({
              data: testData,
            });
          }

          result.success++;
        }
      });
    } catch (error: any) {
      result.errors = data.length - result.success;
      result.messages.push(`Transaction failed: ${error.message}`);
    }

    return result;
  }

  async importMedicationTemplates(data: CsvMedicationTemplateDto[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      if (!row.name) {
        result.errors++;
        result.messages.push(`Error: Missing medication name`);
      }
    }

    if (result.errors > 0) {
      return result;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const row of data) {
          const existing = await tx.medicationTemplate.findFirst({
            where: { name: row.name },
          });

          const medData = {
            name: row.name,
            category: row.category || 'Other',
            dosage: row.dosage || '',
            frequency: row.frequency || '',
            duration: row.duration || '',
            instructions: row.instructions || '',
            isCommon: this.parseBoolean(row.isCommon, false),
          };

          if (existing) {
            await tx.medicationTemplate.update({
              where: { id: existing.id },
              data: medData,
            });
          } else {
            await tx.medicationTemplate.create({
              data: medData,
            });
          }

          result.success++;
        }
      });
    } catch (error: any) {
      result.errors = data.length - result.success;
      result.messages.push(`Transaction failed: ${error.message}`);
    }

    return result;
  }

  async importNoteTemplates(data: CsvNoteTemplateDto[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      if (!row.name) {
        result.errors++;
        result.messages.push(`Error: Missing template name`);
      }
    }

    if (result.errors > 0) {
      return result;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        for (const row of data) {
          const existing = await tx.noteTemplate.findFirst({
            where: { name: row.name },
          });

          const templateData = {
            name: row.name,
            category: row.category || 'General',
            content: row.content || '',
            isCommon: this.parseBoolean(row.isCommon, false),
          };

          if (existing) {
            await tx.noteTemplate.update({
              where: { id: existing.id },
              data: templateData,
            });
          } else {
            await tx.noteTemplate.create({
              data: templateData,
            });
          }

          result.success++;
        }
      });
    } catch (error: any) {
      result.errors = data.length - result.success;
      result.messages.push(`Transaction failed: ${error.message}`);
    }

    return result;
  }

  private parseBoolean(value: boolean | string | undefined, defaultValue: boolean): boolean {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'yes';
    }
    return defaultValue;
  }

  getLabPanelTemplate(): string {
    const headers = ['name', 'category', 'description', 'species', 'isCommon'];
    const sample = ['Complete Blood Count', 'Hematology', 'CBC with differential', '', 'true'];
    return [headers.join(','), sample.join(',')].join('\n');
  }

  getLabTestTemplate(): string {
    const headers = ['panelName', 'name', 'abbreviation', 'unit', 'refRangeDogMin', 'refRangeDogMax', 'refRangeCatMin', 'refRangeCatMax', 'criticalLow', 'criticalHigh', 'sortOrder'];
    const sample = ['Complete Blood Count', 'Red Blood Cells', 'RBC', 'M/µL', '5.5', '8.5', '5.0', '10.0', '4.0', '12.0', '1'];
    return [headers.join(','), sample.join(',')].join('\n');
  }

  getMedicationTemplate(): string {
    const headers = ['name', 'category', 'dosage', 'frequency', 'duration', 'instructions', 'isCommon'];
    const sample = ['Amoxicillin 250mg', 'Antibiotic', '1 tablet', 'Twice daily', '7 days', 'Give with food', 'true'];
    return [headers.join(','), sample.join(',')].join('\n');
  }

  getNoteTemplate(): string {
    const headers = ['name', 'category', 'content', 'isCommon'];
    const sample = ['Wellness Exam - Normal', 'Wellness', 'Patient {{patientName}} presented for routine wellness examination. All systems normal.', 'true'];
    return [headers.join(','), sample.join(',')].join('\n');
  }
}