'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

exports.abortTraversal = function abortTraversal() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

exports.registerAbortListener = function registerAbortListener(ws, callback) {
  if (ws.currentRequest) {
    ws.currentRequest.on('abort', function() {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!ws.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        ws.callbackHasBeenCalledAfterAbort = true;
        return callback(exports.abortError());
      }
    });
  }
};

exports.abortError = function abortError() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};
