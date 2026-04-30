import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationQuery } from '../common/pagination';

@StaffAccess()
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get()
  list(
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('patientId') patientId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.appointments.list({ date, doctorId, status, patientId }, { page, limit });
  }

  @Get('slots')
  getSlots(
    @Query('date') date: string,
    @Query('doctorId') doctorId?: string,
  ) {
    const d = date || new Date().toISOString().slice(0, 10);
    return this.appointments.getSlots(d, doctorId);
  }

  @Post()
  async create(@Body() dto: CreateAppointmentDto) {
    const appointment = await this.appointments.create(dto);
    return { data: appointment };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const appointment = await this.appointments.get(id);
    return { data: appointment };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const appointment = await this.appointments.update(id, dto);
    return { data: appointment };
  }

  @Delete(':id')
  @Roles('admin', 'doctor', 'registrar')
  async cancel(
    @Param('id') id: string,
    @Body('cancelledBy') cancelledBy?: string,
    @Body('cancellationReason') cancellationReason?: string,
  ) {
    const appointment = await this.appointments.cancel(id, cancelledBy, cancellationReason);
    return { data: appointment };
  }
}
