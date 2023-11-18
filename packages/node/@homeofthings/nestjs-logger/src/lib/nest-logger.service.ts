import { LoggerService as NestPureLoggerService } from '@nestjs/common';

export interface NestLoggerService extends NestPureLoggerService {
  setContext(context?: string): void;
}
