'use strict';

module.exports = function mockResponse(doc) {
  var response = {}
  response.body = JSON.stringify(doc)
  response.statusCode = 200
  response.doc = doc
  return response
}
