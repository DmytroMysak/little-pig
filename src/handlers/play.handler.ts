import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { PlayerService } from '../services/player.service.js';
import { BaseCommand } from './base.handler.js';

export class PlayCommand extends BaseCommand {
  @Expose()
  @IsString()
  @IsNotEmpty()
  link: string;

  @Expose()
  @IsNumber()
  @IsNotEmpty()
  volume: number;
}

@CommandHandler(PlayCommand)
export class PlayHandler implements ICommandHandler<PlayCommand> {
  constructor(private readonly playerService: PlayerService) {}

  async execute(command: PlayCommand): Promise<void> {
    await this.playerService.addToQueue({ volume: command.volume, link: command.link });
  }
}
