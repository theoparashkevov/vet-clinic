import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';
import * as express from 'express';
import * as path from 'path';
import { AuditLogInterceptor } from './audit-log/audit-log.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const corsOrigins = (process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim()).filter(Boolean)
    : ['http://localhost:3001', 'http://localhost:3000']);
  app.enableCors({ origin: corsOrigins, credentials: true });

  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  app.setGlobalPrefix('v1', { exclude: [{ path: 'health', method: RequestMethod.GET }] });

  const auditLogInterceptor = app.get(AuditLogInterceptor);
  app.useGlobalInterceptors(auditLogInterceptor);

  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
