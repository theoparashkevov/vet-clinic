import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller()
export class MedicalRecordsController {
  constructor(private readonly records: MedicalRecordsService) {}

  @Get('patients/:patientId/medical-records')
  listForPatient(@Param('patientId') patientId: string) {
    return this.records.listForPatient(patientId);
  }

  @Post('patients/:patientId/medical-records')
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    const record = await this.records.create(patientId, dto);
    return { data: record };
  }

  @Put('medical-records/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    const record = await this.records.update(id, dto);
    return { data: record };
  }
}
