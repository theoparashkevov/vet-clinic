import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from './audit-log.service';
import { AuthUser } from '../auth/auth.types';
import { Reflector } from '@nestjs/core';
import { AUDIT_LOG_KEY, AuditLogOptions } from './audit-log.decorator';

type AuthenticatedRequest = Request & { user?: AuthUser };

const SENSITIVE_FIELDS = ['passwordHash', 'apiKey', 'password', 'token', 'secret'];

function sanitizeData(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function getPrismaModelName(pathSegment: string): string | null {
  const mappings: Record<string, string> = {
    owners: 'owner',
    patients: 'patient',
    appointments: 'appointment',
    users: 'user',
    'medical-records': 'medicalRecord',
    prescriptions: 'prescription',
    vaccinations: 'vaccination',
    invoices: 'invoice',
    payments: 'payment',
    tasks: 'task',
    settings: 'platformSetting',
    labs: 'labResult',
    photos: 'patientPhoto',
    'note-templates': 'noteTemplate',
    reminders: 'followUpReminder',
    analytics: 'analytics',
    import: 'import',
    sms: 'sms',
    client: 'client',
    weight: 'weightRecord',
    'vital-signs': 'vitalSigns',
    'patient-clinical': 'medicalRecord',
    'lab-panels': 'labPanel',
    'lab-tests': 'labTest',
    'ai-provider-configs': 'aIProviderConfig',
    'ai-prompt-templates': 'aiPromptTemplate',
  };

  if (mappings[pathSegment]) return mappings[pathSegment];

  if (pathSegment.endsWith('ies')) return pathSegment.slice(0, -3) + 'y';
  if (pathSegment.endsWith('es')) return pathSegment.slice(0, -2);
  if (pathSegment.endsWith('s')) return pathSegment.slice(0, -1);
  return pathSegment;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const method = request.method;
    const path = request.path || request.url;

    if (path === '/health' || path.startsWith('/health')) {
      return next.handle();
    }

    const auditOptions = this.reflector.getAllAndOverride<AuditLogOptions>(AUDIT_LOG_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (method === 'GET' && !auditOptions) {
      return next.handle();
    }

    if (auditOptions?.skip) {
      return next.handle();
    }

    let action = auditOptions?.action;
    if (!action) {
      if (method === 'POST') action = 'create';
      else if (method === 'PUT' || method === 'PATCH') action = 'update';
      else if (method === 'DELETE') action = 'delete';
      else action = method.toLowerCase();
    }

    const pathParts = path.replace(/^\/v1\//, '').split('/').filter(Boolean);
    const resourceType = auditOptions?.resource || getPrismaModelName(pathParts[0] || 'unknown') || 'unknown';
    const resourceId = pathParts[1] || undefined;

    let oldValues: unknown = null;
    if ((method === 'PUT' || method === 'PATCH' || method === 'DELETE') && resourceId) {
      try {
        const modelName = getPrismaModelName(pathParts[0]);
        if (modelName) {
          const prismaModel = (this.prisma as unknown as Record<string, unknown>)[modelName];
          if (
            prismaModel &&
            typeof prismaModel === 'object' &&
            prismaModel !== null &&
            'findUnique' in prismaModel &&
            typeof (prismaModel as Record<string, unknown>).findUnique === 'function'
          ) {
            oldValues = await (prismaModel as { findUnique: (args: unknown) => Promise<unknown> }).findUnique({
              where: { id: resourceId },
            });
            oldValues = sanitizeData(oldValues);
          }
        }
      } catch {
        // intentionally ignored
      }
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const user = request.user;
        const newValues = sanitizeData(request.body);

        this.auditLogService
          .create({
            action,
            resourceType,
            resourceId,
            userId: user?.sub,
            description: `${action} ${resourceType}${resourceId ? ` ${resourceId}` : ''}`,
            ipAddress: (request.ip || request.headers['x-forwarded-for'] || undefined) as string | undefined,
            userAgent: request.headers['user-agent'] as string | undefined,
            metadataJson: JSON.stringify({
              oldValues,
              newValues,
              path,
              method,
              durationMs: Date.now() - startTime,
            }),
          })
          .catch(() => {
            // intentionally ignored
          });
      }),
    );
  }
}
