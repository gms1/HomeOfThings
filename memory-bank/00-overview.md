# HomeOfThings - Project Overview

> **Last Updated**: 2026-08-18
> **Purpose**: High-level project context for AI assistants

## Project Identity

**Name**: HomeOfThings (HOT)\
**Type**: Nx Monorepo\
**Language**: TypeScript / Node.js\
**License**: MIT

## Description

HomeOfThings is a collection of reusable JavaScript/TypeScript packages, primarily focused on:

- **SQLite ORM** - Type-safe database operations with connection pooling
- **NestJS Modules** - Integration modules for NestJS framework
- **Node.js Utilities** - Async context handling, logging, configuration
- **JSON Pointer** - RFC6901 implementation

## Monorepo Structure

```text
HomeOfThings/
├── packages/
│   ├── js/                    # Browser/JS packages
│   │   └── jsonpointerx/      # JSON Pointer (RFC6901)
│   └── node/                  # Node.js packages
│       ├── asyncctx/          # Async context handling
│       ├── sqlite3orm/        # SQLite ORM
│       └── @homeofthings/     # Scoped packages
│           ├── nestjs-config/
│           ├── nestjs-logger/
│           ├── nestjs-sqlite3/
│           ├── nestjs-utils/
│           └── node-utils/
├── build/                     # Build tooling
├── docs/                      # Documentation
└── config/                    # Configuration files
```

## Key Technologies

| Category        | Technology                                       |
| --------------- | ------------------------------------------------ |
| Build System    | Nx                                               |
| Package Manager | npm                                              |
| Language        | TypeScript                                       |
| Testing         | Jest (ESM mode with `--experimental-vm-modules`) |
| Linting         | ESLint                                           |
| Formatting      | Prettier, dprint                                 |
| Commits         | Conventional Commits                             |
| CI/CD           | GitHub Actions                                   |

## Package Dependencies Graph

```text
jsonpointerx (standalone)
asyncctx (standalone)
sqlite3orm (standalone)
node-utils (standalone)
├── nestjs-utils
│   ├── nestjs-config
│   ├── nestjs-logger
│   └── nestjs-sqlite3
└── nestjs-sqlite3
    └── sqlite3orm
```

## Quick Commands

| Command         | Purpose                                      |
| --------------- | -------------------------------------------- |
| `npm run build` | Build all packages                           |
| `npm run test`  | Run all tests                                |
| `npm run lint`  | Lint all packages                            |
| `npm run ci`    | CI validation (build + test + lint check)    |
| `npm run all`   | Full workflow (build + test + lint + format) |

## Important Files

| File                          | Purpose                                           |
| ----------------------------- | ------------------------------------------------- |
| `nx.json`                     | Nx workspace configuration                        |
| `tsconfig.base.json`          | Shared TypeScript configuration                   |
| `package.json`                | Root package scripts and dev dependencies          |
| `build/sh/package-upgrade.sh` | Automated dependency upgrade script                |
| `build/sh/common`             | Shared shell script helpers (`die`, `succeeded`)   |
| `.roomodes`                   | AI assistant instructions                         |

## Context for AI Assistants

When working on this monorepo:

1. **Always check package-specific memory files** in `memory-bank/packages/` for detailed context
2. **Follow conventional commits** - See `docs/DEVELOP.md` for commit message format
3. **Respect package boundaries** - Each package has its own `project.json` and `tsconfig.json`
4. **Use Nx generators** - Run tasks through `npx nx run <project>:<target>`
5. **Check existing patterns** - Look at similar packages for implementation patterns
