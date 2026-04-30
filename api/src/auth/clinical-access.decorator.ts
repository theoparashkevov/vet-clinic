import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { USER_ROLES } from './roles.constants';

export const CLINICAL_ROLES = [
  USER_ROLES.doctor,
  USER_ROLES.nurse,
];

export function ClinicalAccess() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...CLINICAL_ROLES));
}
