/* jshint loopfunc: true */
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

/*
 * Applies async and sync transforms, one after another.
 */
function applyTransforms(transforms, t, callback) {
  log.debug('applying', transforms.length, 'transforms');
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    log.debug('next transform', transform);
    if (transform.isAsync) {
      log.debug('transform is asynchronous');
      // asynchronous case
      return transform(t, function(t) {
        // this is only called when the async transform was successful,
        // otherwise t.callback has already been called with an error.
        log.debug('asynchronous transform finished successfully, applying ' +
          'remaining transforms.');
        applyTransforms(transforms.slice(i + 1), t, callback);
      });
    } else {
      log.debug('transform is synchronous');
      // synchronous case
      var result = transform(t);
      if (!result) {
        log.debug('transform has failed');
        // stop processing t.callback has already been called
        return;
      }
      log.debug('transform successful');
    }
  }
  log.debug('all transforms done');
  return process.nextTick(function() {
    callback(t);
  });
}

module.exports = applyTransforms;
