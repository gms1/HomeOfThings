import { AsyncContext, GenericDictionary } from '@homeofthings/node-sys';
import { Injectable, Logger } from '@nestjs/common';
import { SqlConnectionPool, SqlDatabase, SQL_OPEN_DEFAULT_URI, Table } from 'sqlite3orm';

import { EntityManager } from './entity-manager';
import { Sqlite3ConnectionOptions, Sqlite3ConnectionPools, Sqlite3Connections, Sqlite3EntityManagers, SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';

@Injectable()
export class ConnectionManager {
  private static _instance: ConnectionManager;
  private static tablesPerConnection: GenericDictionary<Set<Table>>;

  private readonly logger = new Logger('ConnectionManager');
  private readonly _connectionPools: Sqlite3ConnectionPools = {};
  private readonly _entityManagers: Sqlite3EntityManagers = {};
  private _context: AsyncContext<Sqlite3Connections>;
  private _warnOnOpenConnectionsInCreateConnectionContext = true;

  constructor() {
    if (ConnectionManager._instance) {
      throw new Error(`an instance of ConnectionManager is already initialized`);
    }
    this._context = new AsyncContext<Sqlite3Connections>();
    this._context.set({});
  }

  /*
   * opens a connection pool for the given connectionName and connectionOptions
   *
   * @param connectionName - The name of the connection
   * @param connectionOptions - The options for the connection
   */
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
      .open(connectionOptions.file, connectionOptions.mode || SQL_OPEN_DEFAULT_URI, connectionOptions.poolMin, connectionOptions.poolMax, connectionOptions.dbSettings)
      .then(() => pool)
      .catch((err: Error) => {
        this.logger.error(`failed to open '${name}' connection: ${err.message}`, err.stack);
        return Promise.reject(err);
      });
  }

  /*
   * close all connection pools
   *    called from Sqlite3CoreModule.onApplicationShutdown()
   */
  closeAllConnectionPools(): Promise<void> {
    return Promise.allSettled(
      Object.keys(this._connectionPools).map((name) => {
        const connectionPool = this._connectionPools[name];
        delete this._connectionPools[name];
        return connectionPool.close();
      }),
    ).then(() => Promise.resolve());
  }

  /*
   * get a connection pool
   *
   * @param connectionName - The name of the connection
   */
  getConnectionPool(connectionName?: string): SqlConnectionPool {
    const name = connectionName || SQLITE3_DEFAULT_CONNECTION_NAME;
    if (!this._connectionPools[name]) {
      throw new Error(`connection '${name}' is not defined`);
    }
    return this._connectionPools[name];
  }

  /*
   * get entity manager for a given connection name
   *
   * @param connectionName - The name of the connection
   */
  getEntityManager(connectionName: string | undefined): Promise<EntityManager> {
    const name = connectionName || SQLITE3_DEFAULT_CONNECTION_NAME;
    if (this._entityManagers[name]) {
      return Promise.resolve(this._entityManagers[name]);
    }
    this._entityManagers[name] = new EntityManager(this, name);
    return Promise.resolve(this._entityManagers[name]);
  }

  createConnectionContext(): Promise<void> {
    const connectionDictionary = this._context.get();
    // NOTE: we do not want to inherit any connections from asynchronous context, since we would close them in child asynchronous context
    this._context.set({});
    if (!connectionDictionary) {
      return Promise.resolve();
    }
    const names = Object.keys(connectionDictionary)
      .filter((name) => connectionDictionary[name])
      .join(',');
    if (names && this._warnOnOpenConnectionsInCreateConnectionContext) {
      this.logger.warn(`detected open connections on new connection context: ${names}`);
      this._warnOnOpenConnectionsInCreateConnectionContext = false;
    }
    return Promise.resolve();
  }

  async closeConnectionContext(_commit: boolean): Promise<void> {
    const connectionDictionary = this._context.get();
    this._context.set({});

    if (!connectionDictionary) {
      return Promise.resolve();
    }

    const connections: SqlDatabase[] = Object.keys(connectionDictionary)
      .filter((name) => connectionDictionary[name])
      .map((name) => connectionDictionary[name] as SqlDatabase);

    if (_commit) {
      await Promise.allSettled(connections.map((connection) => connection.endTransaction(_commit)));
    }

    return Promise.allSettled(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      connections.map((connection) => connection.close()),
    ).then(() => Promise.resolve());
  }

  getConnection(name: string): Promise<SqlDatabase> {
    const connectionDictionary = this._context.get();
    if (!connectionDictionary) {
      const err = new Error(`connection context not initialized`);
      this.logger.error(err.message, err.stack);
      return Promise.reject(err);
    }
    if (connectionDictionary[name]) {
      return Promise.resolve(connectionDictionary[name] as SqlDatabase);
    }
    if (!this._connectionPools[name]) {
      const err = new Error(`connection '${name}' is not defined`);
      this.logger.error(err.message, err.stack);
      return Promise.reject(err);
    }
    return this._connectionPools[name].get().then((conn) => {
      connectionDictionary[name] = conn;
      return conn;
    });
  }

  /*
   * get the instance of the connection manager singleton
   *
   */
  static getInstance(): ConnectionManager {
    if (!this._instance) {
      this._initialize();
    }
    return this._instance;
  }

  private static _initialize() {
    this._instance = new ConnectionManager();
  }

  /*
   * register a table for a given connection name
   *
   * @param table - The table which should be registered
   * @param connectionName - The connection name for which this table should be registered
   */

  static registerTable(table: Table, connectionName: string) {
    if (!this.tablesPerConnection) {
      this.tablesPerConnection = {};
    }
    if (!this.tablesPerConnection[connectionName]) {
      this.tablesPerConnection[connectionName] = new Set();
    }
    this.tablesPerConnection[connectionName].add(table);
  }

  /*
   * get all tables registered for a given connection name
   *
   * @param connectionName - The connection name for which this table should be registered
   */

  static getTables(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): Table[] {
    if (!this.tablesPerConnection?.[connectionName]) {
      return [];
    }
    return Array.from(this.tablesPerConnection[connectionName]);
  }
}
