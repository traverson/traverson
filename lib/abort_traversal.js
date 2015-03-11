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
      exports.callCallbackOnAbort(ws);
    });
  }
};

exports.callCallbackOnAbort = function callCallbackOnAbort(ws) {
  log.debug('link traversal aborted');
  if (!ws.callbackHasBeenCalledAfterAbort) {
    ws.callbackHasBeenCalledAfterAbort = true;
    ws.callback(exports.abortError(), ws);
  }
};

exports.abortError = function abortError() {
  var error = new Error('Link traversal process has been aborted.');
  error.name = 'AbortError';
  error.aborted = true;
  return error;
};
