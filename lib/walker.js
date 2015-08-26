'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , applyTransforms = require('./transforms/apply_transforms')
  , isContinuation = require('./is_continuation')
  , resolveUriTemplate = require('./transforms/resolve_uri_template');

var transforms = [
  require('./transforms/fetch_resource'),
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
exports.walk = function(t, transformsAfterLastStep, callback) {
  // even the root URL might be a template, so we apply the resolveUriTemplate
  // once before starting the walk.
  if (!resolveUriTemplate(t)) return;

  // starts the link rel walking process
  log.debug('starting to follow links');
  transformsAfterLastStep = transformsAfterLastStep || [];
  t.callback = callback;
  processStep(t, transformsAfterLastStep);
};

function processStep(t, transformsAfterLastStep) {
  log.debug('processing next step');
  if (moreLinksToFollow(t) && !isAborted(t)) {
    applyTransforms(transforms, t, function(t) {
      log.debug('successfully processed step');
      // call processStep recursively again to follow next link
      processStep(t, transformsAfterLastStep);
    });
  } else if (isAborted(t)) {
    return abortTraversal.callCallbackOnAbort(t);
  } else {
    // link array is exhausted, we are done and return the last response
    // and URL to the callback the client passed into the walk method.
    log.debug('link array exhausted');

    applyTransforms(transformsAfterLastStep, t, function(t) {
      return t.callback();
    });
  }
}

function moreLinksToFollow(t) {
  return t.step.index < t.links.length;
}

function isAborted(t) {
  return t.aborted;
}
