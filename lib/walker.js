'use strict';

var jsonpathLib = require('JSONPath')
var minilog = require('minilog')
var _s = require('underscore.string')
var uriTemplate = require('uri-template')
var url = require('url')
var util = require('util')


/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = jsonpathLib.eval
/* jshint +W061 */
var log = minilog('traverson')

function Walker() {
}

/*
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(callback) {

  var self = this

  var nextStep = {
    uri: this.resolveUriTemplate(this.startUri, this.templateParameters, 0)
  }
  var index = 0
  var finalStep = nextStep

  log.debug('starting to follow links')

  function executeNextStep() {
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

        // URI template has to be resolved before post processing the URL,
        // because we do url.resolve with it (in json_hal) and this would URI-
        // encode curly braces.
        if (nextStep.uri) {
          // next link found in last response, might be a URI template
          nextStep.uri = self.resolveUriTemplate(nextStep.uri,
              self.templateParameters, index)
        }

        // turn relative URI into absolute URI or whatever else is required
        self.postProcessStep(nextStep, lastStep)
        log.debug('next step: ' + JSON.stringify(nextStep, null, 2))

        // follow next link
        executeNextStep()
      })
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback')
      return callback(null, nextStep, finalStep)
    }
  }
  executeNextStep()
}

Walker.prototype.process = function(step, callback) {
  log.debug('processing next step: ' + JSON.stringify(step, null, 2))
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

Walker.prototype.postProcessStep = function(nextStep, lastStep) {
  // default behaviour: resolve full/absolute/relative url via url.resolve
  if (nextStep.uri) {
    if (!_s.startsWith(nextStep.uri, 'http://')) {
      if (this.resolveRelative && lastStep && lastStep.uri) {
        if (_s.startsWith(nextStep.uri, '/') &&
          _s.endsWith(lastStep.uri, '/')) {
          nextStep.uri = _s.splice(nextStep.uri, 0, 1)
        }
        nextStep.uri = lastStep.uri + nextStep.uri
      } else {
        nextStep.uri = url.resolve(this.startUri, nextStep.uri)
      }
    }
  }
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
    templateParams = {}
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

module.exports = Walker
