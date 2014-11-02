#!/usr/bin/env bash
set -e
STATUS=$(git status --porcelain 2>/dev/null)
BRANCH_NAME=$(git symbolic-ref HEAD 2>/dev/null)
BRANCH_NAME=${BRANCH_NAME##refs/heads/}

if [ -n "$STATUS" ]
then
        echo "Dirty working tree; commit your changes then run me again." >&2
        exit 1
fi

if [ -z "$MAIN_BRANCH"  ]; then
        MAIN_BRANCH="master"
fi

if [ "$BRANCH_NAME" != $MAIN_BRANCH ] 
then
        echo "Refusing to update documentation from non-main branch:" >&2
        echo "expect branch $BRANCH_NAME == $MAIN_BRANCH" >&2
        echo "If you want to view your rendered documentation run: " >&2
        echo "" >&2
        echo "    harp server docs " >&2
        echo "" >&2
        exit 1
fi

# The docs should include the version when they build. At current it's just in
# the commit message.
export RIVETS_VERSION=$( \
        grep 'version' package.json | \
        awk -F'["]' '{print $4}' \
)


git checkout gh-pages 2>/dev/null 1>/dev/null
git checkout $MAIN_BRANCH -- docs 2>/dev/null
rm -rf _harp
mv docs _harp
harp compile _harp .

git add -A 2>/dev/null 1>/dev/null

set +e
git commit -a -m "Generate documentation for v$RIVETS_VERSION" 2>/dev/null 1>/dev/null

if [ $? -eq 0 ]
then
        echo "documentation updated, publish via:" >&2
        echo "    git push origin gh-pages:gh-pages" >&2
else
        echo "No changes to publish" >&2
fi
set -e

git checkout $MAIN_BRANCH 2>/dev/null 1>/dev/null


