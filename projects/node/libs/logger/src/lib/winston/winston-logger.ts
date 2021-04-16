import * as _dbg from 'debug';
import * as path from 'path';
import * as mkdirp from 'mkdirp';
import { LoggerOptions } from '../model';
import { DEFAULT_CONSOLE_FORMAT, DEFAULT_FILE_FORMAT } from './winston-format';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LOGLEVEL } from '../model/logger.constants';
import * as winston from 'winston';
const debug = _dbg('Logger');
debug('Module "winston" imported');

export class WinstonLogger {
  private static _instance: WinstonLogger;
  static get instance(): WinstonLogger {
    return WinstonLogger._instance;
  }

  private _logger!: winston.Logger;

  get logger(): winston.Logger {
    return this._logger;
  }

  private _consoleTransport!: winston.transports.ConsoleTransportInstance;
  private _fileTransport?: winston.transports.FileTransportInstance;

  constructor(_options: LoggerOptions) {
    if (!WinstonLogger._instance) {
      // initialize the 'singleton'
      WinstonLogger._instance = this;
      this.init(_options);
      WinstonLogger._instance.debug('Logger initialized', { context: 'Logger' });
    } else {
      WinstonLogger._instance.debug(`Logger already exist`, { context: 'Logger' });
    }
    return WinstonLogger._instance;
  }

  setConsoleLogLevel(level: LOGLEVEL): LOGLEVEL | undefined {
    const oldLevel = this._consoleTransport.level;
    this._consoleTransport.level = level;
    return oldLevel ? (oldLevel as LOGLEVEL) : undefined;
  }

  setFileLogLevel(level: LOGLEVEL): LOGLEVEL | undefined {
    if (!this._fileTransport) {
      return undefined;
    }
    const oldLevel = this._fileTransport.level;
    this._fileTransport.level = level;
    return oldLevel ? (oldLevel as LOGLEVEL) : undefined;
  }

  setConsoleLogSilent(silent: boolean): boolean | undefined {
    const oldIsSilent = this._consoleTransport.silent;
    this._consoleTransport.silent = silent;
    return oldIsSilent;
  }

  setFileLogSilent(silent: boolean): boolean | undefined {
    if (!this._fileTransport) {
      return undefined;
    }
    const oldIsSilent = this._fileTransport.silent;
    this._fileTransport.silent = silent;
    return oldIsSilent;
  }

  error(message: string, ...meta: any[]): WinstonLogger {
    this._logger.error(message, ...meta);
    return this;
  }

  warn(message: string, ...meta: any[]): WinstonLogger {
    this._logger.warn(message, ...meta);
    return this;
  }

  info(message: string, ...meta: any[]): WinstonLogger {
    this._logger.info(message, ...meta);
    return this;
  }

  debug(message: string, ...meta: any[]): WinstonLogger {
    this._logger.debug(message, ...meta);
    return this;
  }

  verbose(message: string, ...meta: any[]): WinstonLogger {
    this._logger.verbose(message, ...meta);
    return this;
  }

  private init(options: LoggerOptions): winston.Logger {
    debug(`creating winston logger....`);
    this._consoleTransport = new winston.transports.Console({
      silent: options.consoleLogSilent,
      level: options.consoleLogLevel || DEFAULT_CONSOLE_LOGLEVEL,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        DEFAULT_CONSOLE_FORMAT,
      ),
    });

    if (options.fileLogFileName) {
      mkdirp(path.dirname(options.fileLogFileName));
      this._fileTransport = new winston.transports.File({
        silent: options.fileLogSilent,
        level: options.fileLogLevel || DEFAULT_FILE_LOGLEVEL,
        filename: options.fileLogFileName,
        format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), DEFAULT_FILE_FORMAT),
      });
    }
    this._logger = winston.createLogger({
      transports: [this._consoleTransport],
    });

    if (this._fileTransport) {
      this._logger.add(this._fileTransport);
    }
    debug(`creating winston logger: done`);
    return this._logger;
  }
}
