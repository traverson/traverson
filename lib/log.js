'use strict';

// TODO Replace by a proper logging module, suited for the browser

define([], function() {

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
