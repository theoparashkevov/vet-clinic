import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto, UpdatePatientDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { PaginationQuery } from '../common/pagination';

@StaffAccess()
@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.patients.list(search, { page, limit });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.patients.get(id);
  }

  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patients.remove(id);
  }
}
