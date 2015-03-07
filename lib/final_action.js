'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , util = require('util');

function FinalAction(walker) {
  this.walker = walker;
}

FinalAction.prototype.get = function(ws, callback) {
  log.debug('next step: ', ws.step);
  /* jshint maxcomplexity: 7 */
  this.walker.process(ws, function(err, ws) {
    log.debug('walker.process returned');
    if (err) {
      return callback(err,
        ws ? (ws.step ? ws.step.response : null) : null,
        ws ? (ws.step ? ws.step.uri : null) : null);
    }
    if (!ws.step.response && ws.step.doc) {
      log.debug('faking HTTP response for embedded resource');
      ws.step.response = {
        statusCode: 200,
        body: JSON.stringify(ws.step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      };
    }
    callback(null, ws.step.response);
  });
};

/* jshint maxcomplexity: 9 */
FinalAction.prototype.getResource = function(ws, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  var self = this;
  log.debug('next step: ', ws.step);
  this.walker.process(ws, function(err, ws) {
    log.debug('walker.process returned.', ws);
    if (err) {
      return callback(err,
        ws ? (ws.step ? ws.step.response : null) : null,
        ws ? (ws.step ? ws.step.uri : null) : null);
    }
    if (ws.step.doc) {
      // return an embedded doc immediately
      return callback(null, ws.step.doc);
    }

    if (!self.walker.checkHttpStatus(ws)) return;
    var doc = self.walker.parse(ws, callback);
    if (!doc) return;
    return callback(null, doc);
  });
};

FinalAction.prototype.getUri = function(ws, callback) {
  var self = this;
  log.debug('returning uri');
  if (ws.step.uri) {
    return callback(null, ws.step.uri);
  } else if (ws.step.doc &&
    // TODO actually this is very HAL specific :-/
    ws.step.doc._links &&
    ws.step.doc._links.self &&
    ws.step.doc._links.self.href) {
    return callback(null, self.walker.startUri +
        ws.step.doc._links.self.href);
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

FinalAction.prototype.walkAndExecute =
    function(walkState,
             request,
             method,
             callback) {
  var self = this;
  walkState.callback = function(err, ws) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err);
    }

    log.debug('aborted: ' + self.walker.aborted);
    if (self.walker.aborted) {
      log.debug('link traversal aborted');
      if (!self.walker.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.walker.callbackHasBeenCalledAfterAbort = true;
        return callback(self.walker.abortError(), ws);
      }
    }

    var options = walkState.requestOptions;
    if (util.isArray(walkState.requestOptions)) {
      options = walkState.requestOptions[ws.step.index] || {};
    }
    log.debug('executing final request with step: ', ws.step);
    log.debug('options: ', options);
    self.executeRequest(ws.step.uri, request, options, method, walkState.body,
      callback);
  };

  this.walker.walk(walkState);
};

/* jshint maxparams: 6 */
FinalAction.prototype.executeRequest = function(uri, request, requestOptions,
    method, body, callback) {
  var self = this;
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  log.debug('request to ' + uri + ' with options ' +
      JSON.stringify(requestOptions));

  this.walker.currentRequest =
  method.call(request, uri, requestOptions, function(err, response) {
    log.debug('request to ' + uri + ' succeeded');
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      // probably fixed with next release of superagent:
      // https://github.com/visionmedia/superagent/issues/376
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.walker.callbackHasBeenCalledAfterAbort) {
          self.walker.callbackHasBeenCalledAfterAbort = true;
          return callback(self.walker.abortError());
      } else {
        return callback(err, response, uri);
      }
    }
    return callback(null, response, uri);
  });
  this.walker._registerAbortListener(callback);
};

module.exports = FinalAction;
