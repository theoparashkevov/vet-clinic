import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CsvImportService } from './csv-import.service';
import { StaffAccess } from '../auth/staff-access.decorator';

interface CsvImportBody {
  data: Record<string, any>[];
}

@StaffAccess()
@Controller('import')
export class ImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Post('lab-panels')
  async importLabPanels(@Body() body: CsvImportBody) {
    if (!Array.isArray(body.data)) {
      throw new BadRequestException('Expected data array');
    }
    return this.csvImportService.importLabPanels(body.data as any);
  }

  @Post('lab-tests')
  async importLabTests(@Body() body: CsvImportBody) {
    if (!Array.isArray(body.data)) {
      throw new BadRequestException('Expected data array');
    }
    return this.csvImportService.importLabTests(body.data as any);
  }

  @Post('medication-templates')
  async importMedicationTemplates(@Body() body: CsvImportBody) {
    if (!Array.isArray(body.data)) {
      throw new BadRequestException('Expected data array');
    }
    return this.csvImportService.importMedicationTemplates(body.data as any);
  }

  @Post('note-templates')
  async importNoteTemplates(@Body() body: CsvImportBody) {
    if (!Array.isArray(body.data)) {
      throw new BadRequestException('Expected data array');
    }
    return this.csvImportService.importNoteTemplates(body.data as any);
  }

  // Template downloads
  @Get('templates/lab-panels')
  downloadLabPanelTemplate(@Res() res: Response) {
    const csv = this.csvImportService.getLabPanelTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lab-panels-template.csv"');
    res.send(csv);
  }

  @Get('templates/lab-tests')
  downloadLabTestTemplate(@Res() res: Response) {
    const csv = this.csvImportService.getLabTestTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="lab-tests-template.csv"');
    res.send(csv);
  }

  @Get('templates/medication-templates')
  downloadMedicationTemplate(@Res() res: Response) {
    const csv = this.csvImportService.getMedicationTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="medication-templates-template.csv"');
    res.send(csv);
  }

  @Get('templates/note-templates')
  downloadNoteTemplate(@Res() res: Response) {
    const csv = this.csvImportService.getNoteTemplate();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="note-templates-template.csv"');
    res.send(csv);
  }
}
