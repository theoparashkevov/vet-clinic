import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';

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
  ) {
    return this.appointments.list({ date, doctorId, status, patientId });
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
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.appointments.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointments.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointments.remove(id);
  }
}
