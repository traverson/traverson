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

  var getUri = rootUri + '/link/to/resource'
  var postUri = rootUri + '/post/something/here'

  var rootResponse = mockResponse({
    'get_link': getUri,
    'post_link': postUri
  })

  var result = mockResponse({ result: 'success' })

  beforeEach(function() {
    api = client.newRequest()
    originalFetch = JsonWalker.prototype.fetch
    JsonWalker.prototype.fetch = fetch = sinon.stub()
    callback = sinon.spy()

    fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse)
    fetch.withArgs(getUri, sinon.match.func).callsArgWithAsync(1, null, result)
    fetch.withArgs(postUri, sinon.match.func).callsArgWithAsync(1,
      new Error('GET is not implemented for this URI, only POST'))
  })

  afterEach(function() {
    JsonWalker.prototype.fetch = originalFetch
  })

  describe('get method', function() {

    it('should walk along the links', function(done) {
      api.walk('get_link').get(callback)
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
      api.walk('get_link', 'another_link').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(err)
          done()
        }
      )
    })

  })

  describe('post method', function() {


    it.skip('should walk along the links', function(done) {
      api.walk('post_link').post(callback)
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
      api.walk('post_link', 'another_link').post(callback)
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
