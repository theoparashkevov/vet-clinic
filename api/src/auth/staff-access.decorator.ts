import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { STAFF_ROLES } from './roles.constants';

export function StaffAccess() {
  return applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...STAFF_ROLES));
}
