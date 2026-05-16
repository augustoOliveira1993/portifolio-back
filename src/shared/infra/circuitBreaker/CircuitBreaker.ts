import CircuitBreaker from 'opossum';
import { logger } from '@shared/utils/logger';

export interface ICircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  name?: string;
}

const defaultOptions: ICircuitBreakerOptions = {
  timeout: 5000,
  errorThresholdPercentage: 50,
  resetTimeout: 10000,
};

/**
 * Cria um Circuit Breaker em volta de uma função assíncrona.
 *
 * @example
 * const breaker = createCircuitBreaker(sendEmail, { name: 'EmailService' });
 * await breaker.fire(payload);
 */
export function createCircuitBreaker<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: ICircuitBreakerOptions = {},
): CircuitBreaker<TArgs, TResult> {
  const opts = { ...defaultOptions, ...options };
  const breaker = new CircuitBreaker(fn, opts);

  const name = opts.name ?? fn.name ?? 'unknown';

  breaker.on('open', () =>
    logger.warn(`[CircuitBreaker:${name}] ABERTO - chamadas bloqueadas`),
  );
  breaker.on('halfOpen', () =>
    logger.info(`[CircuitBreaker:${name}] HALF-OPEN - testando recuperação`),
  );
  breaker.on('close', () =>
    logger.info(`[CircuitBreaker:${name}] FECHADO - operação normalizada`),
  );
  breaker.on('fallback', () =>
    logger.warn(`[CircuitBreaker:${name}] fallback acionado`),
  );
  breaker.on('timeout', () =>
    logger.error(`[CircuitBreaker:${name}] timeout após ${opts.timeout}ms`),
  );

  return breaker;
}
