import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CreateVaccinationDto, UpdateVaccinationDto } from './dto';

@StaffAccess()
@Controller('vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Get('patients/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    const vaccinations = await this.vaccinationsService.findByPatient(patientId);
    return { data: vaccinations };
  }

  @Get('patients/:patientId/status')
  async getStatusSummary(@Param('patientId') patientId: string) {
    return this.vaccinationsService.getStatusSummary(patientId);
  }

  @Post('patients/:patientId')
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateVaccinationDto,
  ) {
    const vaccination = await this.vaccinationsService.create(patientId, dto);
    return { data: vaccination };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVaccinationDto,
  ) {
    const vaccination = await this.vaccinationsService.update(id, dto);
    return { data: vaccination };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.vaccinationsService.remove(id);
    return { success: true };
  }
}
