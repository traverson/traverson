'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var mediaTypeRegistry = require('../media_type_registry');

module.exports = function detectContentType(ws, callback) {
  if (ws.contentNegotiation &&
      ws.step.response &&
      ws.step.response.headers &&
      ws.step.response.headers['content-type']) {
    var contentType = ws.step.response.headers['content-type'].split(/[; ]/)[0];
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      callback(new Error('Unknown content type for content ' +
          'type detection: ' + contentType));
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    ws.adapter = new AdapterType(log);
  }
  return true;
};
