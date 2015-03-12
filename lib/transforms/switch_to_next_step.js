'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function switchToNextStep(t) {
  // extract next link to follow from last response
  var link = t.links[t.step.index];
  log.debug('next link: ' + link);

  // save last step before overwriting it with the next step (required for
  // relative URL resolution, where we need the last URL)
  t.lastStep = t.step;

  t.step = findNextStep(t, t.lastStep.doc, link);
  if (!t.step) return false;
  log.debug('next step: ', t.step);
  t.step.index = t.lastStep.index + 1;
  return true;
};

function findNextStep(t, doc, link) {
  try {
    return t.adapter.findNextStep(doc, link);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    t.callback(e);
    return null;
  }
}
