# Architecture Decisions

> **Last Updated**: 2026-03-29
> **Purpose**: Document architectural patterns and decisions

## Monorepo Architecture

### Build System: Nx

This project uses **Nx** as the monorepo build system. Key benefits:

- **Task Orchestration**: Parallel task execution with dependency awareness
- **Affected Commands**: Only run tasks on changed packages
- **Caching**: Built-in computation caching for faster builds
- **Project Graph**: Visualizes package dependencies

### Project Configuration

Each package has:

- `project.json` - Nx project configuration (targets, dependencies)
- `package.json` - npm package metadata
- `tsconfig.json` - TypeScript configuration (extends from base)
- `tsconfig.lib.json` - Library build configuration
- `tsconfig.spec.json` - Test configuration

### Shared Configuration

| File                   | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `tsconfig.base.json`   | Shared TypeScript settings                                |
| `jest.preset.js`       | Jest preset for all packages (ESM mode, moduleNameMapper) |
| `jest.global-setup.js` | Jest global setup (sets cwd to workspace root)            |
| `eslint.config.mjs`    | ESLint flat config                                        |
| `nx.json`              | Nx workspace settings                                     |

## Package Architecture

### Layer 1: Foundation Packages

Standalone packages with minimal dependencies:

| Package        | Purpose                | Dependencies |
| -------------- | ---------------------- | ------------ |
| `jsonpointerx` | JSON Pointer (RFC6901) | None         |
| `asyncctx`     | Async context handling | None         |
| `sqlite3orm`   | SQLite ORM             | sqlite3      |
| `node-utils`   | Node.js utilities      | None         |

### Layer 2: NestJS Integration

Packages that integrate with NestJS:

| Package          | Purpose                  | Dependencies              |
| ---------------- | ------------------------ | ------------------------- |
| `nestjs-utils`   | Dynamic module utilities | @nestjs/core              |
| `nestjs-config`  | Configuration module     | nestjs-utils, node-config |
| `nestjs-logger`  | Logging module           | nestjs-utils, winston     |
| `nestjs-sqlite3` | SQLite module            | nestjs-utils, sqlite3orm  |

### Dependency Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  (uses nestjs-config, nestjs-logger, nestjs-sqlite3)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NestJS Integration Layer                 │
│  nestjs-utils ← nestjs-config, nestjs-logger, nestjs-sqlite3│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Foundation Layer                          │
│  jsonpointerx | asyncctx | sqlite3orm | node-utils          │
└─────────────────────────────────────────────────────────────┘
```

## Key Architectural Patterns

### 1. Dynamic Root Modules (nestjs-utils)

Pattern for creating NestJS modules that support both synchronous and asynchronous configuration:

```typescript
// Synchronous
@Module({
  imports: [MyModule.forRoot({ ... })]
})

// Asynchronous
@Module({
  imports: [MyModule.forRootAsync({ useFactory: ... })]
})
```

### 2. Connection Pooling (sqlite3orm)

SQLite connection pool with:

- Configurable pool size
- Automatic connection management
- Online backup support

### 3. Auto-Upgrader (sqlite3orm)

Database schema migration system:

- Version-based upgrades
- Automatic schema evolution
- Rollback support

### 4. Async Context (asyncctx)

Two implementations:

- `AsynchronousLocalStorage` - Modern async context
- `ContinuationLocalStorage` - Legacy continuation support

## Build Pipeline

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Lint       │───▶│   Build      │───▶│   Test       │
│  (ESLint)    │    │  (TypeScript)│    │   (Jest)     │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Task Dependencies

Nx automatically handles task dependencies:

1. Build dependencies before dependents
2. Run tests after successful builds
3. Cache results for unchanged packages

## Release Process

1. **Version Bump**: `npx nx run <project>:version-bump --ver increment`
2. **Changelog**: Auto-generated from conventional commits
3. **Publish**: `npx nx run <project>:publish --mode run`

See `docs/DEVELOP.md` for detailed release workflow.

## Architecture Decision Records (ADRs)

ADRs are stored in `memory-bank/decisions/` and follow the format:

```markdown
# ADR-XXX: Title

## Status

[Proposed | Accepted | Deprecated | Superseded]

## Context

What is the issue we're addressing?

## Decision

What is the change we're proposing?

## Consequences

What are the trade-offs?
```

### Active ADRs

| ADR                                                               | Title                                          | Status   |
| ----------------------------------------------------------------- | ---------------------------------------------- | -------- |
| [ADR-001](memory-bank/decisions/ADR-001-jest-esm-deep-imports.md) | Jest ESM Mode Cannot Load the `config` Package | Accepted |
