'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var mediaTypeRegistry = require('../media_type_registry')
  , errorModule = require('../errors')
  , errors = errorModule.errors
  , createError = errorModule.createError;

module.exports = function detectContentType(t, callback) {
  if (t.contentNegotiation &&
      t.step.response &&
      t.step.response.headers &&
      t.step.response.headers['content-type']) {
    var contentType = t.step.response.headers['content-type'].split(/[; ]/)[0];
    log.debug('found content type string', contentType);
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      log.error('no adapter for content type', contentType);
      callback(createError('Unknown content type for content ' +
          'type detection: ' + contentType, errors.UnsupportedMediaType), t);
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    t.adapter = new AdapterType(log);
    log.debug('switched to media type adapter',
      t.adapter.name || t.adapter.constructor.name);
  }
  return true;
};
