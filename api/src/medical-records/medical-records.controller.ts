import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { ClinicalAccess } from '../auth/clinical-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@ClinicalAccess()
@Controller()
export class MedicalRecordsController {
  constructor(private readonly records: MedicalRecordsService) {}

  @Get('medical-records')
  list(
    @Query('patientId') patientId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.records.list({ patientId, from, to }, { page, limit });
  }

  @Post('medical-records')
  async create(@Body() dto: CreateMedicalRecordDto, @CurrentUser() user: AuthUser) {
    const record = await this.records.create(dto, user.sub);
    return { data: record };
  }

  @Get('medical-records/:id')
  async get(@Param('id') id: string) {
    const record = await this.records.get(id);
    return { data: record };
  }

  @Put('medical-records/:id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMedicalRecordDto,
    @CurrentUser() user: AuthUser,
  ) {
    const record = await this.records.update(id, dto, user.sub);
    return { data: record };
  }

  @Delete('medical-records/:id')
  async remove(@Param('id') id: string) {
    await this.records.remove(id);
    return { ok: true };
  }

  @Get('patients/:patientId/medical-records')
  listForPatient(@Param('patientId') patientId: string) {
    return this.records.listForPatient(patientId);
  }
}
