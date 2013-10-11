'use strict';

var mediaTypes = require('./lib/media_types')
var RequestBuilder = require('./lib/request_builder')
//
//require('minilog').enable();

exports.json = {
  from: function(uri) {
    return {
      newRequest: function() {
        return new RequestBuilder(mediaTypes.JSON, uri)
      }
    }
  }
}
