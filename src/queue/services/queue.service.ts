import { Logger } from '@nestjs/common';
import type { ChannelWrapper } from '../queue.type.js';
import { createExchangeName, createRoutingKey } from '../queue.util.js';
import { REQUEST_ID, RETRY_COUNT_KEY, TIME_SENT_KEY } from '../constants.js';

export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(private readonly producer: ChannelWrapper) {}

  async send<MessageType extends object>({
    message,
    requestId,
    delayInSeconds: delay,
  }: {
    message: MessageType;
    requestId: string;
    delayInSeconds?: number;
  }): Promise<void> {
    try {
      const exchange = createExchangeName(this.producer.queueName, delay);
      const routingKey = createRoutingKey(this.producer.queueName, delay);

      if (delay) {
        const delayQueueName = `${this.producer.queueName}_delay_${delay.toString()}`;
        await this.producer.assertQueue(delayQueueName, {
          deadLetterExchange: exchange,
          deadLetterRoutingKey: routingKey,
          expires: delay * 1000 + 60_000,
        });
        await this.producer.assertExchange(exchange, 'direct', { autoDelete: true });
        await this.producer.bindQueue(delayQueueName, exchange, routingKey);
      }

      const headers = {
        [RETRY_COUNT_KEY]: 0,
        [REQUEST_ID]: requestId,
        [TIME_SENT_KEY]: Date.now(),
      };
      this.producer.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { headers });

      this.logger.debug('[QueueService.send] Message sent to queue');
    } catch (error) {
      this.logger.error('[QueueService.send] Error during message sent', { error, message, delay });
      throw error;
    }
  }
}
