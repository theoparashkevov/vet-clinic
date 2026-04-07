import { Module, Global } from '@nestjs/common';
import { DemoModeGuard } from './demo-mode.guard';
import { DemoRateLimitMiddleware } from './demo-rate-limit.middleware';
import { DemoOperationTracker } from './demo-operation.tracker';

@Global()
@Module({
  providers: [DemoModeGuard, DemoOperationTracker],
  exports: [DemoModeGuard, DemoOperationTracker],
})
export class DemoModule {}
