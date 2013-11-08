// TODO Replace by a proper logging module, suited for the browser

({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([], function () {
  'use strict';

  var enabled = false
  function Logger(id) {
    if (id == null) {
      id = ''
    }
    this.id = id
  }

  Logger.prototype.enable = function() {
    this.enabled = true
  }

  Logger.prototype.debug = function(message) {
    if (enabled) {
      console.log(this.id + '/debug: ' + message)
    }
  }

  Logger.prototype.info = function(message) {
    if (enabled) {
      console.log(this.id + '/info: ' + message)
    }
  }

  Logger.prototype.warn = function(message) {
    if (enabled) {
      console.log(this.id + '/warn: ' + message)
    }
  }

  Logger.prototype.error = function(message) {
    if (enabled) {
      console.log(this.id + '/error: ' + message)
    }
  }

  function minilog(id) {
    return new Logger(id)
  }

  minilog.enable = function() {
    enabled = true
  }

  return minilog
})
