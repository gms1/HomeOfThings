export const LOGGER_MODULE_OPTIONS_TOKEN = 'LOGGER_MODULE_OPTIONS_TOKEN';

export const DEFAULT_CONSOLE_LOGLEVEL = 'info';
export const DEFAULT_FILE_LOGLEVEL = 'warn';
export enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Help = 'help',
  Verbose = 'verbose',
  Debug = 'debug',
  Silly = 'silly',
}
