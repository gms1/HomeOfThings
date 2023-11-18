import { ConfigModule } from '@homeofthings/nestjs-config';
import { LoggerModule } from '@homeofthings/nestjs-logger';
import { Module } from '@nestjs/common';
import * as path from 'path';
import { ServerModule } from '../../../server/server.module';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigModule, {
      configDirectory: path.resolve(__dirname, 'config'),
      environment: 'test',
    }),
    LoggerModule.forRoot(LoggerModule, {}),
    ServerModule,
  ],
  controllers: [],
  providers: [],
})
export class TestAppModule {}
