import { Injectable } from '@nestjs/common';
import { DEMO_CONFIG, DemoOperation, DemoQuotaStatus } from './demo.config';

@Injectable()
export class DemoOperationTracker {
  private operations: Map<string, DemoOperation[]> = new Map();

  trackOperation(userId: string, operation: string, entityType?: string, entityId?: string): void {
    if (!DEMO_CONFIG.isDemoMode) return;

    const userOperations = this.operations.get(userId) || [];
    userOperations.push({
      userId,
      operation,
      timestamp: new Date(),
      entityType,
      entityId,
    });

    this.operations.set(userId, userOperations);
    this.cleanupOldOperations(userId);
  }

  getQuotaStatus(userId: string): DemoQuotaStatus {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const userOperations = this.operations.get(userId) || [];
    const operationsThisHour = userOperations.filter(
      (op) => op.timestamp > oneHourAgo
    ).length;

    const resetTime = new Date(Date.now() + 60 * 60 * 1000);
    const remainingOperations = Math.max(
      0,
      DEMO_CONFIG.maxOperationsPerHour - operationsThisHour
    );

    return {
      operationsThisHour,
      maxOperationsPerHour: DEMO_CONFIG.maxOperationsPerHour,
      remainingOperations,
      resetTime,
      isLimited: remainingOperations === 0,
    };
  }

  canPerformOperation(userId: string): boolean {
    if (!DEMO_CONFIG.isDemoMode) return true;
    const status = this.getQuotaStatus(userId);
    return !status.isLimited;
  }

  private cleanupOldOperations(userId: string): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const userOperations = this.operations.get(userId) || [];
    const recentOperations = userOperations.filter(
      (op) => op.timestamp > oneHourAgo
    );
    this.operations.set(userId, recentOperations);
  }

  getOperationHistory(userId: string, limit = 50): DemoOperation[] {
    const userOperations = this.operations.get(userId) || [];
    return userOperations.slice(-limit);
  }

  resetUserOperations(userId: string): void {
    this.operations.delete(userId);
  }
}
