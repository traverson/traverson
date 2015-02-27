'use strict';

module.exports = function mergeRecursive(obj1, obj2) {
  for (var p in obj2) {
    if (!obj2.hasOwnProperty(p)) {
      continue;
    }
    try {
      // Property in destination object set; update its value.
      if (obj2[p].constructor === Object ) {
        mergeRecursive(obj1[p], obj2[p]);
      } else {
        obj1[p] = obj2[p];
      }
    } catch(e) {
      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];
    }
  }
  return obj1;
};
