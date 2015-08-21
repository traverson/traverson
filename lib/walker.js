'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , apply = require('./transforms/apply')
  , httpRequests = require('./http_requests')
  , isContinuation = require('./is_continuation')
  , resolveUriTemplate = require('./transforms/resolve_uri_template');

var transforms = [
  require('./transforms/reset_last_step'),
  // check HTTP status code
  require('./transforms/check_http_status'),
  // parse JSON from last response
  require('./transforms/parse'),
  // retrieve next link and switch to next step
  require('./transforms/switch_to_next_step'),
  // URI template has to be resolved before post processing the URL,
  // because we do url.resolve with it (in json_hal) and this would URL-
  // encode curly braces.
  resolveUriTemplate,
  require('./transforms/resolve_next_url'),
  require('./transforms/reset_continuation'),
];


/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URL. On reaching this, it calls
 * the given callback with the last resulting step.
 */
exports.walk = function(t, callback) {
  // even the root URL might be a template
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
  if (!isContinuation(t)) {
    executeNextStepViaHttp(t);
  } else {
    executeNextStepForContinuation(t);
  }
}

function executeNextStepViaHttp(t) {
  httpRequests.fetchResource(t, function(err) {
    log.debug('fetchResource returned.');
    if (err) {
      if (!err.aborted) {
        log.debug('error while processing step ', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    onResourceReceived(t);
  });
}

/*
 * This is a continuation of an earlier traversal process.
 * We need to shortcut to the next step (without executing the final HTTP
 * request of the last traversal again.
 */
function executeNextStepForContinuation(t) {
  log.debug('continuing from last traversal process (walker)');
  process.nextTick(function() { // de-zalgo continuations
    onResourceReceived(t);
  });
}

function onResourceReceived(t) {
  if (!applyTransforms(t)) return;

  // call processStep recursively again to follow next link
  processStep(t);
}

function applyTransforms(t) {
  log.debug('successfully processed step');
  return apply(transforms, t);
}
