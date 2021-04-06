import { ModuleMetadata } from '@nestjs/common/interfaces';
import { LOGLEVEL } from '../model/logger.constants';
/*
 * logging level: 'error', 'warn', 'info', 'verbose', 'debug', 'silly'
 */
export interface LoggerModuleOptions {
  consoleLogLevel?: LOGLEVEL;
  consoleLogSilent?: boolean;
  fileLogFileName?: string;
  fileLogLevel?: LOGLEVEL;
  fileLogSilent?: boolean;
}

export interface LoggerModuleOptionsAsync extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => Promise<LoggerModuleOptions> | LoggerModuleOptions;
  inject: any[];
}
