# Development Workflows

> **Last Updated**: 2026-04-25
> **Purpose**: Document build, test, and release workflows

## Development Setup

### Prerequisites

- Node.js (LTS version recommended)
- npm (comes with Node.js)
- Git

### Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd HomeOfThings

# Install dependencies
npm install

# Verify setup
npm run build
npm run test
```

## Build Commands

### Build All Packages

```bash
npm run build
```

### Build Single Package

```bash
npx nx run <project>:build

# Examples:
npx nx run jsonpointerx:build
npx nx run sqlite3orm:build
npx nx run nestjs-logger:build
```

### Build Affected Packages

```bash
# Build only packages affected by changes
npx nx affected -t build
```

## Test Commands

### Run All Tests

```bash
npm run test
```

### Run Tests for Single Package

```bash
npx nx run <project>:test

# Examples:
npx nx run jsonpointerx:test
npx nx run sqlite3orm:test --coverage
```

### Run Tests with Coverage

```bash
npm run test -- --coverage
```

### Test Patterns

```bash
# Run specific test file
npx nx run sqlite3orm:test --testPathPattern="SqlDatabase"

# Run tests matching pattern
npx nx run sqlite3orm:test --testNamePattern="should connect"
```

## Lint Commands

### Lint All Packages

```bash
npm run lint
```

### Fix Lint Issues

```bash
npm run lint:fix
```

### Lint Single Package

```bash
npx nx run <project>:lint
```

## Format Commands

### Format All Files

```bash
npm run format
```

### Check Formatting

```bash
npm run format:check
```

## Combined Workflows

### Full Validation (CI)

```bash
npm run ci
```

This runs:

1. Build all packages
2. Run all tests
3. Check linting (no fixes)
4. Check formatting (no fixes)

### Complete Workflow (Local)

```bash
npm run all
```

This runs:

1. Format files
2. Fix lint issues
3. Build all packages
4. Run all tests

## Version Management

### Check Current Versions

```bash
# View package.json versions
cat packages/node/sqlite3orm/package.json | grep version
```

### Version Bump

```bash
# Automatic version increment based on commits
npx nx run <project>:version-bump --ver increment

# Specific version
npx nx run <project>:version-bump --ver 2.0.0

# Keep current version (just update changelog)
npx nx run <project>:version-bump --ver keep
```

### Version Bump Examples

```bash
# Foundation packages
npx nx run jsonpointerx:version-bump --ver increment
npx nx run asyncctx:version-bump --ver increment
npx nx run sqlite3orm:version-bump --ver increment
npx nx run node-utils:version-bump --ver increment

# NestJS packages
npx nx run nestjs-utils:version-bump --ver increment
npx nx run nestjs-config:version-bump --ver increment
npx nx run nestjs-sqlite3:version-bump --ver increment
npx nx run nestjs-logger:version-bump --ver increment
```

## Changelog Management

### Generate Changelogs

```bash
npm run changelogs
```

This generates changelog entries from conventional commits for each package.

### Manual Changelog Review

After version bump, review changelogs:

```bash
# Open all changelogs
find packages/ -name "CHANGELOG.md" -exec code {} \;
```

## Publishing

### Dry Run (Verify)

```bash
npx nx run <project>:publish --mode dry-run
```

### Publish to npm

```bash
npx nx run <project>:publish --mode run
```

### Force Republish

```bash
npx nx run <project>:publish --mode force
```

> **Note**: Already published versions are skipped automatically.

## Git Workflow

### Branch Naming

```
<type>/<short-description>

Examples:
feat/add-backup-api
fix/connection-pool-leak
docs/update-readme
```

### Commit Process

```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat(sqlite3orm): add backup progress callback"

# Push to remote
git push origin <branch-name>
```

### Pre-commit Hooks

Husky runs pre-commit hooks:

1. Lint staged files
2. Format staged files
3. Validate commit message

## CI/CD Pipeline

### GitHub Actions Workflows

Located in `.github/workflows/`:

| Workflow      | Trigger          | Purpose                           |
| ------------- | ---------------- | --------------------------------- |
| `build.yml`   | Push, PR, manual | Build, test, lint, coverage       |
| `publish.yml` | Manual           | Publish packages to npm (trusted) |

### CI Process (build.yml)

1. **Checkout** - Clone repository
2. **Setup Node.js 24** - Install Node.js
3. **Install Dependencies** - `npm ci`
4. **Build** - Build all packages
5. **Test** - Run tests with coverage
6. **Lint** - Check code style
7. **Upload Coverage** - Send to Codecov

### Publish Process (publish.yml)

Uses [npm trusted publishers](https://docs.npmjs.com/trusted-publishers) (OIDC) — no `NPM_TOKEN` secret required.

1. **Manual trigger** - `workflow_dispatch` with mode input (dry-run, run, force)
2. **Checkout** - Full history (`fetch-depth: 0`)
3. **Setup Node.js 24** - With `registry-url: https://registry.npmjs.org`
4. **CI checks** - `npm ci` → `npm run ci` (build, test, lint, format)
5. **Build** - `npm run build`
6. **Validate** - `npm run validate-projects`
7. **Publish** - `npm run publish -- --mode=<mode>`
8. **Provenance** - `--provenance` flag automatically added in CI for supply chain security

**npm Trusted Publisher Setup (per package):**

Each package must be configured on npmjs.com to trust this repository:

- Go to package settings → Integrations → Publishing access
- Add trusted publisher: owner `gms1`, repo `HomeOfThings`, workflow `publish.yml`

Packages requiring trusted publisher setup:

- `jsonpointerx`, `asyncctx`, `@homeofthings/node-utils`, `@homeofthings/node-sys`, `sqlite3orm`
- `@homeofthings/nestjs-utils`, `@homeofthings/nestjs-config`, `@homeofthings/nestjs-logger`, `@homeofthings/nestjs-sqlite3`

### Local CI Simulation

```bash
npm run ci
```

## Debugging

### Run Tests in Debug Mode

```bash
# Debug specific test
npx nx run <project>:test -- --detectOpenHandles --forceExit

# With Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Verbose Nx Output

```bash
npx nx run <project>:build --verbose
```

### View Project Graph

```bash
npx nx graph
```

## Common Tasks

### Add New Package

1. Create directory in `packages/`
2. Add `project.json` for Nx
3. Add `package.json` with dependencies
4. Add `tsconfig.json` extending base
5. Update `nx.json` if needed

### Update Dependencies

```bash
# Interactive update
npm run package-upgrade

# Or manually
npm install <package>@<version> --save-dev
```

### Clean Build Artifacts

```bash
# Clean Nx cache
npx nx reset

# Clean node_modules
rm -rf node_modules
npm install
```
