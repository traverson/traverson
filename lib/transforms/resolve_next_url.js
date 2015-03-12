'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , url = require('url');

var protocolRegEx = /https?:\/\//i;

module.exports = function resolveNextUrl(t) {
  if (t.step.uri) {
    if (t.step.uri.search(protocolRegEx) !== 0) {
      log.debug('found non full qualified URL');
      if (t.resolveRelative && t.lastStep && t.lastStep.uri) {
        // edge case: resolve URL relatively (only when requested by client)
        log.debug('resolving URL relative');
        if (_s.startsWith(t.step.uri, '/') &&
          _s.endsWith(t.lastStep.uri, '/')) {
          t.step.uri = _s.splice(t.step.uri, 0, 1);
        }
        t.step.uri = t.lastStep.uri + t.step.uri;
      } else {
        // This is the default case and what happens most likely (not a full
        // qualified URL, not resolving relatively) and we simply use Node's url
        // module (or the appropriate shim) here.
        t.step.uri = url.resolve(t.startUri, t.step.uri);
      }
    } // edge case: full qualified URL -> no URL resolving necessary
  } // no t.step.uri -> no URL resolving (step might contain an embedded doc)
  return true;
};
