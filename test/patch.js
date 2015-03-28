'use strict';

var traverson = require('../traverson')
  , util = require('util')
  , mockResponse =  require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);


describe('patch method', function() {

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var patchUri = rootUri + '/patch/me';

  var get;
  var patch;

  var rootResponse = mockResponse({
    'patch_link': patchUri,
  });

  var result = mockResponse({ result: 'success' });

  var payload = {
    some: 'stuff',
    data: 4711
  };

  beforeEach(function() {
    get = sinon.stub();
    patch = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      patch: patch,
    };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
  });

  it('should follow the links and patch the last URI',
      function(done) {
    patch
    .withArgs(patchUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('patch_link')
    .patch(payload, callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result);
        expect(patch.firstCall.args[1].body).to.exist;
        expect(patch.firstCall.args[1].body).to.contain(payload.some);
        expect(patch.firstCall.args[1].body).to.contain(payload.data);
        done();
      }
    );
  });

  it('should call callback with err when patch fails',
      function(done) {
    var err = new Error('test error');
    patch
    .withArgs(patchUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, err);

    api
    .newRequest()
    .follow('patch_link')
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
