import { logger } from '../logger/WinstonLogger';

export interface RetryPolicy {
  maxRetries: number;
  shouldRetry(error: Error, attempt: number): boolean;
  getDelay(attempt: number): number;
  execute<T>(operation: () => Promise<T>, onRetry?: (attempt: number, error: Error) => void): Promise<T>;
}

export class ExponentialBackoffRetryPolicy implements RetryPolicy {
  maxRetries: number;
  private baseDelayMs: number;

  constructor(maxRetries: number = 3, baseDelayMs: number = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelayMs = baseDelayMs;
  }

  shouldRetry(error: Error, attempt: number): boolean {
    return attempt < this.maxRetries;
  }

  getDelay(attempt: number): number {
    const delay = this.baseDelayMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 200;
    return delay + jitter;
  }

  async execute<T>(operation: () => Promise<T>, onRetry?: (attempt: number, error: Error) => void): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        if (this.shouldRetry(error, attempt)) {
          const delay = this.getDelay(attempt);
          logger.warn(`Operation failed (attempt ${attempt}/${this.maxRetries}). Retrying in ${Math.round(delay)}ms. Error: ${error.message || error}`);
          if (onRetry) onRetry(attempt, error);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          logger.error(`Operation failed after ${attempt} attempts. No more retries. Error: ${error.message || error}`);
          throw error;
        }
      }
    }
  }
}
