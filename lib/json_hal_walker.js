'use strict';

var parseHal = require('halbert').parser
var log = require('minilog')('traverson');

var Walker = require('./walker')

function JsonHalWalker() {
}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.findNextStep = function(doc, link) {
  log.debug('parsing hal')
  var halResource = parseHal(doc)
  var halLink = halResource.links(link)
  if (halLink && halLink.href) {
    log.debug('found hal link: ' + halLink.href)
    return { uri: halLink.href }
  }
  var stepForEmbeddedDoc = this.findEmbedded(halResource, link)
  if (stepForEmbeddedDoc) {
    return stepForEmbeddedDoc
  } else {
    throw new Error('Could not find a link nor an embedded object for ' + link +
        ' in document:\n' + JSON.stringify(doc))
  }
}

JsonHalWalker.prototype.postProcessStep = function(nextStep) {
  if (nextStep.uri) {
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
