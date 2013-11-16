/*
 * This test suite runs Traverson against the haltalk server at
 * http://haltalk.herokuapp.com. It is excuded by default in test/mocha.opts and
 * in the Gruntfile. Use bin/haltalk_test.sh to run it.
 */

'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var should = chai.should()
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var log = require('minilog')('test');

var waitFor = require('../test/util/wait_for')
var traverson = require('../traverson')

var rootUri = 'http://haltalk.herokuapp.com/'

describe('Traverson (when tested against the haltalk server at ' + rootUri +
    ')', function() {

  var api
  var testServer
  var callback

  beforeEach(function() {
    api = traverson
            .jsonHal
            .from(rootUri)
            .newRequest()
            .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    callback = sinon.spy()
  })

  it('should fetch the root response', function(done) {
    api.follow().get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc.welcome.should.exist
        resultDoc.welcome.should.equal('Welcome to a haltalk server.')
        done()
      }
    )
  })

  it('should fetch the root document', function(done) {
    api.follow().getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc.welcome.should.exist
        resultDoc.welcome.should.equal('Welcome to a haltalk server.')
        done()
      }
    )
  })

  it('should follow a single element path', function(done) {
    api.follow('ht:users').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        resultDoc._links.self.href.should.equal('/users')
        done()
      }
    )
  })

  it('should follow a multi-element path with templating and embedded docs',
      function(done) {
    api.follow('ht:me', 'ht:posts', 'ht:post')
       .withTemplateParameters({name: 'mike'})
       .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        resultDoc[0].content.should.contain('Awesome!')
        done()
      }
    )
  })

  // You can create new accounts like this. However, we should refrain from
  // creating a new account at the haltalk server every time the tests run.
  /*
  it.skip('should create a new user account by posting to ht:signup',
      function(done) {
    var user = 'new-user-name' // must not exist yet
    var password = 'password'
    var realName = 'Not Applicable'
    var body = {
      'username': user,
      'password': password,
      'real_name': realName
    }
    api.follow('ht:signup').post(body, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var response = checkResponse(201)
        response.headers.location.should.equal(rootUri + 'users/' + user)
        done()
      }
    )
  })
  */

  it('should post',
      function(done) {
    var body = {
      content: 'Hello! I\'m Traverson, the Node.js module to work with ' +
          'hypermedia APIs. You can find out more about me at ' +
          'https://github.com/basti1302/traverson. This is just a test post. ' +
          '@mikekelly: Don\'t worry, this tests will only be run manually a ' +
          'few times here and there, I\'ll promise to not spam your haltalk ' +
          'server too much :-)'
    }
    api.withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      auth: {
        user: 'traverson',
        pass: 'traverson',
        sendImmediately: true
      }
    }).follow('ht:me', 'ht:posts')
      .withTemplateParameters({ name: 'traverson' })
      .post(body, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var response = checkResponse(201)
        response.headers.location.should.contain(rootUri + 'posts/')
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
