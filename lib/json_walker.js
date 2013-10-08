'use strict';

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = require('JSONPath').eval;
/* jshint +W061 */
var request = require('request')
var uriTemplate = require('uri-template')
var util = require('util')

function JsonWalker() {
}

/*
 * Fetches the document from the startUri and then
 * 1) Uses the next element from the path array as the property key.
 *    If the next element starts with $. or $[ it is assumed that it is a
 *    JSONPath expression, otherwise it is assumed to be a simple property
 *    key.
 * 2) Looks for the property key in the fetched document or evaluates the
 *    JSONPath expression. In the latter case, there must be a non-ambigious
 *    match, otherwise an error is passed to the  callback.
 * 3) If the result of step 2 is an URI template, it is evaluated with the
 *    given templateParams.
 * 4) Passes the resulting URI to fetch callback to acquire the next document.
 * 5) Goes back to step 1) with the next element from path, if any. If path
 *    array is exhausted, the last resulting document is passed to the
 *    callback.
 *
 * The last resulting document (when the path array has been consumed
 * completely by the above procedure) is passed to the result callback.
 *
 * Parameters:
 * startUri is the first URI to fetch
 * path is an array of property keys/JSONPath expressions.
 * templateParams is an array of objects, containaing the template parameters
 *   for each element in the path array. Can be null. Also, individual
 *   elements can be null.
 * callback will be called if this method is done, parameters (error, result),
 *   of which only one will be non-null.
 */
JsonWalker.prototype.walk = function(startUri, path, templateParams, callback) {
  var self = this
  var uri = this.resolveUriTemplate(startUri, templateParams, 0)
  var index = 0;
  (function walkToNext() {
    self.fetch(uri, function(err, doc) {
      if (err) { return callback(err, doc) }
      if (index < path.length) {
        var link = path[index++]
        if (self.testJSONPath(link)) {
          uri = self.resolveJSONPath(link, doc, callback)
          if (!uri) {
            // JSONPath resolving failed, callback already called with error.
            return false
          }
        } else {
          uri = doc[link]
        }
        if (!uri) {
          return callback(new Error('Could not find property ' + link +
                ' in document:\n' + doc))
        }
        uri = self.resolveUriTemplate(uri, templateParams, index)
        walkToNext()
      } else {
        callback(null, doc)
      }
    })
  })()
}

JsonWalker.prototype.fetch = function(uri, callback) {
  request.get(uri, function(err, response) {
    if (err) { return callback(err, null) }
    var httpStatus = response.statusCode
    var doc
    try {
      doc = JSON.parse(response.body)
    } catch (e) {
      if (e.name === 'SyntaxError') {
        return callback(jsonError(uri, httpStatus, response.body))
      }
      return callback(e)
    }

    // Only process response if http status was in 200 - 299 range.
    // The request module follows redirects for GET requests all by itself, so
    // we should not have to handle them here. If a 3xx http status get's here
    // something went wrong. 4xx and 5xx of course also indicate an error
    // condition. 1xx should not occur.
    if (200 <= httpStatus && httpStatus < 300) {
      return callback(null, doc)
    } else {
      return callback(httpError(uri, httpStatus), doc)
    }
  })
}

JsonWalker.prototype.testJSONPath = function(link) {
  return link.indexOf('$.') === 0 || link.indexOf('$[') === 0
}

JsonWalker.prototype.resolveJSONPath = function(link, doc, callback) {
  var matches = jsonpath(doc, link)
  if (matches.length === 1) {
    var uri = matches[0]
    if (!uri) {
      callback(new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc)))
      return false
    }
    return uri
  } else if (matches.length > 1) {
    // ambigious match
    callback(new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc)))
    return false
  } else {
    // no match at all
    callback(new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc)))
    return false
  }
}

JsonWalker.prototype.resolveUriTemplate = function(uri, templateParams,
    templateIndex) {
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[templateIndex]
  }

  if (!templateParams) {
    // Skip URI templating if no template parameters were provided
    return uri
  }

  if (uri.indexOf('{') >= 0) {
    var template = uriTemplate.parse(uri)
    return template.expand(templateParams)
  } else {
    return uri
  }
}

function httpError(uri, httpStatus) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.')
  error.name = 'HTTPError'
  error.uri = uri
  error.httpStatus = httpStatus
  return error
}

function jsonError(uri, httpStatus, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body)
  error.name = 'JSONError'
  error.uri = uri
  error.httpStatus = httpStatus
  error.body = body
  return error
}

module.exports = JsonWalker
