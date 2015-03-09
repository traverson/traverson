'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , checkHttpStatus = require('./transforms/check_http_status')
  , detectContentType = require('./transforms/detect_content_type')
  , getOptionsForStep = require('./transforms/get_options_for_step')
  , parse = require('./transforms/parse')
  , resolveNextUrl = require('./transforms/resolve_next_url')
  , resolveUriTemplate = require('./transforms/resolve_uri_template')
  , switchToNextStep = require('./transforms/switch_to_next_step');

/**
 * Creates a new Walker.
 */
function Walker() {
  this.aborted = false;
  this.callbackHasBeenCalledAfterAbort = false;
}

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(walkState, callback) {
  if (!resolveUriTemplate(walkState)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  this._processStep(walkState);
};

Walker.prototype._processStep = function(ws) {
  var self = this;
  if (ws.step.index < ws.links.length && !self.aborted) {
    this._executeNextStep(ws);
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

Walker.prototype._executeNextStep = function(ws) {
  var self = this;
  // Trigger execution of next step. In most cases that is an HTTP get to
  // the next URI.
  self.fetchResource(ws, function(err, newWs) {
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

    if (!applyTransforms(ws)) return;

    // follow next link
    self._processStep(ws);
  });
};

function applyTransforms(ws) {
  ws.lastStep = null;
  log.debug('successfully processed step');

  // check HTTP status code
  if (!checkHttpStatus(ws)) return false;

  // parse JSON from last response
  if (!parse(ws)) return false;

  // retrieve next link and switch to next step
  if (!switchToNextStep(ws)) return false;

  // URI template has to be resolved before post processing the URL,
  // because we do url.resolve with it (in json_hal) and this would URI-
  // encode curly braces.
  if (!resolveUriTemplate(ws)) return false;

  // turn relative URI into absolute URI or whatever else is required
  if (!resolveNextUrl(ws)) return false;

  log.debug('next step: ', ws.step);
  return true;
}

Walker.prototype.fetchResource = function(ws, callback) {
  log.debug('fetching resource for step: ', ws.step);
  if (ws.step.uri) {
    return this.executeHttpGet(ws, callback);
  } else if (ws.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    // Um, we release zalgo here. Problem?
    return callback(null, ws);
  } else {
    var error = new Error('Can not process step');
    error.step = ws.step;
    return callback(error);
  }
};

Walker.prototype.executeHttpGet = function(ws, callback) {
  log.debug('request to ' + ws.step.uri);
  var self = this;
  self.currentRequest =
    self.request.get(ws.step.uri,
                     getOptionsForStep(ws),
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

    if (!detectContentType(ws, callback)) return;

    return callback(null, ws);
  });
  self._registerAbortListener(callback);
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

Walker.prototype.abort = function() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

Walker.prototype.abortError = function() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};

module.exports = Walker;
