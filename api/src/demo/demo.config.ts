export const DEMO_CONFIG = {
  isDemoMode: process.env.DEMO_MODE === 'true',
  maxOperationsPerHour: parseInt(process.env.DEMO_MAX_OPERATIONS_PER_HOUR || '100', 10),
  rateLimitWindowMs: parseInt(process.env.DEMO_RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMaxRequests: parseInt(process.env.DEMO_RATE_LIMIT_MAX_REQUESTS || '30', 10),
  seedOnStartup: process.env.DEMO_DATA_SEED_ON_STARTUP === 'true',
};

export interface DemoOperation {
  userId: string;
  operation: string;
  timestamp: Date;
  entityType?: string;
  entityId?: string;
}

export interface DemoQuotaStatus {
  operationsThisHour: number;
  maxOperationsPerHour: number;
  remainingOperations: number;
  resetTime: Date;
  isLimited: boolean;
}
