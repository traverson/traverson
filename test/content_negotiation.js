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
    , rootUri = 'http://api.example.org'
    , client = traverson.from(rootUri)
    , secondResponse
    , secondUri
    , thirdResponse
    , thirdUri
    , fourthResponse
    , fourthUri
    , fifthResponse;

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
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
  });

  describe('with application/json', function() {

    beforeEach(function() {
      mockResponse =
        require('traverson-mock-response')('application/json ; charset=utf-8');
      firstUri = rootUri + '/first';
      secondUri = rootUri + '/second';
      rootResponse = mockResponse({ first: firstUri });
      secondResponse = mockResponse({ second: secondUri });
      thirdResponse = mockResponse({ content: 'awesome' });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, thirdResponse, thirdResponse.body);
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

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, thirdResponse, thirdResponse.body);
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

  describe('with alternating media types', function() {
    beforeEach(function() {
      var mockResponseApplicationJson =
        require('traverson-mock-response')('application/json');
      var mockResponseOther =
        require('traverson-mock-response')('application/foobar+json');
      firstUri = rootUri + '/first';
      secondUri = rootUri + '/second';
      thirdUri = rootUri + '/third';
      fourthUri = rootUri + '/fourth';
      rootResponse = mockResponseApplicationJson({
        one: firstUri,
      });
      secondResponse = mockResponseOther({
        foobar: secondUri,
      });
      thirdResponse = mockResponseApplicationJson({
        'three': thirdUri,
      });
      fourthResponse = mockResponseOther({
        foobar: fourthUri,
      });
      fifthResponse = mockResponseApplicationJson({ content: 'awesome' });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse, rootResponse.body);
      get.withArgs(firstUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, secondResponse, secondResponse.body);
      get.withArgs(secondUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, thirdResponse, thirdResponse.body);
      get.withArgs(thirdUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, fourthResponse, fourthResponse.body);
      get.withArgs(fourthUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, fifthResponse, fifthResponse.body);
    });

    it('should switch the media type on every request',
        function(done) {
      api
      .follow('one', 'two', 'three', 'four')
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

  describe('with unknown media types', function() {
    beforeEach(function() {
      var mockResponseUnknown =
        require('traverson-mock-response')('text/html');
      rootResponse = mockResponseUnknown({
        whatever: rootUri + '/whatever',
      });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse, rootResponse.body);
    });


    it('should not crash on unknown media type', function(done) {
      api
      .newRequest()
      .follow('whatever')
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          assert(callback.calledOnce);
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          var err = callback.args[0][0];
          expect(err.name).to.equal(traverson.errors.UnsupportedMediaType);
          expect(err.message).to.contain('Unknown content type for content ' +
            'type detection: text/html');
          done();
      });
    });
  });


  function FoobarAdapter(log) {
    this.log = log;
  }

  FoobarAdapter.mediaType = 'application/foobar+json';

  FoobarAdapter.prototype.findNextStep = function(t, link) {
    this.log.debug('logging something');
    return {
      // No matter what has been specified in the follow method, this adapter
      // always returns the link relation foobar from the doc.
      url: t.lastStep.doc.foobar,
    };
  };

});
