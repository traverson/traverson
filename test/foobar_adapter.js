'use strict';

function FoobarAdapter(log) {
  this.log = log;
}

FoobarAdapter.mediaType = 'application/foobar+json';

FoobarAdapter.prototype.findNextStep = function(t, link) {
  this.log.debug('logging something');
  return {
    // No matter what has been specified in the follow method, this adapter
    // always returns the link relation foobar from the doc.
    url: t.lastStep.doc.foobar,
  };
};

module.exports = FoobarAdapter;
