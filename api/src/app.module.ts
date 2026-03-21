import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AppointmentsController } from './appointments/appointments.controller';
import { PrismaModule } from './prisma/prisma.module';
import { OwnersModule } from './owners/owners.module';

@Module({
  imports: [PrismaModule, OwnersModule],
  controllers: [HealthController, AppointmentsController],
})
export class AppModule {}
