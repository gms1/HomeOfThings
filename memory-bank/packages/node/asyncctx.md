# asyncctx Package

> **Last Updated**: 2026-03-29
> **Location**: `packages/node/asyncctx/`
> **Type**: Foundation Package (Standalone)

## Overview

Asynchronous execution context handling for Node.js applications.

## Purpose

Provides utilities for:

- Managing async context in Node.js applications
- Continuation local storage (CLS)
- Request-scoped data without explicit parameter passing

## Key Files

| File                                  | Purpose                             |
| ------------------------------------- | ----------------------------------- |
| `src/lib/AsynchronousLocalStorage.ts` | Modern async context implementation |
| `src/lib/ContinuationLocalStorage.ts` | Legacy continuation support         |
| `src/lib/index.ts`                    | Public exports                      |
| `src/lib/spec/*.spec.ts`              | Test suites                         |

## API Reference

### AsynchronousLocalStorage

```typescript
class AsynchronousLocalStorage<T> {
  // Get current context
  getStore(): T | undefined;

  // Run with context
  run(store: T, callback: () => void): void;

  // Set context value
  set(store: T): void;
}
```

### ContinuationLocalStorage

```typescript
class ContinuationLocalStorage<T> {
  // Get current context
  get(): T | undefined;

  // Run with context
  run(store: T, callback: () => void): void;

  // Set context value
  set(store: T): void;
}
```

## Dependencies

### External Dependencies

| Package | Version | Purpose            |
| ------- | ------- | ------------------ |
| None    | -       | Standalone package |

### Internal Dependencies

None - This is a foundation package.

## Build & Test

```bash
# Build
npx nx run asyncctx:build

# Test
npx nx run asyncctx:test

# Test with coverage
npx nx run asyncctx:test --coverage
```

## Usage Example

```typescript
import { AsynchronousLocalStorage } from 'asyncctx';

const als = new AsynchronousLocalStorage<Map<string, string>>();

// Set context for async operation
als.run(new Map(), () => {
  als.getStore()?.set('requestId', '123');

  // Context is available in nested async calls
  someAsyncFunction();
});

function someAsyncFunction() {
  const requestId = als.getStore()?.get('requestId');
  console.log('Request ID:', requestId); // '123'
}
```

## Package Metadata

| Property   | Value             |
| ---------- | ----------------- |
| Name       | `asyncctx`        |
| Scope      | None (public)     |
| License    | MIT               |
| Main Entry | `dist/index.js`   |
| Types      | `dist/index.d.ts` |

## Notes

- Zero external dependencies
- Node.js only (not browser compatible)
- Two implementations available:
  - `AsynchronousLocalStorage` - Uses Node.js `AsyncLocalStorage` API
  - `ContinuationLocalStorage` - Uses `domain` module (legacy)

## Related Files

- [`README.md`](packages/node/asyncctx/README.md) - Package documentation
- [`CHANGELOG.md`](packages/node/asyncctx/CHANGELOG.md) - Version history
- [`project.json`](packages/node/asyncctx/project.json) - Nx configuration
