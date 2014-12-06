'use strict';

module.exports = function(_contentType) {
  var contentType = _contentType || 'application/json';
  return function mockResponse(doc, httpStatus) {
    var response = {};
    response.body = JSON.stringify(doc);
    response.statusCode = httpStatus || 200;
    response.doc = doc;
    response.headers = {
      'content-type': contentType,
    };
    return response;
  };
};
