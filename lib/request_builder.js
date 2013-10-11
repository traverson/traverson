'use strict';

var log = require('minilog')('request_builder');
var request = require('request')
var util = require('util')

var JsonWalker = require('./json_walker')
var mediaTypes = require('./media_types')

function RequestBuilder(mediaType, fromUri) {
  this.mediaType = mediaType
  this.fromUri = fromUri
}

RequestBuilder.prototype.walk = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.linkArray = arguments[0]
  } else {
    this.linkArray = Array.prototype.slice.apply(arguments)
  }
  return this
}

RequestBuilder.prototype.withTemplateParameters = function(parameters) {
  this.templateParameters = parameters
  return this
}

RequestBuilder.prototype.get = function(callback) {
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
RequestBuilder.prototype.getResource = function(callback) {
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

RequestBuilder.prototype.post = function(body, callback) {
  var self = this
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    self.doPost(result.nextUri, body, callback)
  })
}

RequestBuilder.prototype.put = function(body, callback) {
  var self = this
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters,
      function(err, result) {
    if (err) { return callback(err, result.lastResponse, result.lastUri ) }
    self.doPut(result.nextUri, body, callback)
  })
}

RequestBuilder.prototype.doPost = function(uri, body, callback) {
  log.debug('post to ' + uri + ' with ' + body)
  request.post(uri, { body: body }, function(err, response) {
    log.debug('post to ' + uri + ' with ' + body + ' succeeded')
    if (err) { return callback(err, null) }
    return callback(null, response, uri)
  })
}

RequestBuilder.prototype.doPut = function(uri, body, callback) {
  log.debug('put to ' + uri + ' with ' + body)
  request.put(uri, { body: body }, function(err, response) {
    log.debug('post to ' + uri + ' with ' + body + ' succeeded')
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

module.exports = RequestBuilder
