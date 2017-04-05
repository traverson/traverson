'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , util = require('util')
  , mergeRecursive = require('../merge_recursive');

module.exports = function getOptionsForStep(t) {
  var options = t.requestOptions;
  if (util.isArray(t.requestOptions)) {
    options = t.requestOptions[t.step.index] || {};
  }
  if (t.autoHeaders) {
    addAutoHeaders(t, options);
  }
  log.debug('options', options);
  return options;
};

function addAutoHeaders(t, options) {
  var autoHeaderValue =
    // we accept a static mediaType property as well as an instance property
    t.adapter.constructor.mediaType ||
    t.adapter.mediaType;

  // The content negotiation adapter does not (and can not) provide a value
  // for automatical Accept and Content-Type headers, in this case auto header
  // value is undefined and we skip setting auto headers. This also happens
  // arbitrary media type plug-ins that do not behave well and have no
  // mediaType property.
  if (autoHeaderValue) {
    if (!options.headers) {
      options.headers = createAutoHeaders(options, autoHeaderValue);
    } else {
      options.headers =
        mergeRecursive(
          createAutoHeaders(options, autoHeaderValue),
          options.headers
        );
    }
  }
}

function createAutoHeaders(options, autoHeaderValue) {
  if (!options.form) {
    // default: set Accept and Content-Type header
    return {
      'Accept': autoHeaderValue,
      'Content-Type': autoHeaderValue,
    };
  } else {
    // if options.form is set, we only set the Accept header, but not not the
    // Content-Type header. The Content-Type header is set automatically by
    // request/request or by browser/lib/shim/request.js.
    return {
      'Accept': autoHeaderValue
    };
  }
}
