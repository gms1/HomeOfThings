# @homeofthings/nestjs-logger Package

> **Location**: `packages/node/@homeofthings/nestjs-logger/`
> **Type**: NestJS Integration Package

## Overview

A logging module for NestJS based on [winston](https://www.npmjs.com/package/winston).

## Purpose

Provides utilities for:

- Structured logging in NestJS applications
- Multiple transport support (console, file, etc.)
- Log level management
- Context-aware logging
- Integration with NestJS dependency injection

## Key Files

| File                                | Purpose               |
| ----------------------------------- | --------------------- |
| `src/lib/nest-logger.service.ts`    | Main logger service   |
| `src/lib/model/logger.options.ts`   | Configuration options |
| `src/lib/model/logger.constants.ts` | Constants and tokens  |
| `src/index.ts`                      | Public exports        |

## API Reference

### LoggerModule

```typescript
@Module({})
export class LoggerModule {
  // Synchronous configuration
  static forRoot(options: LoggerModuleOptions): DynamicModule;

  // Asynchronous configuration
  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule;
}
```

### NestLoggerService

```typescript
@Injectable()
class NestLoggerService implements LoggerService {
  // Log info message
  log(message: string, context?: string): void;

  // Log error
  error(message: string, trace?: string, context?: string): void;

  // Log warning
  warn(message: string, context?: string): void;

  // Log debug message
  debug?(message: string, context?: string): void;

  // Log verbose message
  verbose?(message: string, context?: string): void;
}
```

### Logger Options

```typescript
interface LoggerModuleOptions {
  // Log level
  level?: 'error' | 'warn' | 'info' | 'debug' | 'verbose';

  // Transports
  transports?: Transport[];

  // Format
  format?: Format;

  // Context
  context?: string;
}
```

## Dependencies

### External Dependencies

| Package          | Purpose                 |
| ---------------- | ----------------------- |
| `winston`        | Logging framework       |
| `chalk`          | Terminal color support  |
| `supports-color` | Color detection         |
| `debug`          | Debug logging           |
| `mkdirp`         | Directory creation      |
| `@nestjs/core`   | NestJS core module      |
| `@nestjs/common` | NestJS common utilities |

### Internal Dependencies

| Package                      | Purpose                  |
| ---------------------------- | ------------------------ |
| `@homeofthings/nestjs-utils` | Dynamic module utilities |

### Peer Dependencies

| Package          | Purpose       |
| ---------------- | ------------- |
| `@nestjs/core`   | NestJS core   |
| `@nestjs/common` | NestJS common |

## Build & Test

```bash
# Build
npx nx run nestjs-logger:build

# Test
npx nx run nestjs-logger:test

# Test with coverage
npx nx run nestjs-logger:test --coverage
```

## Usage Example

### Module Registration

```typescript
import { LoggerModule } from '@homeofthings/nestjs-logger';

@Module({
  imports: [
    LoggerModule.forRoot({
      level: 'info',
      transports: [new winston.transports.Console(), new winston.transports.File({ filename: 'app.log' })],
    }),
  ],
})
export class AppModule {}
```

### Using Logger

```typescript
import { NestLoggerService } from '@homeofthings/nestjs-logger';

@Injectable()
export class MyService {
  constructor(private readonly logger: NestLoggerService) {}

  someMethod() {
    this.logger.log('Processing started', MyService.name);
    this.logger.debug('Debug information', MyService.name);
    this.logger.error('Error occurred', 'stack trace', MyService.name);
  }
}
```

### Async Configuration

```typescript
import { LoggerModule } from '@homeofthings/nestjs-logger';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        level: config.get('LOG_LEVEL'),
        transports: [new winston.transports.Console()],
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Package Metadata

| Property   | Value                         |
| ---------- | ----------------------------- |
| Name       | `@homeofthings/nestjs-logger` |
| Scope      | @homeofthings                 |
| License    | MIT                           |
| Engine     | `node >= 24.9.0`              |
| Main Entry | `dist/index.js`               |
| Types      | `dist/index.d.ts`             |

> Version numbers are not listed here; see `package.json` for current versions.

### Jest ESM Mode

Tests run in Jest ESM mode (`--experimental-vm-modules`). Key setup:

- **`jest.preset.js`** — Global preset with `useESM: true`, `extensionsToTreatAsEsm: ['.ts']`, `.js` extension stripping via `moduleNameMapper`, and a `moduleNameMapper` stub for the `config` package (which cannot be loaded in Jest ESM mode because its `.js` files contain ESM syntax but lack `"type": "module"`)
- **`jest.unstable_mockModule()`** — Used instead of `jest.mock()` for ESM module mocking (winston, config, etc.)
- **Config v5 public API** — Uses `import config from 'config'` (public API). The `config` module is stubbed via `moduleNameMapper` because Jest ESM mode cannot load it. See ADR-001.

## Notes

- Based on winston for flexible logging
- Supports multiple transports (console, file, etc.)
- Integrates with NestJS LoggerService interface
- Context-aware logging for better traceability
- Configurable log levels and formats

## Related Files

- [`README.md`](../../../../packages/node/@homeofthings/nestjs-logger/README.md) - Package documentation
- [`CHANGELOG.md`](../../../../packages/node/@homeofthings/nestjs-logger/CHANGELOG.md) - Version history
- [`project.json`](../../../../packages/node/@homeofthings/nestjs-logger/project.json) - Nx configuration
- [`TODO.md`](../../../../packages/node/@homeofthings/nestjs-logger/TODO.md) - Pending tasks
