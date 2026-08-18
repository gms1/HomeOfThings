# Noteworthy

## conventional commits

This project is using conventional commits where a commit message must be prefixed by a type, e.g.: "type: description".

Optionally it can also be scopped, e.g.: "type(scope): description".

Breaking changes must always append a '!' to the prefix, e.g.: "type!: description", "type(scope)!: description". Any breaking change leads to a major version update.

The type can be one of the following:

| Type     | Description                                                                                                      | Update        |
| -------- | ---------------------------------------------------------------------------------------------------------------- | ------------- |
| feat     | A code change that about addition or removal of a feature.                                                       | minor version |
| perf     | A code change that improves performance                                                                          | minor version |
| fix      | A code change that fixes a bug.                                                                                  | patch version |
| chore    | Installing new dependencies, or bumping deps. This can also lead to a breaking change                            | patch         |
| style    | A code change that does not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)   |               |
| refactor | A code change that neither fixes a bug nor adds/removes a feature nor improves performance nor changes the style | patch         |
|          |                                                                                                                  |               |
| docs     | Documentation only changes (README.md)                                                                           |               |
| test     | Update testing suite, cypress files                                                                              |               |
|          |                                                                                                                  |               |
| build    | Working on build scripts, configurations,...                                                                     |               |
| ci       | Update github workflows, husky                                                                                   |               |
|          |                                                                                                                  |               |
| release  | Bumps the package version for a new release (NOTE: added this, after looking how Angular does it)                |               |
|          |                                                                                                                  |               |
| revert   | when reverting commits                                                                                           | depends       |
|          |                                                                                                                  |               |

An optional body can be added to the commit message, which begins one blank line after the description.

An optional footer can be added which begins one blank line after the body or the description. A footer for a braking change must contain "BREAKING CHANGE" and a description or issue reference, e.g.: "BREAKING CHANGE Fixes #13"

> NOTE: release commits for a single package should follow the convention: "release: <project-name> version <new-version>", but you can also create a release commit for multiple packages

## commands

### build/lint/test/format commands

Please run the npm run-script having the same name: 'build', 'lint', 'test' and 'format'.
To format you can call the npm run-script 'format', to fix all fixable lint errors, you can call the npm run-script 'lint:fix'
To run all of the above, please run `npm run all` which will also run 'format' and 'lint:fix'.
To validate if all is working, you can run `npm run ci`, which will run 'build' and 'test' and will just validate the format and linting

### changelog

Print changelog relevant commits for each project (for review):

```bash
npm run changelogs
```

Write changelogs to CHANGELOG.md files:

```bash
npm run changelogs:write
```

> NOTE: `changelogs:write` updates each package's `CHANGELOG.md` with a standardized entry for the current version, deduplicating commits by hash. Entries use the format `- type: message` or `- maintenance release`.

### version bump

#### automated version bump (recommended)

A fully automated version bump script is provided at `build/sh/version-bump.sh`. It detects changed packages, bumps their versions, propagates bumps through the dependency graph, writes changelogs, and auto-commits:

```bash
./build/sh/version-bump.sh
```

The script performs these steps in order:

1. **Check repo state** — Records whether the repo was clean before starting
2. **Build** — `npm run build` (ensures the version-bump tool is available)
3. **Phase 1: Detect changes** — For each publishable project, checks for changes in `src/` or `package.json` since the last `release:` commit
4. **Phase 2: Propagate** — Iteratively bumps packages whose dependencies were bumped (ensures dependents get version updates)
5. **Phase 3: Write changelogs** — `npm run changelogs:write` updates all CHANGELOG.md files
6. **Phase 4: Validate** — `npm run all` (format, lint, build, test)
7. **Phase 5: Auto-commit** — If the repo was clean before the bump: commits with `"chore: bumped versions and updated changelogs"` and pushes. Otherwise prints a warning to commit manually.

> NOTE: the repo should be clean (no uncommitted changes) before running the script, otherwise auto-commit is skipped

#### manual version bump

Bump the version for a single project:

```bash
npx nx run <project>:version-bump --ver <new version>|increment|keep
```

This updates the version in `package.json` and also updates dependency references.

> NOTE: using 'increment' takes the git changes into account to decide which part of the version must be incremented

```bash
npx nx run jsonpointerx:version-bump --ver increment
npx nx run asyncctx:version-bump --ver increment
npx nx run node-utils:version-bump --ver increment
npx nx run node-sys:version-bump --ver increment
npx nx run sqlite3orm:version-bump --ver increment

npx nx run nestjs-utils:version-bump --ver increment
npx nx run nestjs-config:version-bump --ver increment
npx nx run nestjs-sqlite3:version-bump --ver increment
npx nx run nestjs-logger:version-bump --ver increment

# npx nx run hot-server:version-bump --ver increment
# npx nx run hot-cli:version-bump --ver increment
# npx nx run hot-gateway:version-bump --ver increment
```

After bumping, write changelogs:

```bash
npm run changelogs:write
```

### publish

> NOTE: versions already published will be skipped, non-publishable projects too

- publish a project by name:

  ```bash
  npx nx run <project>:publish --mode dry-run|run|force
  ```

- publish all publishable projects:

  ```bash
  npm run publish -- --mode dry-run|run|force
  ```

  > NOTE: this command is using `nx run-many` which should always run the commands in the order, which is based on the dpendencies between projects

  > NOTE: if you want to run `nx run-many  --target=publish` instead, please do not forget to add the `--nxBail` option

### publish via CI (trusted publishing)

Packages can be published to npm via the **Publish to npm** GitHub Actions workflow, which uses [npm trusted publishers](https://docs.npmjs.com/trusted-publishers) (OIDC) — no `NPM_TOKEN` secret is required.

**Prerequisites (one-time setup per package):**

Each package must be configured on npmjs.com to trust this repository:

1. Go to the package settings on npmjs.com → **Integrations** → **Publishing access**
2. Add a trusted publisher:
   - **Repository owner**: `gms1`
   - **Repository name**: `HomeOfThings`
   - **Workflow filename**: `publish.yml`

**Publishing steps:**

1. Ensure changelogs are already prepared and committed
2. Go to **Actions** → **Publish to npm** → **Run workflow**
3. Select the publish mode:
   - `dry-run` — validates everything but skips actual publish (default)
   - `run` — publishes packages that are not yet published
   - `force` — publishes even if version already exists on npm
4. The workflow runs: `npm ci` → `npm run ci` → `npm run build` → `npm run validate-projects` → `npm run publish`
5. Published packages are signed with npm provenance (`--provenance` flag is automatically added in CI)

## upgrade dependencies

### automated upgrade (recommended)

A fully automated upgrade script is provided at `build/sh/package-upgrade.sh`. It handles Nx migration, npm package upgrades, validation, and auto-commit in one run:

```bash
./build/sh/package-upgrade.sh
```

The script performs these steps in order:

1. `git pull --rebase --autostash` — pull latest changes
2. Nx migration: `npx nx migrate latest --include=all` → `npm install` → run migrations → `npm run all`
3. npm-upgrade: `npx npm-upgrade` → format → `npm install` → `npm run all`
4. Auto-commit and push if the repo was clean before the upgrade (otherwise prints a warning to commit manually)

> NOTE: the repo should be clean (no uncommitted changes) before running the script, otherwise auto-commit is skipped

### manual upgrade

If you prefer to run the steps individually:

Nx migration:

```bash
npx nx migrate latest
npm install
[ ! -f migrations.json ] || npx nx migrate --run-migrations
rm -f migrations.json
npm run all
```

Then upgrade remaining packages:

```bash
npx npm-upgrade
npm install
npm run all
```

Optional: upgrade tools/benchmarks/jsonpointerx

```bash
cd tools/benchmarks/jsonpointerx
npx npm-upgrade
npm install
npm run test
```

## CHANGELOG format

All CHANGELOG.md files follow a standardized format:

```markdown
# CHANGELOG for <package-name>

## <version>

- type: message
- type: message

## <previous-version>

- maintenance release
```

- Title: `# CHANGELOG for <package-name>`
- Version headers: `## <version>` (no date ranges)
- Entries: `- type: message` (using conventional commit types: feat, fix, perf, chore, refactor, revert)
- Breaking changes: `- type!: message`
- Maintenance releases: `- maintenance release`
- Deduplication: the `changelogs:write` command deduplicates by commit hash
