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
  var originalGet
  var get
  var originalPost
  var post
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

    originalGet = JsonWalker.prototype.get
    JsonWalker.prototype.get = get = sinon.stub()

    callback = sinon.spy()

    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse)
    get.withArgs(getUri, sinon.match.func).callsArgWithAsync(1, null, result)
    get.withArgs(postUri, sinon.match.func).callsArgWithAsync(1,
      new Error('GET is not implemented for this URI, only POST'))
  })

  afterEach(function() {
    JsonWalker.prototype.get = originalGet
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
      get.withArgs(rootUri + '/link/to/resource', sinon.match.func).
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

    var postBody = {
      some: 'stuff',
      data: 4711
    }

    var result = mockResponse({ result: 'success' }, 201)

    beforeEach(function() {
      originalPost = JsonWalker.prototype.post
      JsonWalker.prototype.post = post = sinon.stub()
      post.withArgs(postUri, postBody, sinon.match.func).callsArgWithAsync(
          2, null, null)
    })

    it('should walk along the links and post to the last URI',
        function(done) {
      api.walk('post_link').post(postBody, callback)
      waitFor(
        function() { return post.called || callback.called },
        function() {
          post.should.have.been.calledWith(postUri, postBody, sinon.match.func)
          callback.should.have.been.calledWith(null, null)
          done()
        }
      )
    })

    it.skip('should call callback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error')
      get.withArgs(rootUri + '/link/to/resource', sinon.match.func).
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
