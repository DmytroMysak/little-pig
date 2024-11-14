import type { Connection } from 'amqplib';
import type { ChannelWrapper, QueueOptions } from './queue.type.js';
import { Logger } from '@nestjs/common';

const QUEUE_EXCHANGE = 'queue-ex';
const ROUTING_KEY = 'routing-key';
const DELAY_EXCHANGE = 'delay-ex';
export const QUEUE_PREFIX = 'RABBIT_QUEUE_';

export const createExchangeName = (queueName: string, delay?: number): string =>
  `${queueName}_${QUEUE_EXCHANGE}${delay ? `_${DELAY_EXCHANGE}_${delay.toString()}` : ''}`;

export const createRoutingKey = (queueName: string, delay?: number): string =>
  `${queueName}_${ROUTING_KEY}${delay ? `_${DELAY_EXCHANGE}` : ''}`;

export const initChannel = async (
  connection: Connection,
  queueName: string,
  queueOptions?: QueueOptions,
): Promise<ChannelWrapper> => {
  const channel = await connection.createChannel();
  await channel.assertQueue(queueName);
  await channel.assertExchange(createExchangeName(queueName), 'direct', { autoDelete: false, durable: true });
  await channel.bindQueue(queueName, createExchangeName(queueName), createRoutingKey(queueName));

  const logger = new Logger(initChannel.name);
  channel.on('connect', () => logger.debug('Connected to RabbitMQ'));
  channel.on('error', (err: unknown) => logger.warn('Error in channel', err));
  channel.on('close', () => logger.debug('Channel closed'));

  (channel as ChannelWrapper).queueName = queueName;
  (channel as ChannelWrapper).retriesCount = queueOptions?.retriesCount;
  return channel as ChannelWrapper;
};
