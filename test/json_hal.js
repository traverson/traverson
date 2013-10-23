'use strict';

var chai = require('chai')
chai.should()
var assert = chai.assert
var expect = chai.expect
var sinon = require('sinon')
var sinonChai = require('sinon-chai')
chai.use(sinonChai)

var traverson = require('../traverson')
var JsonHalWalker = require('../lib/json_hal_walker')
var WalkerBuilder = require('../lib/walker_builder')

var mockResponse = require('./util/mock_response')
var waitFor = require('./util/wait_for')

describe('The JSON-HAL walker\'s', function() {

  var rootUri = 'http://api.io'

  var rootDoc = {
    '_links': {
      'self': { 'href': '/' },
      // re-enable when https://github.com/xcambar/halbert/issues/5 is fixed
      /*'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],*/
      'ea:orders': { 'href': '/orders' }
    }
  }
  var ordersUri = rootUri + '/orders'
  var ordersDoc = {
    '_links': {
      'self': { 'href': '/orders' },
      // re-enable when https://github.com/xcambar/halbert/issues/5 is fixed
      /*'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],*/
      'next': { 'href': '/orders?page=2' },
      'ea:find': { 'href': '/orders{/id}', 'templated': true },
      // re-enable when https://github.com/xcambar/halbert/issues/5 is fixed
      /*
      'ea:admin': [{
        'href': '/admins/2',
        'title': 'Fred'
      }, {
        'href': '/admins/5',
        'title': 'Kate'
      }]
      */
    },
    'currentlyProcessing': 14,
    'shippedToday': 20,
    '_embedded': {
      'ea:order': { // {[
        '_links': {
          'self': { 'href': '/orders/123' },
          'ea:basket': { 'href': '/baskets/987' },
          'ea:customer': { 'href': '/customers/654' }
        },
        'total': 30.00,
        'currency': 'USD',
        'status': 'shipped'
      }
      // re-enable when traverson can cope with arrays of embedded
      // objects
      /*, {
        '_links': {
          'self': { 'href': '/orders/124' },
          'ea:basket': { 'href': '/baskets/321' },
          'ea:customer': { 'href': '/customers/42' }
        },
        'total': 20.00,
        'currency': 'USD',
        'status': 'processing'
      }]*/
    }
  }
  var singleOrderUri = ordersUri + '/13'
  var singleOrderDoc = {
    '_links': {
      'self': { 'href': '/orders/13' },
      // re-enable when https://github.com/xcambar/halbert/issues/5 is fixed
      /*
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      */
      'ea:customer': { 'href': '/customers/4711' },
      'ea:basket': { 'href': '/baskets/4712' }
    },
    'total': 30.00,
    'currency': 'USD',
    'status': 'shipped'
  }
  var customerUri = rootUri + '/customers/4711'
  var customerDoc = {
    '_links': {
      'self': { 'href': '/customer/4711' },
      // re-enable when https://github.com/xcambar/halbert/issues/5 is fixed /*
      /*
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }]
      */
    },
    'first_name': 'Halbert',
    'last_name': 'Halbertson'
  }
  var basketDoc = { basket: 'empty' }

  var rootResponse = mockResponse(rootDoc)
  var ordersResponse = mockResponse(ordersDoc)
  var singleOrderResponse = mockResponse(singleOrderDoc)
  var customerResponse = mockResponse(customerDoc)
  var basketResponse = mockResponse(basketDoc)

  var get
  var executeRequest

  var callback
  var client = traverson.jsonHal.from(rootUri)
  var api

  beforeEach(function() {
    api = client.newRequest()
    get = sinon.stub()
    api.walker.request = { get: get }
    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(1, null,
        rootResponse)
    get.withArgs(ordersUri, sinon.match.func).callsArgWithAsync(1, null,
        ordersResponse)
    get.withArgs(singleOrderUri, sinon.match.func).callsArgWithAsync(1, null,
        singleOrderResponse)
    get.withArgs(rootUri + '/baskets/987', sinon.match.func).
        callsArgWithAsync(1, null, basketResponse)
    get.withArgs(customerUri, sinon.match.func).callsArgWithAsync(1, null,
        customerResponse)
    callback = sinon.spy()
    executeRequest = sinon.stub(WalkerBuilder.prototype, 'executeRequest')
  })

  afterEach(function() {
    WalkerBuilder.prototype.executeRequest.restore()
  })

  describe('get method', function() {

    it('should follow a single link', function(done) {
      api.walk('ea:orders').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, ordersResponse)
          done()
        }
      )
    })

    it('should follow multiple links', function(done) {
      api.walk('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, customerResponse)
          done()
        }
      )
    })

    it.skip('should pass an embedded document into the callback',
        function(done) {
      assert.fail()

      /*
      api.walk('ea:orders', 'ea:order', 'ea:basket')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, customerResponse)
          done()
        }
      )
      */
    })

    it('should walk along embedded documents', function(done) {
      api.walk('ea:orders', 'ea:order', 'ea:basket')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, basketResponse)
          done()
        }
      )
    })
  })

  describe('getResource method', function() {

    it('should return the resource', function(done) {
      api.walk('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, customerDoc)
          done()
        }
      )
    })

    it.skip('should return the resource if it is an embedded resource',
        function(done) {
      assert.fail()
    })
  })

  describe('getUri method', function() {

    it('should return the last URI', function(done) {
      api.walk('ea:orders', 'ea:find')
         .withTemplateParameters({ id: 13 })
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          callback.should.have.been.calledWith(null, singleOrderUri)
          done()
        }
      )
    })

    // not sure what to do in this case
    it.skip('yields an error if the last URI is actually an embedded ' +
        ' resource???', function(done) {
      assert.fail()
    })

  })

  describe('post, put, delete and patch methods', function() {
    it.skip('should behave correctly with hal+json', function(done) {
      assert.fail()
    })
  })
})
