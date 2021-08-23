import { AsyncModuleOptions } from '@homeofthings/nestjs-utils';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { Sqlite3ModuleOptions } from './model';
import { Sqlite3CoreModule } from './sqlite3-core.module';

@Global()
@Module({})
export class Sqlite3Module {
  static forRoot(moduleOptions: Sqlite3ModuleOptions): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.forRoot(Sqlite3CoreModule, moduleOptions)],
    };
  }

  static forRootAsync(asyncModuleOptions: AsyncModuleOptions<Sqlite3ModuleOptions>): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.forRootAsync(Sqlite3CoreModule, asyncModuleOptions)],
    };
  }
}
