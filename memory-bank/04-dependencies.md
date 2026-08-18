# Dependency Management

> **Last Updated**: 2026-08-18
> **Purpose**: Document dependency structure and management

## Dependency Layers

### Layer 1: Foundation Packages (No Internal Dependencies)

| Package        | External Dependencies                            | Engine           | Purpose                     |
| -------------- | ------------------------------------------------ | ---------------- | --------------------------- |
| `jsonpointerx` | None                                             | —                | JSON Pointer implementation |
| `asyncctx`     | `tslib`                                          | —                | Async context handling      |
| `node-utils`   | `config`, `chalk`, `type-fest`, `debug`, `tslib` | `node >= 24.9.0` | Node.js utilities           |

### Layer 2: Core Packages (Depend on Layer 1 Only)

| Package      | Internal Dependencies | External Dependencies                                                               | Engine           | Purpose                                   |
| ------------ | --------------------- | ----------------------------------------------------------------------------------- | ---------------- | ----------------------------------------- |
| `node-sys`   | `node-utils`          | `debug`, `tslib`, `chmodr`, `chownr`, `mktemp`, `touch`, `which`, `mv`, `stat-mode` | `node >= 24.9.0` | Shell-like filesystem & process utilities |
| `sqlite3orm` | `node-utils`          | `debug`, `reflect-metadata`, `@homeofthings/sqlite3`, `tslib`                       | `node >= 24.9.0` | SQLite ORM                                |

### Layer 3: NestJS Integration Packages

| Package          | Internal Dependencies                      | Peer Dependencies                        | External Dependencies                                            | Engine           | Purpose                  |
| ---------------- | ------------------------------------------ | ---------------------------------------- | ---------------------------------------------------------------- | ---------------- | ------------------------ |
| `nestjs-utils`   | `node-utils`                               | `@nestjs/common`, `rxjs`                 | `tslib`                                                          | `node >= 24.9.0` | Dynamic module utilities |
| `nestjs-config`  | `nestjs-utils`, `node-utils`               | `@nestjs/common`                         | `tslib`                                                          | `node >= 24.9.0` | NestJS config module     |
| `nestjs-logger`  | `nestjs-utils`                             | `@nestjs/common`                         | `chalk`, `supports-color`, `debug`, `mkdirp`, `winston`, `tslib` | `node >= 24.9.0` | NestJS logger module     |
| `nestjs-sqlite3` | `nestjs-utils`, `sqlite3orm`, `node-utils` | `@nestjs/common`, `@nestjs/core`, `rxjs` | `reflect-metadata`, `tslib`                                      | `node >= 24.9.0` | NestJS SQLite3 module    |

### Application Packages (Not Published)

| Package       | Internal Dependencies                                                                          | Engine           |
| ------------- | ---------------------------------------------------------------------------------------------- | ---------------- |
| `hot-server`  | `nestjs-utils`, `nestjs-config`, `nestjs-logger`, `nestjs-sqlite3`, `sqlite3orm`, `node-utils` | `node >= 24.9.0` |
| `hot-gateway` | `nestjs-config`, `nestjs-logger`, `hot-server`, `node-utils`                                   | `node >= 24.9.0` |
| `hot-cli`     | `nestjs-config`, `nestjs-logger`                                                               | `node >= 24.9.0` |

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                             │
│  hot-server, hot-gateway, hot-cli                                │
│  (depend on: nestjs-config, nestjs-logger, nestjs-sqlite3, etc.)│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NestJS Integration Layer                      │
│                                                                 │
│  nestjs-config ──▶ nestjs-utils ──▶ node-utils                 │
│  nestjs-logger ──▶ nestjs-utils ──▶ node-utils                 │
│  nestjs-sqlite3 ──▶ nestjs-utils + sqlite3orm ──▶ node-utils  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Core Layer                                    │
│                                                                 │
│  node-sys ──▶ node-utils                                        │
│  sqlite3orm ──▶ node-utils                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Foundation Layer                               │
│                                                                 │
│  jsonpointerx (standalone)                                      │
│  asyncctx (standalone, only tslib)                              │
│  node-utils (config, chalk, type-fest, debug, tslib)            │
└─────────────────────────────────────────────────────────────────┘
```

## ESM Dependencies and Engine Requirements

Packages with ESM transitive dependencies require `node >= 24.9.0`:

| Package          | ESM Dependency Chain                             |
| ---------------- | ------------------------------------------------ |
| `node-utils`     | `config` (ESM), `chalk` (ESM), `type-fest` (ESM) |
| `node-sys`       | via `node-utils`                                 |
| `sqlite3orm`     | via `node-utils`                                 |
| `nestjs-utils`   | via `node-utils`                                 |
| `nestjs-config`  | via `node-utils`                                 |
| `nestjs-logger`  | via `node-utils`, `chalk` (direct)               |
| `nestjs-sqlite3` | via `node-utils`                                 |
| `hot-server`     | via `node-utils`                                 |
| `hot-gateway`    | via `node-utils`                                 |
| `hot-cli`        | via `node-utils`                                 |

Packages **without** ESM dependencies (no engine constraint required):

| Package        | Reason             |
| -------------- | ------------------ |
| `jsonpointerx` | No dependencies    |
| `asyncctx`     | Only `tslib` (CJS) |

## Package.json Structure

### Root Package.json

```json
{
  "name": "homeofthings",
  "private": true,
  "scripts": {
    "build": "nx run-many -t build",
    "test": "nx run-many -t test",
    "lint": "nx run-many -t lint",
    "format": "prettier --write .",
    "ci": "npm run build && npm run test && npm run lint && npm run format:check",
    "all": "npm run format && npm run lint:fix && npm run build && npm run test"
  }
}
```

### Package Package.json

```json
{
  "name": "@homeofthings/package-name",
  "version": "1.0.0",
  "license": "MIT",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "engines": { "node": ">=24.9.0" },
  "scripts": {
    "build": "...",
    "test": "..."
  },
  "dependencies": {
    "runtime-dep": "^1.0.0"
  },
  "peerDependencies": {
    "@nestjs/core": "^10.0.0"
  },
  "devDependencies": {
    "dev-dep": "^1.0.0"
  }
}
```

## Version Management

### Semantic Versioning

| Change Type     | Version Impact | Example       |
| --------------- | -------------- | ------------- |
| Breaking change | Major          | 1.0.0 → 2.0.0 |
| New feature     | Minor          | 1.0.0 → 1.1.0 |
| Bug fix         | Patch          | 1.0.0 → 1.0.1 |

### Conventional Commits → Version

| Commit Type                   | Version Impact |
| ----------------------------- | -------------- |
| `feat!:` or `feat(scope)!:`   | Major          |
| `feat:` or `perf:`            | Minor          |
| `fix:`, `chore:`, `refactor:` | Patch          |
| `docs:`, `style:`, `test:`    | None           |

## Dependency Updates

### Check for Updates

```bash
# Check outdated packages
npm outdated

# Interactive update tool
npm run package-upgrade
```

### Update Dependencies

```bash
# Update single package
npm install <package>@<version> --save-dev

# Update all packages (careful!)
npm update
```

### Security Audits

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Peer Dependencies

### NestJS Packages

NestJS integration packages use peer dependencies:

```json
{
  "peerDependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0"
  }
}
```

This allows consumers to control the NestJS version.

## Local Package References

### Workspace References

Packages reference each other using workspace protocol:

```json
{
  "dependencies": {
    "@homeofthings/nestjs-utils": "workspace:*"
  }
}
```

### Build Order

Nx automatically determines build order based on dependencies:

1. Foundation packages (no dependencies)
2. Core packages (depend on foundation)
3. NestJS utils (depends on node-utils + @nestjs/core)
4. NestJS modules (depend on nestjs-utils)
5. Application packages (depend on NestJS modules)

## Dependency Best Practices

### Adding New Dependencies

1. **Check if dependency is needed** - Can functionality be implemented internally?
2. **Check bundle size** - Use `npm info <package>` to check size
3. **Check maintenance** - Is the package actively maintained?
4. **Check license** - Is the license compatible (MIT, Apache-2.0, etc.)?
5. **Add to correct dependency type**:
   - `dependencies` - Runtime required
   - `peerDependencies` - Consumer provides (NestJS modules)
   - `devDependencies` - Build/test only

### Avoiding Dependency Issues

1. **Lock versions** - Use exact versions for runtime dependencies in published packages; dev dependencies may use ranges
2. **Use `npm ci`** - Not `npm install` in CI
3. **Commit lockfile** - Always commit `package-lock.json`
4. **Regular updates** - Schedule regular dependency updates

## Troubleshooting

### Common Issues

| Issue                    | Solution                            |
| ------------------------ | ----------------------------------- |
| Version mismatch         | `npm ci` to reinstall from lockfile |
| Missing peer dependency  | Install peer dependency manually    |
| Build fails after update | Clear cache: `npx nx reset`         |
| Duplicate dependencies   | Check for version conflicts         |

### Clear Caches

```bash
# Clear Nx cache
npx nx reset

# Clear npm cache
npm cache clean --force

# Reinstall dependencies (preserves lockfile)
rm -rf node_modules
npm ci
```
