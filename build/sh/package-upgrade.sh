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

echo "--- saving package.json before npm-upgrade ---"
PKG_JSON_BACKUP=$(mktemp)
cp package.json "$PKG_JSON_BACKUP"

npx npm-upgrade || die "npm-upgrade failed"

if ! diff -q package.json "$PKG_JSON_BACKUP" > /dev/null 2>&1; then
  echo ""
  echo "--- package.json changes from npm-upgrade ---"
  diff --unified=0 "$PKG_JSON_BACKUP" package.json || true
  echo "--------------------------------------------"
  echo ""
  if confirm "Accept these dependency changes?" Y; then
    rm -f "$PKG_JSON_BACKUP"
  else
    echo "--- reverting package.json changes ---"
    cp "$PKG_JSON_BACKUP" package.json
    rm -f "$PKG_JSON_BACKUP"
    echo "package.json reverted. Aborting."
    exit 1
  fi
else
  rm -f "$PKG_JSON_BACKUP"
  echo "--- no changes from npm-upgrade ---"
fi

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
