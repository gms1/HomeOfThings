# jsonpointerx Package

> **Last Updated**: 2026-03-29
> **Location**: `packages/js/jsonpointerx/`
> **Type**: Foundation Package (Standalone)

## Overview

A fast JSON Pointer (RFC 6901) implementation for JavaScript/TypeScript.

## Purpose

Provides utilities for:

- Parsing JSON Pointer strings
- Getting/setting values at pointer locations
- Manipulating JSON documents via pointers

## Key Files

| File                           | Purpose             |
| ------------------------------ | ------------------- |
| `src/lib/jsonpointerx.ts`      | Main implementation |
| `src/lib/jsonpointerx.spec.ts` | Test suite          |
| `src/index.ts`                 | Public exports      |

## API Reference

### Main Class

```typescript
class JsonPointer {
  // Parse pointer string
  static parse(pointer: string): JsonPointer;

  // Get value at pointer location
  get(document: unknown): unknown;

  // Set value at pointer location
  set(document: unknown, value: unknown): void;

  // Check if pointer exists
  has(document: unknown): boolean;
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
npx nx run jsonpointerx:build

# Test
npx nx run jsonpointerx:test

# Test with coverage
npx nx run jsonpointerx:test --coverage
```

## Usage Example

```typescript
import { JsonPointer } from 'jsonpointerx';

const doc = { foo: { bar: 'baz' } };

// Get value
const value = JsonPointer.parse('/foo/bar').get(doc);
// value === 'baz'

// Set value
JsonPointer.parse('/foo/bar').set(doc, 'qux');
// doc === { foo: { bar: 'qux' } }
```

## Package Metadata

| Property   | Value             |
| ---------- | ----------------- |
| Name       | `jsonpointerx`    |
| Scope      | None (public)     |
| License    | MIT               |
| Main Entry | `dist/index.js`   |
| Types      | `dist/index.d.ts` |

## Notes

- Zero external dependencies
- Compatible with browser and Node.js
- Follows RFC6901 specification
- High performance implementation

## Related Files

- [`README.md`](../../../packages/js/jsonpointerx/README.md) - Package documentation
- [`CHANGELOG.md`](../../../packages/js/jsonpointerx/CHANGELOG.md) - Version history
- [`project.json`](../../../packages/js/jsonpointerx/project.json) - Nx configuration
