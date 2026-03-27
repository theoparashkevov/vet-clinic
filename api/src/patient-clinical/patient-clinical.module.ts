import { Module } from '@nestjs/common';
import { PatientClinicalController } from './patient-clinical.controller';
import { PatientClinicalService } from './patient-clinical.service';

@Module({
  controllers: [PatientClinicalController],
  providers: [PatientClinicalService],
  exports: [PatientClinicalService],
})
export class PatientClinicalModule {}
