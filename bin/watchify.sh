#!/usr/bin/env bash
set -e

# This script assumes that watchify is installed globally. To do that execute
# npm install -g watchify

# Three watchify processes are started in the background. Use
# pkill -f watchify or pkill -f "node.*watchify"
# to stop them.

bin_path=`dirname $0`
pushd $bin_path/.. > /dev/null

watchify \
  --entry traverson.js \
  --outfile browser/dist/traverson.js \
  --standalone traverson \
  --debug \
  --verbose \
  &

watchify \
  --entry traverson.js \
  --outfile browser/dist/traverson.external.js \
  --require ./traverson \
  --debug \
  --verbose \
  &

watchify \
  --entry test/browser_suite.js \
  --outfile browser/test/browserified_tests.js \
  --external ./traverson.js \
  --debug \
  --verbose \
  &

popd > /dev/null
