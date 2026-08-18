# @homeofthings/nestjs-config Package

> **Last Updated**: 2026-08-18
> **Location**: `packages/node/@homeofthings/nestjs-config/`
> **Type**: NestJS Integration Package
> **Engine**: `node >= 24.9.0`

## Overview

A configuration module for NestJS based on [node-config](https://www.npmjs.com/package/config).

## Purpose

Provides utilities for:

- Loading configuration from multiple sources
- Environment-specific configuration
- Type-safe configuration access
- Integration with NestJS dependency injection

## Key Files

| File                        | Purpose               |
| --------------------------- | --------------------- |
| `src/lib/config.module.ts`  | Main NestJS module    |
| `src/lib/config.service.ts` | Configuration service |
| `src/lib/model/`            | Type definitions      |
| `src/index.ts`              | Public exports        |

## API Reference

### ConfigModule

```typescript
@Module({})
export class ConfigModule {
  // Synchronous configuration
  static forRoot(options: ConfigModuleOptions): DynamicModule;

  // Asynchronous configuration
  static forRootAsync(options: ConfigModuleAsyncOptions): DynamicModule;
}
```

### ConfigService

```typescript
@Injectable()
class ConfigService {
  // Get configuration value
  get<T>(key: string): T;

  // Get configuration value with default
  get<T>(key: string, defaultValue: T): T;

  // Check if key exists
  has(key: string): boolean;
}
```

## Dependencies

### External Dependencies

| Package | Purpose                    |
| ------- | -------------------------- |
| `tslib` | TypeScript runtime helpers |

### Internal Dependencies

| Package                      | Purpose                  |
| ---------------------------- | ------------------------ |
| `@homeofthings/nestjs-utils` | Dynamic module utilities |
| `@homeofthings/node-utils`   | ConfigService base class |

### Peer Dependencies

| Package          | Purpose       |
| ---------------- | ------------- |
| `@nestjs/common` | NestJS common |

## Build & Test

```bash
# Build
npx nx run nestjs-config:build

# Test
npx nx run nestjs-config:test

# Test with coverage
npx nx run nestjs-config:test --coverage
```

## Usage Example

### Module Registration

```typescript
import { ConfigModule } from '@homeofthings/nestjs-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      // Configuration options
    }),
  ],
})
export class AppModule {}
```

### Using ConfigService

```typescript
import { ConfigService } from '@homeofthings/nestjs-config';

@Injectable()
export class MyService {
  constructor(private readonly config: ConfigService) {}

  someMethod() {
    const dbHost = this.config.get<string>('database.host');
    const dbPort = this.config.get<number>('database.port', 5432);
  }
}
```

### Configuration Files

Configuration files are placed in `config/` directory:

```
config/
├── default.yml          # Default configuration
├── development.yml      # Development overrides
├── production.yml       # Production overrides
└── custom-environment-variables.yml  # Env var mappings
```

## Package Metadata

| Property   | Value                         |
| ---------- | ----------------------------- |
| Name       | `@homeofthings/nestjs-config` |
| Scope      | @homeofthings                 |
| License    | MIT                           |
| Main Entry | `dist/index.js`               |
| Types      | `dist/index.d.ts`             |
| Engine     | `node >= 24.9.0`              |

## Testing

### Jest ESM Mode

Tests run in Jest ESM mode (`--experimental-vm-modules`). Key setup:

- **`jest.preset.js`** — Global preset with `useESM: true`, `extensionsToTreatAsEsm: ['.ts']`, `.js` extension stripping via `moduleNameMapper`, and a `moduleNameMapper` stub for the `config` package (which cannot be loaded in Jest ESM mode because its `.js` files contain ESM syntax but lack `"type": "module"`)
- **`jest.unstable_mockModule()`** — Used instead of `jest.mock()` for ESM module mocking (winston, config, etc.)
- **Config v5 public API** — Uses `import config from 'config'` (public API) instead of the former deep import `config/lib/util.js`. The `config` module is stubbed via `moduleNameMapper` because Jest ESM mode cannot load it. See ADR-001.
- **Integration tests excluded** — `testPathIgnorePatterns` excludes `config.service.integration.spec.ts` because the real `config` module cannot be loaded in Jest ESM mode

### ConfigService Unit Tests

`config.service.spec.ts` and `config.module.spec.ts` mock `config` via `jest.unstable_mockModule('config', ...)` to test without loading the real config module.

## Notes

- Based on node-config for configuration management
- Supports YAML, JSON, and JS configuration files
- Environment variable override support
- Integrates seamlessly with NestJS DI
- Requires `node >= 24.9.0` due to transitive ESM dependencies (`config`, `chalk`, `type-fest` via `node-utils`)

## Related Files

- [`README.md`](packages/node/@homeofthings/nestjs-config/README.md) - Package documentation
- [`project.json`](packages/node/@homeofthings/nestjs-config/project.json) - Nx configuration
- [`TODO.md`](packages/node/@homeofthings/nestjs-config/TODO.md) - Pending tasks
