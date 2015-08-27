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

describe('delete method', function() {

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';
  var deleteUri = rootUri + '/delete/me';

  var get;
  var del;

  var rootResponse = mockResponse({
    'get_link': getUri,
    'delete_link': deleteUri,
  });

  var result = mockResponse(null, 204);

  beforeEach(function() {
    get = sinon.stub();
    del = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      del: del
    };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
  });

  it('should follow the links and delete the last URL',
      function(done) {
    del
    .withArgs(deleteUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('delete_link')
    .delete(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result,
          sinon.match.object);
        expect(del.firstCall.args[1].body).to.not.exist;
        done();
      }
    );
  });

  it('should convert a response without a body to a null object',
      function(done) {
    del
    .withArgs(deleteUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('delete_link')
    .convertResponseToObject()
    .delete(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, null,
          sinon.match.object);
        done();
      }
    );
  });



  it('should call callback with err when deleting fails',
      function(done) {
    var err = new Error('test error');
    del
    .withArgs(deleteUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, err);

    api
    .newRequest()
    .follow('delete_link')
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
