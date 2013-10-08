'use strict';

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

RequestBuilder.prototype.getResource = function(callback) {
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters, callback)
}

RequestBuilder.prototype.get = function(callback) {
  var walker = createWalker(this.mediaType)
  if (!walker) {
    return mediaTypeError(callback, this.mediaType)
  }
  walker.walk(this.fromUri, this.linkArray, this.templateParameters, callback)
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
