import { ConfigModule, ConfigService } from '@homeofthings/nestjs-config';
import { LoggerModule, LoggerService } from '@homeofthings/nestjs-logger';
import { Logger, Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';

const DEFAULT_SERVICE_THROTTLE_TTL = 60;
const DEFAULT_SERVICE_THROTTLE_LIMIT = 10;
@Module({
  imports: [
    // NOTE: options ignored because ConfigService manually created in main.ts
    ConfigModule.forRoot(ConfigModule, {}),
    // NOTE: options ignored because LoggerService manually created in main.ts
    LoggerModule.forRoot(LoggerModule, {}),
    ThrottlerModule.forRootAsync({
      inject: [LoggerService, ConfigService],
      useFactory: (logger: LoggerService, config: ConfigService) => ({
        ttl: config.getNumber('service.throttle.ttl', DEFAULT_SERVICE_THROTTLE_TTL),
        limit: config.getNumber('service.throttle.limit', DEFAULT_SERVICE_THROTTLE_LIMIT),
      }),
    }),
    ConsoleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.debug(`${AppModule.name} created`);
  }
}
