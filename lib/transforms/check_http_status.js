'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , errorModule = require('../errors')
  , errors = errorModule.errors
  , createError = errorModule.createError
  , isContinuation = require('../is_continuation');

module.exports = function checkHttpStatus(t) {
  // this step is ommitted for continuations
  if (isContinuation(t)) {
    return true;
  }

  log.debug('checking http status');
  if (!t.step.response && t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('found embedded document, assuming no HTTP request has been ' +
        'made');
    return true;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = t.step.response.statusCode;
  if (httpStatus && (httpStatus < 200 || httpStatus >= 300)) {
    var error = httpError(t, httpStatus);
    log.error('unexpected http status code');
    log.error(error);
    t.callback(error);
    return false;
  }
  log.debug('http status code ok (' + httpStatus + ')');
  return true;
};

function httpError(t, httpStatus) {
  var error =
    createError('HTTP ' + t.mostRecentHttpMethodName + ' request to ' +
      t.step.url + ' resulted in HTTP status code ' + httpStatus + '.',
      errors.HTTPError);
  error.url = t.step.url;
  error.httpStatus = httpStatus;
  var body = t.step.response.body;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}
