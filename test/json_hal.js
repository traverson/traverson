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
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:orders': { 'href': '/orders' }
    }
  }
  var ordersUri = rootUri + '/orders'
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
      'ea:order': [{
        '_links': {
          'self': { 'href': '/orders/123' },
          'ea:basket': { 'href': '/baskets/98712' },
          'ea:customer': { 'href': '/customers/7809' }
        },
        'total': 30.00,
        'currency': 'USD',
        'status': 'shipped'
      }, {
        '_links': {
          'self': { 'href': '/orders/124' },
          'ea:basket': { 'href': '/baskets/97213' },
          'ea:customer': { 'href': '/customers/12369' }
        },
        'total': 20.00,
        'currency': 'USD',
        'status': 'processing'
      }]
    }
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
  var customerUri = rootUri + '/customers/4711'
  var customerDoc = {
    '_links': {
      'self': { 'href': '/customer/4711' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }]
    },
    'first_name': 'Halbert',
    'last_name': 'Halbertson'
  }

  var rootResponse = mockResponse(rootDoc)
  var ordersResponse = mockResponse(ordersDoc)
  var singleOrderResponse = mockResponse(singleOrderDoc)
  var customerResponse = mockResponse(customerDoc)

  var get
  var executeRequest

  var callback
  var client = traverson.jsonHal.from(rootUri)
  var api


  beforeEach(function() {
    api = client.newRequest()
    callback = sinon.spy()

    get = sinon.stub(JsonHalWalker.prototype, 'get')
    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(1, null,
        rootResponse)
    get.withArgs(ordersUri, sinon.match.func).callsArgWithAsync(1, null,
        ordersResponse)
    get.withArgs(singleOrderUri, sinon.match.func).callsArgWithAsync(1, null,
        singleOrderResponse)
    get.withArgs(customerUri, sinon.match.func).callsArgWithAsync(1, null,
        customerUri)

    executeRequest = sinon.stub(WalkerBuilder.prototype, 'executeRequest')
  })

  afterEach(function() {
    JsonHalWalker.prototype.get.restore()
    WalkerBuilder.prototype.executeRequest.restore()
  })

  describe('get method', function() {

    it('should walk along the links', function(done) {
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
  })

})
