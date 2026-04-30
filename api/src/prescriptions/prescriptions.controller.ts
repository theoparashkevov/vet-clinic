import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto, UpdatePrescriptionDto, CreateFromTemplateDto } from './dto';
import { StaffAccess } from '../auth/staff-access.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { AuthUser } from '../auth/auth.types';
import { Roles } from '../common/decorators/roles.decorator';
import { USER_ROLES } from '../auth/roles.constants';

@StaffAccess()
@Controller('patients/:patientId/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptions: PrescriptionsService) {}

  @Get()
  listForPatient(@Param('patientId') patientId: string) {
    return this.prescriptions.listForPatient(patientId);
  }

  @Roles(USER_ROLES.doctor)
  @Post()
  create(
    @Param('patientId') patientId: string,
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.prescriptions.create({ ...dto, patientId }, user.sub);
  }

  @Roles(USER_ROLES.doctor)
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

  @Get()
  list(
    @Query('patientId') patientId?: string,
    @Query('medication') medication?: string,
    @Query('prescribedById') prescribedById?: string,
    @Query('active') active?: string,
    @Query('isControlled') isControlled?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.prescriptions.list({
      patientId,
      medication,
      prescribedById,
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      isControlled: isControlled === 'true' ? true : isControlled === 'false' ? false : undefined,
      page,
      limit,
    });
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.prescriptions.get(id);
  }

  @Roles(USER_ROLES.doctor)
  @Post()
  create(
    @Body() dto: CreatePrescriptionDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.prescriptions.create(dto, user.sub);
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
