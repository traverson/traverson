'use strict';

var minilog = require('minilog')
  , url = require('url')
  , checkHttpStatus = require('./transforms/check_http_status')
  , abortTraversal = require('./abort_traversal')
  , httpRequests = require('./http_requests')
  , parse = require('./transforms/parse')
  , resolveNextUrl = require('./transforms/resolve_next_url')
  , resolveUriTemplate = require('./transforms/resolve_uri_template')
  , switchToNextStep = require('./transforms/switch_to_next_step')
  , walker = require('./walker');

var log = minilog('traverson');

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
exports.get = function(t, callback) {
  t.callback =
    createWalkStateCallback(t, afterGet, callback);
  walker.walk(t);
  return createTraversalHandle(t);
};

function afterGet(t, callback) {
  if (t.continuation && t.step && t.step.response) {
    // follow() call without links after continue(). Actually, there is nothing
    // to do here since we should have fetched everything last time.
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    convertEmbeddedDocToResponse(t);
    return callback(null, t.step.response);
  }

  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned');
    if (err) {
      return callback(err, responseFromState(t), urlFromState(t));
    }
    convertEmbeddedDocToResponse(t);
    callback(null, t.step.response);
  });
}

function convertEmbeddedDocToResponse(t) {
  if (!t.step.response && t.step.doc) {
    log.debug('faking HTTP response for embedded resource');
    t.step.response = {
      statusCode: 200,
      body: JSON.stringify(t.step.doc),
      remark: 'This is not an actual HTTP response. The resource you ' +
        'requested was an embedded resource, so no HTTP request was ' +
        'made to acquire it.'
    };
  }
}

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
exports.getResource = function(t, callback) {
  t.callback =
    createWalkStateCallback(t, afterGetResource, callback);
  walker.walk(t);
  return createTraversalHandle(t);
};

function afterGetResource(t, callback) {
  if (t.continuation && t.step && t.step.response) {
    // follow() call without links after continue(). Actually, there is nothing
    // to do here since we should have fetched everything last time.
    log.debug('continuing from last traversal process (actions)');
    t.continuation = null;
    return callback(null, t.step.doc);
  }

  // TODO Remove duplication: This duplicates the fetchResource/checkHttpStatus/
  // parse sequence from the Walker's walk method.
  httpRequests.fetchResource(t, function(err, t) {
    log.debug('fetchResource returned.');
    if (err) {
      return callback(err, responseFromState(t), urlFromState(t));
    }
    if (t.step.doc) {
      // return an embedded doc immediately
      return callback(null, t.step.doc);
    }

    if (!checkHttpStatus(t)) return;
    if (!parse(t)) return;
    return callback(null, t.step.doc);
  });
}

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URL to the callback.
 */
exports.getUrl = function(t, callback) {
  t.callback =
    createWalkStateCallback(t, afterGetUrl, callback);
  walker.walk(t);
  return createTraversalHandle(t);
};

function afterGetUrl(t, callback) {
  log.debug('returning url');
  if (t.step.url) {
    return callback(null, t.step.url);
  } else if (t.step.doc &&
    // TODO actually this is very HAL specific :-/
    t.step.doc._links &&
    t.step.doc._links.self &&
    t.step.doc._links.self.href) {
    return callback(null, url.resolve(t.startUrl, t.step.doc._links.self.href));
  } else {
    return callback(new Error('You requested an URL but the last ' +
        'resource is an embedded resource and has no URL of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
}

function createWalkStateCallback(t, fn, callback) {
  return function(err) {
    log.debug('walker.walk returned');
    if (err) {
      callback(err);
    } else {
      fn(t, callback);
    }
  };
}

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
exports.post = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.post,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
exports.put = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.put,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
exports.patch = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.patch,
      callback);
  return createTraversalHandle(t);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
exports.delete = function(t, callback) {
  walkAndExecute(t,
      t.requestModuleInstance,
      t.requestModuleInstance.del,
      callback);
  return createTraversalHandle(t);
};

function walkAndExecute(t, request, method, callback) {
  t.callback = function(err) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err);
    }

    if (t.aborted) {
      return abortTraversal.callCallbackOnAbort(t);
    }

    log.debug('executing final request with step: ', t.step);
    httpRequests.executeHttpRequest(t, request, method, callback);
  };

  walker.walk(t);
}

function createTraversalHandle(t) {
  return {
    abort: t.abortTraversal
  };
}

function responseFromState(t) {
  return t ? (t.step ? t.step.response : null) : null;
}

function urlFromState(t) {
  return t ? (t.step ? t.step.url : null) : null;
}
