import { SqlDatabaseSettings } from 'sqlite3orm';

export interface Sqlite3ModuleOptions {
  name: string;
  /**
   * file - The database file to open
   */
  file: string;
  /**
   * [mode=SQL_OPEN_DEFAULT] - The mode for opening the database file
   * A bit flag combination of:
   *   SQL_OPEN_CREATE,
   *   SQL_OPEN_READONLY,
   *   SQL_OPEN_READWRITE
   * SQL_OPEN_DEFAULT = SQL_OPEN_CREATE | SQL_OPEN_READWRITE
   */
  mode?: number;
  /**
   * [min=1] - Minimum connections which should be opened by the connection pool
   */
  poolMin?: number;
  /*
   * [max=0] - Maximum connections which can be opened by this connection pool
   */
  poolMax?: number;
  /*
   * [dbSettings]
   */
  dbSettings?: SqlDatabaseSettings;
}
