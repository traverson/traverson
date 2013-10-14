'use strict';

var log = require('minilog')('traverson');

var Walker = require('./walker')

function JsonHalWalker() {
}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.preProcessLink = function(link) {
  // TODO XXX !!!
  return '$._links.' + link + '.href'
}

JsonHalWalker.prototype.postProcessUri = function(nextUri) {
  // TODO XXX !!!
  return 'http://api.io' + nextUri
}


module.exports = JsonHalWalker
