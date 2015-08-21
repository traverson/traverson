'use strict';

module.exports = function isContinuation(t) {
  return t.continuation && t.step && t.step.response;
};
