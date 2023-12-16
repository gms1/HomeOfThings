import chalk from 'chalk';

import { Logger } from './logger';

class DefaultLogger implements Logger {
  readonly WARNING_PREFIX = 'WARNING: ';
  readonly ERROR_PREFIX = 'ERROR: ';

  log(...text: unknown[]): void {
    console.info(...text);
  }

  info(...text: unknown[]): void {
    console.info(chalk.green(...text));
  }

  warn(...text: unknown[]): void {
    console.warn(chalk.yellow(this.WARNING_PREFIX, ...text));
  }

  error(...text: unknown[]): void {
    console.error(chalk.red.bold(this.ERROR_PREFIX, ...text));
  }
}

let currentLogger: Logger = new DefaultLogger();

export function setLogger(logger: Logger) {
  currentLogger = logger;
}

export function log(...text: unknown[]): void {
  currentLogger.log(...text);
}

export function logInfo(...text: unknown[]): void {
  currentLogger.info(...text);
}

export function logWarn(...text: unknown[]): void {
  currentLogger.warn(...text);
}

export function logError(...text: unknown[]): void {
  currentLogger.error(...text);
}
