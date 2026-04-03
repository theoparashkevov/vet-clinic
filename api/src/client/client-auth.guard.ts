import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export type ClientAuthUser = {
  sub: string;
  email: string;
  ownerId: string;
  role: 'client';
};

type AuthenticatedRequest = Request & { user?: ClientAuthUser };

/**
 * JWT Guard for client portal users.
 * Validates the JWT token and ensures the user has the 'client' role.
 * Used to protect all client portal endpoints.
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authHeader.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    try {
      const payload = await this.jwtService.verifyAsync<ClientAuthUser>(token);
      
      // Ensure this is a client token
      if (payload.role !== 'client') {
        throw new UnauthorizedException('Access denied: client portal only');
      }
      
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
