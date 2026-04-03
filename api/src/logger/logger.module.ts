import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RequestLoggingMiddleware } from './request-logging.middleware';

@Module({})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
