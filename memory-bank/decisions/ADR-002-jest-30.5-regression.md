# ADR-002: Pin Jest at 30.4.x due to ESM regression in 30.5.0

## Status

Accepted

## Context

Jest 30.5.0 (released 2026-08-28) introduced a major change to ESM module evaluation on Node 24.9+ (PR #16391).
This change altered the module evaluation order for ESM graphs, causing a Temporal Dead Zone (TDZ) regression
with ESM-only packages that use `import` declarations with `#imports` (package `imports` map).

Specifically, `chalk@6` uses `#supports-color` and `#ansi-styles` import map entries. Under Jest 30.5.0's
new ESM evaluation strategy, `supportsColor` is accessed before its initialization in
`chalk/source/index.js`, causing:

```
ReferenceError: Cannot access 'supportsColor' before initialization
```

This error occurs in all test suites that import modules transitively depending on chalk (nestjs-config,
node-utils, nestjs-logger, sqlite3orm, node-sys, nestjs-sqlite3).

Without `--experimental-vm-modules`, Jest 30.5.0 also fails with a different error:

```
SyntaxError: await is only valid in async functions and the top level bodies of modules
```

Jest 30.4.2 with `--experimental-vm-modules` works correctly with all these ESM packages.

## Decision

Pin `jest`, `jest-environment-node`, and `jest-util` at versions < 30.5.0 in `package.json`
and add them to `.npm-upgrade.json` ignore list.

The ignore list entries use `"versions": ">=30.5.0"` so that once the Jest team fixes the regression,
`npm-upgrade` can pick up the fixed version.

## Consequences

### Positive

- All test suites pass with the pinned Jest version
- No changes needed to test configurations or ESM setup (ADR-001 remains valid)
- The `.npm-upgrade.json` ignore list prevents accidental upgrade to the broken version

### Negative

- Jest updates are blocked at 30.4.x until the regression is fixed
- `jest-environment-node` and `jest-util` must also be pinned to stay in sync
- The Jest 30.5.0 features (describe-level retries, `whenCalledWith`, etc.) are unavailable until fixed
