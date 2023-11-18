import { ConfigModule } from '@homeofthings/nestjs-config';
import { LoggerModule } from '@homeofthings/nestjs-logger';
import { Module } from '@nestjs/common';
import { ConsoleModule } from 'nestjs-console';

@Module({
  imports: [
    // NOTE: options ignored because ConfigService manually created in main.ts
    ConfigModule.forRoot(ConfigModule, {}),
    // NOTE: options ignored because LoggerService manually created in main.ts
    LoggerModule.forRoot(LoggerModule, {}),
    ConsoleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
