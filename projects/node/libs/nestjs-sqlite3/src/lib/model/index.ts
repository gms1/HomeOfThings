import { GenericDictionary } from '@homeofthings/nestjs-utils';
import { SqlConnectionPool, SqlDatabase } from 'sqlite3orm';
import { EntityManager } from '../services/entity-manager';
import { Sqlite3ConnectionOptions } from './sqlite3.options';

export * from './sqlite3.constants';
export * from './sqlite3.options';

export type Sqlite3ConnectionsOptions = GenericDictionary<Sqlite3ConnectionOptions>;

export type Sqlite3ConnectionPools = GenericDictionary<SqlConnectionPool>;

export type Sqlite3Connections = GenericDictionary<SqlDatabase | undefined>;

export type Sqlite3EntityManagers = GenericDictionary<EntityManager>;
