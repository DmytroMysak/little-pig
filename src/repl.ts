import { repl } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap(): Promise<void> {
  await repl(AppModule);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
