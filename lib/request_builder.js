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
  var walker
  switch (this.mediaType) {
  case mediaTypes.JSON:
    walker = new JsonWalker()
    break;
  default:
    return callback(new Error('Unknown media type: ' + this.mediaType))
  }

  walker.walk(this.fromUri, this.linkArray, this.templateParameters, callback)
}

module.exports = RequestBuilder
