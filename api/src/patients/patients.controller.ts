import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

class CreatePatientDto {
  @IsString() ownerId!: string;
  @IsString() name!: string;
  @IsString() species!: string;
  @IsOptional() @IsString() breed?: string;
}

@Controller('patients')
export class PatientsController {
  @Post()
  create(@Body() dto: CreatePatientDto) {
    return { id: 'mock-patient', ...dto };
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return { id, name: 'Rex', species: 'dog' };
  }

  @Get()
  search(@Query('q') q = '') {
    return { query: q, results: [] };
  }
}
