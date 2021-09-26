import { ConfigModule, ConfigService } from '@homeofthings/nestjs-config';
import { LoggerModule } from '@homeofthings/nestjs-logger';
import { Sqlite3Module } from '@homeofthings/nestjs-sqlite3';
import { Global, Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import express from 'express';
import { AuthenticationModule } from '../authentication/authentication.module';
import { DEFAULT_LIMIT_JSON_BODY, DEFAULT_MAIN_DB_FILE } from './model/server.constants';
import { UsersModule } from '../user/user.module';
import { HOT_MAIN_DB } from '../model';

@Global()
@Module({
  imports: [
    ConfigModule.forChild(),
    LoggerModule.forChild(),
    Sqlite3Module.registerAsync({
      name: HOT_MAIN_DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => Promise.resolve({ file: config.getString('server.database.file', DEFAULT_MAIN_DB_FILE) }),
    }),
    UsersModule,
    AuthenticationModule.forRootAsync(AuthenticationModule, {
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secretConfig = config.getOptionalString('server.session.secret');
        return {
          bcryptRounds: config.getOptionalNumber('server.bcrypt.rounds'),
          session: {
            secret: secretConfig ? secretConfig.split(',') : undefined,
            name: config.getOptionalString('server.session.name'),
            maxAge: config.getOptionalNumber('server.session.maxAge'),
            domain: config.getOptionalString('server.session.domain'),
            path: config.getOptionalString('server.session.path'),
          },
        };
      },
    }),
  ],
  providers: [],
})
export class ServerModule implements NestModule {
  private readonly logger = new Logger(ServerModule.name);

  constructor(private config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      express.json({
        limit: this.config.getString('server.limits.jsonBody', DEFAULT_LIMIT_JSON_BODY),
      }),
    );
    consumer.apply(express.urlencoded({ extended: true }));
  }
}
