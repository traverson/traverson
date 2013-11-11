'use strict';

var halbert = require('halbert')
var minilog = require('minilog')
var _s = require('underscore.string')
var Walker = require('./walker')

var log = minilog('traverson')
var parseHal = halbert.parser

function JsonHalWalker() {}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.findNextStep = function(doc, link) {
  log.debug('parsing hal')
  var halResource = parseHal(doc, false)
  var halLinks = halResource.links(link)
  if (halLinks && halLinks[0] && halLinks[0].href) {
    log.debug('found hal link: ' + halLinks[0].href)
    return { uri: halLinks[0].href }
  }
  var stepForEmbeddedDoc = this.findEmbedded(halResource, link)
  if (stepForEmbeddedDoc) {
    return stepForEmbeddedDoc
  } else {
    throw new Error('Could not find a link nor an embedded object for ' +
        link + ' in document:\n' + JSON.stringify(doc))
  }
}

JsonHalWalker.prototype.postProcessStep = function(nextStep) {
  if (nextStep.uri) {
    if (_s.endsWith(this.startUri, '/') &&
        _s.startsWith(nextStep.uri, '/')) {
      nextStep.uri = _s.splice(nextStep.uri, 0, 1)
    }
    nextStep.uri = this.startUri + nextStep.uri
  }
}

JsonHalWalker.prototype.findEmbedded = function(halResource, link) {
  log.debug('checking for embedded: ' + link)
  var nextResource = halResource.embedded(link)
  if (nextResource) {
    log.debug('found embedded doc for: ' + link)
    return { doc: nextResource }
  } else {
    return null
  }
}

module.exports = JsonHalWalker
