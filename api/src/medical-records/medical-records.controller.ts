import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { CreateMedicalRecordDto, UpdateMedicalRecordDto } from './dto';

@Controller()
export class MedicalRecordsController {
  constructor(private readonly records: MedicalRecordsService) {}

  @Get('patients/:patientId/medical-records')
  listForPatient(@Param('patientId') patientId: string) {
    return this.records.listForPatient(patientId);
  }

  @Post('patients/:patientId/medical-records')
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateMedicalRecordDto,
  ) {
    return this.records.create(patientId, dto);
  }

  @Put('medical-records/:id')
  update(@Param('id') id: string, @Body() dto: UpdateMedicalRecordDto) {
    return this.records.update(id, dto);
  }
}
