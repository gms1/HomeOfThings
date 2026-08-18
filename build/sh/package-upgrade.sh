#!/bin/bash
BN=$(basename "$0")
DN=$(dirname "$0")
. "${DN}/common"
#--------------------------------------------------------------

git pull --rebase --autostash || die "git pull failed"

REPO_WAS_CLEAN=true
if [ -n "$(git status --porcelain)" ]; then
  REPO_WAS_CLEAN=false
fi

npx nx migrate latest --include=all || die "nx migrate failed"
npm install || die "npm install failed after nx migration"
[ ! -f migrations.json ] || npx nx migrate --run-migrations || die "nx migration failed"
rm -f migrations.json

npm run all || die "npm run script 'all' failed after nx migration"

npx npm-upgrade || die "npm-upgrade failed"
npm run format:write || die "failed to format"

npm install || die "npm install failed after npm-upgrade"
if [ -n "$(git status --porcelain package-lock.json)" ]; then
  npm audit fix
fi

npm run all || die "npm run script 'all' failed after npm-upgrade"

if [ -n "$(git status --porcelain package-lock.json)" ]; then
  if [ "$REPO_WAS_CLEAN" = true ]; then
    git add package.json package-lock.json
    git commit -m 'chore: upgraded dependencies'
    git push || die "git push failed"
  else
    echo "WARNING: package-lock.json has been changed due to upgrading, but the repo was not clean before the upgrade. Please review and commit manually."
  fi
fi

succeeded
