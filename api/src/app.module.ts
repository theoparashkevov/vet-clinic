import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { DemoModule, DemoRateLimitMiddleware } from './demo';
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
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { RemindersModule } from './reminders/reminders.module';
import { SMSModule } from './sms/sms.module';
import { LabsModule } from './labs/labs.module';
import { ImportModule } from './import/import.module';
import { LoggerModule } from './logger/logger.module';
import { PhotosModule } from './photos/photos.module';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    DemoModule,
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
    PrescriptionsModule,
    RemindersModule,
    SMSModule,
    LabsModule,
    ImportModule,
    LoggerModule,
    PhotosModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(DemoRateLimitMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}