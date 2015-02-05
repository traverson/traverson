'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var FinalAction = require('./final_action')
  , mediaTypeRegistry = require('./media_type_registry')
  , Walker = require('./walker')
  , mediaTypes = require('./media_types');

var log = minilog('traverson');

function Builder(mediaType, startUri) {
  var adapter = this.createAdapter(mediaType);
  this.walker = new Walker(adapter);
  this.walker.startUri = startUri;
  this.walker.request = this.request = standardRequest;
  this.walker.parseJson = JSON.parse;
  this.finalAction = new FinalAction(this.walker);
}

Builder.prototype.createAdapter = function(mediaType) {
  var AdapterType = mediaTypeRegistry.get(mediaType);
  if (!AdapterType) {
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
  log.debug('creating new ' + AdapterType.name);
  return new AdapterType(false);
};

Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0];
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments);
  }
  return this;
};

Builder.prototype.walk = Builder.prototype.follow;

Builder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters;
  return this;
};

// This function resets any previous set options
Builder.prototype.withRequestOptions = function(options) {
  this.walker.request = this.request = standardRequest.defaults(options);
  return this;
};

// This function adds new options on top of existing options
Builder.prototype.addRequestOptions = function(options) {
	function MergeRecursive(obj1, obj2) {
		for (var p in obj2) {
			if (!obj2.hasOwnProperty(p)) {
				continue;
			}
			try {
				// Property in destination object set; update its value.
				if ( obj2[p].constructor===Object ) {
					MergeRecursive(obj1[p], obj2[p]);
				} else {
					obj1[p] = obj2[p];
				}
			} catch(e) {
				// Property in destination object not set; create it and set its value.
				obj1[p] = obj2[p];
			}
		}

		return obj1;
	}
	MergeRecursive(this.request.options, options);
	this.walker.request.options = this.request.options;
	return this
};


Builder.prototype.withRequestLibrary = function(request) {
  this.walker.request = this.request = request;
  return this;
};

Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.walker.parseJson = parser;
  return this;
};

Builder.prototype.resolveRelative = function() {
  this.walker.resolveRelative = true;
  return this;
};

Builder.prototype.get = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.get(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getResource(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */

Builder.prototype.getUri = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getUri(nextStep, callback);
  });
};

Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.post,
      callback);
};

Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.put,
      callback);
};

Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.patch,
      callback);
};

Builder.prototype.del = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.request.del,
      callback);
};

module.exports = Builder;
