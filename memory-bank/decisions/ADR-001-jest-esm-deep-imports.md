# ADR-001: Jest ESM Mode Cannot Load the `config` Package

## Status

Accepted

## Context

The `config` package (node-config) v5 ships `.js` files that use ESM syntax (`import`/`export`) while the package's `package.json` does **not** include `"type": "module"`. This is a valid dual CJS/ESM design that works correctly at runtime:

- `lib/config.js` — Contains ESM `import` statements but is treated as CJS by Node.js (since no `"type": "module"`)
- `lib/config.mjs` — ESM entry point
- `lib/util.js` — Contains ESM `import`/`export` syntax

### The Problem

When running tests with Jest in ESM mode (`--experimental-vm-modules`), Jest uses `cjs-module-lexer` to parse `.js` files that it treats as CJS (because the package lacks `"type": "module"`). The `cjs-module-lexer` cannot handle ESM syntax (`import`/`export`) in files it considers CJS, causing it to fail with:

```text
Unexpected import statement in CJS module.
  at @:2:8
  esmSyntaxErr (node_modules/cjs-module-lexer/lexer.js:1317:24)
  Object.<anonymous> (node_modules/config/lib/config.js:4:18)
```

This affects **any** import of the `config` package in Jest ESM mode — both the deep import `config/lib/util.js` and the public API `import config from 'config'`. The issue is **NOT specific to deep imports** — it is a fundamental incompatibility between the `config` package's ESM-syntax `.js` files and Jest's ESM loader.

This is **NOT a bug in config v5**. The dual CJS/ESM format is by design. The issue is a **Jest limitation**: Jest's ESM mode treats `.js` files in packages without `"type": "module"` as CJS and uses `cjs-module-lexer` to parse them, which chokes on ESM syntax.

### Workaround

The `config` module must be stubbed via `moduleNameMapper` in `jest.preset.js` for all unit tests, and integration tests that require the real `config` module must be excluded via `testPathIgnorePatterns` since the real module cannot be loaded in Jest ESM mode.

The deep import `import { Load, Util } from 'config/lib/util.js'` has been replaced with the public API `import config from 'config'`:

1. `Util.getPath(config, key)` → inline `getPath()` helper (simple dot-path accessor)
2. `Util.toObject(value)` → inline `toObject()` helper (`JSON.parse(JSON.stringify(value))`)
3. `Load.fromEnvironment().scan().config` → `config.util.loadFileConfigs()`

This eliminates the deep import, but the public API import still requires the same `moduleNameMapper` stub workaround because Jest ESM mode cannot load any `config` module file.

## Decision

1. Use the `config` package's public API (`import config from 'config'`) instead of deep imports
2. Provide a stub module at `jest.mocks/config.js` mapped via `moduleNameMapper` (`'^config$'`) in `jest.preset.js` so that unit tests can mock `config` without loading the real module
3. Unit tests use `jest.unstable_mockModule('config', ...)` to provide custom mock behavior
4. Integration tests that need the real `config` module are excluded via `testPathIgnorePatterns` because the real module cannot be loaded in Jest ESM mode

## Consequences

### Positive

- No fragile dependency on config package internal structure (deep imports eliminated)
- Uses only documented, stable public API of the `config` package
- Unit tests pass reliably with the `moduleNameMapper` stub

### Negative

- Integration tests that need the real `config` module must still be excluded from Jest via `testPathIgnorePatterns`
- A `moduleNameMapper` stub for `config` is still required in `jest.preset.js`
- `getPath` and `toObject` are inline helpers instead of using the `config` package's implementations
- If `config` changes the behavior of `Util.getPath` or `Util.toObject`, the inline helpers won't automatically pick up those changes (though both are trivial and unlikely to change)
