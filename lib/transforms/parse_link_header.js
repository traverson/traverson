'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var parseLinkHeaderValue = require('../parse_link_header_value');

module.exports = function parseLinkHeader(t) {
  if (!t.step.doc ||
      !t.step.response ||
      !t.step.response.headers ||
      !t.step.response.headers.link) {
    return true;
  }

  try {
    var links = parseLinkHeaderValue(t.step.response.headers.link);
    t.step.doc._linkHeaders = links;
    return true;
  } catch (e) {
    handleError(t, e);
    return false;
  }
};

function handleError(t, e) {
  log.error('failed to parse link header');
  log.error(e);
  t.callback(e);
}
