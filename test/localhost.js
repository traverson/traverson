'use strict';

var traverson = require('../traverson')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

chai.should()
var assert = chai.assert
var expect = chai.expect
var should = chai.should()
chai.use(sinonChai)

describe('Traverson (when tested against a local server)', function() {

  var jsonApi
  var jsonHalApi
  var testServer
  var callback
  var rootUri = 'http://127.0.0.1:2808/'

  before(function() {
    if (isNodeJs()) {
      testServer = require('../server/app')
      testServer.start()
    }
  })

  after(function() {
    if (isNodeJs() && testServer) {
      testServer.stop()
    }
  })

  beforeEach(function() {
    jsonApi = traverson
      .json
      .from(rootUri)
      .newRequest()
      .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    jsonHalApi = traverson.jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions({
      headers: {
        'Accept': 'application/hal+json',
        'Content-Type': 'application/json'
      }
    })
    callback = sinon.spy()
  })

  it('should fetch the root response', function(done) {
    jsonApi.walk().get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.first.should.exist
        resultDoc.first.should.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should fetch the root document', function(done) {
    jsonApi.walk().getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.first.should.exist
        resultDoc.first.should.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should walk a single element path', function(done) {
    jsonApi.walk('first').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.first.should.exist
        resultDoc.first.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path', function(done) {
    jsonApi.walk('second', 'doc').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path in hal+json', function(done) {
    jsonHalApi.walk('first', 'second').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path in hal+json using an embedded ' +
      'resource along the way', function(done) {
    jsonHalApi.walk('first',
        'contained_resource',
        'embedded_link_to_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path in hal+json yielding an embedded ' +
      'resource to the callback',
      function(done) {
    jsonHalApi.walk('first',
        'second',
        'inside_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.more.should.exist
        resultDoc.more.should.equal('data')
        done()
      }
    )
  })

  it('should walk a multi-element path to a resource', function(done) {
    jsonApi.walk('second', 'doc').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should leverage JSONPath', function(done) {
    jsonApi.walk('$.jsonpath.nested.key').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.third.should.exist
        resultDoc.third.should.equal('document')
        done()
      }
    )
  })

  it('should leverage URI templates', function(done) {
    jsonApi.walk('uri_template')
       .withTemplateParameters({param: 'foobar', id: 13})
       .getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.some.should.equal('document')
        resultDoc.param.should.equal('foobar')
        resultDoc.id.should.equal('13')
        done()
      }
    )
  })

  it('should fail gracefully on 404 with get()', function(done) {
    jsonApi.walk('blind_alley', 'more', 'links').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var error = callback.firstCall.args[0]
        error.should.exist
        error.name.should.equal('HTTPError')
        error.message.should.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.')
        error.uri.should.equal(rootUri + 'does/not/exist')
        error.httpStatus.should.equal(404)

        var response = callback.firstCall.args[1]
        response.should.exist
        var body = response.body
        body.should.exist
        var resultDoc = JSON.parse(body)
        resultDoc.message.should.exist
        resultDoc.message.should.equal('resource not found')
        done()
      }
    )
  })

  it('should just deliver the last response of get(), even when it\'s 404',
      function(done) {
    jsonApi.walk('blind_alley').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody(404)
        resultDoc.should.exist
        resultDoc.message.should.exist
        resultDoc.message.should.equal('resource not found')
        done()
      }
    )
  })

  it('should fail gracefully on 404 with getResource()', function(done) {
    jsonApi.walk('blind_alley').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var error = callback.firstCall.args[0]
        error.should.exist
        error.name.should.equal('HTTPError')
        error.message.should.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.')
        error.uri.should.equal(rootUri + 'does/not/exist')
        error.httpStatus.should.equal(404)

        var resultDoc = callback.firstCall.args[1]
        resultDoc.should.exist
        resultDoc.message.should.exist
        resultDoc.message.should.equal('resource not found')
        done()
      }
    )
  })

  it('should fail gracefully on syntactically incorrect JSON',
      function(done) {
    jsonApi.walk('garbage').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var error = callback.firstCall.args[0]
        error.should.exist
        error.name.should.equal('JSONError')
        error.message.should.equal('The document at ' + rootUri + 'junk' +
          ' could not be parsed as JSON: { this will :: not parse')
        error.uri.should.equal(rootUri + 'junk')
        error.body.should.equal('{ this will :: not parse')

        var resultDoc = callback.firstCall.args[1]
        expect(resultDoc).to.not.exist
        done()
      }
    )
  })

  it('should yield the last URI', function(done) {
    jsonApi.walk('second', 'doc').getUri(callback)
    waitFor(
      function() { return callback.called },
      function() {
        callback.callCount.should.equal(1)
        var result = callback.firstCall.args[1]
        result.should.exist
        result.should.equal(rootUri + 'second/document')
        done()
      }
    )
  })

  it('should post', function(done) {
    var payload = {'new': 'document'}
    jsonApi.walk('post_link').post(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody(201)
        resultDoc.document.should.exist
        resultDoc.document.should.equal('created')
        resultDoc.received.should.exist
        resultDoc.received.should.deep.equal(payload)
        done()
      }
    )
  })

  it('should put', function(done) {
    var payload = {'updated': 'document'}
    jsonApi.walk('put_link').put(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.document.should.exist
        resultDoc.document.should.equal('overwritten')
        resultDoc.received.should.exist
        resultDoc.received.should.deep.equal(payload)
        done()
      }
    )
  })

  it('should patch', function(done) {
    // This test will not work via mocha-phantomjs since PhantomJS currently
    // sends an empty body with a PATCH request, see
    // https://github.com/ariya/phantomjs/issues/11384
    // Skip this test if we are running in mocha-phantomjs
    // Also, currently it's not possible to skip a test from inside the test,
    // see
    // https://github.com/visionmedia/mocha/issues/332 and
    // https://github.com/visionmedia/mocha/pull/946
    // so we just mark the test as passed. Sigh.
    if (isPhantomJs()) {
      console.log('skipping test localhost.js#should patch in PhantomJS')
      return done()
    }

    var payload = {'patched': 'document'}
    jsonApi.walk('patch_link').patch(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.document.should.exist
        resultDoc.document.should.equal('patched')
        resultDoc.received.should.exist
        resultDoc.received.should.deep.equal(payload)
        done()
      }
    )
  })

  it('should delete', function(done) {
    jsonApi.walk('delete_link').delete(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var response = checkResponse(204)
        done()
      }
    )
  })

  it('should use provided request options', function(done) {
    jsonApi.walk('echo-headers').withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      }
    }).getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        var testResponseHeader =
            resultDoc['X-Traverson-Test-Header'] ||
            resultDoc['x-traverson-test-header']
        testResponseHeader.should.exist
        testResponseHeader.should.equal('Traverson rocks!')
        done()
      }
    )
  })

  function isNodeJs() {
    // can't use strict here
    if (typeof window !== 'undefined') {
      return false
    } else if (typeof process !== 'undefined') {
      return true
    } else {
      throw new Error('Can\'t figure out environment. ' +
          'Seems it\'s neither Node.js nor a browser.')
    }
  }

  function isPhantomJs() {
    return typeof window !== 'undefined' && window.mochaPhantomJS
  }

  function checkResponseWithBody(httpStatus) {
    var response = checkResponse(httpStatus)
    var body = response.body
    body.should.exist
    var resultDoc = JSON.parse(body)
    return resultDoc
  }

  function checkResponse(httpStatus) {
    httpStatus = httpStatus || 200
    callback.callCount.should.equal(1)
    var error = callback.firstCall.args[0]
    should.not.exist(error)
    var response = callback.firstCall.args[1]
    response.should.exist
    response.statusCode.should.exist
    response.statusCode.should.equal(httpStatus)
    return response
  }

  function checkResultDoc() {
    callback.callCount.should.equal(1)
    var error = callback.firstCall.args[0]
    should.not.exist(error)
    var resultDoc = callback.firstCall.args[1]
    resultDoc.should.exist
    return resultDoc
  }
})
