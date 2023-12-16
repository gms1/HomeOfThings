import chalk from 'chalk';

import { Logger } from './logger';

class DefaultLogger implements Logger {
  readonly WARNING_PREFIX = 'WARNING: ';
  readonly ERROR_PREFIX = 'ERROR: ';

  verbose(message: string, ...more: unknown[]): void {
    console.info(message, ...more);
  }

  info(message: string, ...more: unknown[]): void {
    console.info(chalk.green(message, ...more));
  }

  warn(message: string, ...more: unknown[]): void {
    console.warn(chalk.yellow(message, this.WARNING_PREFIX, ...more));
  }

  error(message: string, ...more: unknown[]): void {
    console.error(chalk.red.bold(message, this.ERROR_PREFIX, ...more));
  }
}

let currentLogger: Logger = new DefaultLogger();

export function setLogger(logger: Logger) {
  currentLogger = logger;
}

export function logVerbose(message: string, ...more: unknown[]): void {
  currentLogger.verbose(message, ...more);
}

export function logInfo(message: string, ...more: unknown[]): void {
  currentLogger.info(message, ...more);
}

export function logWarn(message: string, ...more: unknown[]): void {
  currentLogger.warn(message, ...more);
}

export function logError(message: string, ...more: unknown[]): void {
  currentLogger.error(message, ...more);
}
