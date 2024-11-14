export interface Config {
  isProduction: boolean;
  rabbitMq: {
    url: string;
    queueName: string;
    responseQueue: string;
  };
}

export const CONFIG = (): Config => {
  const { RABBITMQ_URL, RABBITMQ_QUEUE_NAME } = process.env;
  if (!RABBITMQ_URL || !RABBITMQ_QUEUE_NAME) {
    throw new Error('RabbitMQ configuration is missing');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    isProduction,
    rabbitMq: {
      url: RABBITMQ_URL,
      queueName: RABBITMQ_QUEUE_NAME,
      responseQueue: 'response-queue',
    },
  };
};
