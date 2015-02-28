'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var FinalAction = require('./final_action')
  , mediaTypeRegistry = require('./media_type_registry')
  , Walker = require('./walker')
  , mediaTypes = require('./media_types')
  , mergeRecursive = require('./merge_recursive');

var log = minilog('traverson');

// Maintenance notice: The constructor is usually called without arguments, the
// mediaType parameter is only used when cloning the request builder in
// newRequest().
function Builder(mediaType) {
  this.mediaType = mediaType || mediaTypes.CONTENT_NEGOTIATION;
  var adapter = this._createAdapter(this.mediaType);
  this.walker = new Walker(adapter);
  this.request = this.walker.request = standardRequest;
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
  var clone = new Builder(this.getMediaType());
  clone.walker.contentNegotiation = this.doesContentNegotiation();
  clone.from(this.getFrom());
  clone.withTemplateParameters(this.getTemplateParameters());
  clone.withRequestOptions(this.getRequestOptions());
  clone.withRequestLibrary(this.getRequestLibrary());
  clone.parseResponseBodiesWith(this.getJsonParser());
  clone.resolveRelative(this.doesResolveRelative());
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
  this.walker.contentNegotiation =
    (mediaType === mediaTypes.CONTENT_NEGOTIATION);
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

/**
 * Alias for follow.
 */
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
 * This function resets any request options, that had been set previously, that
 * is, multiple calls to withRequestOptions are not cumulative. Use
 * addRequestOptions to add request options in a cumulative way.
 */
Builder.prototype.withRequestOptions = function(options) {
  this.walker.requestOptions = options;
  this.walker.request = this.request = standardRequest.defaults(options);
  return this;
};

/**
 * Adds options for HTTP requests (additional HTTP headers, for example) on top
 * of existing options, if any. To reset all request options and set new ones
 * without keeping the old ones, you can use withRequestOptions.
 */
Builder.prototype.addRequestOptions = function(options) {
  mergeRecursive(this.getRequestOptions(), options);
  this.withRequestOptions(this.getRequestOptions());
  return this;
};

/**
 * Injects a custom request library. When using this method, you should not
 * call withRequestOptions or addRequestOptions but instead pre-configure the
 * injected request library instance before passing it to withRequestLibrary.
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
 * Switches URL resolution to relative (default is absolute) or back to
 * absolute.
 *
 * If the method is called without arguments (or the first argument is undefined
 * or null), URL resolution is switched to relative, otherwise the argument is
 * interpreted as a boolean flag. If it is a truthy value, URL resolution is
 * switched to relative, if it is a falsy value, URL resolution is switched to
 * absolute.
 */
Builder.prototype.resolveRelative = function(flag) {
  if (typeof flag === 'undefined' || flag === null) {
    flag = true;
  }
  this.walker.resolveRelative = !!flag;
  return this;
};

/**
 * Returns the current media type. If no media type is enforced but content type
 * detection is used, the string `content-negotiation` is returned.
 */
Builder.prototype.getMediaType = function() {
  return this.mediaType;
};

/**
 * Returns the URL set by the from(url) method, that is, the root URL of the
 * API.
 */
Builder.prototype.getFrom = function() {
  return this.walker.startUri;
};

/**
 * Returns the template parameters set by the withTemplateParameters.
 */
Builder.prototype.getTemplateParameters = function() {
  return this.walker.templateParameters;
};

/**
 * Returns the request options set by the withRequestOptions or
 * addRequestOptions.
 */
Builder.prototype.getRequestOptions = function() {
  return this.walker.requestOptions;
};

/**
 * Returns the custom request library instance set by withRequestLibrary or the
 * standard request library instance, if a custom one has not been set.
 */
Builder.prototype.getRequestLibrary = function() {
  return this.walker.request;
};

/**
 * Returns the custom JSON parser function set by parseResponseBodiesWith or the
 * standard parser function, if a custom one has not been set.
 */
Builder.prototype.getJsonParser = function() {
  return this.walker.parseJson;
};

/**
 * Returns the flag controlling if URLs are resolved relative or absolute.
 * A return value of true means that URLs are resolved relative, false means
 * absolute.
 */
Builder.prototype.doesResolveRelative = function() {
  return this.walker.resolveRelative;
};

/**
 * Returns true if content negotiation is enabled and false if a particular
 * media type is forced.
 */
Builder.prototype.doesContentNegotiation = function() {
  return this.walker.contentNegotiation;
};

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
Builder.prototype.get = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.get(nextStep, callback);
  });
};

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.getResource(nextStep, callback);
  });
};

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */
Builder.prototype.getUri = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }
    self.finalAction.getUri(nextStep, callback);
  });
};

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.post,
      callback);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.put,
      callback);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.patch,
      callback);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
Builder.prototype.delete = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.request.del,
      callback);
};

/**
 * Alias for delete.
 */
Builder.prototype.del = Builder.prototype.delete;

module.exports = Builder;
