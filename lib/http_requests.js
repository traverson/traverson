'use strict';
var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , detectContentType = require('./transforms/detect_content_type')
  , getOptionsForStep = require('./transforms/get_options_for_step');

/**
 * Executes a HTTP GET request during the link traversal process.
 */
// This method is currently used for all intermediate GET requests during of the
// link traversal process. Coincidentally, it is also used for the final request
// in a link traversal should this happen to be a GET request. Otherwise (POST/
// PUT/PATCH/DELETE), Traverson uses exectueHttpRequest.
exports.fetchResource = function fetchResource(ws, callback) {
  log.debug('fetching resource for step: ', ws.step);
  if (ws.step.uri) {
    return executeHttpGet(ws, callback);
  } else if (ws.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    // Um, we release zalgo here. Problem?
    return callback(null, ws);
  } else {
    // More zalgo...
    var error = new Error('Can not process step');
    error.step = ws.step;
    return callback(error);
  }
};

function executeHttpGet(ws, callback) {
  var options = getOptionsForStep(ws);
  log.debug('GET request to ', ws.step.uri);
  log.debug('options ', options);
  ws.currentRequest =
    ws.requestModuleInstance.get(ws.step.uri, options,
        function(err, response, body) {
    log.debug('HTTP request to ' + ws.step.uri + ' returned');
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
}

/**
 * Executes an arbitrary HTTP request.
 */
// This method is currently used for POST/PUT/PATCH/DELETE at the end of a link
// traversal process. If the link traversal process requires a GET as the last
// request, Traverson uses exectueHttpGet.
exports.executeHttpRequest = function(ws, request, method, callback) {
  var requestOptions = getOptionsForStep(ws);
  if (ws.body) {
    requestOptions.body = JSON.stringify(ws.body);
  }

  log.debug(method.name + 'request to ', ws.step.uri);
  log.debug('options ', requestOptions);
  ws.currentRequest =
    method.call(request, ws.step.uri, requestOptions, function(err, response) {
    log.debug('HTTP request to ' + ws.step.uri + ' returned');
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
  abortTraversal.registerAbortListener(ws, callback);
};
