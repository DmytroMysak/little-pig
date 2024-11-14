import type { Channel } from 'amqplib';

export interface QueueOptions {
  retriesCount?: number;
}

export interface ConnectionOptions {
  url: string;
}

export interface ConsumerOptions {
  queueName: string;
  queueOptions?: QueueOptions;
  connection: ConnectionOptions;
}

export interface ProducerOptions {
  connection: ConnectionOptions;
}

export interface ChannelWrapper extends Channel {
  queueName: string;
  retriesCount?: number;
}
