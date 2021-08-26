import { DynamicModule, Global, Module } from '@nestjs/common';
import { Sqlite3AsyncModuleOptions, Sqlite3SyncModuleOptions } from './model';
import { Sqlite3CoreModule } from './sqlite3-core.module';

@Global()
@Module({})
export class Sqlite3Module {
  static register(moduleOptions: Sqlite3SyncModuleOptions): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.register(Sqlite3CoreModule, moduleOptions)],
    };
  }

  static registerAsync(asyncModuleOptions: Sqlite3AsyncModuleOptions): DynamicModule {
    return {
      module: Sqlite3Module,
      imports: [Sqlite3CoreModule.registerAsync(Sqlite3CoreModule, asyncModuleOptions)],
    };
  }
  /*
  static forFeature(entities: any[] = [], connection?: string): DynamicModule {
    const connectionPoolToken = getConnectionPoolToken(connection);
    // const providers = createTypeOrmProviders(entities, connection);
    // const customRepositoryEntities = getCustomRepositoryEntity(entities);
    return {
      module: Sqlite3Module,
      // providers: providers,
      // exports: providers,
    };
  }
  */
}
