({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';

  return {
    isArray: function(o) {
      if (o == null) {
        return false
      }
      return Object.prototype.toString.call(o) === '[object Array]'
    }
  }
})
