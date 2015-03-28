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

describe('put method', function() {

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var putUri = rootUri + '/put/something/here';

  var get;
  var put;

  var rootResponse = mockResponse({
    'put_link': putUri,
  });

  var result = mockResponse({ result: 'success' });

  var payload = {
    some: 'stuff',
    data: 4711
  };

  beforeEach(function() {
    get = sinon.stub();
    put = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      put: put,
    };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
  });

  it('should follow the links and put to the last URI',
      function(done) {
    put
    .withArgs(putUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result, putUri);

    api
    .newRequest()
    .follow('put_link')
    .put(payload, callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result);
        expect(put.firstCall.args[1].body).to.exist;
        expect(put.firstCall.args[1].body).to.contain(payload.some);
        expect(put.firstCall.args[1].body).to.contain(payload.data);
        done();
      }
    );
  });

  it('should call callback with err when put fails',
      function(done) {
    var err = new Error('test error');
    put
    .withArgs(putUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, err);

    api
    .newRequest()
    .follow('put_link')
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
