export interface Logger {
  log(...text: unknown[]): void;
  info(...text: unknown[]): void;
  warn(...text: unknown[]): void;
  error(...text: unknown[]): void;
}
