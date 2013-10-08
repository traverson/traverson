'use strict';

var RequestBuilder = require('./request_builder')

function ApiClient(mediaType, fromUri) {
  this.mediaType = mediaType
  this.fromUri = fromUri
}

ApiClient.prototype.newRequest = function() {
  return new RequestBuilder(this.mediaType, this.fromUri)
}

module.exports = ApiClient
