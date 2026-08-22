#!/bin/bash
BN=$(basename "$0")
DN=$(dirname "$0")
. "${DN}/common"
#--------------------------------------------------------------

REPO_WAS_CLEAN=true
if [ -n "$(git status --porcelain)" ]; then
  REPO_WAS_CLEAN=false
fi

# Build so version-bump tool is available
npm run build || die "build failed"

# Get list of publishable projects with version-bump target (skip private and unpublished packages)
ALL_PROJECTS=$(npx nx show projects --with-target version-bump 2>/dev/null)
PROJECTS=""
for P in $ALL_PROJECTS; do
  P_ROOT=$(npx nx show project "$P" --json 2>/dev/null | jq -r '.root')
  if [ -f "$P_ROOT/package.json" ] && jq -e '.private' "$P_ROOT/package.json" > /dev/null 2>&1; then
    echo "Skipping $P (private package)"
  elif [ -f "$P_ROOT/package.json" ] && [ "$(jq -r '.version' "$P_ROOT/package.json" 2>/dev/null)" = "0.0.0" ]; then
    echo "Skipping $P (never published, version 0.0.0)"
  else
    PROJECTS="$PROJECTS $P"
  fi
done

BUMPED=""
CHANGED=true

# Phase 1: Detect projects with source or package.json changes and bump them
for PROJECT in $PROJECTS; do
  PROJECT_ROOT=$(npx nx show project "$PROJECT" --json 2>/dev/null | jq -r '.root')

  # Find last release commit for this project
  LAST_RELEASE=$(git log --max-count=1 --grep="^release: ${PROJECT}" --format="%H" -- "$PROJECT_ROOT" 2>/dev/null)

  # Check for changes in src/ or package.json since last release
  if [ -n "$LAST_RELEASE" ]; then
    CHANGES=$(git diff "$LAST_RELEASE" -- "$PROJECT_ROOT/src" "$PROJECT_ROOT/package.json")
  else
    # No release commit found — check if there are any commits touching these paths
    CHANGES=$(git log --oneline -- "$PROJECT_ROOT/src" "$PROJECT_ROOT/package.json" 2>/dev/null | head -1)
  fi

  if [ -n "$CHANGES" ]; then
    echo "Bumping $PROJECT (changes detected)"
    npx nx run "$PROJECT:version-bump" --ver increment || die "version-bump failed for $PROJECT"
    BUMPED="$BUMPED $PROJECT"
  fi
done

# Phase 2: Propagate — bump projects whose dependencies were bumped
while [ "$CHANGED" = true ]; do
  CHANGED=false
  for PROJECT in $PROJECTS; do
    # Skip already bumped projects
    case " $BUMPED " in
      *" $PROJECT "*) continue ;;
    esac

    PROJECT_ROOT=$(npx nx show project "$PROJECT" --json 2>/dev/null | jq -r '.root')
    PKG_JSON="${PROJECT_ROOT}/package.json"

    # Skip if no package.json
    [ -f "$PKG_JSON" ] || continue

    # Check if any dependency was bumped
    for BUMPED_PROJ in $BUMPED; do
      BUMPED_ROOT=$(npx nx show project "$BUMPED_PROJ" --json 2>/dev/null | jq -r '.root')
      BUMPED_PKG_NAME=$(jq -r '.name' "$BUMPED_ROOT/package.json" 2>/dev/null)

      # Check if this project depends on the bumped package
      if jq -e ".dependencies[\"$BUMPED_PKG_NAME\"] // .peerDependencies[\"$BUMPED_PKG_NAME\"]" "$PKG_JSON" > /dev/null 2>&1; then
        echo "Bumping $PROJECT (dependency $BUMPED_PKG_NAME was bumped)"
        npx nx run "$PROJECT:version-bump" --ver increment || die "version-bump failed for $PROJECT"
        BUMPED="$BUMPED $PROJECT"
        CHANGED=true
        break
      fi
    done
  done
done

if [ -z "$BUMPED" ]; then
  echo "No packages need version bumping"
  succeeded
fi

# Phase 3: Write changelogs to CHANGELOG.md files
npm run changelogs:write || die "changelogs:write failed"

# Phase 4: Validate
npm run all || die "npm run all failed"

# Phase 5: Commit
if [ -n "$(git status --porcelain)" ]; then
  if [ "$REPO_WAS_CLEAN" = true ]; then
    git add -A
    # Build commit message with release: line per project for change detection
    COMMIT_MSG="release: bumped versions and updated changelogs"
    for PROJ in $BUMPED; do
      PROJ_ROOT=$(npx nx show project "$PROJ" --json 2>/dev/null | jq -r '.root')
      PROJ_VER=$(jq -r '.version' "$PROJ_ROOT/package.json" 2>/dev/null)
      COMMIT_MSG="${COMMIT_MSG}

release: ${PROJ} version ${PROJ_VER}"
    done
    git commit -m "$COMMIT_MSG"
  else
    echo "WARNING: versions/changelogs have changed, but the repo was not clean before the version bump. Please review and commit manually."
  fi
fi

succeeded
