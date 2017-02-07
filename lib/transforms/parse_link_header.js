'use strict';

var parse = require('parse-link-header')
  , minilog = require('minilog')
  , log = minilog('traverson');

var errorModule = require('../errors')
  , errors = errorModule.errors
  , createError = errorModule.createError;

module.exports = function parseLinkHeader(t) {
  if (!t.step.response.headers.link || !t.step.doc)
    return true;

  try {
    var links = parse(t.step.response.headers.link);
    t.step.doc._linkHeaders = links;
    return true;
  } catch (e) {
    handleError(t, e);
    return false;
  }
};

function handleError(t, e) {
  var error = e;
  log.error('parsing failed');
  log.error(error);
  t.callback(error);
}
