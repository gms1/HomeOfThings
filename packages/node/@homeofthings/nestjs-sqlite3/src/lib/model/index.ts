/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { GenericDictionary } from '@homeofthings/node-utils';
import { SqlConnectionPool, SqlDatabase } from 'sqlite3orm';

import { ConnectionManager, Repository } from '../..';
import { EntityManager } from '../service/entity-manager';
import { Sqlite3ConnectionOptions } from './sqlite3.options';

export * from './sqlite3.constants';
export * from './sqlite3.options';

export type Sqlite3ConnectionsOptions = GenericDictionary<Sqlite3ConnectionOptions>;

export type Sqlite3ConnectionPools = GenericDictionary<SqlConnectionPool>;

export type Sqlite3Connections = GenericDictionary<SqlDatabase | undefined>;

export type Sqlite3EntityManagers = GenericDictionary<EntityManager>;

export interface RepositoryType<T = Repository<any>> extends Function {
  new(connectionManager: ConnectionManager, connectionName: string): T;
}
