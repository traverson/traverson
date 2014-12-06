'use strict';

var traverson = require('../traverson')
  , waitFor = require('./util/wait_for')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect
  , _s = require('underscore.string');

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

  beforeEach(function() {
    api = client.newRequest();
    get = sinon.stub();
    api.walker.request = { get: get };
    callback = sinon.spy();

  });

  describe('with application/json', function() {

    beforeEach(function() {
      mockResponse =
        require('./util/mock_response')('application/json ; charset=utf-8');
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

  describe('with application/hal+json', function() {
    beforeEach(function() {
      mockResponse = require('./util/mock_response')('application/hal+json');
      firstUri = rootUri + '/first';
      secondUri = rootUri + '/second';
      rootResponse = mockResponse({
        _links: {
          first: { href: firstUri },
        }
      });
      secondResponse = mockResponse({
        _links: {
          second: { href: secondUri },
        }
      });
      thirdResponse = mockResponse({ content: 'awesome' });

      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, sinon.match.func).callsArgWithAsync(
          1, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, sinon.match.func).callsArgWithAsync(
          1, null, thirdResponse, thirdResponse.body);
    });

    it('should recognize the media type as application/hal+json',
        function(done) {
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

});
