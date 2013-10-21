'use strict';

var parseHal = require('halbert').parser
var log = require('minilog')('traverson');

var Walker = require('./walker')

function JsonHalWalker() {
}

JsonHalWalker.prototype = new Walker()

JsonHalWalker.prototype.extractLink = function(doc, link) {
  var halResource = parseHal(doc)
  var halLink = halResource.links(link)
  return halLink.href
}

JsonHalWalker.prototype.postProcessUri = function(nextUri) {
  return this.startUri + nextUri
}


module.exports = JsonHalWalker
