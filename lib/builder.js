'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var FinalAction = require('./final_action')
  , mediaTypeRegistry = require('./media_type_registry')
  , Walker = require('./walker')
  , mediaTypes = require('./media_types');

var log = minilog('traverson');

function Builder(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  var adapter = this._createAdapter(this.mediaType);
  this.walker = new Walker(adapter);
  this.walker.request = this.request = standardRequest;
  this.walker.parseJson = JSON.parse;
  this.finalAction = new FinalAction(this.walker);
}

Builder.prototype._createAdapter = function(mediaType) {
  var AdapterType = mediaTypeRegistry.get(mediaType);
  if (!AdapterType) {
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
  log.debug('creating new ' + AdapterType.name);
  return new AdapterType(log);
};

/**
 * Returns a new builder instance which is basically a clone of this builder
 * instance. This allows you to initiate a new request but keeping all the setup
 * (start URL, template parameters, request options, body parser, ...).
 */
Builder.prototype.newRequest = function() {
  var clone = new Builder(this.mediaType);
  clone.from(this.walker.startUri);
  clone.withTemplateParameters(this.walker.templateParameters);
  clone.withRequestLibrary(this.walker.request);
  clone.parseResponseBodiesWith(this.walker.parseJson);
  clone.resolveRelative(this.walker.resolveRelative);
  return clone;
};

/**
 * Disables content negotiation and forces the use of a given media type.
 * The media type has to be registered at Traverson's media type registry
 * before via traverson.registerMediaType (except for media type
 * application/json, which is traverson.mediaTypes.JSON).
 */
Builder.prototype.setMediaType = function(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  this.walker.adapter = this._createAdapter(mediaType);
  this.walker.contentNegotiation = mediaType === mediaTypes.CONTENT_NEGOTIATION;
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON);
 */
Builder.prototype.json = function() {
  this.setMediaType(mediaTypes.JSON);
  return this;
};

/**
 * Shortcut for
 * setMediaType(traverson.mediaTypes.JSON_HAL);
 */
Builder.prototype.jsonHal = function() {
  this.setMediaType(mediaTypes.JSON_HAL);
  return this;
};

/**
 * Enables content negotiation (content negotiation is enabled by default, this
 * method can be used to enable it after a call to setMediaType disabled it).
 */
Builder.prototype.useContentNegotiation = function() {
  this.setMediaType(mediaTypes.CONTENT_NEGOTIATION);
  this.walker.contentNegotiation = true;
  return this;
};

/**
 * Set the root URL of the API, that is, where the link traversal begins.
 */
Builder.prototype.from = function(url) {
  this.walker.startUri = url;
  return this;
};

/**
 * Provides the list of link relations to follow
 */
Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0];
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments);
  }
  return this;
};

Builder.prototype.walk = Builder.prototype.follow;

/**
 * Provide template parameters for URI template substitution.
 */
Builder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters;
  return this;
};

/**
 * Provide options for HTTP requests (additional HTTP headers, for example).
 */
Builder.prototype.withRequestOptions = function(options) {
  this.walker.request = this.request = standardRequest.defaults(options);
  return this;
};

/**
 * Injects a custom request library. When using this method, you should not
 * call withRequestOptions but instead pre-configure the injected
 * request library instance before passing it to withRequestLibrary.
 */
Builder.prototype.withRequestLibrary = function(request) {
  this.walker.request = this.request = request;
  return this;
};

/**
 * Injects a custom JSON parser.
 */
Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.walker.parseJson = parser;
  return this;
};

/**
 * Switches URL resolution to relative (default is absolute).
 */
Builder.prototype.resolveRelative = function() {
  this.walker.resolveRelative = true;
  return this;
};

Builder.prototype.get = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.get(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getResource(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */
Builder.prototype.getUri = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getUri(nextStep, callback);
  });
};

Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.post,
      callback);
};

Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.put,
      callback);
};

Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.patch,
      callback);
};

Builder.prototype.delete = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.request.del,
      callback);
};

Builder.prototype.del = Builder.prototype.delete;

module.exports = Builder;
