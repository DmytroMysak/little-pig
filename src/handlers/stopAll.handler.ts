import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';
import { Injectable } from '@nestjs/common';

export class StopAllCommand extends BaseCommand {}

@Injectable()
@CommandHandler(StopAllCommand)
export class StopAllHandler implements ICommandHandler<StopAllCommand> {
  constructor(private readonly playerService: PlayerService) {}

  execute(): Promise<void> {
    this.playerService.clearQueue();
    this.playerService.stopSong();
    return Promise.resolve();
  }
}
