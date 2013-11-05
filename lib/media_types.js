({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';
  return {
    JSON: 'application/json',
    JSON_HAL: 'application/hal+json'
  }
})
