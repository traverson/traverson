'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

module.exports = function switchToNextStep(ws) {
  // extract next link to follow from last response
  var link = ws.links[ws.step.index];
  log.debug('next link: ' + link);

  // save last step before overwriting it with the next step (required for
  // relative URL resolution, where we need the last URL)
  ws.lastStep = ws.step;

  ws.step = findNextStep(ws, ws.lastStep.doc, link);
  if (!ws.step) return false;
  log.debug('next step: ', ws.step);
  ws.step.index = ws.lastStep.index + 1;
  return true;
};

function findNextStep(ws, doc, link) {
  try {
    return ws.adapter.findNextStep(doc, link);
  } catch (e) {
    log.error('could not find next step');
    log.error(e);
    ws.callback(e);
    return null;
  }
}
