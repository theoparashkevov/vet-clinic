import { Module } from '@nestjs/common';
import {
  LabPanelsController,
  LabResultsController,
  PatientLabResultsController,
} from './lab-results.controller';
import { LabResultsService } from './lab-results.service';

@Module({
  controllers: [LabPanelsController, LabResultsController, PatientLabResultsController],
  providers: [LabResultsService],
})
export class LabResultsModule {}
