import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto, CreateFromTemplateDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';

@StaffAccess()
@Controller('patients/:patientId/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptions: PrescriptionsService) {}

  @Get()
  listForPatient(@Param('patientId') patientId: string) {
    return this.prescriptions.listForPatient(patientId);
  }

  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.prescriptions.create(patientId, dto, user.sub);
  }

  @Post('from-template')
  createFromTemplate(
    @Param('patientId') patientId: string,
    @Body() dto: CreateFromTemplateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.prescriptions.createFromTemplate(patientId, dto, user.sub);
  }

  @Get('check-interactions')
  checkInteractions(
    @Param('patientId') patientId: string,
    @Param('medication') medication: string,
  ) {
    return this.prescriptions.checkDrugInteractions(patientId, medication);
  }
}

@StaffAccess()
@Controller('prescriptions')
export class PrescriptionActionsController {
  constructor(private readonly prescriptions: PrescriptionsService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prescriptions.get(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrescriptionDto) {
    return this.prescriptions.update(id, dto);
  }

  @Post(':id/refill')
  refill(@Param('id') id: string) {
    return this.prescriptions.refill(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prescriptions.remove(id);
  }
}
