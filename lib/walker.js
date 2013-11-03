({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([
  'JSONPath',
  'underscore.string',
  'uri-template',
  'util',
  'minilog'
], function (
  jsonpathLib,
  _s,
  uriTemplate,
  util,
  minilog
) {
  'use strict';

var log = minilog('traverson')

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = jsonpathLib.eval
/* jshint +W061 */

function Walker() {
}

/*
 * Fetches the document from this.startUri and then, starting with the first
 * element from the array this.links:
 * 1) uses the next element from this.links as the property key.
 *    If the next element starts with $. or $[ it is assumed that it is a
 *    JSONPath expression, otherwise it is assumed to be a simple property
 *    key.
 * 2) Looks for the property key in the fetched document or evaluates the
 *    JSONPath expression. In the latter case, there must be exactly one
 *    non-ambigious match, otherwise an error is passed to the callback.
 * 3) If the result of step 2 is an URI template, it is evaluated with
 *    this.templateParameters, otherwise it is interpreted as an URI as is.
 * 4) Passes the resulting URI to this.get to acquire the next document.
 * 5) Goes back to step 1) with the next element from the this.links, if any.
 *
 * When the this.links has been consumed completely by the above procedure),
 * the given callback is called with a result object, containing three
 * properties:
 *    - nextUri: the nextUri to access (depending on which method has been
 *      called on WalkerBuilder, this will be a get/post/put/... request),
 *    - lastUri: the last URI that the walker has accessed,
 *    - lastResponse: the HTTP response from accessing lastUri
 *
 * This method uses the following properties of the this-context, which need to
 *   be set by the caller in advance::
 * - this.startUri is the first URI to get (usually the root URI of the API)
 * - this.links is an array of property keys/JSONPath expressions.
 * - this.templateParameters is an object or an array of objects, containaing
 *   the template parameters for each element in this.links. Can be null. Also,
 *   individual elements can be null.
 * - this.request is the request API object to use
 */
Walker.prototype.walk = function(callback) {

  var self = this

  var nextStep = {
    uri: this.resolveUriTemplate(this.startUri, this.templateParameters, 0)
  }
  var index = 0
  var finalStep = nextStep

  log.debug('starting to follow links')
  ;
  (function executeNextRequest() {
    if (index < self.links.length) {

      // Trigger execution of next step. In most cases that is an HTTP get to
      // the next URI.
      self.process(nextStep, function(err, lastStep) {
        finalStep = lastStep
        if (err) {
          log.debug('error while processing step ' + JSON.stringify(nextStep))
          log.error(err)
          return callback(err, nextStep, lastStep)
        }
        log.debug('successully processed step')

        // check HTTP status code
        try {
          self.checkHttpStatus(lastStep)
        } catch (e) {
          log.error('unexpected http status code')
          log.error(e)
          return callback(e, nextStep, lastStep)
        }

        // parse JSON from last response
        var doc
        try {
          doc = self.parse(lastStep)
        } catch (e) {
          log.error('parsing failed')
          log.error(e)
          return callback(e, nextStep, lastStep)
        }

        // extract next link to follow from last response
        var link = self.links[index++]
        log.debug('next link: ' + link)

        try {
          nextStep = self.findNextStep(doc, link)
        } catch (e) {
          log.error('could not find next step')
          log.error(e)
          return callback(e, nextStep, lastStep)
        }

        // turn relative URI into absolute URI or whatever else is required
        self.postProcessStep(nextStep)
        log.debug('next step: ' + JSON.stringify(nextStep))

        if (nextStep.uri) {
          // next link found in last response, might be a URI template
          nextStep.uri = self.resolveUriTemplate(nextStep.uri,
              self.templateParameters, index)
        }

        // follow next link
        executeNextRequest()
      })
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback')
      return callback(null, nextStep, finalStep)
    }
  })()
}

Walker.prototype.process = function(step, callback) {
  log.debug('processing next step: ' + JSON.stringify(step))
  if (step.uri) {
    this.get(step, callback)
  } else if (step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched')
    callback(null, step)
  } else {
    throw new Error('Can not process next step: ' + JSON.stringify(step))
  }
}

Walker.prototype.get = function(step, callback) {
  log.debug('request to ' + step.uri)
  this.request.get(step.uri, function(err, response) {
    log.debug('request.get returned')
    if (err) { return callback(err, step) }
    log.debug('request to ' + step.uri + ' finished (' + response.statusCode +
        ')')
    step.response = response
    return callback(null, step)
  })
}

Walker.prototype.checkHttpStatus = function(step) {
  if (!step.response && step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = step.response.statusCode
  if (httpStatus < 200 || httpStatus >= 300) {
    throw httpError(step.uri, httpStatus, step.response.body)
  }
}

Walker.prototype.parse = function(step) {
  if (step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return step.doc
  }

  try {
    return JSON.parse(step.response.body)
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw jsonError(step.uri, step.response.body)
    }
    throw e
  }
}

Walker.prototype.findNextStep = function(doc, link) {
  log.debug('extracting link ' + link + ' from ' + JSON.stringify(doc))
  var uri
  if (this.testJSONPath(link)) {
    return { uri: this.resolveJSONPath(link, doc) }
  } else if (doc[link]) {
    return { uri : doc[link] }
  } else {
    throw new Error('Could not find property ' + link +
        ' in document:\n' + JSON.stringify(doc))
  }
}

Walker.prototype.postProcessStep = function(nextStep) {
  // default behaviour: no post processing
}

Walker.prototype.testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[')
}

Walker.prototype.resolveJSONPath = function(link, doc) {
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

Walker.prototype.resolveUriTemplate = function(uri, templateParams,
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

  if (_s.contains(uri, '{')) {
    var template = uriTemplate.parse(uri)
    return template.expand(templateParams)
  } else {
    return uri
  }
}

function httpError(uri, httpStatus, body) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.')
  error.name = 'HTTPError'
  error.uri = uri
  error.httpStatus = httpStatus
  error.body = body
  try {
    error.doc = JSON.parse(body)
  } catch (e) {
    // ignore
  }
  return error
}

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body)
  error.name = 'JSONError'
  error.uri = uri
  error.body = body
  return error
}

return Walker
})
