import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';

export class StopCommand extends BaseCommand {}

@CommandHandler(StopCommand)
export class StopHandler implements ICommandHandler<StopCommand> {
  constructor(private readonly playerService: PlayerService) {}

  async execute(): Promise<void> {
    await this.playerService.stopSong();
  }
}
