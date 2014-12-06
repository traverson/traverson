'use strict';

var minilog = require('minilog')
  , mediaTypes = require('./lib/media_types')
  , Builder = require('./lib/builder');

// activate this line to enable logging
// require('minilog').enable();

module.exports = {
  _Builder: Builder,
  from: function(uri) {
    return {
      newRequest: function() {
        return new Builder(mediaTypes.CONTENT_NEGOTIATION, uri);
      }
    };
  },
  json: {
    from: function(uri) {
      return {
        newRequest: function() {
          return new Builder(mediaTypes.JSON, uri);
        }
      };
    }
  },
  jsonHal: {
    from: function(uri) {
      return {
        newRequest: function() {
          return new Builder(mediaTypes.JSON_HAL, uri);
        }
      };
    }
  }
};
