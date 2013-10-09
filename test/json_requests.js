'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var waitFor = require('./wait_for')
var mockResponse = require('./mock_response')

var traverson = require('../traverson')
var JsonWalker = require('../lib/json_walker')

describe('The JSON client\'s', function() {

  var request
  var originalFetch
  var fetch
  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

  var rootResponse = mockResponse({ link: rootUri + '/link/to/resource' })
  var result = mockResponse({ result: 'success' })

  beforeEach(function() {
    api = client.newRequest()
    originalFetch = JsonWalker.prototype.fetch
    JsonWalker.prototype.fetch = fetch = sinon.stub()
    callback = sinon.spy()

    fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse)
    fetch.withArgs(rootUri + '/link/to/resource',
        sinon.match.func).callsArgWithAsync(1, null, result)
  })

  afterEach(function() {
    JsonWalker.prototype.fetch = originalFetch
  })

  describe('get method', function() {

    it('should walk along the links', function(done) {
      api.walk('link').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, result)
          done()
        }
      )
    })

    it('should call callback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error')
      fetch.withArgs(rootUri + '/link/to/resource', sinon.match.func).
          callsArgWithAsync(1, err)
      api.walk('link', 'another_link').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(err)
          done()
        }
      )
    })

  })

  describe.skip('post method', function() {

    it.skip('should walk along the links', function(done) {
      api.walk('link').post(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, result)
          done()
        }
      )
    })

    it.skip('should call callback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error')
      fetch.withArgs(rootUri + '/link/to/resource', sinon.match.func).
          callsArgWithAsync(1, err)
      api.walk('link', 'another_link').post(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(err)
          done()
        }
      )
    })

  })


})
