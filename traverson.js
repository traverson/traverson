// set up RequireJS aliases when running in browser
if (typeof require.config === 'function') {
  require.config({
    paths: {
      // shims
      minilog: 'lib/dependencies/browser/log-shim',
      request: 'lib/dependencies/browser/request-shim',
      util: 'lib/dependencies/browser/node-util-shim',

      // third party libs
      JSONPath: 'lib/dependencies/browser/vendor/jsonpath',
      halbert: 'lib/dependencies/browser/vendor/halbert',
      'underscore.string': 'lib/dependencies/browser/vendor/underscore.string',
      'uri-template': 'lib/dependencies/browser/vendor/uri-template'
    }
  })
}

({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
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
