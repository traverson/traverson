'use strict';

exports.isNodeJs = function isNodeJs() {
  // can't use strict here
  if (typeof window !== 'undefined') {
    return false;
  } else if (typeof process !== 'undefined') {
    return true;
  } else {
    throw new Error('Can\'t figure out environment. ' +
        'Seems it\'s neither Node.js nor a browser.');
  }
};

exports.isPhantomJs = function isPhantomJs() {
  return typeof window !== 'undefined' && window.mochaPhantomJS;
};
