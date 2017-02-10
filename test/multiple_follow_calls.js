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

describe('Traverson with multiple follow calls for one traversal', function() {

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


  it('should aggregate multiple calls to follow into one link array',
      function(done) {
    var path1 = rootUri + '/path/1';
    var path2 = rootUri + '/path/2';
    var path3 = rootUri + '/path/3';

    var response1 = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });
    var response3 = mockResponse({ link3: path3 });

    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(path1, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(path2, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response3);
    get
    .withArgs(path3, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('link1')
     // interleave follow calls with some other config calls (false is the
     // default for resolveRelative anyway)
    .resolveRelative(false)
    .follow('link2')
    // no embedded resources, so this has no effect
    .preferEmbeddedResources(true)
    .follow('link3')
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
