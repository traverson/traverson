'use strict';

var log = require('minilog')('traverson');
var standardRequest = require('request')
var util = require('util')

var JsonWalker = require('./json_walker')
var mediaTypes = require('./media_types')

function WalkerBuilder(mediaType, startUri) {
  this.request = standardRequest
  this.mediaType = mediaType
  this.startUri = startUri
}

WalkerBuilder.prototype.walk = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.links = arguments[0]
  } else {
    this.links = Array.prototype.slice.apply(arguments)
  }
  return this
}

WalkerBuilder.prototype.withTemplateParameters = function(parameters) {
  this.templateParameters = parameters
  return this
}

WalkerBuilder.prototype.get = function(callback) {
  var walker = this.createWalker()
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    walker.get(result.nextUri, callback)
  })
}

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
WalkerBuilder.prototype.getResource = function(callback) {
  var walker = this.createWalker()
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(function(err, result) {
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
  var walker = this.createWalker()
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(function(err, result) {
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

WalkerBuilder.prototype.createWalker = function() {
  var walker
  switch (this.mediaType) {
  case mediaTypes.JSON:
    walker = new JsonWalker()
    break;
  default:
    return null
  }
  walker.startUri = this.startUri
  walker.links =  this.links
  walker.templateParameters = this.templateParameters
  walker.request = this.request
  return walker
}


WalkerBuilder.prototype.walkAndExecute = function(body, method, callback) {
  var self = this
  var walker = this.createWalker()
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(function(err, result) {
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

function mediaTypeError(callback, mediaType) {
  callback(new Error('Unknown or unsupported media type: ' + mediaType))
}

module.exports = WalkerBuilder
