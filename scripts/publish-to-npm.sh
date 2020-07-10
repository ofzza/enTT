#!/bin/bash
cd "$(cd -P -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)";

# Exit when any command fails
set -e

# Build library version
echo '';
echo '> Building latest library version ...';
tsc;
cp -f ../README.md ../dist;
cp -f ../CHANGELOG.md ../dist;
cp -f ../LICENSE ../dist;
cp -f ../package.json ../dist;

# Publish via NPM
echo '';
echo '> Publishing to NPM ...';
cd ../dist;
npm publish --access public
