#!/usr/bin/env bash
traverson_bin_path=`dirname $0`
pushd $traverson_bin_path/../node_modules/halbert > /dev/null
# TODO we should really exclude lodash in the long runt to reduce the file size,
# but for now, we just ignore this browserify halbert completely.
# we could also shim halbert by hyperagent like we shim mikeal's request by with
# superagent.
browserify index.js -s halbert -o halbert.js
popd > /dev/null
