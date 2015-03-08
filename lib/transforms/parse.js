'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function parse(ws) {
  if (ws.step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return ws.step.doc;
  }

  try {
    return ws.parseJson(ws.step.response.body);
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(ws.step.uri, ws.step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    ws.callback(error);
    return null;
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
