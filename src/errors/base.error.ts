/* eslint-disable @typescript-eslint/no-explicit-any */
import omit from 'lodash/omit.js';
import { inspect } from 'node:util';

export interface BaseErrorParams {
  message?: string;
  cause?: Error | Error[];
  shouldRetry?: boolean;
  delayInSeconds?: number;
  metadata?: Record<string, unknown>;
  requestId: string;
}

export abstract class BaseError extends Error {
  public message: string;
  public cause?: Error;
  public shouldRetry: boolean;
  public delayInSeconds?: number;
  public requestId?: string;
  public metadata?: Record<string, unknown>;

  constructor({ shouldRetry, message, cause, delayInSeconds, metadata, requestId }: BaseErrorParams) {
    const { message: causeMsg, shouldRetry: causeShouldRetry } =
      (Array.isArray(cause) ? cause[0] : cause) ?? ({} as any);

    const msg = message ?? causeMsg ?? 'Generic Error';

    super(msg, { cause });

    this.message = msg;
    this.shouldRetry = shouldRetry ?? causeShouldRetry ?? true;
    this.delayInSeconds = delayInSeconds;
    this.cause = this.stripError(cause);
    this.metadata = metadata;
    this.requestId = requestId;
  }

  logError(): Record<string, unknown> {
    const { shouldRetry, message, requestId, delayInSeconds, cause, metadata, stack } = this;
    const additionalData = omit({ ...(metadata ?? {}), ...(cause ?? {}) }, ['shouldRetry', 'delayInSeconds']);

    return {
      message,
      name: this.constructor.name,
      data: {
        requestId,
        shouldRetry,
        delayInSeconds,
        ...additionalData,
      },
      stack: inspect({ stack, cause }).replaceAll(`\\n' +`, ''),
    };
  }

  stripError(cause?: Error | Error[]): Error | undefined {
    if (!cause) {
      return;
    }
    if (Array.isArray(cause)) {
      return new AggregateError(cause.map((error) => this.stripError(error)));
    }

    return cause;
  }
}
