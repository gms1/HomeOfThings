#!/bin/bash
BN=$(basename "$0")
DN=$(dirname "$0")
. "${DN}/common"
#--------------------------------------------------------------

NU=$(which npm-upgrade)
[ -n "${NU}" ] || npm -g install npm-upgrade

die() {
  echo "ERROR: $@" >&2
  exit 1
}


# please see

# https://nx.dev/recipes/tips-n-tricks/advanced-update#identifying-the-nx-version-to-migrate-from-to-collect-previously-skipped-updates

# https://angular.io/guide/versions

git checkout package.json package-lock.json
npm ci
npx nx migrate latest --interactive
if [ -f "migrations.json" ]; then
  npm i
  npx nx migrate --run-migrations || die "running migrations failed"
  rm -f "migrations.json"
fi
npm i
npm run all || die "failed to migrate"
