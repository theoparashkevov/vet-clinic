import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SuperAdminGuard } from './superadmin.guard';

export function SuperAdminAccess() {
  return applyDecorators(UseGuards(JwtAuthGuard, SuperAdminGuard));
}
