/* jshint -W072 */
({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([
  'minilog',
  '../traverson',
  '../lib/json_walker',
  '../lib/walker_builder',
  './util/mock_response',
  './util/wait_for',
  'chai',
  'sinon',
  'sinon-chai'
], function (
  minilog,
  traverson,
  JsonWalker,
  WalkerBuilder,
  mockResponse,
  waitFor,
  chai,
  maybeSinon,
  sinonChai
) {
  /* jshint +W072 */
  'use strict';

  var log = minilog('test')
  // Node.js: sinon is defined by require; Browser: sinon is a global var
  var localSinon = maybeSinon ? maybeSinon : sinon

  chai.should()
  var assert = chai.assert
  var expect = chai.expect
  chai.use(sinonChai)

  /*
   * Tests for all of Json Walker's request methods except getResource, which is
   * tested extensively in json_get_resource.js. This test suite contains tests
   * for get, post, put, delete and patch. Each http method verb has it's own
   * describe-section. Since most of the code path is the same for getResource
   * and get, post, ..., there are only a few basic tests here for each verb.
   * The getResource tests are more comprehensive.
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
    var templateUri = rootUri + '/template/{param}'

    var rootResponse = mockResponse({
      'get_link': getUri,
      'post_link': postUri,
      'put_link': putUri,
      'patch_link': patchUri,
      'delete_link': deleteUri,
      'template_link': templateUri
    })

    var result = mockResponse({ result: 'success' })

    var payload = {
      some: 'stuff',
      data: 4711
    }

    beforeEach(function() {
      api = client.newRequest()
      get = localSinon.stub()
      api.walker.request = { get: get }
      callback = localSinon.spy()

      get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      get.withArgs(getUri, localSinon.match.func).callsArgWithAsync(1, null,
          result)
      get.withArgs(postUri, localSinon.match.func).callsArgWithAsync(1,
          new Error('GET is not implemented for this URI, only POST'))

      executeRequest = localSinon.stub(WalkerBuilder.prototype,
          'executeRequest')
    })

    afterEach(function() {
      WalkerBuilder.prototype.executeRequest.restore()
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

      it('should call callback with err', function(done) {
        var err = new Error('test error')
        // Default stubbing from beforeEach is not what we want here.
        // IMO, get.reset() should be enough, but isnt?
        get = localSinon.stub()
        api.walker.request = { get: get }
        get.callsArgWithAsync(1, err)
        api.walk().get(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(err)
            done()
          }
        )
      })

      it('should call callback with err when walking along the links fails',
          function(done) {
        var err = new Error('test error')
        // Default stubbing from beforeEach is not what we want here.
        // IMO, get.reset() should be enough, but isnt?
        get = localSinon.stub()
        api.walker.request = { get: get }
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        get.withArgs(getUri, localSinon.match.func).callsArgWithAsync(1, err)
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

    describe('getUri method', function() {
      it('should walk along the links and yield the last URI', function(done) {
        api.walk('get_link').getUri(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, getUri)
            get.callCount.should.equal(1)
            done()
          }
        )
      })

      it('should yield resolved URI if last URI is a URI template',
          function(done) {
        api.walk('template_link')
          .withTemplateParameters({ param: 'substituted' })
          .getUri(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null,
                rootUri + '/template/substituted')
            get.callCount.should.equal(1)
            done()
          }
        )
      })
    })


    describe('post method', function() {

      var result = mockResponse({ result: 'success' }, 201)

      it('should walk along the links and post to the last URI',
          function(done) {
        executeRequest.withArgs(postUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, null, result, postUri)
        api.walk('post_link').post(payload, callback)
        waitFor(
          function() { return callback.called },
          function() {
            executeRequest.should.have.been.calledWith(postUri,
                localSinon.match.func, payload, localSinon.match.func)
            callback.should.have.been.calledWith(null, result, postUri)
            done()
          }
        )
      })

      it('should call callback with err when post fails',
          function(done) {
        var err = new Error('test error')
        executeRequest.withArgs(postUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, err)
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

      var result = mockResponse({ result: 'success' }, 200)

      it('should walk along the links and put to the last URI',
          function(done) {
        executeRequest.withArgs(putUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, null, result, putUri)
        api.walk('put_link').put(payload, callback)
        waitFor(
          function() { return callback.called },
          function() {
            executeRequest.should.have.been.calledWith(putUri,
                localSinon.match.func, payload, localSinon.match.func)
            callback.should.have.been.calledWith(null, result, putUri)
            done()
          }
        )
      })

      it('should call callback with err when put fails',
          function(done) {
        var err = new Error('test error')
        executeRequest.withArgs(putUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, err)
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

    describe('patch method', function() {

      var result = mockResponse({ result: 'success' }, 200)

      it('should walk along the links and patch the last URI',
          function(done) {
        executeRequest.withArgs(patchUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, null, result, patchUri)
        api.walk('patch_link').patch(payload, callback)
        waitFor(
          function() { return callback.called },
          function() {
            executeRequest.should.have.been.calledWith(patchUri,
                localSinon.match.func, payload, localSinon.match.func)
            callback.should.have.been.calledWith(null, result, patchUri)
            done()
          }
        )
      })

      it('should call callback with err when patch fails',
          function(done) {
        var err = new Error('test error')
        executeRequest.withArgs(patchUri, localSinon.match.func, payload,
            localSinon.match.func).callsArgWithAsync(3, err, null)
        api.walk('patch_link').patch(payload, callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(err)
            done()
          }
        )
      })
    })

    describe('delete method', function() {

      var result = mockResponse(null, 204)

      it('should walk along the links and delete the last URI',
          function(done) {
        executeRequest.withArgs(deleteUri, localSinon.match.func, null,
            localSinon.match.func).callsArgWithAsync(3, null, result, deleteUri)
        api.walk('delete_link').delete(callback)
        waitFor(
          function() { return callback.called },
          function() {
            executeRequest.should.have.been.calledWith(deleteUri,
                localSinon.match.func, null, localSinon.match.func)
            callback.should.have.been.calledWith(null, result, deleteUri)
            done()
          }
        )
      })

      it('should call callback with err when delete fails',
          function(done) {
        var err = new Error('test error')
        executeRequest.withArgs(deleteUri, localSinon.match.func, null,
            localSinon.match.func).callsArgWithAsync(3, err)
        api.walk('delete_link').delete(callback)
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
})
