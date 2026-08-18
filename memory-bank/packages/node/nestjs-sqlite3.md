# @homeofthings/nestjs-sqlite3 Package

> **Location**: `packages/node/@homeofthings/nestjs-sqlite3/`
> **Type**: NestJS Integration Package

## Overview

A SQLite3 module for NestJS based on [sqlite3orm](../sqlite3orm.md).

## Purpose

Provides utilities for:

- SQLite database integration in NestJS applications
- Connection pooling management
- Dependency injection for database connections
- Integration with NestJS module system

## Key Files

| File                         | Purpose            |
| ---------------------------- | ------------------ |
| `src/lib/sqlite3.module.ts`  | Main NestJS module |
| `src/lib/sqlite3.service.ts` | Database service   |
| `src/lib/model/`             | Type definitions   |
| `src/index.ts`               | Public exports     |

## API Reference

### Sqlite3Module

```typescript
@Module({})
export class Sqlite3Module {
  // Synchronous configuration
  static forRoot(options: Sqlite3ModuleOptions): DynamicModule;

  // Asynchronous configuration
  static forRootAsync(options: Sqlite3ModuleAsyncOptions): DynamicModule;
}
```

### Sqlite3Service

```typescript
@Injectable()
class Sqlite3Service {
  // Get database connection
  getDatabase(): SqlDatabase;

  // Get connection pool
  getPool(): SqlConnectionPool;

  // Execute query
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  // Execute statement
  run(sql: string, params?: unknown[]): Promise<void>;
}
```

### Module Options

```typescript
interface Sqlite3ModuleOptions {
  // Database filename
  filename: string;

  // Pool size (default: 5)
  poolSize?: number;

  // Enable WAL mode
  walMode?: boolean;

  // Connection options
  options?: SqlDatabaseOptions;
}
```

## Dependencies

### External Dependencies

| Package            | Purpose                 |
| ------------------ | ----------------------- |
| `@nestjs/core`     | NestJS core module      |
| `@nestjs/common`   | NestJS common utilities |
| `reflect-metadata` | Metadata reflection     |

### Internal Dependencies

| Package                      | Purpose                  |
| ---------------------------- | ------------------------ |
| `@homeofthings/nestjs-utils` | Dynamic module utilities |
| `sqlite3orm`                 | SQLite ORM               |
| `@homeofthings/node-utils`   | Node.js utilities        |

### Peer Dependencies

| Package          | Purpose             |
| ---------------- | ------------------- |
| `@nestjs/core`   | NestJS core         |
| `@nestjs/common` | NestJS common       |
| `rxjs`           | Reactive Extensions |

## Build & Test

```bash
# Build
npx nx run nestjs-sqlite3:build

# Test
npx nx run nestjs-sqlite3:test

# Test with coverage
npx nx run nestjs-sqlite3:test --coverage
```

## Usage Example

### Module Registration

```typescript
import { Sqlite3Module } from '@homeofthings/nestjs-sqlite3';

@Module({
  imports: [
    Sqlite3Module.forRoot({
      filename: 'mydb.db',
      poolSize: 5,
      walMode: true,
    }),
  ],
})
export class AppModule {}
```

### Using Sqlite3Service

```typescript
import { Sqlite3Service } from '@homeofthings/nestjs-sqlite3';

@Injectable()
export class UserService {
  constructor(private readonly sqlite: Sqlite3Service) {}

  async getUsers(): Promise<User[]> {
    return this.sqlite.query<User>('SELECT * FROM users');
  }

  async createUser(user: User): Promise<void> {
    await this.sqlite.run('INSERT INTO users (name, email) VALUES (?, ?)', [user.name, user.email]);
  }
}
```

### Async Configuration

```typescript
import { Sqlite3Module } from '@homeofthings/nestjs-sqlite3';

@Module({
  imports: [
    Sqlite3Module.forRootAsync({
      useFactory: (config: ConfigService) => ({
        filename: config.get('DATABASE_URL'),
        poolSize: config.get('DB_POOL_SIZE', 5),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### Using with DAO Pattern

```typescript
import { Sqlite3Service } from '@homeofthings/nestjs-sqlite3';
import { BaseDAO } from 'sqlite3orm';

@Injectable()
export class UserDAO extends BaseDAO<User> {
  constructor(sqlite: Sqlite3Service) {
    super(User, sqlite.getDatabase());
  }
}
```

## Package Metadata

| Property   | Value                          |
| ---------- | ------------------------------ |
| Name       | `@homeofthings/nestjs-sqlite3` |
| Scope      | @homeofthings                  |
| License    | MIT                            |
| Engine     | `node >= 24.9.0`               |
| Main Entry | `dist/index.js`                |
| Types      | `dist/index.d.ts`              |

> Version numbers are not listed here; see `package.json` for current versions.

## Notes

- Wraps sqlite3orm for NestJS integration
- Supports connection pooling
- Integrates with NestJS dependency injection
- Works with BaseDAO from sqlite3orm
- Supports both in-memory and file-based databases

## Related Files

- [`README.md`](../../../../packages/node/@homeofthings/nestjs-sqlite3/README.md) - Package documentation
- [`CHANGELOG.md`](../../../../packages/node/@homeofthings/nestjs-sqlite3/CHANGELOG.md) - Version history
- [`project.json`](../../../../packages/node/@homeofthings/nestjs-sqlite3/project.json) - Nx configuration
