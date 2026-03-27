import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { WeightService } from './weight.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CreateWeightRecordDto, UpdateWeightRecordDto } from './dto';

@StaffAccess()
@Controller('weight')
export class WeightController {
  constructor(private readonly weightService: WeightService) {}

  @Get('patients/:patientId')
  async findByPatient(@Param('patientId') patientId: string) {
    const records = await this.weightService.findByPatient(patientId);
    return { data: records };
  }

  @Get('patients/:patientId/summary')
  async getSummary(@Param('patientId') patientId: string) {
    return this.weightService.getSummary(patientId);
  }

  @Post('patients/:patientId')
  async create(
    @Param('patientId') patientId: string,
    @Body() dto: CreateWeightRecordDto,
  ) {
    const record = await this.weightService.create(patientId, dto);
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
