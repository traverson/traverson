'use strict';

var minilog = require('minilog')
  , mediaTypes = require('./lib/media_types')
  , Builder = require('./lib/builder')
  , mediaTypes = require('./lib/media_types')
  , mediaTypeRegistry = require('./lib/media_type_registry');

// activate this line to enable logging
// require('minilog').enable();

// export builder for traverson-angular
exports._Builder = Builder;

exports.from = function from(uri) {
  return {
    newRequest: function() {
      return new Builder(mediaTypes.CONTENT_NEGOTIATION, uri);
    }
  };
};

// Provided for backward compatibility with version 0.15.0 and below.
// The preferred way to set the media type explicitly is now calling
// mediaType(...) on the builder - or use content negotiation.
exports.json = {
  from: function(uri) {
    return {
      newRequest: function() {
        return new Builder(mediaTypes.JSON, uri);
      }
    };
  }
},

// Provided for backward compatibility with version 0.15.0 and below.
// The preferred way to set the media type explicitly is now calling
// mediaType(...) on the builder - or use content negotiation.
exports.jsonHal = {
  from: function(uri) {
    if (!mediaTypeRegistry.get(mediaTypes.JSON_HAL)) {
      throw new Error('JSON HAL adapter is not registered. From version ' +
        '1.0.0 on, Traverson has no longer built-in support for ' +
        'application/hal+json. HAL support was moved to a separate, optional ' +
        'plug-in. See https://github.com/basti1302/traverson-hal');
    }
    return {
      newRequest: function() {
        return new Builder(mediaTypes.JSON_HAL, uri);
      }
    };
  }
};

// expose media type registry so that media type plug-ins can register
// themselves
exports.registerMediaType = mediaTypeRegistry.register;
