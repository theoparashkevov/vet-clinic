import { Body, Controller, Post } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';

class CreateOwnerDto {
  @IsString() name!: string;
  @IsString() phone!: string;
  @IsOptional() @IsString() email?: string;
}

@Controller('owners')
export class OwnersController {
  @Post()
  create(@Body() dto: CreateOwnerDto) {
    // TODO: service + prisma; mock for now
    return { id: 'mock-owner', ...dto };
  }
}
