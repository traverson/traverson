'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

function FinalAction(walker) {
  this.walker = walker;
}

FinalAction.prototype.get = function(nextStep, callback) {
  log.debug('next step: ' + JSON.stringify(nextStep, null, 2));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) {
      return callback(err,
        step ? step.response : null,
        step ? step.uri : null);
    }
    if (!step.response && step.doc) {
      log.debug('faking HTTP response for embedded resource');
      step.response = {
        statusCode: 200,
        body: JSON.stringify(step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      };
    }
    callback(null, step.response);
  });
};

FinalAction.prototype.getResource = function(nextStep, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  var self = this;
  log.debug('next step: ' + JSON.stringify(nextStep));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) {
      return callback(err,
        step ? step.response : null,
        step ? step.uri : null);
    }
    if (step.doc) {
      // return an embedded doc immediately
      return callback(null, step.doc);
    }

    var resource;
    try {
      self.walker.checkHttpStatus(step);
      resource = self.walker.parse(step);
      return callback(null, resource);
    } catch (e) {
      return callback(e, e.doc);
    }
  });
};

FinalAction.prototype.getUri = function(nextStep, callback) {
  var self = this;
  log.debug('returning uri');
  if (nextStep.uri) {
    return callback(null, nextStep.uri);
  } else if (nextStep.doc &&
    // TODO actually this is very HAL specific :-/
    nextStep.doc._links &&
    nextStep.doc._links.self &&
    nextStep.doc._links.self.href) {
    return callback(null, self.walker.startUri +
        nextStep.doc._links.self.href);
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

/* jshint maxcomplexity: 8 */
FinalAction.prototype.walkAndExecute = function(body, request, requestOptions,
    method, callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err,
        lastStep ? lastStep.response : null,
        lastStep ? lastStep.uri : null);
    }

    log.debug('aborted: ' + self.walker.aborted);
    if (self.walker.aborted) {
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'),
            lastStep ? lastStep.response : null,
            lastStep ? lastStep.uri : null);
      }
    }

    log.debug('executing final request with step: ' +
        JSON.stringify(nextStep));
    self.executeRequest(nextStep.uri, request, requestOptions, method, body,
      callback);
  });
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
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.walker.callbackHasBeenCalledAfterAbort) {
          self.walker.callbackHasBeenCalledAfterAbort = true;
          return callback(
            new Error('Link traversal process has been aborted.'));
      } else {
        return callback(err, response, uri);
      }
    }
    return callback(null, response, uri);
  });
  this.walker.registerAbortListener(callback);
};

module.exports = FinalAction;
