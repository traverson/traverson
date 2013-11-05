'use strict';

requirejs.config({
  baseUrl: '..',
  paths: {
    // TODO Remove code duplication - same set up as in traverson.js
    // except for test libs

    // shims
    minilog: 'browser_lib/shim/log',
    request: 'browser_lib/shim/request',
    util: 'browser_lib/shim/node-util',

    // third party libs
    JSONPath: 'browser_lib/third-party/jsonpath',
    halbert: 'browser_lib/third-party/halbert',
    'underscore.string': 'browser_lib/third-party/underscore.string',
    'uri-template': 'browser_lib/third-party/uri-template',

    // test libs
    // we use most test libs directly out of the node_modules folder, even when
    // running in the browser, except for Sinon, for which the version on npm
    // does not work in the browser.
    mocha: 'node_modules/mocha/mocha',
    chai: 'node_modules/chai/chai',
    sinon: 'browser_test/lib/sinon',
    'sinon-chai': 'node_modules/sinon-chai/lib/sinon-chai'
  }
})

// General maintenance notice for tests:
// When running in the browser, chai and sinonChai return themselves in a
// RequireJS compatible way, thus they are listed in the require/define blocks
// as as function arguments. On the other hand, mocha and sinon do not return
// anything but register a global variable, thus we must not list them as
// function arguments, otherwise the global with the same name would be
// shadowed by the undefined function argument.

require(['mocha'], function() {
  mocha.setup('bdd')
  require([
    'test/json_get_resource',
    'test/json_requests',
    'test/json_hal',
    'test/localhost'
  ], function() {
    mocha.run()
  })
})
