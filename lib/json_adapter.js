'use strict';

var minilog = require('minilog')
  , _s = require('underscore.string');

var jsonpath;
try {
  jsonpath = require('jsonpath-plus');
} catch (e) {
  jsonpath = false;
  console.warn('Could not require jsonpath-plus, JSONPath support is not ' +
    'available.');
}
var errorModule = require('./errors')
  , errors = errorModule.errors
  , createError = errorModule.createError
  , parseLinkHeaderValue = require('./parse_link_header_value');

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.mediaType = 'application/json';

JsonAdapter.prototype.findNextStep = function(t, link) {
  validateLinkObject(link);
  var doc = t.lastStep.doc;
  this.log.debug('resolving link', link);
  switch (link.type) {
    case 'link-rel':
      return this._handleLinkRel(doc, link);
    case 'header':
      return this._handleHeader(t.lastStep.response, link);
    case 'link-header':
      return this._handleLinkHeader(t.lastStep.response, link);
    default:
      throw createError('Link objects with type ' + link.type + ' are not ' +
        'supported by this adapter.', errors.InvalidArgumentError, link);
  }
};

JsonAdapter.prototype._handleLinkRel = function(doc, link) {
  var linkRel = link.value;
  this.log.debug('looking for link-rel', linkRel, 'in doc', doc);
  var url;
  if (this._testJSONPath(linkRel)) {
    return { url: this._resolveJSONPath(doc, linkRel) };
  } else if (doc[linkRel]) {
    return { url : doc[linkRel] };
  } else {
    throw createError('Could not find property ' + linkRel +
        ' in document.', errors.LinkError, doc);
  }
};

function validateLinkObject(link) {
  if (typeof link === 'undefined' || link === null) {
    throw createError('Link object is null or undefined.',
      errors.InvalidArgumentError);
  }
  if (typeof link !== 'object') {
    throw createError('Links must be objects, not ' + typeof link +
        '.', errors.InvalidArgumentError, link);
  }
  if (!link.type) {
    throw createError('Link objects has no type attribute.',
      errors.InvalidArgumentError, link);
  }
}

JsonAdapter.prototype._testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype._resolveJSONPath = function(doc, link) {
  if (!jsonpath) {
    throw createError('JSONPath support is not available.');
  }
  var matches = jsonpath({
    json: doc,
    path: link,
  });
  if (matches.length === 1) {
    var url = matches[0];
    if (!url) {
      throw createError('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc),
        errors.JSONPathError, doc);
    }
    if (typeof url !== 'string') {
      throw createError('JSONPath expression ' + link +
        ' was resolved but the result is not a property of type string. ' +
        'Instead it has type "' + (typeof url) +
        '" in document:\n' + JSON.stringify(doc), errors.JSONPathError,
        doc);
    }
    return url;
  } else if (matches.length > 1) {
    // ambigious match
    throw createError('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc), errors.JSONPathError, doc);
  } else {
    // no match at all
    throw createError('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc),
      errors.JSONPathError, doc);
  }
};

JsonAdapter.prototype._handleHeader = function(httpResponse, link) {
  switch (link.value) {
    case 'location':
      var locationHeader = httpResponse.headers.location;
      if (!locationHeader) {
        throw createError('Following the location header but there was no ' +
          'location header in the last response.', errors.LinkError,
          httpResponse.headers);
      }
      return { url : locationHeader };
    default:
      throw createError('Link objects with type header and value ' +
        link.value + ' are not supported by this adapter.',
        errors.InvalidArgumentError, link);
  }
};

JsonAdapter.prototype._handleLinkHeader = function(httpResponse, link) {
  if (!httpResponse.headers.link)
    throw createError('There was no link header in the last response.',
      errors.InvalidArgumentError, link);

  var links = parseLinkHeaderValue(httpResponse.headers.link);
  if (links[link.value]) {
    return { url : links[link.value].url};
  } else {
    throw createError('Link with relation ' + link.value +
      ' not found in link header.',
      errors.InvalidArgumentError, link);
  }
};

module.exports = JsonAdapter;
