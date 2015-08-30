'use strict';

var jsonpathLib = require('JSONPath')
  , minilog = require('minilog')
  , _s = require('underscore.string');

var jsonpath = jsonpathLib.eval;

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.prototype.findNextStep = function(t, link) {
  validateLinkObject(link);
  var doc = t.lastStep.doc;
  this.log.debug('resolving link in doc', link, doc);
  switch (link.type) {
    case 'link-rel':
      return this._handleLinkRel(doc, link);
    case 'header':
      return this._handleHeader(t.lastStep.response, link);
    default:
      throw new Error('Link objects with type ' + link.type + ' are not ' +
        'supported by this adapter.', link);
  }
};

JsonAdapter.prototype._handleLinkRel = function(doc, link) {
  var linkRel = link.value;
  var url;
  if (this._testJSONPath(linkRel)) {
    return { url: this._resolveJSONPath(doc, linkRel) };
  } else if (doc[linkRel]) {
    return { url : doc[linkRel] };
  } else {
    throw new Error('Could not find property ' + linkRel +
        ' in document:\n', doc);
  }
};

function validateLinkObject(link) {
  if (typeof link === 'undefined' || link === null) {
    throw new Error('Link object is null or undefined.');
  }
  if (typeof link !== 'object') {
    throw new Error('Links must be objects, not ' + typeof link +
        ': ', link);
  }
  if (!link.type) {
    throw new Error('Link objects has no type attribute.', link);
  }
}

JsonAdapter.prototype._testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype._resolveJSONPath = function(doc, link) {
  var matches = jsonpath(doc, link);
  if (matches.length === 1) {
    var url = matches[0];
    if (!url) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    if (typeof url !== 'string') {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result is not a property of type string. ' +
        'Instead it has type "' + (typeof url) +
        '" in document:\n' + JSON.stringify(doc));
    }
    return url;
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc));
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc));
  }
};

JsonAdapter.prototype._handleHeader = function(httpResponse, link) {
  switch (link.value) {
    case 'location':
      var locationHeader = httpResponse.headers.location;
      if (!locationHeader) {
        throw new Error('Following the location header but there was no ' +
          'location header in the last response.');
      }
      return { url : locationHeader };
    default:
      throw new Error('Link objects with type header and value ' + link.value +
        ' are not supported by this adapter.', link);
  }

};

module.exports = JsonAdapter;
