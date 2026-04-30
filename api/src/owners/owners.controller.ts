import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';

@StaffAccess()
@Controller('owners')
export class OwnersController {
  constructor(private readonly owners: OwnersService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.owners.list(search, { page, limit });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const owner = await this.owners.get(id);
    return { data: owner };
  }

  @Post()
  async create(@Body() dto: CreateOwnerDto) {
    const owner = await this.owners.create(dto);
    return { data: owner };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOwnerDto) {
    const owner = await this.owners.update(id, dto);
    return { data: owner };
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.owners.remove(id);
  }
}