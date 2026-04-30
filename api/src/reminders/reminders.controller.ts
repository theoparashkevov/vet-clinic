import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateFollowUpReminderDto, UpdateFollowUpReminderDto, CreateFromAppointmentDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('reminders')
export class RemindersController {
  constructor(private readonly reminders: RemindersService) {}

  @Get()
  list(
    @Query('patientId') patientId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reminders.list({ patientId, assignedTo, status, priority, page, limit });
  }

  @Get('overdue')
  getOverdue() {
    return this.reminders.getOverdue();
  }

  @Get('my-reminders')
  getMyReminders(@CurrentUser() user: AuthUser) {
    return this.reminders.getMyReminders(user.sub);
  }

  @Get('stats')
  getStats(@CurrentUser() user: AuthUser) {
    return this.reminders.getStats(user.sub);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const reminder = await this.reminders.get(id);
    return { data: reminder };
  }

  @Post()
  create(
    @Body() dto: CreateFollowUpReminderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reminders.create(dto, user.sub);
  }

  @Post('from-appointment/:appointmentId')
  createFromAppointment(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CreateFromAppointmentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reminders.createFromAppointment(appointmentId, dto, user.sub);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFollowUpReminderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reminders.update(id, dto, user.sub);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reminders.complete(id, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reminders.remove(id);
  }
}
