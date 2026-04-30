import { Module } from '@nestjs/common';
import { RolesController, UserRolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  controllers: [RolesController, UserRolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
