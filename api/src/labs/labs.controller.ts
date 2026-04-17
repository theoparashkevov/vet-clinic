import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LabsService } from './labs.service';
import { CreateLabPanelDto, CreateLabTestDto, CreateLabResultDto, UpdateLabResultDto } from './dto';
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
  async createPanel(@Body() dto: CreateLabPanelDto) {
    const panel = await this.labsService.createPanel(dto);
    return { data: panel };
  }

  @Put('panels/:id')
  async updatePanel(@Param('id') id: string, @Body() dto: CreateLabPanelDto) {
    const panel = await this.labsService.updatePanel(id, dto);
    return { data: panel };
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
  async createTest(@Body() dto: CreateLabTestDto) {
    const test = await this.labsService.createTest(dto);
    return { data: test };
  }

  @Put('tests/:id')
  async updateTest(@Param('id') id: string, @Body() dto: CreateLabTestDto) {
    const test = await this.labsService.updateTest(id, dto);
    return { data: test };
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
  async findOne(@Param('id') id: string) {
    const result = await this.labsService.findOne(id);
    return { data: result };
  }

  @Post('patients/:patientId/results')
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateLabResultDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.labsService.create(patientId, dto, 'Dr. ' + user.name);
    return { data: result };
  }

  @Put('results/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateLabResultDto) {
    const result = await this.labsService.update(id, dto);
    return { data: result };
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
    limits: { fileSize: 10 * 1024 * 1024 },
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
    return {
      success: true,
      message: 'PDF upload endpoint ready - implement S3 integration for production',
      fileName: file?.originalname,
    };
  }
}