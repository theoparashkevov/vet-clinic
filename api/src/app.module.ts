import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { OwnersModule } from './owners/owners.module';
import { PatientsModule } from './patients/patients.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PatientClinicalModule } from './patient-clinical/patient-clinical.module';
import { VaccinationsModule } from './vaccinations/vaccinations.module';
import { WeightModule } from './weight/weight.module';
import { ClientModule } from './client/client.module';

@Module({
  imports: [
    PrismaModule,
    OwnersModule,
    PatientsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    UsersModule,
    AuthModule,
    PatientClinicalModule,
    VaccinationsModule,
    WeightModule,
    ClientModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
