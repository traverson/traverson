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

describe('getUrl method', function() {

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';
  var templateUri = rootUri + '/template/{param}';

  var get;

  var rootResponse = mockResponse({
    'get_link': getUri,
    'template_link': templateUri,
  });

  var result = mockResponse({ result: 'success' });

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
  });

  it('should follow the links and yield the last URI', function(done) {
    api
    .newRequest()
    .follow('get_link')
    .getUrl(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, getUri);
        expect(get.callCount).to.equal(1);
        done();
      }
    );
  });

  it('should yield resolved URI if last URI is a URI template',
      function(done) {
    // using the deprecated alias getUri here, so the alias is tested as well
    api
    .newRequest()
    .follow('template_link')
    .withTemplateParameters({ param: 'substituted' })
    .getUri(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null,
            rootUri + '/template/substituted');
        expect(get.callCount).to.equal(1);
        done();
      }
    );
  });
});
