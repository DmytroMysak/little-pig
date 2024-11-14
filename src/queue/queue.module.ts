import { Module, DynamicModule } from '@nestjs/common';
import { PRODUCER_CONNECTION_NAME, CONSUMER, CONSUMER_CONNECTION_NAME } from './constants.js';
import type { ChannelWrapper } from './queue.type.js';
import amqplib from 'amqplib';
import { ConsumerService } from './services/consumer.service.js';
import { initChannel } from './queue.util.js';
import { QueueService } from './services/queue.service.js';
import {
  CONSUMER_ASYNC_OPTIONS_TYPE,
  CONSUMER_OPTIONS_TOKEN,
  CONSUMER_OPTIONS_TYPE,
  ConsumerModuleClass,
  PRODUCER_ASYNC_OPTIONS_TYPE,
  PRODUCER_OPTIONS_TOKEN,
  PRODUCER_OPTIONS_TYPE,
  ProducerModuleClass,
} from './queue.moduleDefinition.js';
import { ProducerService } from './services/producer.service.js';

@Module({})
export class ConsumerQueueModule extends ConsumerModuleClass {
  static register(options: typeof CONSUMER_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);
    const { providers, exports } = ConsumerQueueModule.getProviders();

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...(providers ?? [])],
      exports: [...(dynamicModule.exports ?? []), ...(exports ?? [])],
    };
  }

  static registerAsync(options: typeof CONSUMER_ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.registerAsync(options);
    const { providers, exports } = ConsumerQueueModule.getProviders();

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...(providers ?? [])],
      exports: [...(dynamicModule.exports ?? []), ...(exports ?? [])],
    };
  }

  static getProviders(): Pick<DynamicModule, 'providers' | 'exports'> {
    return {
      providers: [
        {
          provide: CONSUMER_CONNECTION_NAME,
          useFactory: (options: typeof CONSUMER_OPTIONS_TYPE): Promise<amqplib.Connection> =>
            amqplib.connect(options.connection.url),
          inject: [CONSUMER_OPTIONS_TOKEN],
        },
        {
          provide: CONSUMER,
          useFactory: (connection: amqplib.Connection, { queueName, queueOptions }): Promise<ChannelWrapper> =>
            initChannel(connection, queueName, queueOptions),
          inject: [CONSUMER_CONNECTION_NAME, CONSUMER_OPTIONS_TOKEN],
        },
        ConsumerService,
      ],
      exports: [ConsumerService],
    };
  }
}

@Module({})
export class ProducerQueueModule extends ProducerModuleClass {
  static register(options: typeof PRODUCER_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.register(options);
    const { providers, exports } = ProducerQueueModule.getProviders();

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...(providers ?? [])],
      exports: [...(dynamicModule.exports ?? []), ...(exports ?? [])],
    };
  }

  static registerAsync(options: typeof PRODUCER_ASYNC_OPTIONS_TYPE): DynamicModule {
    const dynamicModule = super.registerAsync(options);
    const { providers, exports } = ProducerQueueModule.getProviders();

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), ...(providers ?? [])],
      exports: [...(dynamicModule.exports ?? []), ...(exports ?? [])],
    };
  }

  static getProviders(): Pick<DynamicModule, 'providers' | 'exports'> {
    return {
      providers: [
        {
          provide: PRODUCER_CONNECTION_NAME,
          useFactory: (options: typeof PRODUCER_OPTIONS_TYPE): Promise<amqplib.Connection> =>
            amqplib.connect(options.connection.url),
          inject: [PRODUCER_OPTIONS_TOKEN],
        },
        QueueService,
        ProducerService,
      ],
      exports: [QueueService, ProducerService],
    };
  }
}
