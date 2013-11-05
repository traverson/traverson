({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([
  './walker'
], function (
  Walker
) {
  'use strict';

  function JsonWalker() { }

  JsonWalker.prototype = new Walker()

  return JsonWalker
})
