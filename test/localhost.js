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

  var api
  var testServer
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
    api = traverson.json.from(rootUri).newRequest()
    callback = sinon.spy()
  })

  it('should fetch the root document', function(done) {
    api.walk().getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = basicChecks()
        resultDoc.first.should.exist
        resultDoc.first.should.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should walk a single element path', function(done) {
    api.walk('first').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = basicChecks()
        resultDoc.first.should.exist
        resultDoc.first.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path', function(done) {
    api.walk('second', 'doc').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = basicChecks()
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should leverage JSONPath', function(done) {
    api.walk('$.jsonpath.nested.key').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = basicChecks()
        resultDoc.third.should.exist
        resultDoc.third.should.equal('document')
        done()
      }
    )
  })

  it('should leverage URI templates', function(done) {
    api.walk('uri_template')
       .withTemplateParameters({param: 'foobar', id: 13})
       .getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = basicChecks()
        resultDoc.some.should.equal('document')
        resultDoc.param.should.equal('foobar')
        resultDoc.id.should.equal(13)
        done()
      }
    )
  })

  it('should fail gracefully on 404', function(done) {
    api.walk('blind_alley').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var error = callback.firstCall.args[0]
        error.should.exist
        error.name.should.equal('HTTPError')
        error.message.should.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.')
        error.uri.should.equal(rootUri + 'does/not/exist')
        error.httpStatus.should.equal(404)

        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.message.should.exist
        resultDoc.message.should.equal('document not found')
        done()
      }
    )
  })

  it('should fail gracefully on syntactically incorrect JSON', function(done) {
    api.walk('garbage').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var error = callback.firstCall.args[0]
        error.should.exist
        error.name.should.equal('JSONError')
        error.message.should.equal('The document at ' + rootUri + 'junk' +
          ' could not be parsed as JSON: { this will :: not parse')
        error.uri.should.equal(rootUri + 'junk')
        error.httpStatus.should.equal(200)
        error.body.should.equal('{ this will :: not parse')

        var resultDoc = callback.firstCall.args[1]
        expect(resultDoc).to.not.exist
        done()
      }
    )
  })

  function basicChecks() {
    callback.callCount.should.equal(1)
    var resultDoc = callback.firstCall.args[1]
    resultDoc.should.exist
    return resultDoc
  }
})
