[![npm version](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3.svg)](https://badge.fury.io/js/%40homeofthings%2Fnestjs-sqlite3)
[![Build Workflow](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml/badge.svg?branch=master)](https://github.com/gms1/HomeOfThings/actions/workflows/build.yml)
[![Coverage Status](https://codecov.io/gh/gms1/HomeOfThings/branch/master/graph/badge.svg?flag=nestjs-sqlite3)](https://app.codecov.io/gh/gms1/HomeOfThings/tree/master/packages%2Fnode%2F%40homeofthings%2Fnestjs-sqlite3)
[![DeepScan grade](https://deepscan.io/api/teams/439/projects/987/branches/1954/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=439&pid=987&bid=1954)
[![Known Vulnerabilities](https://snyk.io/test/github/gms1/HomeOfThings/badge.svg)](https://snyk.io/test/github/gms1/HomeOfThings)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![License](https://img.shields.io/npm/l/@homeofthings/nestjs-sqlite3.svg?style=flat-square)](https://github.com/gms1/HomeOfThings/blob/master/packages/node/@homeofthings/nestjs-sqlite3/LICENSE)

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
    Sqlite3Module.register(Sqlite3Module, { file: SQL_MEMORY_DB_SHARED }),
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
      useFactory: (): Promise<Sqlite3ConnectionOptions> =>
        Promise.resolve({
          // provide your options
        }),
      inject: [], // optional inject params for useFactory method
    }),
  ],
})
export class AppModule {}
```

### inject connection manager

```Typescript
@Injectable()
export class MyService {
  constructor(connectionManager: ConnectionManager) {}
}
```

### get connection

```Typescript
const connection = await this.connectionManager.getConnection(connectionName);
```

This is using asynchronous context tracking to get the same database connection from the pool throughout the lifetime of a web request or any other asynchronous duration
You can create a new context by calling `ConnectionManager.createConnectionContext()` and close it by calling `ConnectionManager.closeConnectionContext()`.
For web requests this is automatically accomblished by the provided `Sqlite3Interceptor`.

If you need a connection which works independend from the asynchronous connection context (e.g for backup, schema creation/upgrade, ...), you can get it from the pool:

```Typescript
const connection = await this.connectionManager.getConnectionPool(connectionName).get();
```

> NOTE: all repositories as well as the entity-manager require an asynchronous connection context to be created

### inject connection pool

```Typescript
@Injectable()
export class MyService {
  constructor(@InjectConnectionPool() sqlConnectionPool: SqlConnectionPool) {}
}
```

optional you can provide `connectionName` as argument for `@InjectConnectionPool`

### mapping

please see (https://github.com/gms1/node-sqlite3-orm#mapping-intruduction)

### inject entity manager

```Typescript
@Injectable()
export class MyService {
  constructor(@InjectEntityManager() entityManager: EntityManager) {}
}
```

optional you can provide `connectionName` as argument for `@InjectEntityManager`

### inject standard repository

register repository by providing entity class to the `Sqlite3Module.forFeature` method

```Typescript
@Module({
  imports: [
    Sqlite3Module.forFeature([User]),
  ],
})
export class AppModule {}
```

thereafter you can inject the standard repository using:

```Typescript
@Injectable()
export class MyService {
  constructor(@InjectRepository(User) repository: Repository<User>) {}
}
```

optional you can provide `connectionName` as second argument for `Sqlite3Module.forFeature`

### inject custom repository

define a custom repository:

```Typescript
export class UserRepository extends Repository<User> {
  constructor(connectionManager: ConnectionManager, connectionName: string) {
    super(User, connectionManager, connectionName);
  }
}
```

register the custom Repository using the `Sqlite3Module.forFeature` method:

```Typescript
@Module({
  imports: [
    Sqlite3Module.forFeature([UserRepository]),
  ],
})
export class AppModule {}
```

inject the custom repository using `InjectCustomRepository` decorator

```Typescript
@Injectable()
export class MyService {
  constructor(@InjectCustomRepository(UserRepository) repository: UserRepository) {}
}
```

### define entities

for convenience, similar decorators are supported as by typeorm

```Typescript
@Entity({ name: 'USERS', autoIncrement: true })
class User {
  @PrimaryKeyColumn({ name: 'user_id', dbtype: 'INTEGER NOT NULL' })
  public id?: number;

  @Column({ name: 'user_email', dbtype: 'TEXT NOT NULL' })
  @Index('idx_users_email', true)
  public email: string;

  @Column({ name: 'user_firstname', dbtype: 'TEXT NOT NULL' })
  public firstName: string;

  @Column({ name: 'user_lastname', dbtype: 'TEXT NOT NULL' })
  public lastName: string;

  @Column()
  public password: string;
}
```

relations can be defined by using the `ForeignKey` decorator

### type safe query syntax

please see (https://github.com/gms1/node-sqlite3-orm#typesafe-query-syntax)

### create schema manually

please see (https://github.com/gms1/node-sqlite3-orm#schema-creation)

### ceeate/upgrade schema automatically

```Typescript
const connection = await this.connectionManager.getConnection(connectionName);
const autoUpgrader = new AutoUpgrader(connection);

// run autoupgrade for all registered tables
autoUpgrader.upgradeAllTables();

// run autoupgrade for all tables referenced by a connection:
autoUpgrader.upgradeTables(ConnectionManager.getTables(connectionName));
```

> NOTE: if you are using a single database, you can call `upgradeAllTables`, otherwise you will need to specify the tables for the specific database that you want to upgrade.
> All tables referenced by a `forFeature` call for a specific database can be retrieved by calling `ConnectionManager.getTables`

### online backup

to run the backup in one step you can call:

```Typescript
const connection = await this.connectionManager.getConnection(connectionName);
const backup = await connection.backup('backup.db');
await backup.step(-1);
backup.finish();
```

## tracing

**sqlite3orm** uses the `debug` module, so you can turn on the logging by setting the 'DEBUG' environment to "sqlite3orm:\*"

## RELEASE NOTES

[CHANGELOG](./CHANGELOG.md)
