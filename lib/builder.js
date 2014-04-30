'use strict';

var minilog = require('minilog')
var standardRequest = require('request')
var util = require('util')

var FinalAction = require('./final_action')
var JsonWalker = require('./json_walker')
var JsonHalWalker = require('./json_hal_walker')
var mediaTypes = require('./media_types')

var log = minilog('traverson')

function Builder(mediaType, startUri) {
  this.walker = this.createWalker(mediaType)
  this.walker.startUri = startUri
  this.walker.request = this.request = standardRequest
  this.finalAction = new FinalAction(this.walker)
}

Builder.prototype.createWalker = function(mediaType) {
  switch (mediaType) {
  case mediaTypes.JSON:
    log.debug('creating new JsonWalker')
    return new JsonWalker()
  case mediaTypes.JSON_HAL:
    log.debug('creating new JsonHalWalker')
    return new JsonHalWalker()
  default:
    throw new Error('Unknown or unsupported media type: ' + mediaType)
  }
}

Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0]
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments)
  }
  return this
}

Builder.prototype.walk = Builder.prototype.follow

Builder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters
  return this
}

Builder.prototype.withRequestOptions = function(options) {
  this.walker.request = this.request = standardRequest.defaults(options)
  return this
}

Builder.prototype.resolveRelative = function() {
  this.walker.resolveRelative = true;
  return this
}

Builder.prototype.get = function(callback) {
  var self = this
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned')
    if (err) {
      return callback(err, lastStep.response, lastStep.uri)
    }
    self.finalAction.get(nextStep, callback)
  })
}

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned')
    if (err) {
      return callback(err, lastStep.response, lastStep.uri)
    }
    self.finalAction.getResource(nextStep, callback)
  })
}

/*
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */

Builder.prototype.getUri = function(callback) {
  var self = this
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned')
    if (err) {
      return callback(err, lastStep.response, lastStep.uri)
    }
    self.finalAction.getUri(nextStep, callback)
  })
}

Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.post,
      callback)
}

Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.put,
      callback)
}

Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.patch,
      callback)
}

Builder.prototype.del = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.request.del,
      callback)
}

module.exports = Builder
