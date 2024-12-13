import { type ClassConstructor as CLS, type ClassTransformOptions, plainToInstance } from 'class-transformer';
import { validateOrReject, type ValidatorOptions } from 'class-validator';

export function transform<T, V>(cls: CLS<T>, plain: V[], options?: ClassTransformOptions): T[];
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export function transform<T, V>(cls: CLS<T>, plain: V, options?: ClassTransformOptions): T;
export function transform<T, V>(cls: CLS<T>, plain: V | V[], options: ClassTransformOptions = {}): T | T[] {
  return plainToInstance(cls, plain, {
    exposeUnsetFields: false,
    exposeDefaultValues: true,
    excludeExtraneousValues: true,
    ...options,
  });
}

export async function validate<T extends []>(instance: T[], options?: ValidatorOptions): Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function validate<T extends object>(instance: T, options?: ValidatorOptions): Promise<void>;
export async function validate<T extends object>(instance: T | T[], options: ValidatorOptions = {}): Promise<void> {
  const config = {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    validationError: { target: false },
    ...options,
  };
  if (Array.isArray(instance)) {
    const errors = await Promise.allSettled(instance.map((el) => validateOrReject(el, config)));
    if (errors.some((el) => el.status === 'rejected')) {
      throw new AggregateError(
        errors.filter((el): el is PromiseRejectedResult => el.status === 'rejected').map((el) => el.reason as Error),
      );
    }
  }
  await validateOrReject(instance, config);
}

export interface Options {
  transform: ClassTransformOptions;
  validator: ValidatorOptions;
  errorFactory: (err: string) => Error;
}

export async function transformAndValidate<T, V>(cls: CLS<T>, plain: V[], options?: Partial<Options>): Promise<T[]>;
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export async function transformAndValidate<T, V>(cls: CLS<T>, plain: V, options?: Partial<Options>): Promise<T>;
export async function transformAndValidate<T, V>(
  cls: CLS<T>,
  plain: V | V[],
  options: Partial<Options> = {},
): Promise<T | T[]> {
  const instance = transform(cls, plain, options.transform);
  await validate(instance as object, options.validator);

  return instance;
}
