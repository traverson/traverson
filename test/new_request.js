'use strict';

var traverson = require('../traverson')
  , environment = require('./environment')
  , isNodeJs = environment.isNodeJs
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('Using newRequest() after configuring', function() {

  var get;
  var callback;
  var rootUrl = 'http://api.io';
  var client = traverson.json.from(rootUrl);
  var request;

  var customParser = function customParser(json) {
    return JSON.parse(json);
  };

  var result = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    client.withTemplateParameters({
      abc: 'def',
      ghi: 4711,
    });
    client.withRequestOptions({
      headers: {
        'x-my-special-header': 'foo'
      }
    });
    client.parseResponseBodiesWith(customParser);
    client.resolveRelative();
    request = client.newRequest();
    get = sinon.stub();
    request.walker.request = { get: get };
    callback = sinon.spy();
  });

  var rootStep = {
    uri: rootUrl
  };
  var rootResponse = mockResponse({
    link: rootUrl + '/link/to/thing',
  });

  it('should keep configured values but not leak state from follow()',
      function(done) {
    get.withArgs(rootUrl, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse);
    get.withArgs(rootUrl + '/link/to/thing',
        sinon.match.func).callsArgWithAsync(1, null, result);
    request.follow('link').getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        var newRequest = client.newRequest();
        checkConfiguredValuesAreStillIntact(newRequest);
        checkNoLeaksFromFollowProcess(request, newRequest);
        done();
      }
    );
  });

  // TODO Builder should have getter methods to query its configuration

  function checkConfiguredValuesAreStillIntact(newRequest) {
    // check if it uses the same media type
    // This does not work in the browser when the minified Traverson lib is used
    // because the constructor name has been minified to 'c' :-(
    if (isNodeJs()) {
      expect(newRequest.walker.adapter.constructor.name)
        .to.equal('JsonAdapter');
    }
    expect(newRequest.walker.startUri).to.equal(rootUrl);
    var templateParams = newRequest.walker.templateParameters;
    expect(templateParams.abc).to.equal('def');
    expect(templateParams.ghi).to.equal(4711);
    // TODO check request options for header x-my-special-header. How?
    expect(newRequest.walker.parseJson).to.be.equal(customParser);
    expect(newRequest.walker.resolveRelative).to.be.true;
  }

  function checkNoLeaksFromFollowProcess(oldRequest, newRequest) {
    expect(oldRequest).to.not.be.equal(newRequest);
    expect(oldRequest.walker).to.not.be.equal(newRequest.walker);
    expect(oldRequest.walker.links).to.exist();
    expect(oldRequest.walker.links.length).to.equal(1);
    expect(oldRequest.walker.links[0]).to.equal('link');
    expect(newRequest.walker.links).to.be.undefined;
  }
});
