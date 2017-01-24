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

    if (!t.step.doc._links) {
      t.step.doc._links = links;
    }

    // TODO: extend existing links?
    /*
    else {
      for (var rel in links) {
        if (t.step.doc._links[rel]) {
          log.debug('duplicated rel ', rel);
        } else {
          t.step.doc._links[rel] = links[rel].url;
        }
      }
    }
    */

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
