import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('doctors')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  listDoctors() {
    return this.users.listDoctors();
  }
}
