({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';

  return function mockResponse(doc, httpStatus) {
    var response = {}
    response.body = JSON.stringify(doc)
    response.statusCode = httpStatus || 200
    response.doc = doc
    return response
  }
})
