import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CsvImportService } from './csv-import.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import {
  ImportLabPanelsDto,
  ImportLabTestsDto,
  ImportMedicationTemplatesDto,
  ImportNoteTemplatesDto,
} from './dto';

@StaffAccess()
@Controller('import')
export class ImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Post('lab-panels')
  async importLabPanels(@Body() dto: ImportLabPanelsDto) {
    return this.csvImportService.importLabPanels(dto.data);
  }

  @Post('lab-tests')
  async importLabTests(@Body() dto: ImportLabTestsDto) {
    return this.csvImportService.importLabTests(dto.data);
  }

  @Post('medication-templates')
  async importMedicationTemplates(@Body() dto: ImportMedicationTemplatesDto) {
    return this.csvImportService.importMedicationTemplates(dto.data);
  }

  @Post('note-templates')
  async importNoteTemplates(@Body() dto: ImportNoteTemplatesDto) {
    return this.csvImportService.importNoteTemplates(dto.data);
  }

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