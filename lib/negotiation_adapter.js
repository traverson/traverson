'use strict';

var errorModule = require('./errors')
  , errors = errorModule.errors
  , createError = errorModule.createError;

function NegotiationAdapter(log) {}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw createError('Content negotiation did not happen',
    errors.InvalidStateError);
};

module.exports = NegotiationAdapter;
