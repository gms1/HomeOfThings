import { LogLevel } from '../model/logger.constants';
/*
 * logging level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
 */

export interface LoggerOptions {
  consoleLogLevel?: LogLevel;
  consoleLogSilent?: boolean;
  fileLogFileName?: string;
  fileLogLevel?: LogLevel;
  fileLogSilent?: boolean;
}
export type LoggerModuleOptions = LoggerOptions;
