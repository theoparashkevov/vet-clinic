import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from './super-admin.guard';

export function SuperAdmin() {
  return applyDecorators(UseGuards(JwtAuthGuard, SuperAdminGuard));
}
