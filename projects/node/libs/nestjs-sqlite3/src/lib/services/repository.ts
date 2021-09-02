import { BaseDAO } from 'sqlite3orm';
import { SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';
import { ConnectionManager } from './connection-manager';

export class Repository<T> {
  constructor(private type: { new (): T }, private _connectionManager: ConnectionManager, private _connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME) {}

  private get _dao(): Promise<BaseDAO<T>> {
    return this._connectionManager.getConnectionInContext(this._connectionName).then((sqlDb) => new BaseDAO<T>(this.type, sqlDb));
  }

  /**
   * insert
   *
   * @param model - A model class instance
   * @returns A promise of the inserted model class instance
   */
  insert(model: T): Promise<T> {
    return this._dao.then((dao) => dao.insert(model));
  }

  /**
   * update
   *
   * @param model - A model class instance
   * @returns A promise of the updated model class instance
   */

  update(model: T): Promise<T> {
    return this._dao.then((dao) => dao.update(model));
  }

  /**
   * deleteById
   *
   * @param model - A model class instance
   * @returns A promise
   */

  deleteById(model: Partial<T>): Promise<void> {
    return this._dao.then((dao) => dao.deleteById(model));
  }
}
