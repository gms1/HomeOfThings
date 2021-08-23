import { Global, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Sqlite3ModuleOptions, SQLITE3_MODULE_OPTIONS_TOKEN } from './model';
import { ConnectionManagerService } from './services/connection-manager.service';
import { createDynamicRootModule } from '@homeofthings/nestjs-utils';

@Global()
@Module({
  providers: [ConnectionManagerService],
  exports: [ConnectionManagerService],
})
export class Sqlite3CoreModule extends createDynamicRootModule<Sqlite3CoreModule, Sqlite3ModuleOptions>(SQLITE3_MODULE_OPTIONS_TOKEN) implements OnApplicationShutdown {
  private readonly logger = new Logger('Sqlite3CoreModule');

  constructor(private readonly moduleRef: ModuleRef) {
    super();
    this.logger.debug('instantiated');
  }

  onApplicationShutdown(_signal?: string) {
    this.logger.debug('shutdown');
    Sqlite3CoreModule.isRegistered = false;
  }
}
