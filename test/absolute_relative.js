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

describe('Traverson resolving absolute and relative URLs', function() {

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


  it('should follow full qualified URLs with protocol http',
      function(done) {
    var path1 = rootUri + '/path/1';
    var path2 = rootUri + '/path/2';

    var response1 = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(path1, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(path2, {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow(['link1', 'link2'])
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should follow full qualified URLs with protocol https',
      function(done) {
    // also test case insensitive matching
    var httpsRootUri = 'HttPs://api.io';
    var path1 = httpsRootUri + '/path/1';
    var path2 = httpsRootUri + '/path/2';

    var response1 = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });

    get
    .withArgs(httpsRootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(path1, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(path2, {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .from(httpsRootUri)
    .follow(['link1', 'link2'])
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should follow links with absolute urls without protocol',
    function(done) {
    var path1 = '/path/1';
    var path2 = '/path/2';

    var response1 = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(rootUri + path1, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(rootUri + path2, {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow(['link1', 'link2'])
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should follow links with relative urls', function(done) {
    var path1 = '/first';
    var path2 = '/second';

    var response1 = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(rootUri + path1, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(rootUri + path1 + path2, {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .resolveRelative()
    .follow(['link1', 'link2'])
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
