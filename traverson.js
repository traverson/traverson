// set up RequireJS aliases when running in browser
if (typeof require.config === 'function') {
  require.config({
    paths: {
      // shims
      minilog: 'browser/lib/shim/log',
      request: 'browser/lib/shim/request',
      util: 'browser/lib/shim/node-util',

      // third party libs
      JSONPath: 'browser/lib/third-party/jsonpath',
      halbert: 'browser/lib/third-party/halbert',
      'underscore.string': 'browser/lib/third-party/underscore.string',
      'uri-template': 'browser/lib/third-party/uri-template'
    }
  })
}

// boilerplate to make it work in Node.js and in the browser via RequireJS
({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([
  'minilog',
  './lib/media_types',
  './lib/walker_builder'
], function (
  minilog,
  mediaTypes,
  WalkerBuilder
) {
  'use strict';

  // activate this line to enable logging
  // require('minilog').enable();

  return {
    json: {
      from: function(uri) {
        return {
          newRequest: function() {
            return new WalkerBuilder(mediaTypes.JSON, uri)
          }
        }
      }
    },
    jsonHal: {
      from: function(uri) {
        return {
          newRequest: function() {
            return new WalkerBuilder(mediaTypes.JSON_HAL, uri)
          }
        }
      }
    }
  }
})
