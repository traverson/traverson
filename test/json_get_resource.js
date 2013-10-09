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

describe('getResource for JSON', function() {

  var request
  var originalFetch
  var fetch
  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

  var result = mockResponse({ foo: 'bar' })

  beforeEach(function() {
    api = client.newRequest()
    originalFetch = JsonWalker.prototype.fetch
    JsonWalker.prototype.fetch = fetch = sinon.stub()
    callback = sinon.spy()
  })

  afterEach(function() {
    JsonWalker.prototype.fetch = originalFetch
  })

  describe('with its basic features', function() {
    var rootResponse = mockResponse({
      irrelevant: { stuff: 'to be ignored' },
      link: rootUri + '/link/to/thing',
      more: { stuff: { that: 'we do not care about' } }
    })

    it('should access the root URI', function() {
      api.walk().getResource(callback)
      fetch.should.have.been.calledWith(rootUri, sinon.match.func)
    })

    it('should call callback with the root doc', function(done) {
      fetch.callsArgWithAsync(1, null, rootResponse)
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
      fetch.callsArgWithAsync(1, err)
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      fetch.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, result)
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      fetch.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, result)
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      api.walk('non-existing-link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          assert(callback.calledOnce)
          callback.should.have.been.calledWith(sinon.match.instanceOf(Error))
          callback.args[0][0].message.should.contain('Could not find ' +
              'property non-existing-link')
          done()
        }
      )
    })

    it('should call callback with err inside recursion', function(done) {
      var err = new Error('test error')
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, mockResponse({ firstLink: rootUri + '/first' }))
      fetch.withArgs(rootUri + '/first', sinon.match.func).callsArgWithAsync(
          1, err)
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      fetch.withArgs(uri, sinon.match.func).callsArgWithAsync(1, null,
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      api.walk('$.deeply.nested.blink').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(sinon.match.instanceOf(Error))
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponseMulti)
      api.walk('$.arr[*].foo').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(sinon.match.instanceOf(Error))
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

      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponseUriTemplate)
      fetch.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, next)
      fetch.withArgs(rootUri + '/another/42',
          sinon.match.func).callsArgWithAsync(1, null, result)
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
      fetch.withArgs(startUri, sinon.match.func).callsArgWithAsync(
          1, null, rootUriTemplate)
      traverson.json
          .from(startUriTemplate)
          .newRequest()
          .walk()
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
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootUriTemplate)
      fetch.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, next)
      fetch.withArgs(rootUri + '/another_user/someone_else',
          sinon.match.func).callsArgWithAsync(1, null, result)
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

      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, root)
      fetch.withArgs(path1, sinon.match.func).callsArgWithAsync(
          1, null, response2)
      fetch.withArgs(path2, sinon.match.func).callsArgWithAsync(
          1, null, response3)
      fetch.withArgs(path3, sinon.match.func).callsArgWithAsync(
          1, null, response4)
      fetch.withArgs(path4, sinon.match.func).callsArgWithAsync(
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
