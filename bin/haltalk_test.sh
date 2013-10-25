#!/usr/bin/env bash
traverson_bin_path=`dirname $0`
pushd $traverson_bin_path/.. > /dev/null
mocha --slow 7500 --timeout 10000 --reporter spec haltalk_tests/
#mocha --slow 7500 --timeout 10000 --reporter spec --watch haltalk_tests/
popd > /dev/null
