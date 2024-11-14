import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { CONSUMER, REQUEST_ID, RETRY_COUNT_KEY } from '../constants.js';
import type { ChannelWrapper } from '../queue.type.js';
import set from 'lodash/set.js';

type IMsgHandler = (msg: Record<string, unknown>, requestId: string) => Promise<void>;

@Injectable()
export class ConsumerService implements OnModuleDestroy {
  private readonly logger = new Logger(ConsumerService.name);

  constructor(@Inject(CONSUMER) private readonly consumer: ChannelWrapper) {}

  async registerHandler(handler: IMsgHandler): Promise<void> {
    await this.consumer.prefetch(10);

    await this.consumer.consume(this.consumer.queueName, (msg) => {
      if (!msg) {
        return;
      }

      const requestId = msg.properties.headers?.[REQUEST_ID] ?? Date.now().toString();
      let message;
      try {
        message = JSON.parse(msg.content.toString());
      } catch (error: unknown) {
        this.logger.warn('Unknown message', { message: message?.content, requestId, error });
        this.consumer.nack(msg, false, false);
      }

      handler(message, requestId).catch((error: unknown) => {
        const shouldRetry = (error as { shouldRetry?: boolean }).shouldRetry;
        const currentRetry = Number(msg.properties.headers?.[RETRY_COUNT_KEY] ?? 0);
        const maxRetry = this.consumer.retriesCount ?? 0;

        if (shouldRetry && currentRetry < maxRetry) {
          set(msg, `properties.headers.${RETRY_COUNT_KEY}`, currentRetry + 1);
          this.logger.warn('message handler failed to consume message', { error, requestId });
          this.consumer.nack(msg, false, true);
          return;
        }

        this.logger.error('message handler failed to consume message', { error, requestId });
        this.consumer.nack(msg, false, false);
      });
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.consumer.close();
  }
}
