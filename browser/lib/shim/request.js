'use strict';

var superagent = require('../third-party/superagent');

function Request() {
  this.options = {};
}

Request.prototype.defaults = function(options) {
  var newRequest = new Request();
  newRequest.options = options;
  return newRequest;
};

Request.prototype.get = function(uri, callback) {
  mapRequest(superagent.get(uri), this.options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.post = function(uri, options, callback) {
  mapRequest(superagent.post(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.put = function(uri, options, callback) {
  mapRequest(superagent.put(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.patch = function(uri, options, callback) {
  mapRequest(superagent.patch(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.del = function(uri, options, callback) {
  mapRequest(superagent.del(uri), this.options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

function mapRequest(superagentRequest, options, bodyOptions) {
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options, bodyOptions);
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

function mapBody(superagentRequest, options, bodyOptions) {
  if (bodyOptions != null) {
    var body = bodyOptions.body;
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

module.exports = new Request();
