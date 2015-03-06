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
Walker.prototype.walk = function(links, callback) {
  var walkState = {
    step : {
      uri: this.startUri,
      index: 0,
    },
    callback: callback,
    links: links,
  };
  walkState.step.uri = this.resolveUriTemplate(walkState.step,
      this.templateParameters),

  // starts the link rel walking process
  log.debug('starting to follow links');
  this._executeNextStep(walkState);
};

Walker.prototype._executeNextStep = function(ws) {
  var self = this;
  if (ws.step.index < ws.links.length && !self.aborted) {

    // Trigger execution of next step. In most cases that is an HTTP get to
    // the next URI.
    self.process(ws.step, function(err) {
      ws.lastStep = null;
      if (err) {
        log.debug('error while processing step ' +
          JSON.stringify(ws.step));
        log.error(err);
        return ws.callback(err);
      }
      log.debug('successfully processed step');

      // check HTTP status code
      if (!self.checkHttpStatus(ws.step, ws.callback)) return;

      // parse JSON from last response
      var doc = self.parse(ws.step, ws.callback);
      if (!doc) return;

      // extract next link to follow from last response
      var link = ws.links[ws.step.index];
      log.debug('next link: ' + link);

      // save last step before overwriting it with next step (required for
      // relative URL resolution, where we need the last URL)
      ws.lastStep = ws.step;
      ws.step = self.findNextStep(doc, link, ws.callback);
      if (!ws.step) return;
      ws.step.index = ws.lastStep.index + 1;

      // URI template has to be resolved before post processing the URL,
      // because we do url.resolve with it (in json_hal) and this would URI-
      // encode curly braces.
      if (ws.step.uri) {
        // next link found in last response, might be a URI template
        ws.step.uri = self.resolveUriTemplate(ws.step,
            self.templateParameters);
      }

      // turn relative URI into absolute URI or whatever else is required
      self.postProcessStep(ws.step, ws.lastStep);
      log.debug('next step: ' + JSON.stringify(ws.step, null, 2));

      // follow next link
      self._executeNextStep(ws);
    });
  } else if (self.aborted) {
    // the link traversal has been aborted in mid-flight
    log.debug('link traversal aborted');
    if (!self.callbackHasBeenCalledAfterAbort) {
      log.debug('calling callback with error');
      self.callbackHasBeenCalledAfterAbort = true;
      return ws.callback(new Error('Link traversal process has been aborted.'));
    }
  } else {
    // link array is exhausted, we are done and return the last response
    // and uri to the callback the client passed into the walk method.
    log.debug('link array exhausted, calling callback');
    return ws.callback(null, ws.step);
  }
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
  var options = self.requestOptions;
  if (util.isArray(self.requestOptions)) {
    options = self.requestOptions[step.index] || {};
  }
  log.debug('options: ' + JSON.stringify(options));
  self.currentRequest =
    self.request.get(step.uri,
                     options,
                     function(err, response, body) {
    log.debug('request.get returned');

    // workaround for cases where response body is empty but body comes in as as
    // the third argument
    if (body && !response.body) {
      response.body = body;
    }
    step.response = response;

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
        return callback(err);
      }
    }
    log.debug('request to ' + step.uri + ' finished without error (' +
      response.statusCode + ')');

    if (!self.detectContentType(step, callback)) return;

    return callback(null, step);
  });
  self.registerAbortListener(callback);
};

Walker.prototype.detectContentType = function(step, callback) {
  if (this.contentNegotiation &&
      step.response &&
      step.response.headers &&
      step.response.headers['content-type']) {
    var contentType = step.response.headers['content-type'].split(/[; ]/)[0];
    var AdapterType = mediaTypeRegistry.get(contentType);
    if (!AdapterType) {
      callback(new Error('Unknown content type for content ' +
          'negotiation: ' + contentType));
      return false;
    }
    // switch to new Adapter depending on Content-Type header of server
    this.adapter = new AdapterType(log);
  }
  return true;
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

Walker.prototype.checkHttpStatus = function(step, callback) {
  log.debug('checking http status');
  if (!step.response && step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    log.debug('found embedded document, assuming no HTTP request has been ' +
        'made');
    return true;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = step.response.statusCode;
  if (httpStatus && (httpStatus < 200 || httpStatus >= 300)) {
    var error = httpError(step.uri, httpStatus, step.response.body);
    log.error('unexpected http status code');
    log.error(error);
    callback(error);
    return false;
  }
  log.debug('http status code ok (' + httpStatus + ')');
  return true;
};

Walker.prototype.parse = function(step, callback) {
  if (step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return step.doc;
  }

  try {
    return this.parseJson(step.response.body);
  } catch (e) {
    var error = e;
    if (e.name === 'SyntaxError') {
      error = jsonError(step.uri, step.response.body);
    }
    log.error('parsing failed');
    log.error(error);
    callback(error);
    return null;
  }
};

Walker.prototype.findNextStep = function(doc, link, callback) {
  try {
    return this.adapter.findNextStep(doc, link);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    callback(e);
    return null;
  }
};

Walker.prototype.postProcessStep = function(step, lastStep) {
  // default behaviour: resolve full/absolute/relative url via url.resolve
  if (step.uri) {
    // TODO Might want to replace all this with a proper URL resolve lib,
    // see https://github.com/basti1302/traverson/issues/22
    if (step.uri.search(protocolRegEx) !== 0) {
      if (this.resolveRelative && lastStep && lastStep.uri) {
        if (_s.startsWith(step.uri, '/') &&
          _s.endsWith(lastStep.uri, '/')) {
          step.uri = _s.splice(step.uri, 0, 1);
        }
        step.uri = lastStep.uri + step.uri;
      } else {
        step.uri = url.resolve(this.startUri, step.uri);
      }
    }
  }
};

Walker.prototype.resolveUriTemplate = function(step, templateParams) {
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[step.index];
  }
  templateParams = templateParams || {};

  if (_s.contains(step.uri, '{')) {
    var template = uriTemplate.parse(step.uri);
    return template.expand(templateParams);
  } else {
    return step.uri;
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
