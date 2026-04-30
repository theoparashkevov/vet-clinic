import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { PatientsService } from './patients.service';
import { VaccinationsModule } from '../vaccinations/vaccinations.module';
import { WeightModule } from '../weight/weight.module';

@Module({
  imports: [VaccinationsModule, WeightModule],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
