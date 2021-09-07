[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3)
[![Build Status](https://api.travis-ci.com/gms1/HomeOfThings.svg?branch=master)](https://app.travis-ci.com/gms1/HomeOfThings)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-sqlite3)](https://codecov.io/gh/gms1/HomeOfThings)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-sqlite3.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/LICENSE)

# HomeOfThings - Sqlite3 for NestJs

This module allows you to map your model, written in JavaScript or TypeScript, to a database schema using SQLite Version 3.
**nestjs-sqlite3** offers connection pool, automatic upgrades and online backups as well as typesafe database queries and refactoring, using a filter syntax designed to serialize safely without any SQL injection possibility

> NOTE: Your contribution is highly welcome! Feel free to pick-up a TODO-item or add yours.

This module is based on [sqlite3orm](https://www.npmjs.com/package/sqlite3orm)
supporting [SQLCipher](https://github.com/gms1/node-sqlite3-orm/blob/master/docs/sqlcipher.md)

## installation

```bash
npm install @homeofthings/nestjs-sqlite3
```

## quick start

### import module in `AppModule` by providing connection options synchronously

```Typescript
@Module({
  imports: [
    Sqlite3Module.register(Sqlite3Module, {file: SQL_MEMORY_DB_SHARED}),
  ],
})
export class AppModule {}
```

### import module in `AppModule` by providing connection options asynchronously

```Typescript
@Module({
  imports: [
    Sqlite3Module.registerAsync(Sqlite3Module, {
      imports: [], // optional
      useFactory: (): Promise<Sqlite3ModuleOptions> => Promise.resolve({
        // provide your options
      }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

### inject connection manager

TODO:

### get connection

```Typescript
  const connection = await this._connectionManager.getConnection(connectionName);
```

is using asynchronous context tracking to get the same database connection from the pool throughout the lifetime of a web request or any other asynchronous duration
You can create a new context by calling `ConnectionManager.createConnectionContext()` and close it by calling `ConnectionManager.closeConnectionContext()`.
For web requests this is automatically accomblished by the provided `Sqlite3Interceptor`.

If you a need for a connection which works independend from the asynchronous context, you can get it from the pool:

```Typescript
  const connection = await this._connectionManager.getConnectionPool(connectionName).get();
```

### inject connection pool

TODO: using `InjectConnectionPool` decorator

### mapping

please see (https://github.com/gms1/node-sqlite3-orm#mapping-intruduction)

### inject entity manager

TODO:  using `InjectEntityManager` decorator

### inject standard repository

TODO: calling `forFeature`
TODO: using `InjectRepository` decorator

### inject custom repository

TODO: define custom repository class
TODO: calling `forFeature`
TODO: using `InjectCustomRepository` decorator

### type safe query syntax

please see (https://github.com/gms1/node-sqlite3-orm#typesafe-query-syntax)

### create schema manually

please see (https://github.com/gms1/node-sqlite3-orm#schema-creation)

### ceeate/upgrade schema automatically

TODO

```Typescript
  const connection = await this._connectionManager.getConnection(connectionName);
  const autoUpgrader = new AutoUpgrader(connection);

  // run autoupgrade for all registered tables
  autoUpgrader.upgradeAllTables();

  // run autoupgrade for all tables referenced by a connection:
  autoUpgrader.upgradeTables(ConnectionManager.getTables(connectionName));
```

> NOTE: if you are using a single database, you can call `upgradeAllTables`, otherwise you will need to specify the tables for the specific database that you want to upgrade.
All tables referenced by a `forFeature` call for a specific database can be retrieved by calling `ConnectionManager.getTables`

### online backup

TODO

```Typescript
  const connection = await this._connectionManager.getConnection(connectionName);
  const backup = await connection.backup('backup.db');
  await backup.step(-1);
  backup.finish();
```

## tracing

TODO

## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)
