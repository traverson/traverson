'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function parse(ws) {
  if (ws.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('no parsing necessary, probably an embedded document');
    return true;
  }

  try {
    log.debug('parsing response body');
    ws.step.doc = ws.parseJson(ws.step.response.body);
    return true;
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(ws.step.uri, ws.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    ws.callback(error);
    return false;
  }
};

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.uri = uri;
  error.body = body;
  return error;
}
