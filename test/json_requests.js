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

/*
 * Tests for all of Json Walker's request methods except getResource, which is
 * tested extensively in json_get_resource.js. This test suite contains tests
 * for get, post, put, delete and patch. Each http method verb has it's own
 * describe-section. Since most of the code path is the same for getResource
 * and get, post, ..., there are only a few basic tests here for each verb. The
 * getResource tests are more comprehensive.
 */
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

  var payload = {
    some: 'stuff',
    data: 4711
  }

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

    var result = mockResponse({ result: 'success' }, 201)

    beforeEach(function() {
      originalPost = JsonWalker.prototype.post
      JsonWalker.prototype.post = post = sinon.stub()
    })

    it('should walk along the links and post to the last URI',
        function(done) {
      post.withArgs(postUri, payload, sinon.match.func).callsArgWithAsync(
          2, null, null)
      api.walk('post_link').post(payload, callback)
      waitFor(
        function() { return post.called || callback.called },
        function() {
          post.should.have.been.calledWith(postUri, payload, sinon.match.func)
          callback.should.have.been.calledWith(null, null)
          done()
        }
      )
    })

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error')
      post.withArgs(postUri, payload, sinon.match.func).callsArgWithAsync(
          2, err, null)
      api.walk('post_link').post(payload, callback)
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
