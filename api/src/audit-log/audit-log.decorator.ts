import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'auditLog';

export interface AuditLogOptions {
  resource?: string;
  action?: string;
  skip?: boolean;
}

export const AuditLog = (options?: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options || {});
