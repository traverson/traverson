'use strict';

define(function(require, exports, module) {
  exports.isArray = function(o) {
    if (o == null) {
      return false
    }
    return Object.prototype.toString.call(o) === '[object Array]'
  }
})
