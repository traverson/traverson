({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define(['lib/dependencies/browser/vendor/superagent'], function (superagent) {
  'use strict';

  function Request() {
    this.options = {}
  }

  Request.prototype.defaults = function(options) {
    this.options = options
    return this
  }

  Request.prototype.get = function(uri, callback) {
    setHeaders(superagent.get(uri), this.options)
      .end(function(response) {
      response.body = response.text
      callback(null, response)
    })
  }

  Request.prototype.post = function(uri, body, callback) {
    setHeaders(superagent.put(uri), this.options)
      .send(body)
      .end(function(response) {
      response.body = response.text
      callback(null, response)
    })
  }

  Request.prototype.put = function(uri, body, callback) {
    setHeaders(superagent.put(uri), this.options)
      .send(body)
      .end(function(response) {
      response.body = response.text
      callback(null, response)
    })
  }

  Request.prototype.patch = function(uri, body, callback) {
    setHeaders(superagent.patch(uri), this.options)
      .send(body)
      .end(function(response) {
      response.body = response.text
      callback(null, response)
    })
  }

  Request.prototype.del = function(uri, callback) {
    setHeaders(superagent.del(uri), this.options)
      .end(function(response) {
      response.body = response.text
      callback(null, response)
    })
  }

  function setHeaders(superagentRequest, options) {
    var headers = options.headers
    if (headers) {
      return superagentRequest.set(options.headers)
    }
    return superagentRequest
  }

  return Request
})
