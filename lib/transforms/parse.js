'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var errorModule = require('../errors')
  , errors = errorModule.errors
  , createError = errorModule.createError
  , isContinuation = require('../is_continuation');


module.exports = function parse(t) {
  // TODO Duplicated in actions#afterGetResource etc.
  // this step is ommitted for continuations that parse at the end
  if (isContinuation(t)) {
    log.debug('continuing from last traversal process (transforms/parse)');
    // if last traversal did a parse at the end we do not need to parse again
    // (this condition will need to change with
    // https://github.com/traverson/traverson/issues/44)
    if (t.continuation.action === 'getResource') {
      return true;
    }
  }
  if (t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('no parsing necessary, probably an embedded document');
    return true;
  }

  try {
    parseBody(t);
    return true;
  } catch (e) {
    handleError(t, e);
    return false;
  }
};

function parseBody(t) {
  log.debug('parsing response body');
  if (t.requestOptions && t.requestOptions.jsonReviver) {
    t.step.doc = t.step.response.body;
  } else {
    t.step.doc = t.jsonParser(t.step.response.body);
  }
}

function handleError(t, e) {
  var error = e;
  if (e.name === 'SyntaxError') {
    error = jsonError(t.step.url, t.step.response.body);
  }
  log.error('parsing failed');
  log.error(error);
  t.callback(error);
}

function jsonError(url, body) {
  var error = createError('The document at ' + url +
      ' could not be parsed as JSON: ' + body, errors.JSONError, body);
  error.url = url;
  error.body = body;
  return error;
}
