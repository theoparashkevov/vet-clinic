import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { SUPERADMIN_KEY } from '../../auth/superadmin.decorator';

export type AuthenticatedRequest = Request & { user?: { roles?: string[]; isSuperAdmin?: boolean } };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiresSuperAdmin = this.reflector.getAllAndOverride<boolean>(SUPERADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    const userRoles = user?.roles ?? [];

    if (requiresSuperAdmin) {
      if (!user?.isSuperAdmin) {
        throw new ForbiddenException('Superadmin access required');
      }
      return true;
    }

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
