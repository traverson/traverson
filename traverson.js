'use strict';

var ApiClient = require('./lib/api_client')
var mediaTypes = require('./lib/media_types')

exports.json = {
  from: function(startUri) {
    return new ApiClient(mediaTypes.JSON, startUri)
  }
}
