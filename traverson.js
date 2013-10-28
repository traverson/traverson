'use strict';

var mediaTypes = require('./lib/media_types')
var WalkerBuilder = require('./lib/walker_builder')

exports.json = {
  from: function(uri) {
    return {
      newRequest: function() {
        return new WalkerBuilder(mediaTypes.JSON, uri)
      }
    }
  }
}

exports.jsonHal = {
  from: function(uri) {
    return {
      newRequest: function() {
        return new WalkerBuilder(mediaTypes.JSON_HAL, uri)
      }
    }
  }
}
