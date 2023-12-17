# Noteworthy

## commands

### version bump

```bash
npx nx run <project>:version-bump --ver <new version>|increment|keep
```

### publish

> NOTE: versions already published will be skipped, non-publishable projects too

publish a project by name:

```bash
npx nx run <project>:publish
```

publish all publishable projects:

```bash
npm run publish
```

> NOTE: this command is using `nx run-many` which should always run the commands in an order, which is based on the dpendencies between projects
