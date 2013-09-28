'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var linkWalker = new (require('../lib/link_walker'))()

describe('The link walker', function() {

  /*
   * TEST/FEATURE TODOs
   * - cache final links for path
   * - linkWalker.disableJSONPath()
   * - linkWalker.disableUriTemplates()
   *   Dissect into several *public* sub-functions that can be overridden
   *   or disabled (fetching, URI template resolving, JSONPath resolving,
   *   caching, ...)
   * - [alternative formats to JSON? html? xml? hal? ... probably better
   *   separate libs]
   */

  var fetch
  var callback
  var rootUri = 'http://api.io'

  beforeEach(function() {
    linkWalker.fetch = fetch = sinon.stub()
    callback = sinon.spy()
  })

  it('should access root URI', function() {
    linkWalker.walk(rootUri, [], null, callback)
    fetch.should.have.been.calledWith(rootUri, sinon.match.func)
  })

  it('should call callback with root doc', function(done) {
    var rootDoc = {root: 'doc'}
    fetch.callsArgWithAsync(1, null, rootDoc)
    linkWalker.walk(rootUri, [], null, callback)
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
    linkWalker.walk(rootUri, [], null, callback)
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
    linkWalker.walk(rootUri, ['link'], null, callback)
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
    linkWalker.walk(rootUri, ['non-existing-link'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        assert(callback.calledOnce)
        callback.should.have.been.calledWith(sinon.match.instanceOf(Error))
        callback.args[0][0].message.should.contain('Could not find property ' +
            'non-existing-link')
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
    linkWalker.walk(rootUri, ['firstLink'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.should.have.been.calledWith(err)
        done()
      }
    )
  })

  it('should walk to a link via JSONPath expression', function(done) {
    var uri = rootUri + '/path/to/resource'
    var rootDoc = {
      deeply: { nested: { link: uri } }
    }
    var resultDoc = { the: 'result' }
    fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootDoc)
    fetch.withArgs(uri, sinon.match.func).callsArgWithAsync(1, null, resultDoc)
    linkWalker.walk(rootUri, ['$.deeply.nested.link'], null, callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.should.have.been.calledWith(null, resultDoc)
        done()
      }
    )
  })

  it('should call callback with err if JSONPath has no match', function(done) {
    var uri = rootUri + '/path/to/resource'
    var rootDoc = {
      deeply: { nested: { link: uri } }
    }
    fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootDoc)
    linkWalker.walk(rootUri, ['$.deeply.nested.blink'], null, callback)
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
    linkWalker.walk(rootUri, ['$.arr[*].foo'], null, callback)
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

  it('should evaluate URI templates', function(done) {
    var rootDoc = {
      template: rootUri + '/users/{user}/things{/thing}'
    }
    var resultDoc = { we: 'can haz use uri templates!' }
    fetch.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootDoc)
    fetch.withArgs(rootUri + '/users/basti1302/things/4711',
        sinon.match.func).callsArgWithAsync(1, null, resultDoc)
    linkWalker.walk(rootUri,
      ['template'],
      [{user: 'basti1302', thing: 4711}],
      callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.should.have.been.calledWith(null, resultDoc)
        done()
      }
    )
  })

  it('should walk a multi element path', function(done) {
    var path1 = rootUri + '/path'
    var template2 = rootUri + '/path/to/resource{/param}'
    var path2 = rootUri + '/path/to/resource/gizmo'
    var path3 = rootUri + '/path/to/another/resource'
    var path4 = rootUri + '/path/to/the/last/resource'

    var rootDoc = { link1: path1 }
    var doc2 = { link2: path2 }
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
    linkWalker.walk(rootUri,
        ['link1', 'link2', '$[nested][array][1].link', 'link4'],
        [null, { param: 'gizmo' }, null, null],
        callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.should.have.been.calledWith(null, resultDoc)
        done()
      }
    )
  })

  // test helper
  function waitFor(test, onSuccess, polling) {
    if (polling === null || polling === undefined) {
      polling = 10
    }
    var handle = setInterval(function() {
      if (test()) {
        clearInterval(handle)
        onSuccess()
      }
    }, polling)
  }
})
