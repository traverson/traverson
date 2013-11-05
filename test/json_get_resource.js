/* jshint -W072 */
({
  define: typeof define === 'function' ?
    define :
    function(deps, fn) { module.exports = fn.apply(null, deps.map(require)) }
}).define([
  'minilog',
  '../traverson',
  '../lib/json_walker',
  './util/mock_response',
  './util/wait_for',
  'chai',
  'sinon',
  'sinon-chai'
], function (
  minilog,
  traverson,
  JsonWalker,
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

  describe('getResource for JSON', function() {

    var get
    var callback
    var rootUri = 'http://api.io'
    var client = traverson.json.from(rootUri)
    var api

    var result = mockResponse({ foo: 'bar' })

    beforeEach(function() {
      api = client.newRequest()
      get = localSinon.stub()
      api.walker.request = { get: get }
      callback = localSinon.spy()
    })

    describe('with its basic features', function() {
      var rootStep = {
        uri: rootUri
      }
      var rootResponse = mockResponse({
        irrelevant: { stuff: 'to be ignored' },
        link: rootUri + '/link/to/thing',
        more: { stuff: { that: 'we do not care about' } }
      })

      it('should access the root URI', function() {
        api.walk().getResource(callback)
        get.should.have.been.calledWith(rootUri, localSinon.match.func)
      })

      it('should call callback with the root doc', function(done) {
        get.callsArgWithAsync(1, null, rootResponse)
        api.walk().getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, rootResponse.doc)
            done()
          }
        )
      })

      it('should call callback with err', function(done) {
        var err = new Error('test error')
        get.callsArgWithAsync(1, err)
        api.walk().getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(err)
            done()
          }
        )
      })

      it('should walk a single element path', function(done) {
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        get.withArgs(rootUri + '/link/to/thing',
            localSinon.match.func).callsArgWithAsync(1, null, result)
        api.walk('link').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })

      it('should walk a single element path as array', function(done) {
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        get.withArgs(rootUri + '/link/to/thing',
            localSinon.match.func).callsArgWithAsync(1, null, result)
        api.walk(['link']).getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })

      it('should call callback with err if link is not found', function(done) {
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        api.walk('non-existing-link').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            assert(callback.calledOnce)
            callback.should.have.been.calledWith(localSinon.match.
                instanceOf(Error))
            callback.args[0][0].message.should.contain('Could not find ' +
                'property non-existing-link')
            done()
          }
        )
      })

      it('should call callback with err inside recursion', function(done) {
        var err = new Error('test error')
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, mockResponse({ firstLink: rootUri + '/first' }))
        get.withArgs(rootUri + '/first', localSinon.match.func).
            callsArgWithAsync(1, err)
        api.walk('firstLink').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(err)
            done()
          }
        )
      })
    })

    describe('with JSONPath', function() {

      var uri = rootUri + '/path/to/resource'
      var rootResponse = mockResponse({
        deeply: { nested: { link: uri } }
      })

      var result = mockResponse({ the: 'result' })

      it('should walk to a link via JSONPath expression', function(done) {
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        get.withArgs(uri, localSinon.match.func).callsArgWithAsync(1, null,
            result)
        api.walk('$.deeply.nested.link').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })

      it('should call callback with err if JSONPath has no match',
          function(done) {
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponse)
        api.walk('$.deeply.nested.blink').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(localSinon.match.
                instanceOf(Error))
            callback.args[0][0].message.should.contain('JSONPath expression ' +
                '$.deeply.nested.blink returned no match')
            done()
          }
        )
      })

      it('should call callback with err if JSONPath has multiple matches',
          function(done) {
        var rootResponseMulti = mockResponse({
          arr: [ { foo: 'bar' }, { foo: 'baz' } ]
        })
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponseMulti)
        api.walk('$.arr[*].foo').getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(localSinon.match.
                instanceOf(Error))
            callback.args[0][0].message.should.contain('JSONPath expression ' +
                '$.arr[*].foo returned more than one match')
            done()
          }
        )
      })
    })

    describe('with URI templating', function() {

      it('should evaluate URI templates', function(done) {
        var rootResponseUriTemplate = mockResponse({
          firstTemplate: rootUri + '/users/{user}/things{/thing}'
        })
        var next = mockResponse({
          secondTemplate: rootUri + '/another/{id}'
        })

        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootResponseUriTemplate)
        get.withArgs(rootUri + '/users/basti1302/things/4711',
            localSinon.match.func).callsArgWithAsync(1, null, next)
        get.withArgs(rootUri + '/another/42',
            localSinon.match.func).callsArgWithAsync(1, null, result)
        api.walk('firstTemplate', 'secondTemplate')
           .withTemplateParameters({user: 'basti1302', thing: 4711, id: 42})
           .getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })

      it('should evaluate URI templates for the start URI', function(done) {
        var rootUriTemplate = mockResponse(
          { we: 'can haz use uri templates for root doc, yo!' })
        var startUriTemplate = rootUri + '/{param}/whatever'
        var startUri = rootUri + '/substituted/whatever'
        var api = traverson
            .json
            .from(startUriTemplate)
            .newRequest()
        get = localSinon.stub()
        api.walker.request = { get: get }
        get.withArgs(startUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootUriTemplate)

        api.walk()
            .withTemplateParameters({param: 'substituted'})
            .getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, rootUriTemplate.doc)
            done()
          }
        )
      })

      it('should evaluate URI templates with array of template params',
          function(done) {
        var rootUriTemplate = mockResponse({
          firstTemplate: rootUri + '/users/{user}/things{/thing}'
        })
        var next = mockResponse({
          secondTemplate: rootUri + '/another_user/{user}'
        })
        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, rootUriTemplate)
        get.withArgs(rootUri + '/users/basti1302/things/4711',
            localSinon.match.func).callsArgWithAsync(1, null, next)
        get.withArgs(rootUri + '/another_user/someone_else',
            localSinon.match.func).callsArgWithAsync(1, null, result)
        api.walk('firstTemplate', 'secondTemplate')
          .withTemplateParameters([null,
                                  {user: 'basti1302', thing: 4711},
                                  {user: 'someone_else'}])
          .getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })
    })

    describe('in all its glory', function() {

      it('should walk a multi element path', function(done) {
        var path1 = rootUri + '/path'
        var template2 = rootUri + '/path/to/resource{/param}'
        var path2 = rootUri + '/path/to/resource/gizmo'
        var path3 = rootUri + '/path/to/another/resource'
        var path4 = rootUri + '/path/to/the/last/resource'

        var root = mockResponse({ link1: path1 })
        var response2 = mockResponse({ link2: template2 })
        var response3 = mockResponse({
          nested: {
            array: [
              { foo: 'bar' },
              { link: path3 },
              { bar: 'baz' }
            ]
          }
        })
        var response4 = mockResponse({ link4: path4 })

        get.withArgs(rootUri, localSinon.match.func).callsArgWithAsync(
            1, null, root)
        get.withArgs(path1, localSinon.match.func).callsArgWithAsync(
            1, null, response2)
        get.withArgs(path2, localSinon.match.func).callsArgWithAsync(
            1, null, response3)
        get.withArgs(path3, localSinon.match.func).callsArgWithAsync(
            1, null, response4)
        get.withArgs(path4, localSinon.match.func).callsArgWithAsync(
            1, null, result)
        api.walk(['link1', 'link2', '$[nested][array][1].link', 'link4'])
           .withTemplateParameters({ param: 'gizmo' })
           .getResource(callback)
        waitFor(
          function() { return callback.called },
          function() {
            callback.should.have.been.calledWith(null, result.doc)
            done()
          }
        )
      })
    })
  })
})
