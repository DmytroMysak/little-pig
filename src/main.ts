import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import { LittlePigService } from './services/client.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
    forceCloseConnections: true,
  });

  app.useLogger(app.get(Logger));
  app.flushLogs();

  await app.get(LittlePigService).start();
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
