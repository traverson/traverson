'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , checkHttpStatus = require('./transforms/check_http_status')
  , abortTraversal = require('./abort_traversal')
  , getOptionsForStep = require('./transforms/get_options_for_step')
  , parse = require('./transforms/parse')
  , registerAbortListener = require('./abort_traversal').registerAbortListener
  , Walker = require('./walker');

var log = minilog('traverson');

function Actions() {
  this.walker = new Walker();
  this.walker.request = standardRequest;
}

/**
 * Starts the link traversal process and passes the last HTTP response to the
 * callback.
 */
Actions.prototype.get = function(walkState, callback) {
  walkState.callback =
    createWalkStateCallback(this.walker, walkState, afterGet, callback);
  this.walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGet(walker, ws, callback) {
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
Actions.prototype.getResource = function(walkState, callback) {
  var self = this;
  walkState.callback =
    createWalkStateCallback(this.walker, walkState, afterGetResource, callback);
  this.walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGetResource(walker, ws, callback) {
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
Actions.prototype.getUri = function(walkState, callback) {
  var self = this;
  walkState.callback =
    createWalkStateCallback(this.walker, walkState, afterGetUri, callback);
  this.walker.walk(walkState);
  return createTraversalHandle(walkState);
};

function afterGetUri(walker, ws, callback) {
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

function createWalkStateCallback(walker, walkState, fn, callback) {
  return function(err) {
    log.debug('walker.walk returned');
    if (err) {
      callback(err);
    } else {
      fn(walker, walkState, callback);
    }
  };
}

/**
 * Starts the link traversal process and sends an HTTP POST request with the
 * given body to the last URL. Passes the HTTP response of the POST request to
 * the callback.
 */
Actions.prototype.post = function(walkState, callback) {
  this.walkAndExecute(walkState,
      this.walker.request, this.walker.request.post, callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP PUT request with the
 * given body to the last URL. Passes the HTTP response of the PUT request to
 * the callback.
 */
Actions.prototype.put = function(walkState, callback) {
  this.walkAndExecute(walkState,
      this.walker.request, this.walker.request.put, callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP PATCH request with the
 * given body to the last URL. Passes the HTTP response of the PATCH request to
 * the callback.
 */
Actions.prototype.patch = function(walkState, callback) {
  this.walkAndExecute(walkState,
      this.walker.request, this.walker.request.patch, callback);
  return createTraversalHandle(walkState);
};

/**
 * Starts the link traversal process and sends an HTTP DELETE request to the
 * last URL. Passes the HTTP response of the DELETE request to the callback.
 */
Actions.prototype.delete = function(walkState, callback) {
  this.walkAndExecute(walkState,
      this.walker.request, this.walker.request.del, callback);
  return createTraversalHandle(walkState);
};

Actions.prototype.walkAndExecute = function(ws, request, method, callback) {
  var self = this;
  ws.callback = function(err) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err);
    }

    if (ws.aborted) {
      return abortTraversal.callCallbackOnAbort(ws);
    }

    log.debug('executing final request with step: ', ws.step);
    self.executeRequest(ws, request, method, callback);
  };

  this.walker.walk(ws);
};

Actions.prototype.executeRequest = function(ws, request, method, callback) {
  var self = this;

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
};

function createTraversalHandle(walkState) {
  return {
    abort: walkState.abortTraversal
  };
}

module.exports = Actions;
