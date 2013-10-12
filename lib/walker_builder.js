'use strict';

var log = require('minilog')('walker_builder');
var request = require('request')
var util = require('util')

var JsonWalker = require('./json_walker')
var mediaTypes = require('./media_types')

function WalkerBuilder(mediaType, fromUri) {
  this.mediaType = mediaType
  this.fromUri = fromUri
}

WalkerBuilder.prototype.walk = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.linkArray = arguments[0]
  } else {
    this.linkArray = Array.prototype.slice.apply(arguments)
  }
  return this
}

WalkerBuilder.prototype.withTemplateParameters = function(parameters) {
  this.templateParameters = parameters
  return this
}

WalkerBuilder.prototype.get = function(callback) {
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    walker.get(result.nextUri, callback)
  })
}

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
WalkerBuilder.prototype.getResource = function(callback) {
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
    // This duplicates the get/parse step from JsonWalker's walk method.
    // TODO Remove duplication
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    walker.get(result.nextUri, function(err, response, uri) {
      if (err) { return callback(err, response, uri) }
      try {
        return callback(null, walker.parse(response, uri))
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
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    callback(null, result.nextUri)
  })
}

WalkerBuilder.prototype.post = function(body, callback) {
  this.walkAndExecute(body, request.post, callback)
}

WalkerBuilder.prototype.put = function(body, callback) {
  this.walkAndExecute(body, request.put, callback)
}

WalkerBuilder.prototype.patch = function(body, callback) {
  this.walkAndExecute(body, request.patch, callback)
}

WalkerBuilder.prototype.delete = function(callback) {
  this.walkAndExecute(null, request.del, callback)
}

WalkerBuilder.prototype.walkAndExecute = function(body, method, callback) {
  var self = this
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
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

function createWalker(mediaType) {
  switch (mediaType) {
  case mediaTypes.JSON:
    return new JsonWalker()
    break;
  default:
    return null
  }
}

function mediaTypeError(callback, mediaType) {
  callback(new Error('Unknown or unsupported media type: ' + mediaType))
}

module.exports = WalkerBuilder
