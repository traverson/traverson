'use strict';
var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , detectContentType = require('./transforms/detect_content_type')
  , errorModule = require('./errors')
  , errors = errorModule.errors
  , createError = errorModule.createError
  , getOptionsForStep = require('./transforms/get_options_for_step');

var nextTickAvailable = process &&
  Object.hasOwnProperty.call(process, 'nextTick');

/**
 * Executes a HTTP GET request during the link traversal process.
 */
// This method is currently used for all intermediate GET requests during the
// link traversal process. Coincidentally, it is also used for the final request
// in a link traversal should this happen to be a GET request. Otherwise (POST/
// PUT/PATCH/DELETE), Traverson uses exectueHttpRequest.
exports.fetchResource = function fetchResource(t, callback) {
  log.debug('fetching resource for next step');
  if (t.step.url) {
    log.debug('fetching resource from', t.step.url);
    return executeHttpGet(t, callback);
  } else if (t.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('resource for next step has already been fetched, using ' +
      'embedded');
    
    if (nextTickAvailable) {
      return process.nextTick(function() {
        callback(null, t);
      });
    }
    return callback(null, t);
  } else {
    var error = createError('Can not process step.', errors.InvalidStateError);
    error.step = t.step;

    if (nextTickAvailable) {
      return process.nextTick(function() {
        callback(error, t);
      });
    }
    return callback(error, t);
  }
};

function executeHttpGet(t, callback) {
  var options = getOptionsForStep(t);
  log.debug('HTTP GET request to', t.step.url);
  log.debug('options', options);
  t.mostRecentHttpMethodName = 'GET';
  t.currentRequest =
    t.requestModuleInstance.get(t.step.url, options,
        function(err, response, body) {
    log.debug('HTTP GET request to', t.step.url, 'returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
     return callback(err, t);
    }
    log.debug('request to', t.step.url, 'finished without error (',
      response.statusCode, ')');

    if (!detectContentType(t, callback)) return;

    return callback(null, t);
  });
  abortTraversal.registerAbortListener(t, callback);
}

/**
 * Executes an arbitrary HTTP request.
 */
// This method is currently used for POST/PUT/PATCH/DELETE at the end of a link
// traversal process. If the link traversal process requires a GET as the last
// request, Traverson uses exectueHttpGet.
exports.executeHttpRequest =
    function(t, request, method, methodName, callback) {
  var requestOptions = getOptionsForStep(t);
  if (t.body !== null && typeof t.body !== 'undefined') {
    requestOptions.body = (t.rawPayload || requestOptions.jsonReplacer) ?
      t.body : JSON.stringify(t.body);
  }

  log.debug('HTTP', methodName, 'request to', t.step.url);
  log.debug('options', requestOptions);
  t.mostRecentHttpMethodName = methodName;
  t.currentRequest =
    method.call(request, t.step.url, requestOptions,
        function(err, response, body) {
    log.debug('HTTP', methodName, 'request to', t.step.url, 'returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
      return callback(err);
    }

    return callback(null, response);
  });
  abortTraversal.registerAbortListener(t, callback);
};
