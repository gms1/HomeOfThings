# @homeofthings/node-sys Package

> **Last Updated**: 2026-08-18
> **Location**: `packages/node/@homeofthings/node-sys/`
> **Type**: Foundation Package
> **Engine**: `node >= 24.9.0`

## Overview

Node.js utility library providing a fluent API for spawning child processes and shell-like filesystem operations.

## Purpose

Provides utilities for:

- Spawning and managing child processes
- Shell-like filesystem operations (cp, mv, rm, mkdir, chmod, chown, etc.)
- Command logging and debugging
- Shell-style directory navigation (cd, pushd, popd, pwd)
- Filesystem queries (which, stat, mode, exists)

## Key Files

| Directory/File                             | Purpose                      |
| ------------------------------------------ | ---------------------------- |
| `src/lib/process/spawn.ts`                 | Child process spawning       |
| `src/lib/process/exec.ts`                  | Exec class (fluent API)      |
| `src/lib/process/pipe.ts`                  | Process piping               |
| `src/lib/process/error.ts`                 | Process error types          |
| `src/lib/process/options.ts`               | Spawn/exec options           |
| `src/lib/process/spawn.spec.ts`            | Spawn tests                  |
| `src/lib/process/exec.integration.spec.ts` | Exec integration tests       |
| `src/lib/process/pipe.integration.spec.ts` | Pipe integration tests       |
| `src/lib/fs/index.ts`                      | Filesystem operations        |
| `src/lib/fs/index.spec.ts`                 | Filesystem unit tests        |
| `src/lib/fs/index.integration.spec.ts`     | Filesystem integration tests |
| `src/lib/log/command.ts`                   | Command logging utilities    |
| `src/index.ts`                             | Public exports               |

## API Reference

### Exec (Fluent Process API)

```typescript
import { exec, sh } from '@homeofthings/node-sys';

// Execute a command and wait for exit
const exitCode = await exec('ls', '-la').run();

// Execute in background (detached)
const process = await exec('server').start();

// Shell command
const exitCode = await sh('ls *.txt').setQuiet().run();

// Capture output
const output: string[] = [];
await exec('git', 'status').setStdOut(output).run();

// Ignore non-zero exit codes
const code = await exec('some-cmd').setIgnoreExitCode().run();
```

### Filesystem Operations

```typescript
import * as fs from '@homeofthings/node-sys';

// Shell-like operations
await fs.mkdir('path/to/dir', { recursive: true });
await fs.rm('path/to/dir', { recursive: true, force: true });
await fs.cp('src.txt', 'dest.txt');
await fs.mv('src.txt', 'dest.txt');
await fs.chmod('file.txt', 0o755, { recursive: true });
await fs.ln('target', 'link');
await fs.touch('file.txt');
await fs.mktemp('/tmp/prefix-', { directory: true });
const paths = await fs.which('node');
const info = await fs.stat('file.txt');
```

### Spawn (Low-level Process Control)

```typescript
import { onChildProcessExit, spawnChildProcess } from '@homeofthings/node-sys';

const context = await spawnChildProcess(options, 'cmd', 'arg1');
// ... interact with process ...
const result = await onChildProcessExit(options);
```

## Dependencies

### External Dependencies

| Package     | Purpose                       |
| ----------- | ----------------------------- |
| `debug`     | Debug logging utility         |
| `tslib`     | TypeScript runtime helpers    |
| `chmodr`    | Recursive chmod               |
| `chownr`    | Recursive chown               |
| `mktemp`    | Temporary file creation       |
| `touch`     | File touch utility            |
| `which`     | Command lookup (like `which`) |
| `mv`        | File move/rename              |
| `stat-mode` | File mode parsing             |

### Internal Dependencies

| Package                    | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `@homeofthings/node-utils` | Quote args, stream strings, type utilities |

## Build & Test

```bash
# Build
npx nx run node-sys:build

# Test
npx nx run node-sys:test

# Test with coverage
npx nx run node-sys:test --coverage
```

## Package Metadata

| Property   | Value                    |
| ---------- | ------------------------ |
| Name       | `@homeofthings/node-sys` |
| Scope      | @homeofthings            |
| License    | MIT                      |
| Main Entry | `dist/index.js`          |
| Types      | `dist/index.d.ts`        |
| Engine     | `node >= 24.9.0`         |

## Testing

### Jest Configuration

Tests run in Jest ESM mode (`--experimental-vm-modules`). Integration tests (files matching `*.integration.spec.ts`) are excluded from the standard test run via `testPathIgnorePatterns` since they require actual filesystem and process interactions.

```typescript
// jest.config.ts
export default {
  displayName: 'node-sys',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/node/@homeofthings/node-sys',
};
```

## Notes

- Requires `node >= 24.9.0` due to transitive ESM dependencies via `node-utils`
- Node.js only (not browser compatible)
- Uses `debug` for command logging (`hot:node-sys:process:spawn` namespace)
- Integration tests exist but are excluded from CI (require real filesystem/process)
- The `Exec` class provides a fluent/builder pattern for process execution

## Related Files

- [`README.md`](packages/node/@homeofthings/node-sys/README.md) - Package documentation
- [`project.json`](packages/node/@homeofthings/node-sys/project.json) - Nx configuration
- [`CHANGELOG.md`](packages/node/@homeofthings/node-sys/CHANGELOG.md) - Changelog
