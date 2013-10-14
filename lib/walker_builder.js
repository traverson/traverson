'use strict';

var log = require('minilog')('traverson');
var standardRequest = require('request')
var util = require('util')

var JsonWalker = require('./json_walker')
var JsonHalWalker = require('./json_hal_walker')
var mediaTypes = require('./media_types')

function WalkerBuilder(mediaType, startUri) {
  this.walker = this.createWalker(mediaType)
  this.walker.startUri = startUri
  this.walker.request = this.request = standardRequest
}

WalkerBuilder.prototype.createWalker = function(mediaType) {
  switch (mediaType) {
  case mediaTypes.JSON:
    return new JsonWalker()
  case mediaTypes.JSON_HAL:
    return new JsonHalWalker()
  default:
    throw new Error('Unknown or unsupported media type: ' + mediaType)
  }
}

WalkerBuilder.prototype.walk = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0]
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments)
  }
  return this
}

WalkerBuilder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters
  return this
}

WalkerBuilder.prototype.withRequestOptions = function(options) {
  this.walker.request = this.request = standardRequest.defaults(options)
  return this
}

WalkerBuilder.prototype.get = function(callback) {
  var self = this
  this.walker.walk(function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    self.walker.get(result.nextUri, callback)
  })
}

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
WalkerBuilder.prototype.getResource = function(callback) {
  var self = this
  this.walker.walk(function(err, result) {
    // This duplicates the get/parse step from JsonWalker's walk method.
    // TODO Remove duplication
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    self.walker.get(result.nextUri, function(err, response, uri) {
      if (err) { return callback(err, response, uri) }
      try {
        return callback(null, self.walker.parse(response, uri))
      } catch (e) {
        return callback(e, e.doc)
      }
    })
  })
}

/*
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */
WalkerBuilder.prototype.getUri = function(callback) {
  this.walker.walk(function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    callback(null, result.nextUri)
  })
}

WalkerBuilder.prototype.post = function(body, callback) {
  this.walkAndExecute(body, this.request.post, callback)
}

WalkerBuilder.prototype.put = function(body, callback) {
  this.walkAndExecute(body, this.request.put, callback)
}

WalkerBuilder.prototype.patch = function(body, callback) {
  this.walkAndExecute(body, this.request.patch, callback)
}

WalkerBuilder.prototype.delete = function(callback) {
  this.walkAndExecute(null, this.request.del, callback)
}

WalkerBuilder.prototype.walkAndExecute = function(body, method, callback) {
  var self = this
  this.walker.walk(function(err, result) {
    log.debug('walker returned')
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    log.debug('executing last request to ' + result.nextUri)
    self.executeRequest(result.nextUri, method, body, callback)
  })
}

WalkerBuilder.prototype.executeRequest = function(uri, method, body,
    callback) {
  log.debug('request to ' + uri +
      (body ? ' with body ' + JSON.stringify(body) : ' without body'))
  method(uri, { body: JSON.stringify(body) }, function(err, response) {
    log.debug('request to ' + uri + ' succeeded')
    if (err) { return callback(err, null) }
    return callback(null, response, uri)
  })
}


module.exports = WalkerBuilder
