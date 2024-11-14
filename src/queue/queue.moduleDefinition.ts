import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { ConsumerOptions, ProducerOptions } from './queue.type.js';

export const {
  ConfigurableModuleClass: ConsumerModuleClass,
  MODULE_OPTIONS_TOKEN: CONSUMER_OPTIONS_TOKEN,
  OPTIONS_TYPE: CONSUMER_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: CONSUMER_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ConsumerOptions>()
  .setExtras({ isGlobal: true }, (definition, extras) => ({ ...definition, global: extras.isGlobal }))
  .build();

export const {
  ConfigurableModuleClass: ProducerModuleClass,
  OPTIONS_TYPE: PRODUCER_OPTIONS_TYPE,
  MODULE_OPTIONS_TOKEN: PRODUCER_OPTIONS_TOKEN,
  ASYNC_OPTIONS_TYPE: PRODUCER_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<ProducerOptions>()
  .setExtras({ isGlobal: true }, (definition, extras) => ({ ...definition, global: extras.isGlobal }))
  .build();
