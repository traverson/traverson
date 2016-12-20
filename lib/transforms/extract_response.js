'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * This transform is meant to be run at the very end of a get/post/put/patch/
 * delete call. It just extracts the last response from the step and calls
 * t.callback with it.
 */
module.exports = function extractDoc(t) {
  log.debug('walker.walk has finished');
  /*
  TODO Breaks a lot of tests although it seems to make perfect sense?!?
  if (!t.response) {
    t.callback(createError('No response available', errors.InvalidStateError));
    return false;
  }
  */

  t.callback(null, t.step.response);

  // This is a so called final transform that is only applied at the very end
  // and it always calls t.callback - in contrast to other transforms it does
  // not call t.callback in the error case, but as a success.
  // We return false to make sure processing ends here.
  return false;
};
