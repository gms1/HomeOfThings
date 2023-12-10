/* eslint-disable @typescript-eslint/no-explicit-any */
import _debug from 'debug';
import * as mkdirp from 'mkdirp';
import * as path from 'path';
import * as winston from 'winston';

import { DEFAULT_CONSOLE_FORMAT, DEFAULT_FILE_FORMAT } from './winston-format';
import { LoggerOptions } from '../model';
import { DEFAULT_CONSOLE_LOGLEVEL, DEFAULT_FILE_LOGLEVEL, LogLevel } from '../model/logger.constants';

// NOTE: to be able to use WinstonLogger for 'debug'
// waiting for
//   "Pluggable log handler" (2018-03) https://github.com/visionmedia/debug/issues/556
//   "5.x Roadmap" (2018-12) https://github.com/visionmedia/debug/issues/656

const debug = _debug('nestjs-logger');
debug('Module "winston" imported');

export class WinstonLogger {
  private _logger!: winston.Logger;

  get logger(): winston.Logger {
    return this._logger;
  }

  private _consoleTransport!: winston.transports.ConsoleTransportInstance;
  private _fileTransport?: winston.transports.FileTransportInstance;

  constructor(_options: LoggerOptions) {
    this.init(_options);
  }

  setConsoleLogLevel(level: LogLevel): LogLevel | undefined {
    const oldLevel = this._consoleTransport.level;
    this._consoleTransport.level = level;
    return oldLevel ? (oldLevel as LogLevel) : undefined;
  }

  setFileLogLevel(level: LogLevel): LogLevel | undefined {
    if (!this._fileTransport) {
      return undefined;
    }
    const oldLevel = this._fileTransport.level;
    this._fileTransport.level = level;
    return oldLevel ? (oldLevel as LogLevel) : undefined;
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
      level: options.consoleLogLevel ?? DEFAULT_CONSOLE_LOGLEVEL,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'HH:mm:ss.SSS',
        }),
        winston.format.errors({ stack: true }),
        DEFAULT_CONSOLE_FORMAT,
      ),
    });

    if (options.fileLogFileName) {
      mkdirp.sync(path.dirname(options.fileLogFileName));
      this._fileTransport = new winston.transports.File({
        silent: options.fileLogSilent,
        level: options.fileLogLevel ?? DEFAULT_FILE_LOGLEVEL,
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
