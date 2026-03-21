import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { OwnersService } from './owners.service';
import { CreateOwnerDto, UpdateOwnerDto } from './dto';

@Controller('owners')
export class OwnersController {
  constructor(private readonly owners: OwnersService) {}

  @Get()
  list() {
    return this.owners.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.owners.get(id);
  }

  @Post()
  create(@Body() dto: CreateOwnerDto) {
    return this.owners.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOwnerDto) {
    return this.owners.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.owners.remove(id);
  }
}
