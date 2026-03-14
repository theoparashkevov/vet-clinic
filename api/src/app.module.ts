import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { AppointmentsController } from './appointments/appointments.controller';
import { OwnersController } from './owners/owners.controller';
import { PatientsController } from './patients/patients.controller';

@Module({
  controllers: [HealthController, AppointmentsController, OwnersController, PatientsController],
})
export class AppModule {}
