'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function parse(t) {
  if (t.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('no parsing necessary, probably an embedded document');
    return true;
  }

  try {
    log.debug('parsing response body');
    t.step.doc = t.parseJson(t.step.response.body);
    return true;
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(t.step.url, t.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    t.callback(error);
    return false;
  }
};

function jsonError(url, body) {
  var error = new Error('The document at ' + url +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.url = url;
  error.body = body;
  return error;
}
