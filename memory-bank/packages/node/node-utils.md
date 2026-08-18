# @homeofthings/node-utils Package

> **Last Updated**: 2026-08-18
> **Location**: `packages/node/@homeofthings/node-utils/`
> **Type**: Foundation Package
> **Engine**: `node >= 24.9.0`

## Overview

Node.js utility library providing common functionality for configuration, caching, logging, file operations, and type utilities.

## Purpose

Provides utilities for:

- Configuration management (based on [node-config](https://www.npmjs.com/package/config))
- LRU (Least Recently Used) cache implementation
- Logging utilities
- File system helpers
- Type utilities and helpers
- Async context helpers
- Child process argument quoting and stream utilities

## Key Files

| Directory/File                                      | Purpose                           |
| --------------------------------------------------- | --------------------------------- |
| `src/lib/config/config.service.ts`                  | ConfigService class               |
| `src/lib/config/config.options.ts`                  | ConfigOptions type                |
| `src/lib/config/config.service.spec.ts`             | ConfigService unit tests          |
| `src/lib/config/config.service.integration.spec.ts` | ConfigService integration tests   |
| `src/lib/lru-cache/lru-cache.ts`                    | LruCache class                    |
| `src/lib/lru-cache/lru-cache.spec.ts`               | LruCache tests                    |
| `src/lib/log/log.ts`                                | Log utilities                     |
| `src/lib/log/logger.ts`                             | Logger class                      |
| `src/lib/file/write-file-if-changed.ts`             | File write utility                |
| `src/lib/util/quote.ts`                             | Argument quoting utilities        |
| `src/lib/util/stream-strings.ts`                    | Stream string utilities           |
| `src/lib/util/sequentialize.ts`                     | Sequentialize utility             |
| `src/lib/util/wait.ts`                              | Wait/promise utilities            |
| `src/lib/util/types/`                               | Common types, mixins, type guards |
| `src/lib/async-context/`                            | Async context helpers             |
| `src/index.ts`                                      | Public exports                    |

## API Reference

### ConfigService

```typescript
class ConfigService {
  constructor(opts: ConfigOptions);
  getConfig(key: string): object | undefined;
  reloadConfig(): void;
  getString(key: string, defaultValue: string): string;
  getNumber(key: string, defaultValue: number): number;
  getBoolean(key: string, defaultValue: boolean): boolean;
  getObject(key: string, defaultValue: object): object;
  getPath(key: string, defaultValue: string): string;
  getOptionalString(key: string): string | undefined;
  getOptionalNumber(key: string): number | undefined;
  getOptionalBoolean(key: string): boolean | undefined;
  getOptionalObject(key: string): object | undefined;
  getOptionalPath(key: string): string | undefined;
}
```

### LruCache

```typescript
class LruCache<K, V> {
  constructor(maxSize: number);
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size: number;
  maxSize: number;
}
```

## Dependencies

### External Dependencies

| Package     | Purpose                          |
| ----------- | -------------------------------- |
| `config`    | Node configuration library (ESM) |
| `chalk`     | Terminal string styling (ESM)    |
| `type-fest` | TypeScript type utilities (ESM)  |
| `debug`     | Debug logging utility            |
| `tslib`     | TypeScript runtime helpers       |

### Internal Dependencies

None — This is a foundation package.

## Build & Test

```bash
# Build
npx nx run node-utils:build

# Test
npx nx run node-utils:test

# Test with coverage
npx nx run node-utils:test --coverage
```

## Usage Example

### Configuration Service

```typescript
import { ConfigService } from '@homeofthings/node-utils';

const config = new ConfigService({ configDirectory: './config' });
const dbHost = config.getString('database.host', 'localhost');
```

### LRU Cache

```typescript
import { LruCache } from '@homeofthings/node-utils';

// Create cache with max 100 items
const cache = new LruCache<string, number>(100);

// Set values
cache.set('key1', 42);
cache.set('key2', 100);

// Get values
const value = cache.get('key1'); // 42

// Check existence
if (cache.has('key2')) {
  console.log('Key exists');
}

// Delete value
cache.delete('key1');

// Clear cache
cache.clear();
```

### Cache Eviction

```typescript
const cache = new LruCache<string, string>(3);

cache.set('a', 'value-a');
cache.set('b', 'value-b');
cache.set('c', 'value-c');
cache.set('d', 'value-d'); // 'a' is evicted (least recently used)

console.log(cache.has('a')); // false
console.log(cache.has('d')); // true
```

## Package Metadata

| Property   | Value                      |
| ---------- | -------------------------- |
| Name       | `@homeofthings/node-utils` |
| Scope      | @homeofthings              |
| License    | MIT                        |
| Main Entry | `dist/index.js`            |
| Types      | `dist/index.d.ts`          |
| Engine     | `node >= 24.9.0`           |

## Testing

### Jest ESM Mode

Tests run in Jest ESM mode (`--experimental-vm-modules`). Key setup:

- **`jest.preset.js`** — Global preset with `useESM: true`, `extensionsToTreatAsEsm: ['.ts']`, `.js` extension stripping via `moduleNameMapper`, and a `moduleNameMapper` stub for the `config` package (which cannot be loaded in Jest ESM mode because its `.js` files contain ESM syntax but lack `"type": "module"`)
- **`jest.unstable_mockModule()`** — Used instead of `jest.mock()` for ESM module mocking (winston, config, etc.)
- **Config v5 public API** — Uses `import config from 'config'` (public API) instead of the former deep import `config/lib/util.js`. The `config` module is stubbed via `moduleNameMapper` because Jest ESM mode cannot load it. See ADR-001.
- **Integration tests excluded** — `testPathIgnorePatterns` excludes `config.service.integration.spec.ts` because the real `config` module cannot be loaded in Jest ESM mode

### ConfigService Unit Tests

`config.service.spec.ts` mocks `config` via `jest.unstable_mockModule('config', ...)` to test ConfigService behavior without loading the real config module.

## Notes

- Contains ESM dependencies (`config`, `chalk`, `type-fest`) requiring `node >= 24.9.0`
- Node.js only (not browser compatible)
- LRU cache with O(1) get/set operations
- ConfigService wraps the `config` npm package with type-safe accessors
- Used internally by other @homeofthings packages

## Related Files

- [`README.md`](packages/node/@homeofthings/node-utils/README.md) - Package documentation
- [`project.json`](packages/node/@homeofthings/node-utils/project.json) - Nx configuration
- [`TODO.md`](packages/node/@homeofthings/node-utils/TODO.md) - Pending tasks
