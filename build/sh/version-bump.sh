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

GRAPH_FILE="${WORKSPACE_DIR}/.nx/workspace-data/project-graph.json"
if [ ! -f "$GRAPH_FILE" ]; then
  die "project graph not found at $GRAPH_FILE (run 'npx nx reset' to generate it)"
fi

# Get list of publishable projects with version-bump target (skip private and unpublished packages)
ALL_PROJECTS=$(npx nx show projects --with-target version-bump 2>/dev/null)
PROJECTS=""
for P in $ALL_PROJECTS; do
  P_ROOT=$(jq -r ".nodes[\"$P\"].data.root" "$GRAPH_FILE" 2>/dev/null)
  P_PKG="${WORKSPACE_DIR}/${P_ROOT}/package.json"
  if [ -f "$P_PKG" ] && jq -e '.private' "$P_PKG" > /dev/null 2>&1; then
    echo "Skipping $P (private package)"
  elif [ -f "$P_PKG" ] && [ "$(jq -r '.version' "$P_PKG" 2>/dev/null)" = "0.0.0" ]; then
    echo "Skipping $P (never published, version 0.0.0)"
  else
    PROJECTS="$PROJECTS $P"
  fi
done

# Build topological order using Kahn's algorithm (dependencies/leaves first)
# This ensures that when a project is version-bumped, all its internal
# dependencies already have their new versions, eliminating the need for
# a separate propagation phase.
declare -A IN_DEGREE
declare -A DEPENDENTS

for P in $PROJECTS; do
  IN_DEGREE[$P]=0
done

for P in $PROJECTS; do
  DEPS=$(jq -r ".dependencies[\"$P\"] // [] | .[] | select(.target | startswith(\"npm:\") | not) | .target" "$GRAPH_FILE" 2>/dev/null)
  for DEP in $DEPS; do
    # Only count dependencies that are publishable projects in our list
    case " $PROJECTS " in
      *" $DEP "*)
        IN_DEGREE[$P]=$((${IN_DEGREE[$P]} + 1))
        DEPENDENTS[$DEP]="${DEPENDENTS[$DEP]} $P"
        ;;
    esac
  done
done

# Seed queue with projects that have no internal dependencies (leaves)
QUEUE=""
for P in $PROJECTS; do
  if [ ${IN_DEGREE[$P]} -eq 0 ]; then
    QUEUE="$QUEUE $P"
  fi
done

SORTED_PROJECTS=""
while [ -n "$QUEUE" ]; do
  # Pop first project from queue
  set -- $QUEUE
  P=$1
  shift
  QUEUE="$*"

  SORTED_PROJECTS="$SORTED_PROJECTS $P"

  # Decrement in-degree of projects that depend on this one
  for DEP_OF in ${DEPENDENTS[$P]}; do
    IN_DEGREE[$DEP_OF]=$((${IN_DEGREE[$DEP_OF]} - 1))
    if [ ${IN_DEGREE[$DEP_OF]} -eq 0 ]; then
      QUEUE="$QUEUE $DEP_OF"
    fi
  done
done

# Check for circular dependencies (any project with remaining in-degree > 0)
for P in $PROJECTS; do
  if [ ${IN_DEGREE[$P]} -gt 0 ]; then
    die "circular dependency detected involving $P"
  fi
done

echo "Processing order:$SORTED_PROJECTS"

# Process projects in topological order (dependencies first)
BUMPED=""

for PROJECT in $SORTED_PROJECTS; do
  PROJECT_ROOT=$(jq -r ".nodes[\"$PROJECT\"].data.root" "$GRAPH_FILE" 2>/dev/null)
  PROJECT_FULL_ROOT="${WORKSPACE_DIR}/${PROJECT_ROOT}"

  # Check if any internal dependency was bumped
  DEP_BUMPED=false
  DEPS=$(jq -r ".dependencies[\"$PROJECT\"] // [] | .[] | select(.target | startswith(\"npm:\") | not) | .target" "$GRAPH_FILE" 2>/dev/null)
  for DEP in $DEPS; do
    case " $BUMPED " in
      *" $DEP "*) DEP_BUMPED=true; break ;;
    esac
  done

  # Find last release commit for this project
  LAST_RELEASE=$(git log --max-count=1 --grep="^release: ${PROJECT}" --format="%H" -- "$PROJECT_FULL_ROOT" 2>/dev/null)

  # Check for changes in src/ or package.json since last release
  HAS_CHANGES=false
  if [ -n "$LAST_RELEASE" ]; then
    CHANGES=$(git diff "$LAST_RELEASE" -- "$PROJECT_FULL_ROOT/src" "$PROJECT_FULL_ROOT/package.json")
  else
    # No release commit found — check if there are any commits touching these paths
    CHANGES=$(git log --oneline -- "$PROJECT_FULL_ROOT/src" "$PROJECT_FULL_ROOT/package.json" 2>/dev/null | head -1)
  fi
  [ -n "$CHANGES" ] && HAS_CHANGES=true

  if [ "$HAS_CHANGES" = true ] || [ "$DEP_BUMPED" = true ]; then
    if [ "$HAS_CHANGES" = true ]; then
      echo "Bumping $PROJECT (changes detected)"
    else
      echo "Bumping $PROJECT (dependency bumped)"
    fi
    npx nx run "$PROJECT:version-bump" --ver increment || die "version-bump failed for $PROJECT"
    BUMPED="$BUMPED $PROJECT"
  else
    echo "Skipping $PROJECT (no changes, no bumped dependencies)"
  fi
done

if [ -z "$BUMPED" ]; then
  echo "No packages need version bumping"
  succeeded
fi

# Write changelogs to CHANGELOG.md files
npm run changelogs:write || die "changelogs:write failed"

# Validate
npm run all || die "npm run all failed"

# Commit
if [ -n "$(git status --porcelain)" ]; then
  if [ "$REPO_WAS_CLEAN" = true ]; then
    git add -A
    COMMIT_MSG="release: bumped versions and updated changelogs"
    for PROJ in $BUMPED; do
      PROJ_ROOT=$(jq -r ".nodes[\"$PROJ\"].data.root" "$GRAPH_FILE" 2>/dev/null)
      PROJ_VER=$(jq -r '.version' "${WORKSPACE_DIR}/${PROJ_ROOT}/package.json" 2>/dev/null)
      COMMIT_MSG="${COMMIT_MSG}

release: ${PROJ} version ${PROJ_VER}"
    done
    git commit -m "$COMMIT_MSG"
  else
    echo "WARNING: versions/changelogs have changed, but the repo was not clean before the version bump. Please review and commit manually."
  fi
fi

succeeded
