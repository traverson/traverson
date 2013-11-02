// set up RequireJS aliases when running in browser
if (typeof require.config === 'function') {
  require.config({
    paths: {
      JSONPath: 'lib/dependencies/browser/vendor/jsonpath',
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
}).define([ './lib/media_types', './lib/walker_builder' ],
  function (mediaTypes, WalkerBuilder) {
  'use strict';

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
