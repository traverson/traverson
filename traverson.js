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
