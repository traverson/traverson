'use strict';

define(function(require, exports, module) {

  var superagent = require('./vendor/superagent')

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

  module.exports = new Request()
})
