/* jshint loopfunc: true */
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

var nextTickAvailable = process &&
  Object.hasOwnProperty.call(process, 'nextTick');

/*
 * Applies async and sync transforms, one after another.
 */
function applyTransforms(transforms, t, callback) {
  log.debug('applying', transforms.length, 'transforms');
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    log.debug('next transform', transform);
    if (transform.isAsync) {
      // asynchronous case
      return transform(t, function(t) {
        // this is only called when the async transform was successful,
        // otherwise t.callback has already been called with an error.
        applyTransforms(transforms.slice(i + 1), t, callback);
      });
    } else {
      // synchronous case
      var result = transform(t);
      if (!result) {
        log.debug('transform has failed or was a final transform');
        // stop processing t.callback has already been called
        return;
      }
    }
  }
  log.debug('all transformations done, starting next step');
  if (nextTickAvailable) {
    return process.nextTick(function() {
      callback(t);
    });
  }
  return callback(t);
}

module.exports = applyTransforms;
