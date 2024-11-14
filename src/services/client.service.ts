import { Injectable, Logger } from '@nestjs/common';
import { CommandBus, ICommand } from '@nestjs/cqrs';
import { Command } from '../constants.js';
import { transformAndValidate } from '../utils/validate.util.js';
import { ConsumerService } from '../queue/services/consumer.service.js';
import { ProducerService } from '../queue/services/producer.service.js';
import { ConfigService } from '@nestjs/config';
import { ConsumerError } from '../errors/consumer.error.js';
import { StopCommand } from '../handlers/stop.handler.js';
import { StopAllCommand } from '../handlers/stopAll.handler.js';
import { PlayCommand } from '../handlers/play.handler.js';
import { PlayYoutubeCommand } from '../handlers/playYoutube.handler.js';

@Injectable()
export class LittlePigService {
  private readonly logger = new Logger(LittlePigService.name);

  public events: Record<Command, new (...args: unknown[]) => ICommand> = {
    [Command.StopSong]: StopCommand,
    [Command.StopAllSongs]: StopAllCommand,
    [Command.Play]: PlayCommand,
    [Command.PlayYoutube]: PlayYoutubeCommand,
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly commandBus: CommandBus,
    private readonly consumerService: ConsumerService,
    private readonly producerService: ProducerService,
  ) {}

  async start(): Promise<void> {
    const responseQueue = await this.producerService.getQueue(this.configService.getOrThrow('rabbitMq.responseQueue'));

    await this.consumerService.registerHandler(async (message, requestId) => {
      if (!this.isCommand(message.command)) {
        throw new ConsumerError({
          message: 'Unknown message',
          requestId,
          shouldRetry: false,
        });
      }

      const commandEvent = transformAndValidate(this.events[message.command], message);
      const response = await this.commandBus.execute(commandEvent);

      if (response && message.chatId) {
        this.logger.debug('Sending response to server', response);
        await responseQueue.send({
          message: { ...response, chatId: message.chatId },
          requestId,
        });
      }
    });

    this.logger.log('LittlePig started');
  }

  isCommand(command: unknown): command is Command {
    return Object.keys(this.events).includes(command as string);
  }
}
