'use strict';

var JsonAdapter = require('./json_adapter');

module.exports = {
  CONTENT_NEGOTIATION: 'content-negotiation',
  JSON: JsonAdapter.mediaType,
  JSON_HAL: 'application/hal+json',
};
