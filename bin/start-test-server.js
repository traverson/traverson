#!/usr/bin/env node

var path = require('path')
  , testServer = require('traverson-test-server');

// serve files from the root folder of the project
testServer.serveStatic(path.join(__dirname, '..'));
testServer.start();
