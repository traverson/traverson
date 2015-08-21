'use strict';

module.exports = function apply(transforms, t) {
  for (var i = 0; i < transforms.length; i++) {
    var transform = transforms[i];
    var result = transform.call(null, t);
    if (!result) {
      return false;
    }
  }
  return true;
};
