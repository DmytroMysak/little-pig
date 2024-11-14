import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';

export class StopAllCommand extends BaseCommand {}

@CommandHandler(StopAllCommand)
export class StopAllHandler implements ICommandHandler<StopAllCommand> {
  constructor(private readonly playerService: PlayerService) {}

  async execute(): Promise<void> {
    this.playerService.clearQueue();
    await this.playerService.stopSong();
  }
}
