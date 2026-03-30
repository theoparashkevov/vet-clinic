import { Module } from '@nestjs/common';
import { PrescriptionsController, PrescriptionActionsController } from './prescriptions.controller';
import { MedicationTemplatesController } from './medication-templates.controller';
import { PrescriptionsService } from './prescriptions.service';

@Module({
  controllers: [PrescriptionsController, PrescriptionActionsController, MedicationTemplatesController],
  providers: [PrescriptionsService],
  exports: [PrescriptionsService],
})
export class PrescriptionsModule {}
