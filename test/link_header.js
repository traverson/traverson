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

describe('Traverson using the link header', function() {

  var get;
  var callback;

  var rootUri = 'http://api.example.org';

  var api = traverson.from(rootUri).json();

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
  });

  it('should follow the link header',
      function(done) {
    var pathFromLinkHeader = rootUri + '/path/from/link/header/1';
    var linkHeader = '<' + pathFromLinkHeader + '>; rel="link1"';

    var response1 = mockResponse({}, 200, {
      link: linkHeader
    });
    var response2 = mockResponse({ the: 'result' });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(pathFromLinkHeader, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);

    api
    .linkHeader()
    .newRequest()
    .follow('link1')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, response2.doc);
        done();
      }
    );
  });

  it('should add the _links to doc',
      function(done) {
    var pathFromLinkHeader = rootUri + '/path/from/link/header/1';
    var linkHeader = '<' + pathFromLinkHeader + '>; rel="link1"';
    var linkHeaderSelf = '<' + pathFromLinkHeader + '>; rel="self"';

    var response1 = mockResponse({}, 200, {
      link: linkHeader
    });
    var response2 = mockResponse({ the: 'result' }, 200, {
      link: linkHeaderSelf
    });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response1);
    get
    .withArgs(pathFromLinkHeader, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);

    api
    .linkHeader()
    .newRequest()
    .follow('link1')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, {
          the: 'result',
          _links: {
            self: {
              rel: 'self',
              url: pathFromLinkHeader
            }
          }
        });
        done();
      }
    );
  });
});
