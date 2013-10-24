'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var log = require('minilog')('test');
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var TestServer = require('./util/test_server.js')
var waitFor = require('./util/wait_for')

var traverson = require('../traverson')

describe('Traverson (when tested against a local server)', function() {

  var api
  var testServer
  var callback
  var rootUri = 'http://127.0.0.1:2808/'

  before(function() {
    testServer = new TestServer()
    testServer.start()
  })

  after(function() {
    testServer.stop()
  })

  beforeEach(function() {
    api = traverson
            .json
            .from(rootUri)
            .newRequest()
            .withRequestOptions({
      headers: {
        'accept': 'application/json'
      }
    })
    callback = sinon.spy()
  })

  it('should fetch the root response', function(done) {
    api.walk().get(callback)
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
    api.walk().getResource(callback)
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
    api.walk('first').getResource(callback)
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
    api.walk('second', 'doc').get(callback)
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
    api = traverson.jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions(
    {
      headers: { 'accept': 'application/hal+json' }
    }).walk('first', 'second').get(callback)
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
    api = traverson.jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions(
    {
      headers: { 'accept': 'application/hal+json' }
    }).walk('first',
            'contained_resource',
            'embedded_link_to_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        console.log(resultDoc)
        resultDoc.second.should.exist
        resultDoc.second.should.equal('document')
        done()
      }
    )
  })

  it('should walk a multi-element path in hal+json yielding an embedded ' +
      'resource to the callback',
      function(done) {
    api = traverson.jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions(
    {
      headers: { 'accept': 'application/hal+json' }
    }).walk('first',
            'second',
            'inside_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        console.log(resultDoc)
        resultDoc.more.should.exist
        resultDoc.more.should.equal('data')
        done()
      }
    )
  })

  it('should walk a multi-element path to a resource', function(done) {
    api.walk('second', 'doc').getResource(callback)
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
    api.walk('$.jsonpath.nested.key').getResource(callback)
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
    api.walk('uri_template')
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
    api.walk('blind_alley', 'more', 'links').get(callback)
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
        resultDoc.message.should.equal('document not found')
        done()
      }
    )
  })

  it('should just deliver the last response of get(), even when it\'s 404',
      function(done) {
    api.walk('blind_alley').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody(404)
        resultDoc.message.should.exist
        resultDoc.message.should.equal('document not found')
        done()
      }
    )
  })

  it('should fail gracefully on 404 with getResource()', function(done) {
    api.walk('blind_alley').getResource(callback)
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
        resultDoc.message.should.equal('document not found')
        done()
      }
    )
  })

  it('should fail gracefully on syntactically incorrect JSON', function(done) {
    api.walk('garbage').getResource(callback)
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
    api.walk('second', 'doc').getUri(callback)
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
    api.walk('post_link').post(payload, callback)
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
    api.walk('put_link').put(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.document.should.exist
        resultDoc.document.should.equal('updated')
        resultDoc.received.should.exist
        resultDoc.received.should.deep.equal(payload)
        done()
      }
    )
  })

  it('should patch', function(done) {
    var payload = {'patched': 'document'}
    api.walk('patch_link').patch(payload, callback)
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
    api.walk('delete_link').delete(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var response = checkResponse(204)
        done()
      }
    )
  })

  it('should use provided request options', function(done) {
    api.walk()
      .withRequestOptions({ headers: { 'x-my-special-header': 'foo' } })
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        var headers = resultDoc.requestHeaders
        headers.should.exist
        var mySpecialHeader = headers['x-my-special-header']
        mySpecialHeader.should.exist
        mySpecialHeader.should.equal('foo')
        done()
      }
    )
  })

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
    var response = callback.firstCall.args[1]
    response.should.exist
    response.statusCode.should.exist
    response.statusCode.should.equal(httpStatus)
    return response
  }

  function checkResultDoc() {
    callback.callCount.should.equal(1)
    var resultDoc = callback.firstCall.args[1]
    resultDoc.should.exist
    return resultDoc
  }
})
