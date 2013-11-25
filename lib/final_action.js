'use strict';

var minilog = require('minilog')
var log = minilog('traverson')

function FinalAction(walker) {
  this.walker = walker
}

FinalAction.prototype.get = function(nextStep, callback) {
  log.debug('next step: ' + JSON.stringify(nextStep, null, 2))
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned')
    if (err) { return callback(err, step.response, step.uri) }
    if (!step.response && step.doc) {
      log.debug('faking HTTP response for embedded resource')
      step.response = {
        statusCode: 200,
        body: JSON.stringify(step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      }
    }
    callback(null, step.response)
  })
}

FinalAction.prototype.getResource = function(nextStep, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  var self = this
  log.debug('next step: ' + JSON.stringify(nextStep))
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned')
    if (err) { return callback(err, step.response, step.uri) }
    // log.debug('resulting step: ' + JSON.stringify(step, null, 2))

    if (step.doc) {
      // return an embedded doc immediately
      return callback(null, step.doc)
    }

    var resource
    try {
      self.walker.checkHttpStatus(step)
      resource = self.walker.parse(step)
      return callback(null, resource)
    } catch (e) {
      return callback(e, e.doc)
    }
  })
}

FinalAction.prototype.getUri = function(nextStep, callback) {
  var self = this
  log.debug('returning uri')
  if (nextStep.uri) {
    return callback(null, nextStep.uri)
  } else if (nextStep.doc &&
    nextStep.doc._links &&
    nextStep.doc._links.self &&
    nextStep.doc._links.self.href) {
    return callback(null, self.walker.startUri +
        nextStep.doc._links.self.href)
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'))
  }
}

FinalAction.prototype.walkAndExecute = function(body, request, method,
    callback) {
  var self = this
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned')
    if (err) { return callback(err, lastStep.response, lastStep.uri) }
    log.debug('executing final request with step: ' +
        JSON.stringify(nextStep))
    self.executeRequest(nextStep.uri, request, method, body, callback)
  })
}

FinalAction.prototype.executeRequest = function(uri, request, method, body,
    callback) {
  var options
  if (body) {
    options = { body: JSON.stringify(body) }
  } else {
    options = {}
  }
  log.debug('request to ' + uri + ' with options ' + JSON.stringify(options))
  method.call(request, uri, options, function(err, response) {
    log.debug('request to ' + uri + ' succeeded')
    if (err) { return callback(err, response, uri) }
    return callback(null, response, uri)
  })
}

module.exports = FinalAction
