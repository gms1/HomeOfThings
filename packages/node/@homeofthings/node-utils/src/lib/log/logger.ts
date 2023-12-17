export interface Logger {
  verbose(message: string, ...more: unknown[]): void;
  info(message: string, ...more: unknown[]): void;
  warn(message: string, ...more: unknown[]): void;
  error(message: string, ...more: unknown[]): void;
}
