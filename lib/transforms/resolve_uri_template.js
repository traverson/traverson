'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , util = require('util');

module.exports = function resolveUriTemplate(ws) {
  var templateParams = ws.templateParameters;
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[ws.step.index];
  }
  templateParams = templateParams || {};

  if (_s.contains(ws.step.uri, '{')) {
    log.debug('resolving URI template');
    var template = uriTemplate.parse(ws.step.uri);
    var resolved = template.expand(templateParams);
    log.debug('resolved to ', resolved);
    return resolved;
  } else {
    return ws.step.uri;
  }
};


