#!/usr/bin/env bash
set -e
BRANCH_NAME=$(git symbolic-ref HEAD 2>/dev/null)
BRANCH_NAME=${BRANCH_NAME##refs/heads/}

if [ -z "$MAIN_BRANCH"  ]; then
        MAIN_BRANCH="master"
fi

if [ "$BRANCH_NAME" != $MAIN_BRANCH ] 
then
        echo "Refusing to update documentation from non-master branch:"
        echo "expect branch $BRANCH_NAME == $MAIN_BRANCH"
        echo "If you want to view your rendered documentation run: "
        echo ""
        echo "    harp server docs "
        echo ""
        exit 1
fi

# Not sure what to do with this at current, but it should get displayed in the
# documentation someplace, so I thought I'd put it in the env...
export RIVETS_VERSION=$( \
        grep 'version' package.json | \
        awk -F'["]' '{print $4}' \
)


cp -r docs .git
echo "copying docs to gh-pages"
git checkout gh-pages
echo "updating documentation"
rm -rf _harp
mv docs _harp
echo "recompiling"
harp compile _harp docs

echo "committing changes"
git add -A
git commit -a -m "generated documentation for $RIVETS_VERSION"
echo "When you are ready to publish:"
echo "     git push origin gh-pages"
exit 0

