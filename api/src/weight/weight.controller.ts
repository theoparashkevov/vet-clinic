import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WeightService } from './weight.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './dto';

@StaffAccess()
@Controller('weight-records')
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Get()
  async list(
    @Query('patientId') patientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.weightService.list({ patientId, page, limit });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const record = await this.weightService.get(id);
    return { data: record };
  }

  @Get('patients/:patientId/summary')
  async getSummary(@Param('patientId') patientId: string) {
    return this.weightService.getSummary(patientId);
  }

  @Post()
  async create(@Body() dto: CreateWeightRecordDto) {
    const record = await this.weightService.create(dto.patientId, dto);
    return { data: record };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateWeightRecordDto,
  ) {
    const record = await this.weightService.update(id, dto);
    return { data: record };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.weightService.remove(id);
    return { success: true };
  }
}
