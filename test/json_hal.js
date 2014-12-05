'use strict';

var traverson = require('../traverson')
  , halDocs = require('./hal_docs.js')
  , mockResponse =  require('./util/mock_response')
  , waitFor = require('./util/wait_for')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('The JSON-HAL walker\'s', function() {

  var rootUri = 'http://api.io';
  var rootDoc = halDocs.root;
  var ordersUri = rootUri + '/orders';
  var embeddedOrdersDoc = halDocs.embeddedOrders;
  var ordersDoc = halDocs.orders;
  var admin2Uri = rootUri + '/admins/2';
  var admin2Doc = halDocs.admin2;
  var admin5Uri = rootUri + '/admins/5';
  var admin5Doc = halDocs.admin5;
  var basketDoc = halDocs.basket;
  var basket1Uri = rootUri + '/baskets/987';
  var basket1Doc = halDocs.basket1;
  var basket2Uri = rootUri + '/baskets/321';
  var basket2Doc = halDocs.basket2;
  var singleOrderUri = ordersUri + '/13';
  var singleOrderDoc = halDocs.singleOrder;
  var embeddedWithoutSelfLink = halDocs.embeddedWithoutSelfLink;
  var customerUri = rootUri + '/customers/4711';
  var customerDoc = halDocs.customer;

  var rootResponse = mockResponse(rootDoc);
  var ordersResponse = mockResponse(ordersDoc);
  var admin2Response = mockResponse(admin2Doc);
  var admin5Response = mockResponse(admin5Doc);
  var basket1Response = mockResponse(basket1Doc);
  var basket2Response = mockResponse(basket2Doc);
  var singleOrderResponse = mockResponse(singleOrderDoc);
  var embeddedOrdersResponse = mockResponse(embeddedOrdersDoc);
  var embeddedOrderResponses = [
    mockResponse(embeddedOrdersDoc[0]),
    mockResponse(embeddedOrdersDoc[1]),
  ];
  var customerResponse = mockResponse(customerDoc);
  var basketResponse = mockResponse(basketDoc);

  var updateResponse = mockResponse({ result: 'success' }, 200);
  var payload = {
    some: 'stuff',
    data: 4711
  };

  var get;
  var executeRequest;

  var callback;
  var client = traverson.jsonHal.from(rootUri);
  var api;

  beforeEach(function() {
    api = client.newRequest();
    get = sinon.stub();
    api.walker.request = { get: get };
    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(1, null,
        rootResponse);
    get.withArgs(ordersUri, sinon.match.func).callsArgWithAsync(1, null,
        ordersResponse);
    get.withArgs(admin2Uri, sinon.match.func).callsArgWithAsync(1, null,
        admin2Response);
    get.withArgs(admin5Uri, sinon.match.func).callsArgWithAsync(1, null,
        admin5Response);
    get.withArgs(basket1Uri, sinon.match.func).callsArgWithAsync(1, null,
        basket1Response);
    get.withArgs(basket2Uri, sinon.match.func).callsArgWithAsync(1, null,
        basket2Response);
    get.withArgs(singleOrderUri, sinon.match.func).callsArgWithAsync(1,
        null, singleOrderResponse);
    get.withArgs(rootUri + '/baskets/987', sinon.match.func).
        callsArgWithAsync(1, null, basketResponse);
    get.withArgs(customerUri, sinon.match.func).callsArgWithAsync(1,
        null, customerResponse);
    callback = sinon.spy();
    executeRequest = sinon.stub(api.finalAction.constructor.prototype,
        'executeRequest');
  });

  afterEach(function() {
    api.finalAction.constructor.prototype.executeRequest.restore();
  });

  describe('get method', function() {

    it('should follow a single link', function(done) {
      api.follow('ea:orders').get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersResponse);
          done();
        }
      );
    });

    it('should follow a single link by full rel URLs (instead of curies)',
        function(done) {
      api.follow('http://example.com/docs/rels/orders').get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersResponse);
          done();
        }
      );
    });

    it('should follow multiple links', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, customerResponse);
          done();
        }
      );
    });

    it('should follow multiple links by full rel URLs (instead of curies)',
        function(done) {
      api.follow(
        'http://example.com/docs/rels/orders',
        'http://example.com/docs/rels/find',
        'http://example.com/docs/rels/customer')
         .withTemplateParameters({ id: 13 })
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, customerResponse);
          done();
        }
      );
    });

    it('should follow first link from a link array automatically',
        function(done) {
      api.follow('ea:orders', 'ea:admin')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin2Response);
          done();
        }
      );
    });

    it('should follow a link specified by index from a link array',
        function(done) {
      api.follow('ea:orders', 'ea:admin[1]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response);
          done();
        }
      );
    });

    it('should follow a link specified by secondary key (title)',
        function(done) {
      api.follow('ea:orders', 'ea:admin[title:Kate]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response);
          done();
        }
      );
    });

    it('should follow a link specified by secondary key (name)',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:boss]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response);
          done();
        }
      );
    });

    it('should follow a link specified by full URL (instead of curie) and ' +
        'index', function(done) {
      api.follow('ea:orders', 'http://example.com/docs/rels/admin[1]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response);
          done();
        }
      );
    });

    it('should follow a link specified by full URL (instead of curie) and ' +
        'secondary key (title)', function(done) {
      api.follow('ea:orders', 'http://example.com/docs/rels/admin[title:Kate]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response);
          done();
        }
      );
    });

    it('should fail if there is no link with the specified secondary key',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:not-existing]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var err = callback.firstCall.args[0];
          expect(err.message).to.contain('but there is no such link');
          done();
        }
      );
    });

    it('should fail if the link specified by secondary key has no href',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:no-href]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var err = callback.firstCall.args[0];
          expect(err.message).to.contain(
              'but this link had no href attribute.');
          done();
        }
      );
    });

    it('should pass first embedded document from the array into the callback ' +
        ' automatically', function(done) {
      api.follow('ea:orders', 'ea:order')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var error = callback.firstCall.args[0];
          expect(error).to.not.exist;
          var response = callback.firstCall.args[1];
          expect(response).to.exist;
          expect(response.body).to.equal(embeddedOrderResponses[0].body);
          expect(response.statusCode).to.equal(200);
          expect(response.remark).to.exist;
          done();
        }
      );
    });

    it('should pass single element of an embedded document into the ' +
        'callback', function(done) {
      api.follow('ea:orders', 'ea:order[1]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var error = callback.firstCall.args[0];
          expect(error).to.not.exist;
          var response = callback.firstCall.args[1];
          expect(response).to.exist;
          expect(response.body).to.equal(embeddedOrderResponses[1].body);
          expect(response.statusCode).to.equal(200);
          expect(response.remark).to.exist;
          done();
        }
      );
    });

    it('should follow first embedded resource from an array automatically',
        function(done) {
      api.follow('ea:orders', 'ea:order', 'ea:basket')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, basket1Response);
          done();
        }
      );
    });

    it('should follow specified embedded resource from an array',
        function(done) {
      api.follow('ea:orders', 'ea:order[1]', 'ea:basket')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, basket2Response);
          done();
        }
      );
    });

    it('should yield the complete embedded array in the response',
        function(done) {
      api.follow('ea:orders', 'ea:order[$all]')
         .get(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var error = callback.firstCall.args[0];
          expect(error).to.not.exist;
          var response = callback.firstCall.args[1];
          expect(response).to.exist;
          expect(response.body).to.equal(embeddedOrdersResponse.body);
          expect(response.statusCode).to.equal(200);
          expect(response.remark).to.exist;
          done();
        }
      );
    });
  });

  describe('getResource method', function() {

    it('should return the resource', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, customerDoc);
          done();
        }
      );
    });

    it('should yield the complete embedded array as a resource',
        function(done) {
      api.follow('ea:orders', 'ea:order[$all]')
         .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null,
            embeddedOrdersDoc);
          done();
        }
      );
    });

    it('should pass an embedded document into the callback',
        function(done) {
      api.follow('ea:orders', 'ea:order')
         .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, embeddedOrdersDoc[0]);
          done();
        }
      );
    });
  });

  describe('getUri method', function() {

    it('should return the last URI', function(done) {
      api.follow('ea:orders', 'ea:find')
         .withTemplateParameters({ id: 13 })
         .getUri(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, singleOrderUri);
          done();
        }
      );
    });

    // not sure what to do in this case
    it('returns the self-URI of an embedded document', function(done) {
      api.follow('ea:orders', 'ea:order')
         .getUri(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersUri + '/123');
          done();
        }
      );
    });

    it('yields an error if the last URI is actually an embedded ' +
               ' resource but has no self-URI', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer', 'ea:no_self_link')
         .withTemplateParameters({ id: 13 })
         .getUri(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          var error = callback.firstCall.args[0];
          expect(error.message).to.contain('You requested an URI but the ' +
              'last resource is an embedded resource and has no URI of its ' +
              'own (that is, it has no link with rel=\"self\"');
          done();
        }
      );
    });

  });

  describe('post method', function() {

    it('should follow multiple links and post to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func);
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri);
          done();
        }
      );
    });

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error');
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('put method', function() {

    it('should follow multiple links and put to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func);
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri);
          done();
        }
      );
    });

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error');
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('patch method', function() {

    it('should follow multiple links and patch the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func);
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri);
          done();
        }
      );
    });

    it('should call callback with err when patch fails',
        function(done) {
      var err = new Error('test error');
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('delete method', function() {

    it('should follow multiple links and delete the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .del(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, null, sinon.match.func);
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri);
          done();
        }
      );
    });

    it('should call callback with err when deleting fails',
        function(done) {
      var err = new Error('test error');
      executeRequest.withArgs(customerUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, err);
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .del(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });
});
