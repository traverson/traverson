'use strict';

var minilog = require('minilog')
  , checkHttpStatus = require('./transforms/check_http_status')
  , abortTraversal = require('./abort_traversal')
  , getOptionsForStep = require('./transforms/get_options_for_step')
  , parse = require('./transforms/parse')
  , registerAbortListener = require('./abort_traversal').registerAbortListener
  , walker = require('./walker');

var log = minilog('traverson');

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
exports.get = function(walkState, callback) {
  walkState.callback =
    createWalkStateCallback(walkState, afterGet, callback);
  walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGet(ws, callback) {
  log.debug('next step: ', ws.step);
  /* jshint maxcomplexity: 7 */
  walker.fetchResource(ws, function(err, ws) {
    log.debug('walker.fetchResource returned');
    if (err) {
      return callback(err,
        ws ? (ws.step ? ws.step.response : null) : null,
        ws ? (ws.step ? ws.step.uri : null) : null);
    }
    if (!ws.step.response && ws.step.doc) {
      log.debug('faking HTTP response for embedded resource');
      ws.step.response = {
        statusCode: 200,
        body: JSON.stringify(ws.step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      };
    }
    callback(null, ws.step.response);
  });
}

/**
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
exports.getResource = function(walkState, callback) {
  walkState.callback =
    createWalkStateCallback(walkState, afterGetResource, callback);
  walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGetResource(ws, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  log.debug('next step: ', ws.step);

  /* jshint maxcomplexity: 9 */
  walker.fetchResource(ws, function(err, ws) {
    log.debug('walker.fetchResource returned.');
    if (err) {
      return callback(err,
        ws ? (ws.step ? ws.step.response : null) : null,
        ws ? (ws.step ? ws.step.uri : null) : null);
    }
    if (ws.step.doc) {
      // return an embedded doc immediately
      return callback(null, ws.step.doc);
    }

    if (!checkHttpStatus(ws)) return;
    if (!parse(ws)) return;
    return callback(null, ws.step.doc);
  });
}

/**
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */
exports.getUri = function(walkState, callback) {
  walkState.callback =
    createWalkStateCallback(walkState, afterGetUri, callback);
  walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGetUri(ws, callback) {
  log.debug('returning uri');
  if (ws.step.uri) {
    return callback(null, ws.step.uri);
  } else if (ws.step.doc &&
    // TODO actually this is very HAL specific :-/
    ws.step.doc._links &&
    ws.step.doc._links.self &&
    ws.step.doc._links.self.href) {
    return callback(null, ws.startUri + ws.step.doc._links.self.href);
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
}

function createWalkStateCallback(walkState, fn, callback) {
  return function(err) {
    log.debug('walker.walk returned');
    if (err) {
      callback(err);
    } else {
      fn(walkState, callback);
    }
  };
}

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
exports.post = function(walkState, callback) {
  walkAndExecute(walkState,
      walkState.requestModuleInstance,
      walkState.requestModuleInstance.post,
      callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
exports.put = function(walkState, callback) {
  walkAndExecute(walkState,
      walkState.requestModuleInstance,
      walkState.requestModuleInstance.put,
      callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
exports.patch = function(walkState, callback) {
  walkAndExecute(walkState,
      walkState.requestModuleInstance,
      walkState.requestModuleInstance.patch,
      callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
exports.delete = function(walkState, callback) {
  walkAndExecute(walkState,
      walkState.requestModuleInstance,
      walkState.requestModuleInstance.del,
      callback);
  return createTraversalHandle(walkState);
};

function walkAndExecute(ws, request, method, callback) {
  ws.callback = function(err) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err);
    }

    if (ws.aborted) {
      return abortTraversal.callCallbackOnAbort(ws);
    }

    log.debug('executing final request with step: ', ws.step);
    executeRequest(ws, request, method, callback);
  };

  walker.walk(ws);
}

function executeRequest(ws, request, method, callback) {
  var requestOptions = getOptionsForStep(ws);
  if (ws.body) {
    requestOptions.body = JSON.stringify(ws.body);
  }

  log.debug('request to ', ws.step.uri);
  log.debug('options ', requestOptions);
  ws.currentRequest =
    method.call(request, ws.step.uri, requestOptions, function(err, response) {
    log.debug('request to ' + ws.step.uri + ' succeeded');
    ws.currentRequest = null;
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      // probably fixed with next release of superagent:
      // https://github.com/visionmedia/superagent/issues/376
      if (err.message &&
          err.message === 'timeout of undefinedms exceeded' &&
          !ws.callbackHasBeenCalledAfterAbort) {
          return abortTraversal.callCallbackOnAbort(ws);
      } else {
        return callback(err, response, ws.step.uri);
      }
    }
    return callback(null, response, ws.step.uri);
  });
  registerAbortListener(ws, callback);
}

function createTraversalHandle(walkState) {
  return {
    abort: walkState.abortTraversal
  };
}
