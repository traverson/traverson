'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
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
function Walker() {}

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
  if (ws.step.index < ws.links.length && !ws.aborted) {
    this._executeNextStep(ws);
  } else if (ws.aborted) {
    return abortTraversal.callCallbackOnAbort(ws);
  } else {
    // link array is exhausted, we are done and return the last response
    // and uri to the callback the client passed into the walk method.
    log.debug('link array exhausted, calling callback');
    return ws.callback();
  }
};

Walker.prototype._executeNextStep = function(ws) {
  var self = this;
  // Trigger execution of next step. In most cases that is an HTTP get to
  // the next URI.
  self.fetchResource(ws, function(err) {
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
  var options = getOptionsForStep(ws);
  log.debug('request to ', ws.step.uri);
  log.debug('options ', options);
  var self = this;
  ws.currentRequest =
    self.request.get(ws.step.uri,
                     options,
                     function(err, response, body) {
    log.debug('request.get returned');
    ws.currentRequest = null;

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
          !ws.callbackHasBeenCalledAfterAbort) {
        return abortTraversal.callCallbackOnAbort(ws);
      } else {
        return callback(err, ws);
      }
    }
    log.debug('request to ' + ws.step.uri + ' finished without error (' +
      response.statusCode + ')');

    if (!detectContentType(ws, callback)) return;

    return callback(null, ws);
  });
  abortTraversal.registerAbortListener(ws, callback);
};

module.exports = Walker;
