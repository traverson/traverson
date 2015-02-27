'use strict';

function mergeRecursive(obj1, obj2) {
  /*jshint maxcomplexity: 8 */
  if (!obj1 && obj2) {
    obj1 = {};
  }
  for (var key in obj2) {
    if (!obj2.hasOwnProperty(key)) {
      continue;
    }
    if (typeof obj2[key] === 'object') {
      // if it is an object (that is, a non-leave in the tree),
      // and it is not present in obj1
      if (!obj1[key] || typeof obj1[key] !== 'object') {
        // ... we create an empty object in obj1
        obj1[key] = {};
      }
      // and we recurse deeper into the structure
      mergeRecursive(obj1[key], obj2[key]);
    } else if (typeof obj2[key] !== 'function') {
      // if it is primitive (string, number, boolean), we overwrite/add it to
      // obj1
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

module.exports = mergeRecursive;
