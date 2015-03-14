'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , checkHttpStatus = require('./transforms/check_http_status')
  , httpRequests = require('./http_requests')
  , parse = require('./transforms/parse')
  , resolveNextUrl = require('./transforms/resolve_next_url')
  , resolveUriTemplate = require('./transforms/resolve_uri_template')
  , switchToNextStep = require('./transforms/switch_to_next_step');

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URL. On reaching this, it calls
 * the given callback with the last resulting step.
 */
exports.walk = function(t, callback) {
  if (!resolveUriTemplate(t)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  processStep(t);
};

function processStep(t) {
  if (t.step.index < t.links.length && !t.aborted) {
    executeNextStep(t);
  } else if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  } else {
    // link array is exhausted, we are done and return the last response
    // and URL to the callback the client passed into the walk method.
    log.debug('link array exhausted, calling callback');
    return t.callback();
  }
}

function executeNextStep(t) {
  // Trigger execution of next step. In most cases that is an HTTP get to
  // the next URL.
  httpRequests.fetchResource(t, function(err) {
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }

    if (!applyTransforms(t)) return;

    // follow next link
    processStep(t);
  });
}

function applyTransforms(t) {
  t.lastStep = null;
  log.debug('successfully processed step');

  // check HTTP status code
  if (!checkHttpStatus(t)) return false;

  // parse JSON from last response
  if (!parse(t)) return false;

  // retrieve next link and switch to next step
  if (!switchToNextStep(t)) return false;

  // URI template has to be resolved before post processing the URL,
  // because we do url.resolve with it (in json_hal) and this would URL-
  // encode curly braces.
  if (!resolveUriTemplate(t)) return false;

  if (!resolveNextUrl(t)) return false;

  log.debug('next step: ', t.step);
  return true;
}
