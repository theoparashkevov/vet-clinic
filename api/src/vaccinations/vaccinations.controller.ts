import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VaccinationsService } from './vaccinations.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CreateVaccinationDto, UpdateVaccinationDto } from './dto';
import { PaginationQuery, getPaginationParams, createPaginatedResult } from '../common/pagination';

@StaffAccess()
@Controller('vaccinations')
export class VaccinationsController {
  constructor(private readonly vaccinationsService: VaccinationsService) {}

  @Get()
  async list(
    @Query('patientId') patientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.vaccinationsService.list({ patientId, page, limit });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const vaccination = await this.vaccinationsService.get(id);
    return { data: vaccination };
  }

  @Get('patients/:patientId/status')
  async getStatusSummary(@Param('patientId') patientId: string) {
    return this.vaccinationsService.getStatusSummary(patientId);
  }

  @Post()
  async create(@Body() dto: CreateVaccinationDto) {
    const vaccination = await this.vaccinationsService.create(dto.patientId, dto);
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
