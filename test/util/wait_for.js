({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';

  return function(test, onSuccess, polling) {
    polling = polling || 10
    var handle = setInterval(function() {
      if (test()) {
        clearInterval(handle)
        onSuccess()
      }
    }, polling)
  }
})
