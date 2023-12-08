import { Inject, Injectable } from '@nestjs/common';

import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_TOKEN, LogLevel } from './model';
import { NestLoggerService } from './nest-logger.service';
import { WinstonLogger } from './winston/winston-logger';

@Injectable()
export class LoggerService implements NestLoggerService {
  private static _instance: WinstonLogger;

  static get instance(): WinstonLogger {
    return LoggerService._instance;
  }

  private _context?: string;

  get logger(): WinstonLogger {
    return LoggerService.instance;
  }

  get context(): string | undefined {
    return this._context;
  }
  set context(context: string | undefined) {
    this._context = context;
  }

  constructor(@Inject(LOGGER_MODULE_OPTIONS_TOKEN) _options: LoggerModuleOptions) {
    if (!LoggerService._instance) {
      LoggerService._instance = new WinstonLogger(_options);
    }
  }

  setContext(context: string | undefined): void {
    this._context = context;
  }

  setConsoleLogLevel(level: LogLevel): LogLevel | undefined {
    return this.logger.setConsoleLogLevel(level);
  }

  setFileLogLevel(level: LogLevel): LogLevel | undefined {
    return this.logger.setFileLogLevel(level);
  }

  setConsoleLogSilent(silent: boolean): boolean | undefined {
    return this.logger.setConsoleLogSilent(silent);
  }

  setFileLogSilent(silent: boolean): boolean | undefined {
    return this.logger.setFileLogSilent(silent);
  }

  log(message: string, context?: string): NestLoggerService {
    context = context ?? this._context;
    this.logger.info(message, { context });
    return this;
  }

  error(message: string, trace?: string, context?: string): NestLoggerService {
    context = context ?? this._context;
    if (trace) {
      this.logger.error(message, { context, stack: trace });
    } else {
      this.logger.error(message, { context });
    }
    return this;
  }

  warn(message: string, context?: string): NestLoggerService {
    context = context ?? this._context;
    this.logger.warn(message, { context });
    return this;
  }

  debug(message: string, context?: string): NestLoggerService {
    context = context ?? this._context;
    this.logger.debug(message, { context });
    return this;
  }

  verbose(message: string, context?: string): NestLoggerService {
    context = context ?? this._context;
    this.logger.verbose(message, { context });
    return this;
  }
}
