import { Module } from '@nestjs/common';
import { LittlePigService } from './services/client.service.js';
import { ConfigModule } from '@nestjs/config';
import { CONFIG } from './config.js';
import { CqrsModule } from '@nestjs/cqrs';
import { PlayerService } from './services/player.service.js';
import { StopAllHandler } from './handlers/stopAll.handler.js';
import { StopHandler } from './handlers/stop.handler.js';
import { PlayYoutubeHandler } from './handlers/playYoutube.handler.js';
import { PlayHandler } from './handlers/play.handler.js';
import { LoggerModule } from './core/logger/logger.module.js';

const handlers = [StopAllHandler, StopHandler, PlayYoutubeHandler, PlayHandler];

@Module({
  imports: [LoggerModule, CqrsModule, ConfigModule.forRoot({ isGlobal: true, load: [CONFIG] })],
  providers: [LittlePigService, PlayerService, ...handlers],
})
export class AppModule {}
