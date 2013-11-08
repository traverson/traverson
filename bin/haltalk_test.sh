#!/usr/bin/env bash
traverson_bin_path=`dirname $0`
pushd $traverson_bin_path/.. > /dev/null
mocha --slow 7500 --timeout 10000 --reporter spec test/haltalk.js
popd > /dev/null
