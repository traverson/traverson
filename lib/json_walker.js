'use strict';

define(function(require, exports, module) {

var log = require('./log')
var Walker = require('./walker')

function JsonWalker() {
}

JsonWalker.prototype = new Walker()

module.exports = JsonWalker
})
