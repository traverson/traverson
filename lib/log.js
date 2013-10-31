// TODO Replace by a proper logging module, suited for the browser
// and use minilog for node again

({
  define: typeof define === 'function'
    ? define
    : function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';

  function Logger() {}

  Logger.prototype.debug = function(message) {
    console.log('debug: ' + message)
  }

  Logger.prototype.info = function(message) {
    console.log('info: ' + message)
  }

  Logger.prototype.warn = function(message) {
    console.log('warn: ' + message)
  }

  Logger.prototype.error = function(message) {
    console.log('error: ' + message)
  }

  return new Logger()
})
