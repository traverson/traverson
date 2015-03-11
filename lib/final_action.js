'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , abortTraversal = require('./abort_traversal')
  , checkHttpStatus = require('./transforms/check_http_status')
  , getOptionsForStep = require('./transforms/get_options_for_step')
  , parse = require('./transforms/parse')
  , registerAbortListener = require('./abort_traversal').registerAbortListener;

function FinalAction(walker) {
  this.walker = walker;
}

FinalAction.prototype.get = function(ws, callback) {
  log.debug('next step: ', ws.step);
  /* jshint maxcomplexity: 7 */
  this.walker.fetchResource(ws, function(err, ws) {
    log.debug('walker.fetchResource returned');
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
  this.walker.fetchResource(ws, function(err, ws) {
    log.debug('walker.fetchResource returned.');
    if (err) {
      return callback(err,
        ws ? (ws.step ? ws.step.response : null) : null,
        ws ? (ws.step ? ws.step.uri : null) : null);
    }
    if (ws.step.doc) {
      // return an embedded doc immediately
      return callback(null, ws.step.doc);
    }

    if (!checkHttpStatus(ws)) return;
    if (!parse(ws)) return;
    return callback(null, ws.step.doc);
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

FinalAction.prototype.walkAndExecute = function(ws, request, method, callback) {
  var self = this;
  ws.callback = function(err) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err);
    }

    if (ws.aborted) {
      return abortTraversal.callCallbackOnAbort(ws);
    }

    log.debug('executing final request with step: ', ws.step);
    self.executeRequest(ws, request, method, callback);
  };

  this.walker.walk(ws);
};

FinalAction.prototype.executeRequest = function(ws, request, method, callback) {
  var self = this;

  var requestOptions = getOptionsForStep(ws);
  if (ws.body) {
    requestOptions.body = JSON.stringify(ws.body);
  }

  log.debug('request to ', ws.step.uri);
  log.debug('options ', requestOptions);
  ws.currentRequest =
    method.call(request, ws.step.uri, requestOptions, function(err, response) {
    log.debug('request to ' + ws.step.uri + ' succeeded');
    ws.currentRequest = null;
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      // probably fixed with next release of superagent:
      // https://github.com/visionmedia/superagent/issues/376
      if (err.message &&
          err.message === 'timeout of undefinedms exceeded' &&
          !ws.callbackHasBeenCalledAfterAbort) {
          return abortTraversal.callCallbackOnAbort(ws);
      } else {
        return callback(err, response, ws.step.uri);
      }
    }
    return callback(null, response, ws.step.uri);
  });
  registerAbortListener(ws, callback);
};

module.exports = FinalAction;
