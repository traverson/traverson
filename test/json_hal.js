'use strict';

var traverson = require('../traverson')
var mockResponse =  require('./util/mock_response')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var assert = chai.assert
var expect = chai.expect
chai.use(sinonChai)

describe('The JSON-HAL walker\'s', function() {

  var rootUri = 'http://api.io'

  var rootDoc = {
    '_links': {
      'self': { 'href': '/' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:orders': { 'href': '/orders' }
    }
  }
  var ordersUri = rootUri + '/orders'
  var embeddedOrderDocs = [{
    '_links': {
      'self': { 'href': '/orders/123' },
      'ea:basket': { 'href': '/baskets/987' },
      'ea:customer': { 'href': '/customers/654' }
    },
    'total': 30.00,
    'currency': 'USD',
    'status': 'shipped'
  }, {
    '_links': {
      'self': { 'href': '/orders/124' },
      'ea:basket': { 'href': '/baskets/321' },
      'ea:customer': { 'href': '/customers/42' }
    },
    'total': 20.00,
    'currency': 'USD',
    'status': 'processing'
  }]
  var ordersDoc = {
    '_links': {
      'self': { 'href': '/orders' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'next': { 'href': '/orders?page=2' },
      'ea:find': { 'href': '/orders{/id}', 'templated': true },
      'ea:admin': [{
        'href': '/admins/2',
        'title': 'Fred'
      }, {
        'href': '/admins/5',
        'title': 'Kate'
      }]
    },
    'currentlyProcessing': 14,
    'shippedToday': 20,
    '_embedded': {
      'ea:order': embeddedOrderDocs[0]
    }
    // re-enable when traverson can cope with arrays of embedded
    // objects
    //'ea:order': embeddedOrders
  }
  var singleOrderUri = ordersUri + '/13'
  var singleOrderDoc = {
    '_links': {
      'self': { 'href': '/orders/13' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:customer': { 'href': '/customers/4711' },
      'ea:basket': { 'href': '/baskets/4712' }
    },
    'total': 30.00,
    'currency': 'USD',
    'status': 'shipped'
  }

  var embeddedWithoutSelfLink = {
    '_links': {
    },
  }
  var customerUri = rootUri + '/customers/4711'
  var customerDoc = {
    '_links': {
      'self': { 'href': '/customer/4711' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }]
    },
    'first_name': 'Halbert',
    'last_name': 'Halbertson',
    '_embedded': {
      'ea:no_self_link': embeddedWithoutSelfLink
    }
  }
  var basketDoc = { basket: 'empty' }

  var rootResponse = mockResponse(rootDoc)
  var ordersResponse = mockResponse(ordersDoc)
  var singleOrderResponse = mockResponse(singleOrderDoc)
  var embeddedOrderResponses = [
    mockResponse(embeddedOrderDocs[0]),
    mockResponse(embeddedOrderDocs[1])
  ]
  var customerResponse = mockResponse(customerDoc)
  var basketResponse = mockResponse(basketDoc)

  var updateResponse = mockResponse({ result: 'success' }, 200)
  var payload = {
    some: 'stuff',
    data: 4711
  }

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
    get.withArgs(singleOrderUri, sinon.match.func).callsArgWithAsync(1,
        null, singleOrderResponse)
    get.withArgs(rootUri + '/baskets/987', sinon.match.func).
        callsArgWithAsync(1, null, basketResponse)
    get.withArgs(customerUri, sinon.match.func).callsArgWithAsync(1,
        null, customerResponse)
    callback = sinon.spy()
    executeRequest = sinon.stub(api.constructor.prototype,
        'executeRequest')
  })

  afterEach(function() {
    api.constructor.prototype.executeRequest.restore()
  })

  describe('get method', function() {

    it('should follow a single link', function(done) {
      api.follow('ea:orders').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersResponse)
          done()
        }
      )
    })

    it('should follow multiple links', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, customerResponse)
          done()
        }
      )
    })

    it('should pass an embedded document into the callback',
        function(done) {
      api.follow('ea:orders', 'ea:order')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var response = callback.firstCall.args[1]
          expect(response).to.exist
          expect(response.body).to.equal(embeddedOrderResponses[0].body)
          expect(response.statusCode).to.equal(200)
          expect(response.remark).to.exist
          done()
        }
      )
    })

    it('should follow embedded documents', function(done) {
      api.follow('ea:orders', 'ea:order', 'ea:basket')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, basketResponse)
          done()
        }
      )
    })
  })

  describe('getResource method', function() {

    it('should return the resource', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, customerDoc)
          done()
        }
      )
    })

    it('should pass an embedded document into the callback',
        function(done) {
      api.follow('ea:orders', 'ea:order')
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, embeddedOrderDocs[0])
          done()
        }
      )
    })
  })

  describe('getUri method', function() {

    it('should return the last URI', function(done) {
      api.follow('ea:orders', 'ea:find')
         .withTemplateParameters({ id: 13 })
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, singleOrderUri)
          done()
        }
      )
    })

    // not sure what to do in this case
    it('returns the self-URI of an embedded document', function(done) {
      api.follow('ea:orders', 'ea:order')
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersUri + '/123')
          done()
        }
      )
    })

    it('yields an error if the last URI is actually an embedded ' +
               ' resource but has no self-URI', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer', 'ea:no_self_link')
         .withTemplateParameters({ id: 13 })
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var error = callback.firstCall.args[0]
          expect(error.message).to.contain('You requested an URI but the ' +
              'last resource is an embedded resource and has no URI of its ' +
              'own (that is, it has no link with rel=\"self\"')
          done()
        }
      )
    })

  })

  describe('post method', function() {

    it('should follow multiple links and post to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('put method', function() {

    it('should follow multiple links and put to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('patch method', function() {

    it('should follow multiple links and patch the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when patch fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(3, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('delete method', function() {

    it('should follow multiple links and delete the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(3, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .delete(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              sinon.match.func, null, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when delete fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(3, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .delete(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })
})
