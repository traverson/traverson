'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , util = require('util');

module.exports = function resolveUriTemplate(t) {
  if (t.step.url) {
    // next link found in last response, might be a URI template
    var templateParams = t.templateParameters;
    if (util.isArray(templateParams)) {
      // if template params were given as an array, only use the array element
      // for the current index for URI template resolving.
      templateParams = templateParams[t.step.index];
    }
    templateParams = templateParams || {};

    if (_s.contains(t.step.url, '{')) {
      log.debug('resolving URI template');
      var template = uriTemplate.parse(t.step.url);
      var resolved = template.expand(templateParams);
      log.debug('resolved to ', resolved);
      t.step.url = resolved;
    }
  }
  return true;
};


