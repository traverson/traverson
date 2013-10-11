'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var traverson = require('../traverson')
var JsonWalker = require('../lib/json_walker')
var RequestBuilder = require('../lib/request_builder')

var mockResponse = require('./util/mock_response')
var waitFor = require('./util/wait_for')

/*
 * Tests for all of Json Walker's request methods except getResource, which is
 * tested extensively in json_get_resource.js. This test suite contains tests
 * for get, post, put, delete and patch. Each http method verb has it's own
 * describe-section. Since most of the code path is the same for getResource
 * and get, post, ..., there are only a few basic tests here for each verb. The
 * getResource tests are more comprehensive.
 */
describe('The JSON client\'s', function() {

  var get
  var executeRequest

  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

  var getUri = rootUri + '/link/to/resource'
  var postUri = rootUri + '/post/something/here'
  var putUri = rootUri + '/put/something/here'
  var patchUri = rootUri + '/patch/me'
  var deleteUri = rootUri + '/delete/me'

  var rootResponse = mockResponse({
    'get_link': getUri,
    'post_link': postUri,
    'put_link': putUri,
    'patch_link': patchUri,
    'delete_link': deleteUri
  })

  var result = mockResponse({ result: 'success' })

  var payload = {
    some: 'stuff',
    data: 4711
  }

  beforeEach(function() {

    api = client.newRequest()
    get = sinon.stub(JsonWalker.prototype, 'get')
    callback = sinon.spy()

    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse)
    get.withArgs(getUri, sinon.match.func).callsArgWithAsync(1, null, result)
    get.withArgs(postUri, sinon.match.func).callsArgWithAsync(1,
      new Error('GET is not implemented for this URI, only POST'))
  })

  afterEach(function() {
    JsonWalker.prototype.get.restore()
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
      executeRequest = sinon.stub(RequestBuilder.prototype, 'executeRequest')
    })

    afterEach(function() {
      RequestBuilder.prototype.executeRequest.restore()
    })

    it('should walk along the links and post to the last URI',
        function(done) {
      executeRequest.withArgs(postUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, null, null)
      api.walk('post_link').post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          executeRequest.should.have.been.calledWith(postUri, sinon.match.func,
              payload, sinon.match.func)
          callback.should.have.been.calledWith(null, null)
          done()
        }
      )
    })

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(postUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, err, null)
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

  describe('put method', function() {

    beforeEach(function() {
      executeRequest = sinon.stub(RequestBuilder.prototype, 'executeRequest')
    })

    afterEach(function() {
      RequestBuilder.prototype.executeRequest.restore()
    })

    it('should walk along the links and put to the last URI',
        function(done) {
      executeRequest.withArgs(putUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, null, null)
      api.walk('put_link').put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          executeRequest.should.have.been.calledWith(putUri, sinon.match.func,
              payload, sinon.match.func)
          callback.should.have.been.calledWith(null, null)
          done()
        }
      )
    })

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(putUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, err, null)
      api.walk('put_link').put(payload, callback)
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
