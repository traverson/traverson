'use strict';

module.exports = function mockResponse(doc, httpStatus) {
  var response = {};
  response.body = JSON.stringify(doc);
  response.statusCode = httpStatus || 200;
  response.doc = doc;
  return response;
};
