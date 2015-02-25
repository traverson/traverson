'use strict';

var jsonpathLib = require('JSONPath')
  , minilog = require('minilog')
  , _s = require('underscore.string');

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = jsonpathLib.eval;
/* jshint +W061 */

function JsonAdapter(log) {
  this.log = log;
}

JsonAdapter.prototype.findNextStep = function(doc, link) {
  this.log.debug('extracting link ' + link + ' from ' + JSON.stringify(doc));
  var uri;
  if (this.testJSONPath(link)) {
    return { uri: this.resolveJSONPath(link, doc) };
  } else if (doc[link]) {
    return { uri : doc[link] };
  } else {
    throw new Error('Could not find property ' + link +
        ' in document:\n' + JSON.stringify(doc));
  }
};

JsonAdapter.prototype.testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

JsonAdapter.prototype.resolveJSONPath = function(link, doc) {
  var matches = jsonpath(doc, link);
  if (matches.length === 1) {
    var uri = matches[0];
    if (!uri) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    return uri;
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

module.exports = JsonAdapter;
