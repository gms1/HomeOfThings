/* eslint-disable @typescript-eslint/naming-convention */
import { Type } from '@homeofthings/nestjs-utils';
import { Inject } from '@nestjs/common';
import { SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';
import { getConnectionPoolInjectionToken, getEntityManagerInjectionToken, getRepositoryInjectionToken } from './sqlite3.utils';

export const InjectConnectionPool = (connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getConnectionPoolInjectionToken(connection));

export const InjectEntityManager = (connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getEntityManagerInjectionToken(connection));

export const InjectRepository = (entity: Type, connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getRepositoryInjectionToken(entity.name, connection));
