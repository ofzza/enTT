#!/bin/bash
DIR="$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)";
cd $DIR

# Exit when any command fails
set -e
function cleanup {
  set +e
}
trap cleanup EXIT

# Delete old docs
rm -rf $DIR/../docs
mkdir $DIR/../docs

# Build library and showcase projects
(cd $DIR/.. && prettier --write . && tsc --build --clean && tsc --project tsconfig.lib.json && ng build --project showcase --configuration production --output-path ./docs --base-href /entt/)

# Rebuild docs
cp $DIR/../docs/index.html $DIR/../docs/404.html
