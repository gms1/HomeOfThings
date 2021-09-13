import { ConfigModule, ConfigService } from '@homeofthings/nestjs-config';
import { LoggerModule } from '@homeofthings/nestjs-logger';
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
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.getNumber('gateway.throttle.ttl', DEFAULT_SERVICE_THROTTLE_TTL),
        limit: config.getNumber('gateway.throttle.limit', DEFAULT_SERVICE_THROTTLE_LIMIT),
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
