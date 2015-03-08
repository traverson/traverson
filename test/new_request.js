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
  // deliberately using deprecated API (property json) here, so we can check if
  // this form also still works
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
    })
    .withRequestOptions({
      headers: {
        'x-my-special-header': 'foo'
      }
    })
    .parseResponseBodiesWith(customParser)
    .resolveRelative();
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
    get
    .withArgs(rootUrl, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse);
    get
    .withArgs(rootUrl + '/link/to/thing', sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result);
    request.follow('link').getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        var newRequest = client.newRequest();
        checkConfiguredValuesAreStillTheSame(newRequest);
        checkNoLeaksFromFollowProcess(request, newRequest);
        done();
      }
    );
  });

  function checkConfiguredValuesAreStillTheSame(newRequest) {
    expect(newRequest.getMediaType()).to.equal(traverson.mediaTypes.JSON);
    expect(newRequest.doesContentNegotiation()).to.be.false;
    // This does not work in the browser when the minified Traverson lib is used
    // because the constructor name has been minified to 'c' :-(
    if (isNodeJs()) {
      expect(newRequest.adapter.constructor.name)
        .to.equal('JsonAdapter');
    }
    expect(newRequest.getFrom()).to.equal(rootUrl);
    var templateParams = newRequest.getTemplateParameters();
    expect(templateParams.abc).to.equal('def');
    expect(templateParams.ghi).to.equal(4711);
    expect(newRequest.getRequestOptions().headers['x-my-special-header'])
      .to.equal('foo');
    expect(newRequest.getJsonParser()).to.equal(customParser);
    expect(newRequest.doesResolveRelative()).to.be.true;
  }

  function checkNoLeaksFromFollowProcess(oldRequest, newRequest) {
    expect(oldRequest).to.not.be.equal(newRequest);
    expect(oldRequest.walker).to.not.be.equal(newRequest.walker);
    expect(oldRequest.links).to.exist();
    expect(oldRequest.links.length).to.equal(1);
    expect(oldRequest.links[0]).to.equal('link');
    expect(newRequest.links).to.exist();
    expect(newRequest.links.length).to.equal(0);
  }
});
