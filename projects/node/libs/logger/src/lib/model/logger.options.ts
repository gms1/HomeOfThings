import { ModuleMetadata } from '@nestjs/common/interfaces';
import { LOGLEVEL } from '../model/logger.constants';
/*
 * logging level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
 */

export interface LoggerOptions {
  consoleLogLevel?: LOGLEVEL;
  consoleLogSilent?: boolean;
  fileLogFileName?: string;
  fileLogLevel?: LOGLEVEL;
  fileLogSilent?: boolean;
}
export type LoggerModuleOptions = LoggerOptions;

export interface LoggerModuleOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  inject: any[];
}
