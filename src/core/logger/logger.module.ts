import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const specialLogs = ['request completed', 'request aborted'];
const hooks = {
  logMethod(inputArgs: unknown[], method: (...args: unknown[]) => void): void {
    if (inputArgs.filter(Boolean).length < 2 || specialLogs.includes(inputArgs[1] as string)) {
      method.apply(this, inputArgs);
      return;
    }

    const { context } = (inputArgs.shift() || {}) as { context?: string };
    const message: string = inputArgs.shift() as string;
    const metadata = inputArgs.shift();

    method.apply(this, [metadata, `${context ?? 'No context'}: ${message}`]);
  },
};

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          hooks,
          level: process.env.LOG_LEVEL ?? 'debug',
          ...(configService.getOrThrow('isProduction') ? {} : { transport: { target: 'pino-pretty' } }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class LoggerModule {}
