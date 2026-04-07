import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { DEMO_CONFIG } from './demo.config';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface RequestWithUser {
  user?: { id: string };
  ip?: string;
}

@Injectable()
export class DemoRateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    if (!DEMO_CONFIG.isDemoMode) {
      return next();
    }

    const identifier = req.user?.id || req.ip || 'unknown';
    const now = Date.now();

    this.cleanupStore(now);

    if (!this.store[identifier]) {
      this.store[identifier] = {
        count: 0,
        resetTime: now + DEMO_CONFIG.rateLimitWindowMs,
      };
    }

    const userLimit = this.store[identifier];

    if (now > userLimit.resetTime) {
      userLimit.count = 0;
      userLimit.resetTime = now + DEMO_CONFIG.rateLimitWindowMs;
    }

    if (userLimit.count >= DEMO_CONFIG.rateLimitMaxRequests) {
      res.status(429).json({
        statusCode: 429,
        message: 'Too many requests in demo mode. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000),
        demoMode: true,
      });
      return;
    }

    userLimit.count++;

    res.setHeader('X-RateLimit-Limit', DEMO_CONFIG.rateLimitMaxRequests);
    res.setHeader(
      'X-RateLimit-Remaining',
      Math.max(0, DEMO_CONFIG.rateLimitMaxRequests - userLimit.count)
    );
    res.setHeader(
      'X-RateLimit-Reset',
      new Date(userLimit.resetTime).toISOString()
    );

    next();
  }

  private cleanupStore(now: number): void {
    Object.keys(this.store).forEach((key) => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }
}
