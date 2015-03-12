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
exports.fetchResource = function fetchResource(t, callback) {
  log.debug('fetching resource for step: ', t.step);
  if (t.step.uri) {
    return executeHttpGet(t, callback);
  } else if (t.step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    // Um, we release zalgo here. Problem?
    return callback(null, t);
  } else {
    // More zalgo...
    var error = new Error('Can not process step');
    error.step = t.step;
    return callback(error);
  }
};

function executeHttpGet(t, callback) {
  var options = getOptionsForStep(t);
  log.debug('GET request to ', t.step.uri);
  log.debug('options ', options);
  t.currentRequest =
    t.requestModuleInstance.get(t.step.uri, options,
        function(err, response, body) {
    log.debug('HTTP request to ' + t.step.uri + ' returned');
    t.currentRequest = null;

    // workaround for cases where response body is empty but body comes in as as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    t.step.response = response;

    if (err) {
     return callback(err, t);
    }
    log.debug('request to ' + t.step.uri + ' finished without error (' +
      response.statusCode + ')');

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
exports.executeHttpRequest = function(t, request, method, callback) {
  var requestOptions = getOptionsForStep(t);
  if (t.body) {
    requestOptions.body = JSON.stringify(t.body);
  }

  log.debug(method.name + 'request to ', t.step.uri);
  log.debug('options ', requestOptions);
  t.currentRequest =
    method.call(request, t.step.uri, requestOptions, function(err, response) {
    log.debug('HTTP request to ' + t.step.uri + ' returned');
    t.currentRequest = null;
    if (err) {
      return callback(err, response, t.step.uri);
    }
    return callback(null, response, t.step.uri);
  });
  abortTraversal.registerAbortListener(t, callback);
};
