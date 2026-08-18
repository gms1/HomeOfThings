# Coding Standards and Conventions

> **Last Updated**: 2026-03-29
> **Purpose**: Document coding standards, patterns, and conventions

## Conventional Commits

This project strictly follows **Conventional Commits** specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description             | Version Impact |
| ---------- | ----------------------- | -------------- |
| `feat`     | New feature             | minor          |
| `perf`     | Performance improvement | minor          |
| `fix`      | Bug fix                 | patch          |
| `chore`    | Dependencies, tooling   | patch          |
| `style`    | Code style (formatting) | none           |
| `refactor` | Code refactoring        | patch          |
| `docs`     | Documentation only      | none           |
| `test`     | Test updates            | none           |
| `build`    | Build scripts           | none           |
| `ci`       | CI/CD updates           | none           |
| `release`  | Version bump            | varies         |
| `revert`   | Revert previous commit  | varies         |

### Breaking Changes

Append `!` after type/scope for breaking changes:

```
feat!: remove deprecated API
fix(scope)!: breaking change description
```

Breaking changes trigger **major version** updates.

### Examples

```bash
# Feature with scope
feat(sqlite3orm): add connection pooling support

# Bug fix
fix: handle null values in query builder

# Breaking change
feat(nestjs-logger)!: rename LoggerService to NestLoggerService

# With body and footer
feat(sqlite3orm): add backup functionality

Add support for online SQLite backups with progress callbacks.

Closes #42
```

## TypeScript Standards

### File Organization

```
src/
├── index.ts              # Public exports
├── lib/
│   ├── module.ts         # Main module implementation
│   ├── module.spec.ts    # Tests (co-located)
│   ├── model/            # Types and interfaces
│   │   └── types.ts
│   └── utils/            # Internal utilities
│       └── helper.ts
```

### Naming Conventions

| Element         | Convention               | Example             |
| --------------- | ------------------------ | ------------------- |
| Files           | kebab-case               | `sql-database.ts`   |
| Classes         | PascalCase               | `SqlDatabase`       |
| Interfaces      | PascalCase (no I prefix) | `ConnectionOptions` |
| Functions       | camelCase                | `createQuery()`     |
| Constants       | SCREAMING_SNAKE_CASE     | `MAX_CONNECTIONS`   |
| Private members | underscore prefix        | `_privateMethod()`  |

### Export Patterns

```typescript
// Preferred: Named exports
export { SqlDatabase } from './sql-database';
export { ConnectionOptions } from './model';

// Avoid: Default exports (except for some NestJS patterns)
// export default class ...  // Not recommended
```

### Module Pattern

```typescript
// index.ts - Barrel export
export * from './lib/module';
export * from './lib/model';
```

## NestJS Module Patterns

### Dynamic Module Pattern

```typescript
// ForRoot pattern for synchronous configuration
export class MyModule {
  static forRoot(options: MyModuleOptions): DynamicModule {
    return {
      module: MyModule,
      providers: [{ provide: OPTIONS, useValue: options }],
      exports: [MyService],
    };
  }

  // ForRootAsync pattern for asynchronous configuration
  static forRootAsync(options: MyModuleAsyncOptions): DynamicModule {
    return {
      module: MyModule,
      imports: options.imports || [],
      providers: [
        {
          provide: OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ],
      exports: [MyService],
    };
  }
}
```

### Service Pattern

```typescript
@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  constructor(@Inject(OPTIONS) private readonly options: MyModuleOptions) {}

  // Methods...
}
```

## Testing Standards

### Test File Location

Tests are co-located with source files:

```
src/lib/
├── module.ts
└── module.spec.ts
```

### Test Naming

```typescript
describe('ClassName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange, Act, Assert
    });
  });
});
```

### Jest Configuration

- Uses shared `jest.preset.js`
- Coverage reports generated in `coverage/`
- Test file pattern: `**/*.spec.ts`

## Code Style

### Formatting Tools

| Tool         | Config File         |
| ------------ | ------------------- |
| Prettier     | `.prettierrc`       |
| dprint       | `dprint.json`       |
| ESLint       | `eslint.config.mjs` |
| EditorConfig | `.editorconfig`     |

### Key Style Rules

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: ES5 compatible
- **Max line length**: 140 characters

### Running Formatters

```bash
npm run format      # Format all files
npm run lint:fix    # Fix linting issues
npm run all         # Format + lint:fix + build + test
```

## Documentation Standards

### README Structure

Each package should have a README with:

1. **Title and badges** (build, coverage, license)
2. **Description** - What the package does
3. **Installation** - npm install command
4. **Quick Start** - Minimal working example
5. **API Reference** - Key classes/functions
6. **Configuration** - Available options
7. **Examples** - Common use cases
8. **License** - MIT

### JSDoc Comments

````typescript
/**
 * Executes a SQL query and returns the results.
 *
 * @param sql - The SQL query string
 * @param params - Query parameters (optional)
 * @returns Promise resolving to query results
 * @throws {SqlError} If query execution fails
 *
 * @example
 * ```ts
 * const results = await db.query('SELECT * FROM users WHERE id = ?', [1]);
 * ```
 */
async query<T>(sql: string, params?: unknown[]): Promise<T[]>;
````

## Dependency Management

### Package Dependencies

- **Dependencies**: Runtime dependencies
- **PeerDependencies**: For NestJS modules, plugins
- **DevDependencies**: Build, test, lint tools

### Version Strategy

- Follow SemVer strictly
- Breaking changes = major version
- New features = minor version
- Bug fixes = patch version

### Updating Dependencies

```bash
npm run package-upgrade  # Interactive dependency updates
```
