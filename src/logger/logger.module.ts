import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const hooks = {
  logMethod(inputArgs: unknown[], method: (...args: unknown[]) => void): void {
    if (inputArgs.length < 2) {
      method.apply(this, inputArgs);
      return;
    }

    const { context } = (inputArgs.shift() || {}) as { context: string };
    const message: string = inputArgs.shift() as string;
    const metadata = inputArgs.shift();

    method.apply(this, [metadata, `${context}: ${message}`]);
  },
};

@Global()
@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return configService.getOrThrow('isProduction')
          ? { pinoHttp: { hooks, level: process.env.LOG_LEVEL ?? 'debug' } }
          : {
              pinoHttp: {
                hooks,
                level: 'debug',
                transport: { target: 'pino-pretty' },
              },
            };
      },
      inject: [ConfigService],
    }),
  ],
})
export class LoggerModule {}
