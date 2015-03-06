'use strict';

var minilog = require('minilog')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , url = require('url')
  , util = require('util');

var NegotiationAdapter = require('./negotiation_adapter')
  , mediaTypeRegistry = require('./media_type_registry')
  , mergeRecursive = require('./merge_recursive');

var log = minilog('traverson');

var protocolRegEx = /https?:\/\//i;

/**
 * Creates a new Walker with the given media type adapter.
 */
function Walker(adapter) {
  this.adapter = adapter || new NegotiationAdapter(log);
  this.contentNegotiation = true;
  this.links = [];
  this.requestOptions = {};
  this.parseJson = JSON.parse;
  this.resolveRelative = false;
  this.aborted = false;
  this.callbackHasBeenCalledAfterAbort = false;
}

/**
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(callback) {
  var self = this;
  var walkState = {
    nextStep : {
      uri: this.resolveUriTemplate(this.startUri, this.templateParameters, 0),
      index: 0,
    }
  };
  walkState.finalStep = walkState.nextStep;

  log.debug('starting to follow links');

  function executeNextStep() {
    if (walkState.nextStep.index < self.links.length &&
        !self.aborted) {

      // Trigger execution of next step. In most cases that is an HTTP get to
      // the next URI.
      self.process(walkState.nextStep, function(err, lastStep) {
        walkState.finalStep = walkState.lastStep = lastStep;
        if (err) {
          log.debug('error while processing step ' +
            JSON.stringify(walkState.lastStep));
          log.error(err);
          return callback(err, walkState.nextStep, walkState.lastStep);
        }
        log.debug('successfully processed step');

        // check HTTP status code
        try {
          self.checkHttpStatus(walkState.lastStep);
        } catch (e) {
          log.error('unexpected http status code');
          log.error(e);
          return callback(e, walkState.nextStep, walkState.lastStep);
        }

        // parse JSON from last response
        var doc;
        try {
          doc = self.parse(walkState.lastStep);
        } catch (e) {
          log.error('parsing failed');
          log.error(e);
          return callback(e, walkState.nextStep, walkState.lastStep);
        }

        // extract next link to follow from last response
        var link = self.links[walkState.lastStep.index];
        log.debug('next link: ' + link);

        try {
          walkState.nextStep = self.adapter.findNextStep(doc, link);
          walkState.nextStep.index = lastStep.index + 1;
        } catch (e) {
          log.error('could not find next step');
          log.error(e);
          return callback(e, walkState.nextStep, walkState.lastStep);
        }

        // URI template has to be resolved before post processing the URL,
        // because we do url.resolve with it (in json_hal) and this would URI-
        // encode curly braces.
        if (walkState.nextStep.uri) {
          // next link found in last response, might be a URI template
          walkState.nextStep.uri =
            self.resolveUriTemplate(walkState.nextStep.uri,
            self.templateParameters, walkState.nextStep.index);
        }

        // turn relative URI into absolute URI or whatever else is required
        self.postProcessStep(walkState.nextStep, walkState.lastStep);
        log.debug('next step: ' + JSON.stringify(walkState.nextStep, null, 2));

        // follow next link
        executeNextStep();
      });
    } else if (self.aborted) {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'),
          walkState.nextStep, walkState.finalStep);
      }
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback');
      return callback(null, walkState.nextStep, walkState.finalStep);
    }
  }

  // this is the initial call of executeNextStep which starts the link rel
  // walking process
  executeNextStep();
};

Walker.prototype.process = function(step, callback) {
  log.debug('processing next step (' + step.index + '): ' +
      JSON.stringify(step, null, 2));
  if (step.uri) {
    this.get(step, callback);
  } else if (step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    callback(null, step);
  } else {
    throw new Error('Can not process next step: ' + JSON.stringify(step));
  }
};

Walker.prototype.get = function(step, callback) {
  log.debug('request to ' + step.uri);
  var self = this;
  // TODO check if request options are an array. If so, use the ones for this
  // step like in URI template resolution. If not, pass the options object as a
  // whole.
  var options = this.requestOptions;
  if (util.isArray(this.requestOptions)) {
    options = this.requestOptions[step.index] || {};
  }
  log.debug('options: ' + JSON.stringify(options));
  this.currentRequest =
    this.request.get(step.uri,
                     options,
                     function(err, response, body) {
    log.debug('request.get returned');
    if (err) {
      // working around a bug in superagent where, when calling abort(), it
      // calls the callback with an error with this message (coming from
      // xhr.abort()).
      // probably fixed with next release of superagent:
      // https://github.com/visionmedia/superagent/issues/376
      if (err.message && err.message === 'timeout of undefinedms exceeded' &&
          !self.callbackHasBeenCalledAfterAbort) {
          self.callbackHasBeenCalledAfterAbort = true;
          return callback(
            new Error('Link traversal process has been aborted.'));
      } else {
        return callback(err, step);
      }
    }
    if (body && !response.body) {
      response.body = body;
    }
    if (self.contentNegotiation &&
        response &&
        response.headers &&
        response.headers['content-type']) {
      var contentType = response.headers['content-type'].split(/[; ]/)[0];
      var AdapterType = mediaTypeRegistry.get(contentType);
      if (!AdapterType) {
        return callback(new Error('Unknown content type for content ' +
            'negotiation: ' + contentType, step));
      }
      // switch to new Adapter depending on Content-Type header of server
      self.adapter = new AdapterType(log);
    }
    log.debug('request to ' + step.uri + ' finished (' + response.statusCode +
        ')');
    step.response = response;
    return callback(null, step);
  });
  this.registerAbortListener(callback);
};

Walker.prototype.registerAbortListener = function(callback) {
  var self = this;
  if (this.currentRequest) {
    this.currentRequest.on('abort', function(a, b, c) {
      // the link traversal has been aborted in mid-flight
      log.debug('link traversal aborted');
      if (!self.callbackHasBeenCalledAfterAbort) {
        log.debug('calling callback with error');
        self.callbackHasBeenCalledAfterAbort = true;
        return callback(new Error('Link traversal process has been aborted.'));
      }
    });
  }
};

Walker.prototype.checkHttpStatus = function(step) {
  if (!step.response && step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = step.response.statusCode;
  if (httpStatus < 200 || httpStatus >= 300) {
    throw httpError(step.uri, httpStatus, step.response.body);
  }
};

Walker.prototype.parse = function(step) {
  if (step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return step.doc;
  }

  try {
    return this.parseJson(step.response.body);
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw jsonError(step.uri, step.response.body);
    }
    throw e;
  }
};

Walker.prototype.postProcessStep = function(nextStep, lastStep) {
  // default behaviour: resolve full/absolute/relative url via url.resolve
  if (nextStep.uri) {
    // TODO Might want to replace all this with a proper URL resolve lib,
    // see https://github.com/basti1302/traverson/issues/22
    if (nextStep.uri.search(protocolRegEx) !== 0) {
      if (this.resolveRelative && lastStep && lastStep.uri) {
        if (_s.startsWith(nextStep.uri, '/') &&
          _s.endsWith(lastStep.uri, '/')) {
          nextStep.uri = _s.splice(nextStep.uri, 0, 1);
        }
        nextStep.uri = lastStep.uri + nextStep.uri;
      } else {
        nextStep.uri = url.resolve(this.startUri, nextStep.uri);
      }
    }
  }
};

Walker.prototype.resolveUriTemplate = function(uri, templateParams,
    templateIndex) {
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[templateIndex];
  }

  if (!templateParams) {
    templateParams = {};
  }

  if (_s.contains(uri, '{')) {
    var template = uriTemplate.parse(uri);
    return template.expand(templateParams);
  } else {
    return uri;
  }
};

Walker.prototype.abort = function() {
  log.debug('aborting link traversal');
  this.aborted = true;
  if (this.currentRequest) {
    log.debug('request in progress. trying to abort it, too.');
    this.currentRequest.abort();
  }
};

function httpError(uri, httpStatus, body) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.');
  error.name = 'HTTPError';
  error.uri = uri;
  error.httpStatus = httpStatus;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.uri = uri;
  error.body = body;
  return error;
}

module.exports = Walker;
