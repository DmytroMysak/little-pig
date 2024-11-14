import { Module } from '@nestjs/common';
import { LittlePigService } from './services/client.service.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CONFIG } from './config.js';
import { ConsumerQueueModule, ProducerQueueModule } from './queue/queue.module.js';
import { CqrsModule } from '@nestjs/cqrs';
import { PlayerService } from './services/player.service.js';
import { LoggerModule } from './logger/logger.module.js';
import { StopAllHandler } from './handlers/stopAll.handler.js';
import { StopHandler } from './handlers/stop.handler.js';
import { PlayYoutubeHandler } from './handlers/playYoutube.handler.js';
import { PlayHandler } from './handlers/play.handler.js';

const handlers = [StopAllHandler, StopHandler, PlayYoutubeHandler, PlayHandler];

@Module({
  imports: [
    LoggerModule,
    CqrsModule,
    ConfigModule.forRoot({ isGlobal: true, load: [CONFIG] }),
    ConsumerQueueModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        connection: { url: configService.getOrThrow('rabbitMq.url') },
        queueName: configService.getOrThrow('rabbitMq.queueName'),
        queueOptions: { retriesCount: 3 },
      }),
      inject: [ConfigService],
    }),
    ProducerQueueModule.registerAsync({
      useFactory: (configService: ConfigService) => ({ connection: { url: configService.getOrThrow('rabbitMq.url') } }),
      inject: [ConfigService],
    }),
  ],
  providers: [LittlePigService, PlayerService, ...handlers],
})
export class AppModule {}
