'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)
var waitFor = require('./wait_for')

var traverson = require('../traverson')

describe('The json walker (when tested against a local server)', function() {

  var testServer
  var jsonWalker
  var callback
  var rootUri = 'http://127.0.0.1:2808/'

  before(function() {
    var TestServer = require('./server/test_server.js')
    testServer = new TestServer()
    testServer.start()
  })

  after(function() {
    testServer.stop()
  })

  beforeEach(function() {
    jsonWalker = new traverson.JsonWalker()
    callback = sinon.spy()
  })

  it('should fetch the root document', function(done) {
    jsonWalker.walk(rootUri, [], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.first.should.exist
        resultDoc.first.should.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should walk a single element path', function(done) {
    jsonWalker.walk(rootUri, ['first'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.first.should.exist
        resultDoc.first.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path', function(done) {
    jsonWalker.walk(rootUri, ['second', 'doc'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should leverage JSONPath', function(done) {
    jsonWalker.walk(rootUri, ['$.jsonpath.nested.key'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.third.should.exist
        resultDoc.third.should.equal('document')
        done()
      }
    )
  })

  it('should leverage URI templates', function(done) {
    jsonWalker.walk(rootUri, ['uri_template'], {param: 'foobar', id: 13},
      callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.some.should.equal('document')
        resultDoc.param.should.equal('foobar')
        resultDoc.id.should.equal(13)
        done()
      }
    )
  })
})
