import { Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Sqlite3ModuleOptions } from './model';
import { Sqlite3Module } from './sqlite3.module';
import { Sqlite3Service } from './sqlite3.service';

export enum Color {
  Red = '',
  Blue = '',
}

describe('Sqlite3Module', function() {
  @Module({
    // imports: [Sqlite3Module.forChild()],
  })
  class ChildModule {
    static sqlite3Service: Sqlite3Service;

    constructor(sqlite3Service: Sqlite3Service) {
      ChildModule.sqlite3Service = sqlite3Service;
    }
  }

  const givenOptions: Sqlite3ModuleOptions = {
    name: 'sqlite3.module.spec',
    file: 'sqlite3.module.spec',
  };

  beforeEach(() => {
    ChildModule.sqlite3Service = undefined;
  });

  it('for sync options', async function() {
    const appModule = await Test.createTestingModule({
      imports: [Sqlite3Module.forRoot(Sqlite3Module, givenOptions), ChildModule],
    }).compile();

    const sqlite3Service = appModule.get(Sqlite3Service);
    expect(sqlite3Service).toBeInstanceOf(Sqlite3Service);

    expect(ChildModule.sqlite3Service).toBe(sqlite3Service);
  });

  it('for async options', async function() {
    @Injectable()
    class Sqlite3ModuleOptionsProvider {
      getSqlite3ModuleOptions(): Promise<Sqlite3ModuleOptions> {
        return new Promise((resolve, _reject) => {
          setTimeout(resolve, 4000, givenOptions);
        });
      }
    }

    @Module({
      providers: [Sqlite3ModuleOptionsProvider],
      exports: [Sqlite3ModuleOptionsProvider],
    })
    class Sqlite3OptionsModule {}

    const appModule = await Test.createTestingModule({
      imports: [
        Sqlite3Module.forRootAsync(Sqlite3Module, {
          imports: [Sqlite3OptionsModule, ChildModule],
          useFactory: (cfg: Sqlite3ModuleOptionsProvider) => cfg.getSqlite3ModuleOptions(),
          inject: [Sqlite3ModuleOptionsProvider],
        }),
      ],
    }).compile();

    const sqlite3Service = appModule.get(Sqlite3Service);
    expect(sqlite3Service).toBeInstanceOf(Sqlite3Service);

    expect(ChildModule.sqlite3Service).toBe(sqlite3Service);
  });
});
