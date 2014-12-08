'use strict';

var traverson = require('../traverson')
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('Content negotiation', function() {

  var api
    , callback
    , firstUri
    , get
    , mockResponse
    , rootResponse
    , rootUri = 'http://api.io'
    , client = traverson.from(rootUri)
    , secondResponse
    , secondUri
    , thirdResponse;

  before(function() {
    traverson.registerMediaType(FoobarAdapter.mediaType, FoobarAdapter);
  });

  after(function() {
    // de-register plug-in to leave Traverson in a clean state for other
    // tests
    traverson.registerMediaType(FoobarAdapter.mediaType, null);
  });


  beforeEach(function() {
    api = client.newRequest();
    get = sinon.stub();
    api.walker.request = { get: get };
    callback = sinon.spy();

  });

  describe('with application/json', function() {

    beforeEach(function() {
      mockResponse =
        require('traverson-mock-response')('application/json ; charset=utf-8');
      firstUri = rootUri + '/first';
      secondUri = rootUri + '/second';
      rootResponse = mockResponse({ first: firstUri, });
      secondResponse = mockResponse({ second: secondUri });
      thirdResponse = mockResponse({ content: 'awesome' });

      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, sinon.match.func).callsArgWithAsync(
          1, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, sinon.match.func).callsArgWithAsync(
          1, null, thirdResponse, thirdResponse.body);
    });

    it('should recognize the media type as application/json', function(done) {
      api
      .follow('first', 'second')
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, {
            content: 'awesome'
          });
          done();
        }
      );
    });
  });

  describe('with a different media type', function() {
    beforeEach(function() {
      mockResponse =
        require('traverson-mock-response')('application/foobar+json');
      firstUri = rootUri + '/first';
      secondUri = rootUri + '/second';
      rootResponse = mockResponse({
        foobar: firstUri,
      });
      secondResponse = mockResponse({
        foobar: secondUri,
      });
      thirdResponse = mockResponse({ content: 'awesome' });

      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, sinon.match.func).callsArgWithAsync(
          1, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, sinon.match.func).callsArgWithAsync(
          1, null, thirdResponse, thirdResponse.body);
    });

    it('should recognize the media type and use the adapter',
        function(done) {
      api
      .follow('what', 'ever')
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, {
            content: 'awesome'
          });
          done();
        }
      );
    });
  });

  function FoobarAdapter() {}

  FoobarAdapter.mediaType = 'application/foobar+json';

  FoobarAdapter.prototype.findNextStep = function(doc, key) {
    return {
      uri: doc.foobar,
    };
  };

});
