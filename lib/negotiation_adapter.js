'use strict';

function NegotiationAdapter() {
  this.contentNegotiation = true;
}

NegotiationAdapter.prototype.findNextStep = function(doc, link) {
  throw new Error('Content negotiation did not happen');
};

module.exports = NegotiationAdapter;
