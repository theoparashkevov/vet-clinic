import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  list(
    @Query('patientId') patientId?: string,
    @Query('appointmentId') appointmentId?: string,
    @Query('ownerId') ownerId?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.tasks.list({ patientId, appointmentId, ownerId, assignedTo, status, priority, page, limit });
  }

  @Get('assigned')
  getAssigned(@CurrentUser() user: AuthUser) {
    return this.tasks.getAssigned(user.sub);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const task = await this.tasks.get(id);
    return { data: task };
  }

  @Post()
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.create(dto, user.sub);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.tasks.update(id, dto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasks.remove(id);
  }
}
