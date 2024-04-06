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

> NOTE: release commits should follow the convention: "release: <project-name> version <new-version>"

## commands

### build/lint/test/format commands

Please run the npm run-script having the same name: 'build', 'lint', 'test' and 'format'.
To format you can call the npm run-script 'format', to fix all fixable lint errors, you can call the npm run-script 'lint:fix'
To run all of the above, please run `npm run all` which will also run 'format' and 'lint:fix'.
To validate if all is working, you can run `npm run ci`, which will run 'build' and 'test' and will just validate the format and linting

### changelog

this logs the changelog relevant commits for each project:

```bash
npm run changelogs
```

### version bump

this bumps the version for a project:

```bash
npx nx run <project>:version-bump --ver <new version>|increment|keep
```

updates the dependencies in package.json and also logs the changelog relevant commits for this project

> NOTE: using 'increment' takes the git changes into account to decide which part of the version must be incremented

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

## upgrade dependencies

check what can be upgraded using

```bash
npx nx migrate latest
npm install
npx nx migrate --run-migrations
npm run all
```

on success remove migrations.json

```bash
rm migrations.json
```

commit changes and upgrade remaining packages

```bash
npx npm-upgrade
npm install
npm run all
```
