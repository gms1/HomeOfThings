import { GenericDictionary } from '@homeofthings/nestjs-utils';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SqlConnectionPool } from 'sqlite3orm';
import { Sqlite3ConnectionOptions, Sqlite3ModuleOptions, SQLITE3_DEFAULT_CONNECTION_NAME, SQLITE3_MODULE_OPTIONS_TOKEN } from '../model';

interface ConnectionRef {
  option: Sqlite3ConnectionOptions;
  pool?: SqlConnectionPool;
}

@Injectable()
export class ConnectionManagerService {
  private readonly logger = new Logger('ConnectionManagerService');

  private _connections: GenericDictionary<ConnectionRef> = {};
  constructor(@Inject(SQLITE3_MODULE_OPTIONS_TOKEN) private _options: Sqlite3ModuleOptions) {
    this._init();
  }

  private _init(): void {
    const options = Array.isArray(this._options) ? [...this._options] : [this._options];
    options.forEach((option) => {
      const name = option.name || SQLITE3_DEFAULT_CONNECTION_NAME;
      if (this._connections[name]) {
        this.logger.warn(`multiple definitions for connection named '${name}'`);
      }
      this._connections[name] = { option };
    });
  }
}
