import { Controller, Get, Query } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { SuperAdmin } from './super-admin.decorator';
import { FindAuditLogsDto } from './dto';

@SuperAdmin()
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(@Query() query: FindAuditLogsDto) {
    return this.auditLogService.findAll(query);
  }
}
