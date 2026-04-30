import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogController } from './audit-log.controller';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { SuperAdminGuard } from './super-admin.guard';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditLogInterceptor, SuperAdminGuard],
  exports: [AuditLogService, AuditLogInterceptor, SuperAdminGuard],
})
export class AuditLogModule {}
