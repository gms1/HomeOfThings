/* eslint-disable @typescript-eslint/naming-convention */
import 'reflect-metadata';
import { Type } from '@homeofthings/nestjs-utils';
import { Inject } from '@nestjs/common';
import { field, fk, id, index, table } from 'sqlite3orm';

import { RepositoryType, SQLITE3_DEFAULT_CONNECTION_NAME } from '../model';

import { getConnectionPoolInjectionToken, getCustomRepositoryInjectionToken, getEntityManagerInjectionToken, getRepositoryInjectionToken } from './sqlite3.utils';

export const Entity = table;
export const Column = field;
export const PrimaryKeyColumn = id;
export const Index = index;
export const ForeignKey = fk;

export const InjectConnectionPool = (connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getConnectionPoolInjectionToken(connection));

export const InjectEntityManager = (connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getEntityManagerInjectionToken(connection));

export const InjectRepository = (entity: Type, connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) => Inject(getRepositoryInjectionToken(entity.name, connection));

export const InjectCustomRepository = (repository: RepositoryType, connection: string = SQLITE3_DEFAULT_CONNECTION_NAME) =>
  Inject(getCustomRepositoryInjectionToken(repository.name, connection));
