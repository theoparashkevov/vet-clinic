import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from './dto';
import { PaginationQuery } from '../common/pagination';

@StaffAccess()
@Controller('doctors')
export class DoctorsController {
  constructor(private readonly users: UsersService) {}

  @Get()
  listDoctors() {
    return this.users.listDoctors();
  }
}

@StaffAccess()
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.users.list({ page, limit });
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.users.remove(id);
  }

  @Post(':id/reset-password')
  resetPassword(@Param('id') id: string, @Body() dto: ResetPasswordDto) {
    return this.users.resetPassword(id, dto);
  }
}
