import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AppointmentsController } from './appointments/appointments.controller';

@Module({
  controllers: [HealthController, AppointmentsController],
})
export class AppModule {}
