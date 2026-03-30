import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CsvLabPanel {
  name: string;
  category?: string;
  description?: string;
  species?: string;
  isCommon?: boolean | string;
}

interface CsvLabTest {
  panelName: string;
  name: string;
  abbreviation?: string;
  unit?: string;
  refRangeDogMin?: number | string;
  refRangeDogMax?: number | string;
  refRangeCatMin?: number | string;
  refRangeCatMax?: number | string;
  criticalLow?: number | string;
  criticalHigh?: number | string;
  warningLow?: number | string;
  warningHigh?: number | string;
  sortOrder?: number | string;
}

interface CsvMedicationTemplate {
  name: string;
  category?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  isCommon?: boolean | string;
}

interface CsvNoteTemplate {
  name: string;
  category?: string;
  content?: string;
  isCommon?: boolean | string;
}

interface CsvImportResult {
  success: number;
  errors: number;
  messages: string[];
}

@Injectable()
export class CsvImportService {
  constructor(private readonly prisma: PrismaService) {}

  async importLabPanels(data: CsvLabPanel[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      try {
        if (!row.name) {
          result.errors++;
          result.messages.push(`Error: Missing panel name`);
          continue;
        }

        // Check if panel exists by name
        const existing = await this.prisma.labPanel.findFirst({
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
          await this.prisma.labPanel.update({
            where: { id: existing.id },
            data: panelData,
          });
        } else {
          await this.prisma.labPanel.create({
            data: panelData,
          });
        }

        result.success++;
      } catch (error: any) {
        result.errors++;
        result.messages.push(`Error importing panel "${row.name}": ${error.message}`);
      }
    }

    return result;
  }

  async importLabTests(data: CsvLabTest[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    // Build a map of panel names to IDs
    const panels = await this.prisma.labPanel.findMany({
      select: { id: true, name: true },
    });
    const panelMap = new Map(panels.map((p) => [p.name, p.id]));

    for (const row of data) {
      try {
        if (!row.name || !row.panelName) {
          result.errors++;
          result.messages.push(`Error: Missing test name or panel name`);
          continue;
        }

        const panelId = panelMap.get(row.panelName);
        if (!panelId) {
          result.errors++;
          result.messages.push(`Error: Panel "${row.panelName}" not found. Create the panel first.`);
          continue;
        }

        // Check if test exists in this panel
        const existingTest = await this.prisma.labTest.findFirst({
          where: {
            panelId,
            name: row.name,
          },
        });

        const sortOrder = this.parseNumber(row.sortOrder, 0) ?? 0;

        const testData = {
          panelId,
          name: row.name,
          abbreviation: row.abbreviation || null,
          unit: row.unit || '',
          refRangeDogMin: this.parseNumber(row.refRangeDogMin, null),
          refRangeDogMax: this.parseNumber(row.refRangeDogMax, null),
          refRangeCatMin: this.parseNumber(row.refRangeCatMin, null),
          refRangeCatMax: this.parseNumber(row.refRangeCatMax, null),
          criticalLow: this.parseNumber(row.criticalLow, null),
          criticalHigh: this.parseNumber(row.criticalHigh, null),
          warningLow: this.parseNumber(row.warningLow, null),
          warningHigh: this.parseNumber(row.warningHigh, null),
          sortOrder,
        };

        if (existingTest) {
          await this.prisma.labTest.update({
            where: { id: existingTest.id },
            data: testData,
          });
        } else {
          await this.prisma.labTest.create({
            data: testData,
          });
        }

        result.success++;
      } catch (error: any) {
        result.errors++;
        result.messages.push(`Error importing test "${row.name}": ${error.message}`);
      }
    }

    return result;
  }

  async importMedicationTemplates(data: CsvMedicationTemplate[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      try {
        if (!row.name) {
          result.errors++;
          result.messages.push(`Error: Missing medication name`);
          continue;
        }

        // Check if medication exists by name
        const existing = await this.prisma.medicationTemplate.findFirst({
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
          await this.prisma.medicationTemplate.update({
            where: { id: existing.id },
            data: medData,
          });
        } else {
          await this.prisma.medicationTemplate.create({
            data: medData,
          });
        }

        result.success++;
      } catch (error: any) {
        result.errors++;
        result.messages.push(`Error importing "${row.name}": ${error.message}`);
      }
    }

    return result;
  }

  async importNoteTemplates(data: CsvNoteTemplate[]): Promise<CsvImportResult> {
    const result: CsvImportResult = { success: 0, errors: 0, messages: [] };

    for (const row of data) {
      try {
        if (!row.name) {
          result.errors++;
          result.messages.push(`Error: Missing template name`);
          continue;
        }

        // Check if template exists by name
        const existing = await this.prisma.noteTemplate.findFirst({
          where: { name: row.name },
        });

        const templateData = {
          name: row.name,
          category: row.category || 'General',
          content: row.content || '',
          isCommon: this.parseBoolean(row.isCommon, false),
        };

        if (existing) {
          await this.prisma.noteTemplate.update({
            where: { id: existing.id },
            data: templateData,
          });
        } else {
          await this.prisma.noteTemplate.create({
            data: templateData,
          });
        }

        result.success++;
      } catch (error: any) {
        result.errors++;
        result.messages.push(`Error importing "${row.name}": ${error.message}`);
      }
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

  private parseNumber(value: number | string | undefined, defaultValue: number | null): number | null {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  // Get templates for download
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
