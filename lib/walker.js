'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , checkHttpStatus = require('./transforms/check_http_status')
  , httpRequests = require('./httpRequests')
  , parse = require('./transforms/parse')
  , resolveNextUrl = require('./transforms/resolve_next_url')
  , resolveUriTemplate = require('./transforms/resolve_uri_template')
  , switchToNextStep = require('./transforms/switch_to_next_step');

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
exports.walk = function(walkState, callback) {
  if (!resolveUriTemplate(walkState)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  processStep(walkState);
};

function processStep(ws) {
  if (ws.step.index < ws.links.length && !ws.aborted) {
    executeNextStep(ws);
  } else if (ws.aborted) {
    return abortTraversal.callCallbackOnAbort(ws);
  } else {
    // link array is exhausted, we are done and return the last response
    // and uri to the callback the client passed into the walk method.
    log.debug('link array exhausted, calling callback');
    return ws.callback();
  }
}

function executeNextStep(ws) {
  // Trigger execution of next step. In most cases that is an HTTP get to
  // the next URI.
  httpRequests.fetchResource(ws, function(err) {
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', ws.step);
        log.error(err);
      }
      return ws.callback(err);
    }

    if (!applyTransforms(ws)) return;

    // follow next link
    processStep(ws);
  });
}

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
