'use strict';

var log = require('minilog')('traverson');

var Walker = require('./walker')

function JsonHalWalker() {
}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.preProcessLink = function(link) {
  // TODO XXX !!!
  // Use a propert HAL library instead of this ad hoc sillyness :-)
  return '$._links.' + link + '.href'
}

JsonHalWalker.prototype.postProcessUri = function(nextUri) {
  return this.startUri + nextUri
}


module.exports = JsonHalWalker
