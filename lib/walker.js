'use strict';

var minilog = require('minilog')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , util = require('util');

var checkHttpStatus = require('./transforms/check_http_status')
  , mediaTypeRegistry = require('./media_type_registry')
  , mergeRecursive = require('./merge_recursive')
  , NegotiationAdapter = require('./negotiation_adapter')
  , postProcessStep = require('./transforms/post_process_step');

var log = minilog('traverson');

/**
 * Creates a new Walker with the given media type adapter.
 */
function Walker(adapter) {
  this.adapter = adapter || new NegotiationAdapter(log);
  this.contentNegotiation = true;
  this.requestOptions = {};
  this.parseJson = JSON.parse;
  this.aborted = false;
  this.callbackHasBeenCalledAfterAbort = false;
}

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(walkState, callback) {
  walkState.step.uri = this.resolveUriTemplate(walkState);

  // starts the link rel walking process
  log.debug('starting to follow links');
  this._executeNextStep(walkState);
};

/* jshint maxcomplexity: 8 */
Walker.prototype._executeNextStep = function(ws) {
  var self = this;
  if (ws.step.index < ws.links.length && !self.aborted) {

    // Trigger execution of next step. In most cases that is an HTTP get to
    // the next URI.
    self.process(ws, function(err, newWs) {
      // fall back to last ws in case callback was called from a place where ws
      // is out of scope
      ws = newWs || ws;

      if (err) {
        if (!err.aborted) {
          log.debug('error while processing step ', ws.step);
          log.error(err);
        }
        return ws.callback(err);
      }
      ws.lastStep = null;
      log.debug('successfully processed step');

      // check HTTP status code
      if (!checkHttpStatus(ws)) return;

      // parse JSON from last response
      var doc = self.parse(ws, ws.callback);
      if (!doc) return;

      // extract next link to follow from last response
      var link = ws.links[ws.step.index];
      log.debug('next link: ' + link);

      // save last step before overwriting it with the next step (required for
      // relative URL resolution, where we need the last URL)
      ws.lastStep = ws.step;
      ws.step = self.findNextStep(doc, link, ws.callback);
      log.debug('next step: ', ws.step);
      if (!ws.step) return;
      ws.step.index = ws.lastStep.index + 1;

      // URI template has to be resolved before post processing the URL,
      // because we do url.resolve with it (in json_hal) and this would URI-
      // encode curly braces.
      if (ws.step.uri) {
        // next link found in last response, might be a URI template
        ws.step.uri = self.resolveUriTemplate(ws);
      }

      // turn relative URI into absolute URI or whatever else is required
      postProcessStep(ws);
      log.debug('next step: ', ws.step);

      // follow next link
      self._executeNextStep(ws);
    });
  } else if (self.aborted) {
    // the link traversal has been aborted in mid-flight
    log.debug('link traversal aborted');
    if (!self.callbackHasBeenCalledAfterAbort) {
      log.debug('calling callback with error');
      self.callbackHasBeenCalledAfterAbort = true;
      return ws.callback(self.abortError(), ws);
    }
  } else {
    // link array is exhausted, we are done and return the last response
    // and uri to the callback the client passed into the walk method.
    log.debug('link array exhausted, calling callback');
    return ws.callback(null, ws);
  }
};

Walker.prototype.process = function(ws, callback) {
  log.debug('processing next step, ws: ', ws);
  if (ws.step.uri) {
    return this.get(ws, callback);
  } else if (ws.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    return callback(null, ws);
  } else {
    var error = new Error('Can not process step');
    error.step = ws.step;
    return callback(error);
  }
};

Walker.prototype.get = function(ws, callback) {
  log.debug('request to ' + ws.step.uri);
  var self = this;
  var options = self.requestOptions;
  if (util.isArray(self.requestOptions)) {
    options = self.requestOptions[ws.step.index] || {};
  }
  log.debug('options: ', options);
  self.currentRequest =
    self.request.get(ws.step.uri,
                     options,
                     function(err, response, body) {
    log.debug('request.get returned');

    // workaround for cases where response body is empty but body comes in as as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    ws.step.response = response;

    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      // probably fixed with next release of superagent:
      // https://github.com/visionmedia/superagent/issues/376
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.callbackHasBeenCalledAfterAbort) {
          self.callbackHasBeenCalledAfterAbort = true;
          return callback(self.abortError(), ws);
      } else {
        return callback(err, ws);
      }
    }
    log.debug('request to ' + ws.step.uri + ' finished without error (' +
      response.statusCode + ')');

    if (!self._detectContentType(ws, callback)) return;

    return callback(null, ws);
  });
  self._registerAbortListener(callback);
};

Walker.prototype._detectContentType = function(ws, callback) {
  if (this.contentNegotiation &&
      ws.step.response &&
      ws.step.response.headers &&
      ws.step.response.headers['content-type']) {
    var contentType = ws.step.response.headers['content-type'].split(/[; ]/)[0];
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      callback(new Error('Unknown content type for content ' +
          'negotiation: ' + contentType));
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    this.adapter = new AdapterType(log);
  }
  return true;
};

Walker.prototype._registerAbortListener = function(callback) {
  var self = this;
  if (this.currentRequest) {
    this.currentRequest.on('abort', function(a, b, c) {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(self.abortError());
      }
    });
  }
};

Walker.prototype.parse = function(ws, callback) {
  if (ws.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return ws.step.doc;
  }

  try {
    return this.parseJson(ws.step.response.body);
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(ws.step.uri, ws.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    callback(error);
    return null;
  }
};

Walker.prototype.findNextStep = function(doc, link, callback) {
  try {
    return this.adapter.findNextStep(doc, link);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    callback(e);
    return null;
  }
};

Walker.prototype.resolveUriTemplate = function(ws) {
  var templateParams = ws.templateParameters;
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[ws.step.index];
  }
  templateParams = templateParams || {};

  if (_s.contains(ws.step.uri, '{')) {
    log.debug('resolving URI template');
    var template = uriTemplate.parse(ws.step.uri);
    var resolved = template.expand(templateParams);
    log.debug('resolved to ', resolved);
    return resolved;
  } else {
    return ws.step.uri;
  }
};

Walker.prototype.abort = function() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.uri = uri;
  error.body = body;
  return error;
}

Walker.prototype.abortError = function() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};

module.exports = Walker;
