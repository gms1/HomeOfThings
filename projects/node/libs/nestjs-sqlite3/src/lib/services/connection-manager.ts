import { AsyncContext } from '@homeofthings/nestjs-utils';
import { Injectable, Logger } from '@nestjs/common';
import { SqlConnectionPool, SqlDatabase } from 'sqlite3orm';
import { Sqlite3ConnectionOptions, Sqlite3ConnectionPools, Sqlite3Connections, Sqlite3EntityManagers, SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';
import { EntityManager } from './entity-manager';

@Injectable()
export class ConnectionManager {
  private static _instance: ConnectionManager;

  private readonly logger = new Logger('ConnectionManager');
  private readonly _connectionPools: Sqlite3ConnectionPools = {};
  private readonly _entityManagers: Sqlite3EntityManagers = {};
  private readonly _context = new AsyncContext<Sqlite3Connections>();
  private _warnOnConnectionOnRootContext = true;

  constructor() {
    if (ConnectionManager._instance) {
      throw new Error(`an instance of ConnectionManager is already initialized`);
    }
  }

  openConnectionPool(connectionName: string | undefined, connectionOptions: Sqlite3ConnectionOptions): Promise<SqlConnectionPool> {
    const name = connectionName || SQLITE3_DEFAULT_CONNECTION_NAME;
    if (this._connectionPools[name]) {
      const err = new Error(`connection '${name}' already defined`);
      this.logger.error(err.message, err.stack);
      return Promise.reject(err);
    }
    this._connectionPools[name] = new SqlConnectionPool(name);
    if (!connectionOptions.file) {
      const err = new Error(`failed to open '${name}' connection which has no file property defined`);
      this.logger.error(err.message, err.stack);
      return Promise.reject(err);
    }
    const pool = this._connectionPools[name];
    return pool
      .open(connectionOptions.file, connectionOptions.mode, connectionOptions.poolMin, connectionOptions.poolMax, connectionOptions.dbSettings)
      .then(() => pool)
      .catch((err: Error) => {
        this.logger.error(`failed to open '${name}' connection: ${err.message}`, err.stack);
        return Promise.reject(err);
      });
  }

  /*
   * called from Sqlite3CoreModule.onApplicationShutdown()
   */
  closeAllConnectionPools(): Promise<void> {
    const promises: Promise<void>[] = [];
    Object.keys(this._connectionPools).forEach((name) => {
      promises.push(this._connectionPools[name].close());
      delete this._connectionPools[name];
    });
    return Promise.allSettled(promises).then(() => Promise.resolve());
  }

  getEntityManager(connectionName: string | undefined): Promise<EntityManager> {
    const name = connectionName || SQLITE3_DEFAULT_CONNECTION_NAME;
    if (this._entityManagers[name]) {
      return Promise.resolve(this._entityManagers[name]);
    }
    this._entityManagers[name] = new EntityManager(this, name);
    return Promise.resolve(this._entityManagers[name]);
  }

  openConnectionsContext() {
    const connections = this._context.get();
    this._context.set({});
    if (!connections) {
      return;
    }
    const names = Object.keys(connections)
      .filter((name) => connections[name])
      .join(',');
    if (names && this._warnOnConnectionOnRootContext) {
      this.logger.warn(`detected open connections on new connection context: ${names}`);
      this.logger.warn(`please avoid opening connections on root context`);
      this._warnOnConnectionOnRootContext = false;
    }
  }

  closeConnectionsContext(_succeeded: boolean): Promise<void> {
    const connections = this._context.get();
    this._context.set({});

    const promises: Promise<void>[] = [];
    Object.keys(connections)
      .filter((name) => connections[name])
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      .forEach((name) => promises.push(connections[name]!.close()));
    return Promise.allSettled(promises).then(() => Promise.resolve());
  }

  getConnectionInContext(name: string): Promise<SqlDatabase> {
    const connections = this._context.get();
    if (connections[name]) {
      return Promise.resolve(connections[name] as SqlDatabase);
    }
    if (this._connectionPools[name]) {
      return this._connectionPools[name].get();
    }
    const err = new Error(`connection '${name}' not open`);
    this.logger.error(err.message);
    return Promise.reject(err);
  }

  static getInstance(): ConnectionManager {
    if (!this._instance) {
      this.initialize();
    }
    return this._instance;
  }

  static initialize() {
    this._instance = new ConnectionManager();
  }
}
