import { SQLITE3_CONNECTION_POOL_TOKEN_PREFIX, SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';

/**
 * Return a connection injection token for a given connection name
 * @param {string} [connection='default'] This optional parameter
 */
export function getConnectionPoolToken(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_CONNECTION_POOL_TOKEN_PREFIX}${connectionName}Connection`;
}
