'use strict';

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = require('JSONPath').eval;
/* jshint +W061 */
var log = require('minilog')('json_walker');

var request = require('request')
var uriTemplate = require('uri-template')
var util = require('util')

function JsonWalker() {
}

/*
 * TODO: DOC COMMENT PROBABLY OUTDATED. NEEDS UPDATING.
 *
 * Fetches the document from the startUri and then
 * 1) Uses the next element from the link array as the property key.
 *    If the next element starts with $. or $[ it is assumed that it is a
 *    JSONPath expression, otherwise it is assumed to be a simple property
 *    key.
 * 2) Looks for the property key in the fetched document or evaluates the
 *    JSONPath expression. In the latter case, there must be a non-ambigious
 *    match, otherwise an error is passed to the  callback.
 * 3) If the result of step 2 is an URI template, it is evaluated with the
 *    given templateParams.
 * 4) Passes the resulting URI to fetch callback to acquire the next document.
 * 5) Goes back to step 1) with the next element from links, if any. If the
 *    links array is exhausted, the last resulting document is passed to the
 *    callback.
 *
 * The last resulting document (when the link array has been consumed
 * completely by the above procedure) is passed to the result callback.
 *
 * Parameters:
 * startUri is the first URI to get
 * links is an array of property keys/JSONPath expressions.
 * templateParams is an array of objects, containaing the template parameters
 *   for each element in the link array. Can be null. Also, individual
 *   elements can be null.
 * callback will be called if this method is done, parameters (error, result),
 *   of which only one will be non-null.
 */
JsonWalker.prototype.walk = function(startUri, links, templateParams,
    callback) {

  var self = this

  var nextUri = this.resolveUriTemplate(startUri, templateParams, 0)
  var index = 0
  var lastResponse
  var lastUri

  (function executeNextRequest() {
    if (index < links.length) {
      log.debug('request to ' + nextUri)
      self.get(nextUri, function(err, response) {
        lastUri = nextUri
        lastResponse = response
        log.debug('request to ' + lastUri + ' finished (' +
            response.statusCode + ')')
        if (err) { return callback(err, result(null, lastUri, lastResponse)) }

        var doc
        try {
          doc = self.parse(lastResponse, lastUri)
        } catch (e) {
          log.debug('parsing failed ' + e)
          return callback(e, result(null, lastUri, lastResponse))
        }

        var link = links[index++]
        try {
          nextUri = self.extractLink(doc, link)
        } catch (e) {
          return callback(e, result(null, lastUri, lastResponse))
        }

        if (!nextUri) {
          // no nextUri means the body of the last response did not contain
          // the link it should have
          return callback(new Error('Could not find property ' + link +
                ' in document:\n' + doc), result(null, lastUri, lastResponse))
        } else {
          // link found in last response, follow it
          nextUri = self.resolveUriTemplate(nextUri, templateParams, index)
          executeNextRequest()
        }
      })
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback')
      callback(null, result(nextUri, lastUri, lastResponse))
    }
  })()
}

JsonWalker.prototype.get = function(uri, callback) {
  request.get(uri, function(err, response) {
    if (err) { return callback(err) }
    return callback(null, response, uri)
  })
}

JsonWalker.prototype.post = function(uri, body, callback) {
  log.debug('post to ' + uri + ' with ' + body)
  request.post(uri, { body: body }, function(err, response) {
    log.debug('post to ' + uri + ' with ' + body + ' succeeded')
    if (err) { return callback(err, null) }
    return callback(null, response, uri)
  })
}

JsonWalker.prototype.parse = function(response, uri) {
  var httpStatus = response.statusCode
  var doc
  try {
    doc = JSON.parse(response.body)
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw jsonError(uri, httpStatus, response.body)
    }
    throw e
  }
  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  if (200 <= httpStatus && httpStatus < 300) {
    return doc
  } else {
    throw httpError(uri, httpStatus, doc)
  }
}

JsonWalker.prototype.extractLink = function(doc, link) {
  log.debug('extracting link ' + link + ' from ' + JSON.stringify(doc))
  if (this.testJSONPath(link)) {
    return this.resolveJSONPath(link, doc)
  } else {
    return doc[link]
  }
}


JsonWalker.prototype.testJSONPath = function(link) {
  return link.indexOf('$.') === 0 || link.indexOf('$[') === 0
}

JsonWalker.prototype.resolveJSONPath = function(link, doc) {
  var matches = jsonpath(doc, link)
  if (matches.length === 1) {
    var uri = matches[0]
    if (!uri) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc))
    }
    return uri
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc))
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc))
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

function result(nextUri, lastUri, lastResponse) {
  return {
    nextUri: nextUri,
    lastUri: lastUri,
    lastResponse: lastResponse
  }
}

function httpError(uri, httpStatus, doc) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.')
  error.name = 'HTTPError'
  error.uri = uri
  error.httpStatus = httpStatus
  error.doc = doc
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
