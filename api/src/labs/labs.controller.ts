import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { LabsService } from './labs.service';
import { CreateLabPanelDto, CreateLabTestDto, CreateLabResultDto, UpdateLabResultDto, UpdateLabPanelDto, UpdateLabTestDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('labs')
export class LabsController {
  constructor(private readonly labsService: LabsService) {}

  // ── Lab Panels ─────────────────────────────────────────────────────────────

  @Get('panels')
  findAllPanels(@Query('species') species?: string) {
    return this.labsService.findAllPanels(species);
  }

  @Get('panels/common')
  findCommonPanels(@Query('species') species?: string) {
    return this.labsService.findCommonPanels(species);
  }

  @Post('panels')
  createPanel(@Body() dto: CreateLabPanelDto) {
    return this.labsService.createPanel(dto);
  }

  @Put('panels/:id')
  updatePanel(@Param('id') id: string, @Body() dto: UpdateLabPanelDto) {
    return this.labsService.updatePanel(id, dto);
  }

  @Delete('panels/:id')
  deletePanel(@Param('id') id: string) {
    return this.labsService.deletePanel(id);
  }

  // ── Lab Tests ──────────────────────────────────────────────────────────────

  @Get('panels/:panelId/tests')
  findTestsByPanel(@Param('panelId') panelId: string) {
    return this.labsService.findTestsByPanel(panelId);
  }

  @Post('tests')
  createTest(@Body() dto: CreateLabTestDto) {
    return this.labsService.createTest(dto);
  }

  @Put('tests/:id')
  updateTest(@Param('id') id: string, @Body() dto: UpdateLabTestDto) {
    return this.labsService.updateTest(id, dto);
  }

  @Delete('tests/:id')
  deleteTest(@Param('id') id: string) {
    return this.labsService.deleteTest(id);
  }

  // ── Lab Results ────────────────────────────────────────────────────────────

  @Get('patients/:patientId/results')
  findByPatient(@Param('patientId') patientId: string) {
    return this.labsService.findByPatient(patientId);
  }

  @Get('patients/:patientId/results/pending')
  getPendingResults(@Param('patientId') patientId: string) {
    return this.labsService.getPendingLabResults(patientId);
  }

  @Get('results/:id')
  findOne(@Param('id') id: string) {
    return this.labsService.findOne(id);
  }

  @Post('patients/:patientId/results')
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateLabResultDto,
    @CurrentUser() user: AuthUser,
  ) {
    // Get user name for reviewedBy field
    return this.labsService.create(patientId, dto, 'Dr. ' + user.name);
  }

  @Put('results/:id')
  update(@Param('id') id: string, @Body() dto: UpdateLabResultDto) {
    return this.labsService.update(id, dto);
  }

  @Delete('results/:id')
  remove(@Param('id') id: string) {
    return this.labsService.remove(id);
  }

  // ── Test History & Trends ──────────────────────────────────────────────────

  @Get('patients/:patientId/tests/:testId/history')
  getTestHistory(
    @Param('patientId') patientId: string,
    @Param('testId') testId: string,
    @Query('limit') limit?: string,
  ) {
    return this.labsService.getTestHistory(patientId, testId, limit ? parseInt(limit) : 10);
  }

  // ── File Upload ────────────────────────────────────────────────────────────

  @Post('results/:id/upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, callback) => {
      if (file.mimetype !== 'application/pdf') {
        return callback(new Error('Only PDF files are allowed'), false);
      }
      callback(null, true);
    },
  }))
  async uploadPdf(
    @Param('id') id: string,
    @UploadedFile() file: any,
  ) {
    // In a real implementation, upload to S3 and save URL
    // For demo, we'll just acknowledge
    return {
      success: true,
      message: 'PDF upload endpoint ready - implement S3 integration for production',
      fileName: file?.originalname,
    };
  }
}
