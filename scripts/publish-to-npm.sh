#!/bin/bash
DIR="$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)";
cd $DIR

# Exit when any command fails
set -e
function cleanup {
  set +e
}
trap cleanup EXIT

# Build library version
echo '';
echo '> Building latest library version ...';
tsc;

echo '';
echo '> Running tests ...';
(cd $DIR/../; npx jasmine --config=./jasmine.json)

echo '';
echo '> Publishing resources...';
cp -f $DIR/../README.md $DIR/../dist;
cp -f $DIR/../CHANGELOG.md $DIR/../dist;
cp -f $DIR/../LICENSE $DIR/../dist;
cp -f $DIR/../package.json $DIR/../dist;

# Publish via NPM
echo '';
echo '> Publishing to NPM ...';
(cd $DIR/../dist; npm publish --access public)
