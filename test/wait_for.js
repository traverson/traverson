'use strict';

module.exports = function(test, onSuccess, polling) {
  polling = polling || 10
  var handle = setInterval(function() {
    if (test()) {
      clearInterval(handle)
      onSuccess()
    }
  }, polling)
}
