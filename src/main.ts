import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Logger } from 'nestjs-pino';
import { LittlePigService } from './services/client.service.js';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));
  app.flushLogs();
  app.get(LittlePigService).start();
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
