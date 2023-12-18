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
npx nx run <project>:publish --mode dry-run|run|force
```

publish all publishable projects:

```bash
npm run publish -- --mode dry-run|run|force
```

> NOTE: this command is using `nx run-many` which should always run the commands in the order, which is based on the dpendencies between projects

> NOTE: if you want to run `nx run-many  --target=publish` please do not forget to add the `--nxBail` option
