import { Type } from '@homeofthings/nestjs-utils';
import { Logger } from '@nestjs/common';
import { METADATA_MODEL_KEY } from 'sqlite3orm';
import { ConnectionManager } from './connection-manager';
import { Repository } from './repository';

export class EntityManager {
  private readonly logger = new Logger('EntityManager');

  constructor(private _connectionManager: ConnectionManager, private _connectionName: string | undefined) {}

  getRepository(entity: Type): Promise<Repository<Type>> {
    const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, entity.prototype);
    if (!metaModel) {
      const err = new Error(`no table-definition defined on prototype of ${entity.name}'`);
      this.logger.error(err.message, err.stack);
      return Promise.reject(err);
    }
    return Promise.resolve(new Repository(entity, this._connectionManager, this._connectionName));
  }

  static getEntityTarget(entity: Type): string | undefined {
    const metaModel = Reflect.getMetadata(METADATA_MODEL_KEY, entity.prototype);
    return metaModel?.table.quotedName;
  }
}
