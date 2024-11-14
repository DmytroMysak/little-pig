import { Inject, Injectable } from '@nestjs/common';
import { QueueService } from './queue.service.js';
import { initChannel } from '../queue.util.js';
import { PRODUCER_CONNECTION_NAME } from '../constants.js';
import type { Connection } from 'amqplib';

@Injectable()
export class ProducerService {
  constructor(@Inject(PRODUCER_CONNECTION_NAME) private readonly connection: Connection) {}

  async getQueue(queueName: string): Promise<QueueService> {
    const producer = await initChannel(this.connection, queueName);

    return new QueueService(producer);
  }
}
