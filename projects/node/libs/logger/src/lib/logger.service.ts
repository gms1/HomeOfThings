import { Inject } from '@nestjs/common';
import { LoggerModuleOptions, LOGGER_MODULE_OPTIONS_TOKEN, LOGLEVEL } from './model';
import { WinstonLogger } from './winston/winston-logger';
import { NestLoggerService } from './nest-logger.service';

export class LoggerService implements NestLoggerService {
  private _context?: string;
  private _logger: WinstonLogger;

  get logger(): WinstonLogger {
    return this._logger;
  }

  get context(): string | undefined {
    return this._context;
  }
  set context(context: string | undefined) {
    this._context = context;
  }

  constructor(@Inject(LOGGER_MODULE_OPTIONS_TOKEN) _options: LoggerModuleOptions) {
    this._logger = new WinstonLogger(_options);
  }

  setContext(context: string | undefined): void {
    this._context = context;
  }

  setConsoleLogLevel(level: LOGLEVEL): LOGLEVEL | undefined {
    return this.logger.setConsoleLogLevel(level);
  }

  setFileLogLevel(level: LOGLEVEL): LOGLEVEL | undefined {
    return this.logger.setFileLogLevel(level);
  }

  setConsoleLogSilent(silent: boolean): boolean | undefined {
    return this.logger.setConsoleLogSilent(silent);
  }

  setFileLogSilent(silent: boolean): boolean | undefined {
    return this.logger.setFileLogSilent(silent);
  }

  log(message: string, context?: string): NestLoggerService {
    return this.callLogger('info', message, context);
  }

  error(message: string, trace?: string, context?: string): NestLoggerService {
    if (trace) {
      return this.callLogger('error', message, context, { stack: trace });
    } else {
      return this.callLogger('error', message, context);
    }
  }

  warn(message: string, context?: string): NestLoggerService {
    return this.callLogger('warn', message, context);
  }

  debug(message: string, context?: string): NestLoggerService {
    return this.callLogger('debug', message, context);
  }

  verbose(message: string, context?: string): NestLoggerService {
    return this.callLogger('verbose', message, context);
  }

  private callLogger(type: string, message: string, context?: string, meta?: object): NestLoggerService {
    context = context || this._context;
    meta = { ...meta, context };

    (this.logger as any)[type](message, meta);
    return this;
  }
}
