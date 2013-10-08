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
var JsonWalker = require('../lib/json_walker')

describe('The json walker\'s', function() {

  var request
  var originalFetch
  var fetch
  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

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

    it('should access the root URI', function() {
      api.walk().getResource(callback)
      fetch.should.have.been.calledWith(rootUri, sinon.match.func)
    })

    it('should call callback with the root doc', function(done) {
      var rootDoc = {root: 'doc'}
      fetch.callsArgWithAsync(1, null, rootDoc)
      api.walk().getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, rootDoc)
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
      var rootDoc = {
        irrelevant: { stuff: 'to be ignored' },
        link: rootUri + '/link/to/thing',
        more: { stuff: { that: 'we do not care about' } }
      }
      var resultDoc = { foo: 'bar' }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, resultDoc)
      api.walk('link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
          done()
        }
      )
    })

    it('should walk a single element path as array', function(done) {
      var rootDoc = {
        irrelevant: { stuff: 'to be ignored' },
        link: rootUri + '/link/to/thing',
        more: { stuff: { that: 'we do not care about' } }
      }
      var resultDoc = { foo: 'bar' }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, resultDoc)
      api.walk(['link']).getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
          done()
        }
      )
    })

    it('should call callback with err if link is not found', function(done) {
      var rootDoc = { nothing: 'in here'}
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
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
          1, null, { firstLink: rootUri + '/first' })
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

    it('should walk to a link via JSONPath expression', function(done) {
      var uri = rootUri + '/path/to/resource'
      var rootDoc = {
        deeply: { nested: { link: uri } }
      }
      var resultDoc = { the: 'result' }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(uri, sinon.match.func).callsArgWithAsync(1, null,
          resultDoc)
      api.walk('$.deeply.nested.link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
          done()
        }
      )
    })

    it('should call callback with err if JSONPath has no match',
        function(done) {
      var uri = rootUri + '/path/to/resource'
      var rootDoc = {
        deeply: { nested: { link: uri } }
      }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
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
      var uri = rootUri + '/path/to/resource'
      var rootDoc = {
        arr: [ { foo: 'bar' }, { foo: 'baz' } ]
      }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
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
      var rootDoc = {
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      }
      var nextDoc = {
        secondTemplate: rootUri + '/another/{id}'
      }
      var resultDoc = { we: 'can haz use uri templates!' }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, nextDoc)
      fetch.withArgs(rootUri + '/another/42',
          sinon.match.func).callsArgWithAsync(1, null, resultDoc)
      api.walk('firstTemplate', 'secondTemplate')
         .withTemplateParameters({user: 'basti1302', thing: 4711, id: 42})
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
          done()
        }
      )
    })

    it('should evaluate URI templates for the start URI', function(done) {
      var rootDoc = { we: 'can haz use uri templates for root doc, yo!' }
      var startUriTemplate = rootUri + '/{param}/whatever'
      var startUri = rootUri + '/substituted/whatever'
      fetch.withArgs(startUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      traverson.json
          .from(startUriTemplate)
          .newRequest()
          .walk()
          .withTemplateParameters({param: 'substituted'})
          .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, rootDoc)
          done()
        }
      )
    })

    it('should evaluate URI templates with array of template params',
        function(done) {
      var rootDoc = {
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      }
      var nextDoc = {
        secondTemplate: rootUri + '/another_user/{user}'
      }
      var resultDoc = { we: 'can haz use uri templates!' }
      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, nextDoc)
      fetch.withArgs(rootUri + '/another_user/someone_else',
          sinon.match.func).callsArgWithAsync(1, null, resultDoc)
      api.walk('firstTemplate', 'secondTemplate')
        .withTemplateParameters([null,
                                {user: 'basti1302', thing: 4711},
                                {user: 'someone_else'}])
        .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
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

      var rootDoc = { link1: path1 }
      var doc2 = { link2: template2 }
      var doc3 = {
        nested: {
          array: [
            { foo: 'bar' },
            { link: path3 },
            { bar: 'baz' }
          ]
        }
      }
      var doc4 = { link4: path4 }
      var resultDoc = { gizmo: 'hell, yeah!' }

      fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootDoc)
      fetch.withArgs(path1, sinon.match.func).callsArgWithAsync(
          1, null, doc2)
      fetch.withArgs(path2, sinon.match.func).callsArgWithAsync(
          1, null, doc3)
      fetch.withArgs(path3, sinon.match.func).callsArgWithAsync(
          1, null, doc4)
      fetch.withArgs(path4, sinon.match.func).callsArgWithAsync(
          1, null, resultDoc)
      api.walk(['link1', 'link2', '$[nested][array][1].link', 'link4'])
         .withTemplateParameters({ param: 'gizmo' })
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, resultDoc)
          done()
        }
      )
    })
  })
})
