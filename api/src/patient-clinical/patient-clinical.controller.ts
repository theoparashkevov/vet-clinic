import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { PatientClinicalService } from './patient-clinical.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import {
  CreatePatientAlertDto,
  UpdatePatientAlertDto,
  CreateVaccinationDto,
  UpdateVaccinationDto,
  CreateWeightRecordDto,
  UpdateWeightRecordDto,
} from './dto';

@StaffAccess()
@Controller('patients/:patientId')
export class PatientClinicalController {
  constructor(private readonly clinicalService: PatientClinicalService) {}

  // Alerts
  @Get('alerts')
  getAlerts(@Param('patientId') patientId: string) {
    return this.clinicalService.getAlerts(patientId);
  }

  @Post('alerts')
  createAlert(@Param('patientId') patientId: string, @Body() dto: CreatePatientAlertDto) {
    return this.clinicalService.createAlert(patientId, dto);
  }

  @Put('alerts/:alertId')
  updateAlert(
    @Param('patientId') patientId: string,
    @Param('alertId') alertId: string,
    @Body() dto: UpdatePatientAlertDto,
  ) {
    return this.clinicalService.updateAlert(patientId, alertId, dto);
  }

  @Delete('alerts/:alertId')
  deleteAlert(@Param('patientId') patientId: string, @Param('alertId') alertId: string) {
    return this.clinicalService.deleteAlert(patientId, alertId);
  }

  // Vaccinations
  @Get('vaccinations')
  getVaccinations(@Param('patientId') patientId: string) {
    return this.clinicalService.getVaccinations(patientId);
  }

  @Post('vaccinations')
  createVaccination(@Param('patientId') patientId: string, @Body() dto: CreateVaccinationDto) {
    return this.clinicalService.createVaccination(patientId, dto);
  }

  @Put('vaccinations/:vacId')
  updateVaccination(
    @Param('patientId') patientId: string,
    @Param('vacId') vacId: string,
    @Body() dto: UpdateVaccinationDto,
  ) {
    return this.clinicalService.updateVaccination(patientId, vacId, dto);
  }

  @Delete('vaccinations/:vacId')
  deleteVaccination(@Param('patientId') patientId: string, @Param('vacId') vacId: string) {
    return this.clinicalService.deleteVaccination(patientId, vacId);
  }

  @Get('vaccination-status')
  getVaccinationStatus(@Param('patientId') patientId: string) {
    return this.clinicalService.getVaccinationStatus(patientId);
  }

  // Weight History
  @Get('weight-history')
  getWeightHistory(@Param('patientId') patientId: string) {
    return this.clinicalService.getWeightHistory(patientId);
  }

  @Post('weight-history')
  createWeightRecord(@Param('patientId') patientId: string, @Body() dto: CreateWeightRecordDto) {
    return this.clinicalService.createWeightRecord(patientId, dto);
  }

  @Put('weight-history/:recordId')
  updateWeightRecord(
    @Param('patientId') patientId: string,
    @Param('recordId') recordId: string,
    @Body() dto: UpdateWeightRecordDto,
  ) {
    return this.clinicalService.updateWeightRecord(patientId, recordId, dto);
  }

  @Delete('weight-history/:recordId')
  deleteWeightRecord(@Param('patientId') patientId: string, @Param('recordId') recordId: string) {
    return this.clinicalService.deleteWeightRecord(patientId, recordId);
  }
}
