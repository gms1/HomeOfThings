import {
  SQLITE3_CONNECTION_POOL_TOKEN_PREFIX,
  SQLITE3_CUSTOM_REPOSITORY_TOKEN_PREFIX,
  SQLITE3_DEFAULT_CONNECTION_NAME,
  SQLITE3_ENTITY_MANAGER_TOKEN_PREFIX,
  SQLITE3_REPOSITORY_TOKEN_PREFIX,
} from '../model';

/**
 * Return a connection pool injection token for a given connection name
 * @param connectionName - [connection='default'] The connection name
 */
export function getConnectionPoolInjectionToken(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_CONNECTION_POOL_TOKEN_PREFIX}${connectionName}`;
}

/**
 * Return an entity manager injection token for a given connection name
 * @param connectionName - [connection='default'] The connection name
 */
export function getEntityManagerInjectionToken(connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_ENTITY_MANAGER_TOKEN_PREFIX}${connectionName}`;
}

/**
 * Return a repository injection token for a given entity and connection name
 * @param entityName - The entity name
 * @param connectionName - [connection='default'] The connection name
 */
export function getRepositoryInjectionToken(entityName: string, connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_REPOSITORY_TOKEN_PREFIX}${connectionName}.${entityName}`;
}

/**
 * Return a custom repository injection token for a given repository and connection name
 * @param repositoryName - The repository name
 * @param connectionName - [connection='default'] The connection name
 */
export function getCustomRepositoryInjectionToken(repositoryName: string, connectionName: string = SQLITE3_DEFAULT_CONNECTION_NAME): string {
  return `${SQLITE3_CUSTOM_REPOSITORY_TOKEN_PREFIX}${connectionName}.${repositoryName}`;
}
