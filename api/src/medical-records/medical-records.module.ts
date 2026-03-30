import { Module } from '@nestjs/common';
import { MedicalRecordsController } from './medical-records.controller';
import { MedicalRecordsService } from './medical-records.service';
import { NoteTemplatesController } from './note-templates.controller';

@Module({
  controllers: [MedicalRecordsController, NoteTemplatesController],
  providers: [MedicalRecordsService],
})
export class MedicalRecordsModule {}
