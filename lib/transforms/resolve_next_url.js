'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , url = require('url');

var protocolRegEx = /https?:\/\//i;

module.exports = function resolveNextUrl(ws) {
  if (ws.step.uri) {
    if (ws.step.uri.search(protocolRegEx) !== 0) {
      log.debug('found non full qualified URL');
      if (ws.resolveRelative && ws.lastStep && ws.lastStep.uri) {
        // edge case: resolve URL relatively (only when requested by client)
        log.debug('resolving URL relative');
        if (_s.startsWith(ws.step.uri, '/') &&
          _s.endsWith(ws.lastStep.uri, '/')) {
          ws.step.uri = _s.splice(ws.step.uri, 0, 1);
        }
        ws.step.uri = ws.lastStep.uri + ws.step.uri;
      } else {
        // This is the default case and what happens most likely (not a full
        // qualified URL, not resolving relatively) and we simply use Node's url
        // module (or the appropriate shim) here.
        ws.step.uri = url.resolve(ws.startUri, ws.step.uri);
      }
    } // edge case: full qualified URL -> no URL resolving necessary
  } // no ws.step.uri -> no URL resolving (step might contain an embedded doc)
  return true;
};
