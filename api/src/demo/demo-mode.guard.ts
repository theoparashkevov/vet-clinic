import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { DemoOperationTracker } from './demo-operation.tracker';
import { DEMO_CONFIG } from './demo.config';

@Injectable()
export class DemoModeGuard implements CanActivate {
  constructor(private readonly tracker: DemoOperationTracker) {}

  canActivate(context: ExecutionContext): boolean {
    if (!DEMO_CONFIG.isDemoMode) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id || request.ip || 'anonymous';

    if (!this.tracker.canPerformOperation(userId)) {
      const status = this.tracker.getQuotaStatus(userId);
      throw new ForbiddenException({
        message: 'Demo mode operation limit reached',
        quota: status,
        demoMode: true,
      });
    }

    const handler = context.getHandler();
    const operation = `${request.method} ${request.path}`;

    this.tracker.trackOperation(
      userId,
      operation,
      request.body?.entityType,
      request.body?.entityId
    );

    return true;
  }
}
