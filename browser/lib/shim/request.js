'use strict';

var superagent = require('superagent');

function Request() {
}

Request.prototype.get = function(uri, options, callback) {
  mapRequest(superagent.get(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.post = function(uri, options, callback) {
  mapRequest(superagent.post(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.put = function(uri, options, callback) {
  mapRequest(superagent.put(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.patch = function(uri, options, callback) {
  mapRequest(superagent.patch(uri), options)
    .end(handleResponse(callback));
};

Request.prototype.del = function(uri, options, callback) {
  mapRequest(superagent.del(uri), options)
    .end(handleResponse(callback));
};

function mapRequest(superagentRequest, options) {
  options = options || {};
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options);
  return superagentRequest;
}

function mapQuery(superagentRequest, options) {
  var qs = options.qs;
  if (qs != null) {
    superagentRequest = superagentRequest.query(qs);
  }
}

function mapHeaders(superagentRequest, options) {
  var headers = options.headers;
  if (headers != null) {
    superagentRequest = superagentRequest.set(headers);
  }
}

function mapAuth(superagentRequest, options) {
  var auth = options.auth;
  if (auth != null) {
    superagentRequest = superagentRequest.auth(
      auth.user || auth.username,
      auth.pass || auth.password
    );
  }
}

function mapBody(superagentRequest, options) {
  if (options != null) {
    var body = options.body;
    if (body != null) {
      superagentRequest = superagentRequest.send(body);
    }
  }
}

// map XHR response object properties to Node.js request lib's response object
// properties
function mapResponse(response) {
  response.body = response.text;
  response.statusCode = response.status;
  return response;
}

function handleResponse(callback) {
  return function(error, response) {
    if (error) {
      return callback(error);
    } else {
      callback(null, mapResponse(response));
    }
  };
}

module.exports = new Request();
