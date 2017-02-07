'use strict';

var traverson = require('../traverson')
  , util = require('util')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('Traverson using the location header', function() {

  var get;
  var callback;

  var rootUri = 'http://api.example.org';
  var result = mockResponse({ the: 'result' });

  var api = traverson.from(rootUri).json();

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
  });

  it('should follow the location header',
      function(done) {
    var pathFromLink = rootUri + '/path/1';
    var pathFromLocationHeader = rootUri + '/path/from/location/header/1';

    var response1 = mockResponse({ link1: pathFromLink });
    var response2 = mockResponse({}, 200, {
      location: pathFromLocationHeader,
    });

    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(pathFromLink, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(pathFromLocationHeader, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('link1')
    .followLocationHeader()
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });
});
