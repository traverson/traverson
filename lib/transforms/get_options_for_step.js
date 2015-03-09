'use strict';

var minilog = require('minilog')
  , log = minilog('traverson')
  , util = require('util');

module.exports = function getOptionsForStep(ws) {
  var options = ws.requestOptions;
  if (util.isArray(ws.requestOptions)) {
    options = ws.requestOptions[ws.step.index] || {};
  }
  log.debug('options: ', options);
  return options;
};
