import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { EventSource, type FetchLike } from 'eventsource';
import { Command } from '../constants.js';
import { ConfigService } from '@nestjs/config';
import { StopCommand } from '../handlers/stop.handler.js';
import { StopAllCommand } from '../handlers/stopAll.handler.js';
import { PlayCommand } from '../handlers/play.handler.js';
import { PlayYoutubeCommand } from '../handlers/playYoutube.handler.js';
import { transformAndValidate } from 'src/core/utils/validate.util.js';

@Injectable()
export class LittlePigService implements OnApplicationShutdown {
  private readonly logger = new Logger(LittlePigService.name);
  private readonly eventSource: EventSource;

  public events: Record<Command, new (...args: unknown[]) => ICommand> = {
    [Command.StopSong]: StopCommand,
    [Command.StopAllSongs]: StopAllCommand,
    [Command.Play]: PlayCommand,
    [Command.PlayYoutube]: PlayYoutubeCommand,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
  ) {
    this.eventSource = new EventSource(this.configService.getOrThrow('serverUrl'), {
      fetch: (input, init): ReturnType<FetchLike> =>
        fetch(input, {
          ...init,
          headers: {
            ...(init?.headers ?? {}),
            'x-access-key': this.configService.getOrThrow('apiKey'),
          },
        }),
    });
  }

  onApplicationShutdown(): void {
    this.eventSource.close();
  }

  start(): void {
    this.eventSource.onmessage = async ({ data }): Promise<void> => {
      this.logger.debug('Received message', data);

      try {
        const message = JSON.parse(data as string) as Record<string, unknown> | undefined;

        if (!this.isCommand(message?.command)) {
          this.logger.error('Unknown message', message);
          return;
        }

        await this.commandBus.execute(await transformAndValidate(this.events[message.command], message));
      } catch (error) {
        this.logger.error('Error while handling message', error);
      }
    };

    this.logger.log('LittlePig started');
  }

  isCommand(command: unknown): command is Command {
    return Object.keys(this.events).includes(command as string);
  }
}
