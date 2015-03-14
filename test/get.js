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

describe('get method', function() {

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';

  var get;

  var rootResponse = mockResponse({ 'get_link': getUri });

  var result = mockResponse({ result: 'success' });

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
    get
    .withArgs(getUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, result, result.body);
  });

  it('should follow the links', function(done) {
    api
    .newRequest()
    .follow('get_link')
    .get(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result);
        done();
      }
    );
  });

  it('should call callback with err', function(done) {
    var err = new Error('test error');
    // Default stubbing from beforeEach is not what we want here.
    // IMO, get.reset() should be enough, but isnt?
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    get.callsArgWithAsync(2, err);

    api
    .newRequest()
    .follow()
    .get(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(err);
        done();
      }
    );
  });

  it('should call callback with err when walking along the links fails',
      function(done) {
    var err = new Error('test error');
    // Default stubbing from beforeEach is not what we want here.
    // IMO, get.reset() should be enough, but isnt?
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse);
    get
    .withArgs(getUri, {}, sinon.match.func)
    .callsArgWithAsync(2, err);

    api
    .newRequest()
    .follow('get_link', 'another_link')
    .get(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(err);
        done();
      }
    );
  });
});
