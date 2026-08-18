# sqlite3orm Package

> **Location**: `packages/node/sqlite3orm/`
> **Type**: Foundation Package

## Overview

A comprehensive ORM for SQLite3 offering connection pooling, automatic schema upgrades, online backups, and type-safe database queries.

## Purpose

Provides utilities for:

- SQLite database connection management
- Connection pooling
- Type-safe query building
- Automatic schema migrations (AutoUpgrader)
- Online database backups
- Object-relational mapping

## Key Files

| Directory/File                      | Purpose                     |
| ----------------------------------- | --------------------------- |
| `src/lib/core/`                     | Core database functionality |
| `src/lib/core/SqlDatabase.ts`       | Main database class         |
| `src/lib/core/SqlConnectionPool.ts` | Connection pooling          |
| `src/lib/core/SqlBackup.ts`         | Online backup support       |
| `src/lib/metadata/`                 | ORM metadata decorators     |
| `src/lib/query/`                    | Query builder               |
| `src/lib/dbcatalog/`                | Database catalog utilities  |
| `src/lib/AutoUpgrader.ts`           | Schema migration system     |
| `src/lib/BaseDAO.ts`                | Base Data Access Object     |

## API Reference

### SqlDatabase

```typescript
class SqlDatabase {
  // Open database
  static open(filename: string): Promise<SqlDatabase>;

  // Execute query
  run(sql: string, params?: unknown[]): Promise<void>;

  // Query and get results
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;

  // Get single row
  get<T>(sql: string, params?: unknown[]): Promise<T | undefined>;

  // Close connection
  close(): Promise<void>;
}
```

### SqlConnectionPool

```typescript
class SqlConnectionPool {
  // Create pool
  static create(options: PoolOptions): SqlConnectionPool;

  // Get connection from pool
  acquire(): Promise<SqlDatabase>;

  // Release connection back to pool
  release(db: SqlDatabase): void;

  // Close pool
  close(): Promise<void>;
}
```

### BaseDAO

```typescript
abstract class BaseDAO<T> {
  // Insert record
  insert(entity: T): Promise<T>;

  // Update record
  update(entity: T): Promise<void>;

  // Delete record
  delete(entity: T): Promise<void>;

  // Find by primary key
  findByPk(pk: unknown): Promise<T | undefined>;

  // Query with filter
  find(filter: Filter<T>): Promise<T[]>;
}
```

### AutoUpgrader

```typescript
class AutoUpgrader {
  // Apply upgrades
  upgrade(db: SqlDatabase): Promise<void>;

  // Get current version
  getVersion(): Promise<number>;

  // Set version
  setVersion(version: number): Promise<void>;
}
```

## Dependencies

### External Dependencies

| Package                 | Purpose                    |
| ----------------------- | -------------------------- |
| `debug`                 | Debug logging              |
| `reflect-metadata`      | Metadata reflection        |
| `@homeofthings/sqlite3` | SQLite bindings            |
| `tslib`                 | TypeScript runtime helpers |

### Internal Dependencies

| Package                    | Purpose           |
| -------------------------- | ----------------- |
| `@homeofthings/node-utils` | Node.js utilities |

## Build & Test

```bash
# Build
npx nx run sqlite3orm:build

# Test
npx nx run sqlite3orm:test

# Test with coverage
npx nx run sqlite3orm:test --coverage
```

## Usage Example

### Basic Connection

```typescript
import { SqlDatabase } from 'sqlite3orm';

const db = await SqlDatabase.open(':memory:');

// Create table
await db.run(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`);

// Insert
await db.run('INSERT INTO users (name, email) VALUES (?, ?)', ['John', 'john@example.com']);

// Query
const users = await db.query<{ id: number; name: string }>('SELECT * FROM users');

await db.close();
```

### Connection Pool

```typescript
import { SqlConnectionPool } from 'sqlite3orm';

const pool = SqlConnectionPool.create({
  filename: 'mydb.db',
  poolSize: 5,
});

const db = await pool.acquire();
try {
  const users = await db.query('SELECT * FROM users');
} finally {
  pool.release(db);
}

await pool.close();
```

### ORM with Decorators

```typescript
import { BaseDAO, Field, Table } from 'sqlite3orm';

@Table({ name: 'users' })
class User {
  @Field({ primary: true, autoIncrement: true })
  id: number;

  @Field()
  name: string;

  @Field({ unique: true })
  email: string;
}

class UserDAO extends BaseDAO<User> {
  constructor() {
    super(User);
  }
}
```

## Package Metadata

| Property   | Value             |
| ---------- | ----------------- |
| Name       | `sqlite3orm`      |
| Scope      | None (public)     |
| License    | MIT               |
| Engine     | `node >= 24.9.0`  |
| Main Entry | `dist/index.js`   |
| Types      | `dist/index.d.ts` |

> Version numbers are not listed here; see `package.json` for current versions.

## Notes

- Supports both in-memory and file-based databases
- Connection pooling for concurrent access
- Type-safe query building
- Automatic schema migrations
- Online backup functionality
- SQLCipher support (see `docs/sqlcipher.md`)

## Related Files

- [`README.md`](packages/node/sqlite3orm/README.md) - Package documentation
- [`CHANGELOG.md`](packages/node/sqlite3orm/CHANGELOG.md) - Version history
- [`project.json`](packages/node/sqlite3orm/project.json) - Nx configuration
- [`docs/sqlcipher.md`](packages/node/sqlite3orm/docs/sqlcipher.md) - SQLCipher support
