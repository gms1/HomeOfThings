import { Global, Module } from '@nestjs/common';
import { Sqlite3ModuleOptions, SQLITE3_MODULE_OPTIONS_TOKEN } from './model';
import { Sqlite3Service } from './sqlite3.service';
import { createDynamicRootModule } from '@homeofthings/nestjs-utils';

@Global()
@Module({
  providers: [Sqlite3Service],
  exports: [Sqlite3Service],
})
export class Sqlite3Module extends createDynamicRootModule<Sqlite3Module, Sqlite3ModuleOptions>(SQLITE3_MODULE_OPTIONS_TOKEN) {}
