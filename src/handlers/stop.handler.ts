import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';
import { Injectable } from '@nestjs/common';

export class StopCommand extends BaseCommand {}

@Injectable()
@CommandHandler(StopCommand)
export class StopHandler implements ICommandHandler<StopCommand> {
  constructor(private readonly playerService: PlayerService) {}

  execute(): Promise<void> {
    this.playerService.stopSong();
    return Promise.resolve();
  }
}
