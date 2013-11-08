({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define(['browser/lib/third-party/superagent'], function (superagent) {
  'use strict';

  function Request() {
    this.options = {}
  }

  Request.prototype.defaults = function(options) {
    var newRequest = new Request()
    newRequest.options = options
    return newRequest
  }

  Request.prototype.get = function(uri, callback) {
    setupRequest(superagent.get(uri), this.options)
      .end(function(response) {
      callback(null, map(response))
    })
  }

  Request.prototype.post = function(uri, options, callback) {
    setupRequest(superagent.post(uri), this.options, options)
      .end(function(response) {
      callback(null, map(response))
    })
  }

  Request.prototype.put = function(uri, options, callback) {
    setupRequest(superagent.put(uri), this.options, options)
      .end(function(response) {
      callback(null, map(response))
    })
  }

  Request.prototype.patch = function(uri, options, callback) {
    setupRequest(superagent.patch(uri), this.options, options)
      .end(function(response) {
      callback(null, map(response))
    })
  }

  Request.prototype.del = function(uri, options, callback) {
    setupRequest(superagent.del(uri), this.options)
      .end(function(response) {
      callback(null, map(response))
    })
  }

  function setupRequest(superagentRequest, options, bodyOptions) {
    var headers = options.headers
    if (headers != null) {
      superagentRequest = superagentRequest.set(options.headers)
    }
    if (bodyOptions != null) {
      var body = bodyOptions.body
      if (body != null) {
        superagentRequest = superagentRequest.send(body)
      }
    }
    return superagentRequest
  }

  // map XHR response object properties to Node.js request lib's response object
  // properties
  function map(response) {
    response.body = response.text
    response.statusCode = response.status
    return response
  }

  return new Request()
})
