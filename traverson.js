// set up RequireJS aliases when running in browser
if (typeof require.config === 'function') {
  require.config({
    paths: {
      JSONPath: 'lib/dependencies/browser/vendor/jsonpath',
      halbert: 'lib/dependencies/browser/vendor/halbert',
      minilog: 'lib/dependencies/browser/minilog',
      request: 'lib/dependencies/browser/request',
      'underscore.string': 'lib/dependencies/browser/vendor/underscore.string',
      'uri-template': 'lib/dependencies/browser/vendor/uri-template',
      util: 'lib/dependencies/browser/util'
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
