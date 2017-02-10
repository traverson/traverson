'use strict';

var traverson = require('../traverson')
  , FoobarAdapter = require('./foobar_adapter')
  , util = require('util')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('Traverson setting Accept and Content-Type header automatically',
    function() {

  /* jshint sub: true */

  var get;
  var callback;

  var rootUri = 'http://api.example.org';
  var result = mockResponse({ the: 'result' });
  var response = mockResponse({
    link: rootUri + '/link',
  });

  var api = traverson.from(rootUri);

  before(function() {
    traverson.registerMediaType(FoobarAdapter.mediaType, FoobarAdapter);
  });

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
  });

  it('should not set headers when the media type has not been set ' +
      'explicitly and no request options are present', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);

    api
    .newRequest()
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers).to.be.undefined;
        expect(callback).to.have.been.calledWith(null, response.doc);
        done();
      }
    );
  });

  it('should not set headers when the media type has not been set ' +
      'explicitly but request options headers are present', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);

    api
    .newRequest()
    .withRequestOptions({ headers: { SomeHeader: 'value' }})
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers['Accept']).to.be.undefined;
        expect(get.firstCall.args[1].headers['Content-Type']).to.be.undefined;
        expect(get.firstCall.args[1].headers['SomeHeader']).to.equal('value');
        expect(callback).to.have.been.calledWith(null, response.doc);
        done();
      }
    );
  });

  it('should set headers for .json()', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);
    get
    .withArgs(rootUri + '/link', sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .json()
    .follow('link')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers['Accept'])
          .to.equal('application/json');
        expect(get.firstCall.args[1].headers['Content-Type'])
          .to.equal('application/json');
        expect(get.secondCall.args[1].headers['Accept'])
          .to.equal('application/json');
        expect(get.secondCall.args[1].headers['Content-Type'])
          .to.equal('application/json');
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should not set headers when auto headers are disabled', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);
    get
    .withArgs(rootUri + '/link', sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .json()
    .disableAutoHeaders()
    .follow('link')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers).to.be.undefined;
        expect(get.secondCall.args[1].headers).to.be.undefined;
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });


  it('should set headers for .json() also when other request options are ' +
      'present', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);
    get
    .withArgs(rootUri + '/link', sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .withRequestOptions({ headers: { SomeHeader: 'value' }})
    .json()
    .follow('link')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers['Accept'])
          .to.equal('application/json');
        expect(get.firstCall.args[1].headers['Content-Type'])
          .to.equal('application/json');
        expect(get.firstCall.args[1].headers['SomeHeader']).to.equal('value');
        expect(get.secondCall.args[1].headers['Accept'])
          .to.equal('application/json');
        expect(get.secondCall.args[1].headers['Content-Type'])
          .to.equal('application/json');
        expect(get.secondCall.args[1].headers['SomeHeader']).to.equal('value');
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should set headers for arbitrary media type plug-ins', function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);

    api
    .newRequest()
    .setMediaType('application/foobar+json')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(get.firstCall.args[1].headers['Accept'])
          .to.equal('application/foobar+json');
        expect(get.firstCall.args[1].headers['Content-Type'])
          .to.equal('application/foobar+json');
        done();
      }
    );
  });

});
