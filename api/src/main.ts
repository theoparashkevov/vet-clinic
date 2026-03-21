import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  // Version REST under /v1, but keep /health at root
  app.setGlobalPrefix('v1', { exclude: [{ path: 'health', method: RequestMethod.GET }] });
  await app.listen(process.env.PORT || 3000);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
