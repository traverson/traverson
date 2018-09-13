'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('../abort_traversal')
  , httpRequests = require('../http_requests');

/*
 * Execute the last HTTP request in a traversal that ends in
 * post/put/patch/delete, but do not call t.callback immediately
 * (because we still need to do response body to object conversion
 * afterwards, for example)
 */
// TODO Why is this different from when do a GET?
// Probably only because the HTTP method is configurable here (with
// t.lastMethod), we might be able to unify this with the
// fetch_resource/fetch_last_resource transform.
function executeLastHttpRequestForConvertResponse(t, callback) {
  // always check for aborted before doing an HTTP request
  if (t.aborted) {
    return abortTraversal.callCallbackOnAbort(t);
  }
  // The only diff to the execute_last_http_request transform: pass a new
  // callback function instead of calling t.callback immediately. This enables
  // other transforms to run after the HTTP request (check status code, convert
  // response to object, ...)
  httpRequests.executeHttpRequest(
      t,
      t.requestModuleInstance,
      t.lastMethod,
      t.lastMethodName,
      function(err, response) {
    if (err) {
      if (!err.aborted) {
        log.debug('error while executing http request, ' +
                  'processing step', t.step);
        log.error(err);
      }
      return t.callback(err);
    }
    callback(t);
  });
}

executeLastHttpRequestForConvertResponse.isAsync = true;

module.exports = executeLastHttpRequestForConvertResponse;
