#!/usr/bin/env bash
traverson_bin_path=`dirname $0`
pushd $traverson_bin_path/.. > /dev/null
browserify --entry traverson --outfile browser/dist/traverson.js --standalone traverson
popd > /dev/null
