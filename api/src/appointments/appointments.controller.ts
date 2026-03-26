import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Get()
  list(
    @Query('date') date?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
  ) {
    return this.appointments.list({ date, doctorId, status });
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

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointments.update(id, dto);
  }
}
