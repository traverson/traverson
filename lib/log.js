'use strict';

var methods = ['debug', 'info', 'warn', 'error']

// no logging for the browser build
/* jshint -W083 */
for (var i = 0; i < methods.length; i++) {
  exports[methods[i]] = function(s) {
    // do nothing
  }
}
/* jshint +W083 */
