import { Module } from '@nestjs/common';
import { DoctorsController, UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [DoctorsController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
