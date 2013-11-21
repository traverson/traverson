'use strict';

var halfred = require('halfred')
var minilog = require('minilog')
var _s = require('underscore.string')
var Walker = require('./walker')

var log = minilog('traverson')

function JsonHalWalker() {}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.findNextStep = function(doc, link) {
  log.debug('parsing hal')
  var halResource = halfred.parse(doc)

  // try _links first
  var halLinkHref = firstMatchingLinkWithHref(halResource, link)
  if (halLinkHref) {
    return { uri: halLinkHref }
  }

  // no link found, check for _embedded
  var stepForEmbeddedDoc = this.findEmbedded(doc, halResource, link)
  if (stepForEmbeddedDoc) {
    return stepForEmbeddedDoc
  } else {
    throw new Error('Could not find a link nor an embedded object for ' +
        link + ' in document:\n' + JSON.stringify(doc))
  }
}

function firstMatchingLinkWithHref(halResource, link) {
  var halLinks = halResource.linkArray(link)
  var halLink
  var linkIndex
  if (halLinks) {
    for (linkIndex = 0; linkIndex < halLinks.length; linkIndex++) {
      if (halLinks[linkIndex].href) {
        halLink = halLinks[linkIndex]
        break
      }
    }
  }
  if (halLink) {
    if (halLinks.length > 1) {
      log.warn('Found HAL link array with more than one element for ' +
          'key ' + link + ', arbitrarily choosing index ' + linkIndex +
          ', because it was the first that had a href attribute.')
    }
    log.debug('found hal link: ' + halLink.href)
    return halLink.href
  }
  return null
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

JsonHalWalker.prototype.findEmbedded = function(doc, halResource, link) {
  log.debug('checking for embedded: ' + link)
  // TODO The first embedded resource in the array is not necessarily the one we
  // want...
  var nextResourceArray = halResource.embedded(link)
  if (nextResourceArray) {
    log.debug('found embedded doc for: ' + link)
    return { doc: doc._embedded[link] }
  } else {
    return null
  }
}

module.exports = JsonHalWalker
