'use strict';

var traverson = require('../traverson')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect
  , _s = require('underscore.string');

chai.use(sinonChai);

describe('Traverson using a custom request parser', function() {

  var get;

  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';

  var jsonVulnerabilityProtection = ')]}\',\n';
  var rootResponse = mockResponse({
    'get_link': getUri,
  });
  rootResponse.body = jsonVulnerabilityProtection + rootResponse.body;

  var secondResponse = mockResponse({ content: 'before custom parsing' });
  secondResponse.body = jsonVulnerabilityProtection + secondResponse.body;

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();

    get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
        2, null, rootResponse, rootResponse.body);
    get.withArgs(getUri, {}, sinon.match.func).callsArgWithAsync(2, null,
        secondResponse, secondResponse.body);

  });

  it('should use the custom request parser to strip JSON vulnerability ' +
      'protection', function(done) {
    api
    .newRequest()
    .follow('get_link')
    .parseResponseBodiesWith(function(body) {
      if (_s.startsWith(body, jsonVulnerabilityProtection)) {
        body = body.slice(jsonVulnerabilityProtection.length);
      }
      var doc = JSON.parse(body);
      if (doc.content === 'before custom parsing') {
        doc.content = 'after custom parsing';
      }
      return doc;
    })
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, {
          content: 'after custom parsing'
        });
        done();
      }
    );
  });
});
