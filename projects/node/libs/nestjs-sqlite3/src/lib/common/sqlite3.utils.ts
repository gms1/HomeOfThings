import { SQLITE3_CONNECTION_POOL_TOKEN_PREFIX, SQLITE3_DEFAULT_CONNECTION_NAME, SQLITE3_ENTITY_MANAGER_TOKEN_PREFIX } from '../model';

/**
 * Return a connection pool injection token for a given connection name
 * @param {string} [connection='default'] This optional parameter
 */
export function getConnectionPoolInjectionToken(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_CONNECTION_POOL_TOKEN_PREFIX}${connectionName}`;
}

/**
 * Return an entity manager injection token for a given connection name
 * @param {string} [connection='default'] This optional parameter
 */
export function getEntityManagerInjectionToken(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_ENTITY_MANAGER_TOKEN_PREFIX}${connectionName}`;
}

/**
 * Return a repository injection token for a given connection name
 * @param {string} [connection='default'] This optional parameter
 */
export function getRepositoryInjectionToken(entityName: string, connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_ENTITY_MANAGER_TOKEN_PREFIX}${connectionName}.${entityName}`;
}
