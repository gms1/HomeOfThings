# @homeofthings/nestjs-utils Package

> **Location**: `packages/node/@homeofthings/nestjs-utils/`
> **Type**: NestJS Integration Package

## Overview

Common utilities for NestJS modules, primarily focused on creating dynamic root modules that support both synchronous and asynchronous configuration.

## Purpose

Provides utilities for:

- Creating dynamic NestJS modules with forRoot/forRootAsync patterns
- Managing module options and configuration
- Shared utilities used by other @homeofthings NestJS packages

## Key Files

| File                                          | Purpose                           |
| --------------------------------------------- | --------------------------------- |
| `src/lib/dynamic-root/dynamic-root.module.ts` | Dynamic module creation utilities |
| `src/lib/model/module.options.ts`             | Module options interfaces         |
| `src/lib/model/common-types.ts`               | Shared type definitions           |
| `src/index.ts`                                | Public exports                    |

## API Reference

### DynamicRootModule

```typescript
interface DynamicRootModule {
  // Create synchronous module
  forRoot<T>(options: T): DynamicModule;

  // Create asynchronous module
  forRootAsync<T>(options: AsyncOptions<T>): DynamicModule;
}
```

### Module Options Pattern

```typescript
interface ModuleOptions {
  // Synchronous options
  forRoot(options: ModuleOptions): DynamicModule;

  // Asynchronous options
  forRootAsync(options: ModuleAsyncOptions): DynamicModule;
}

interface ModuleAsyncOptions {
  useFactory: (...args: any[]) => Promise<ModuleOptions> | ModuleOptions;
  inject?: any[];
  imports?: Module[];
}
```

## Dependencies

### External Dependencies

| Package          | Purpose                 |
| ---------------- | ----------------------- |
| `@nestjs/core`   | NestJS core module      |
| `@nestjs/common` | NestJS common utilities |

### Internal Dependencies

| Package                    | Purpose           |
| -------------------------- | ----------------- |
| `@homeofthings/node-utils` | Node.js utilities |

### Peer Dependencies

| Package          | Purpose       |
| ---------------- | ------------- |
| `@nestjs/core`   | NestJS core   |
| `@nestjs/common` | NestJS common |

## Build & Test

```bash
# Build
npx nx run nestjs-utils:build

# Test
npx nx run nestjs-utils:test

# Test with coverage
npx nx run nestjs-utils:test --coverage
```

## Usage Example

### Creating a Dynamic Module

```typescript
import { DynamicRootModule } from '@homeofthings/nestjs-utils';

@Module({})
export class MyModule {
  static forRoot(options: MyModuleOptions): DynamicModule {
    return DynamicRootModule.forRoot(MyModule, options, {
      providers: [MyService],
      exports: [MyService],
    });
  }

  static forRootAsync(options: MyModuleAsyncOptions): DynamicModule {
    return DynamicRootModule.forRootAsync(MyModule, options, {
      providers: [MyService],
      exports: [MyService],
    });
  }
}
```

### Using the Module

```typescript
// Synchronous
@Module({
  imports: [MyModule.forRoot({ option1: 'value1' })],
})
export class AppModule {}

// Asynchronous
@Module({
  imports: [
    MyModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        option1: config.get('MY_OPTION'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Package Metadata

| Property   | Value                        |
| ---------- | ---------------------------- |
| Name       | `@homeofthings/nestjs-utils` |
| Scope      | @homeofthings                |
| License    | MIT                          |
| Engine     | `node >= 24.9.0`             |
| Main Entry | `dist/index.js`              |
| Types      | `dist/index.d.ts`            |

> Version numbers are not listed here; see `package.json` for current versions.

## Notes

- Foundation package for other @homeofthings NestJS modules
- Supports both sync and async module configuration
- Follows NestJS module patterns
- Used by nestjs-config, nestjs-logger, and nestjs-sqlite3

## Related Files

- [`README.md`](packages/node/@homeofthings/nestjs-utils/README.md) - Package documentation
- [`CHANGELOG.md`](packages/node/@homeofthings/nestjs-utils/CHANGELOG.md) - Version history
- [`project.json`](packages/node/@homeofthings/nestjs-utils/project.json) - Nx configuration
