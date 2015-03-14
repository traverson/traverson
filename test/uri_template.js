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

describe('Traverson with URI templating', function() {

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

  it('should evaluate URI templates', function(done) {
    var rootResponseUriTemplate = mockResponse({
      firstTemplate: rootUri + '/users/{user}/things{/thing}'
    });
    var next = mockResponse({
      secondTemplate: rootUri + '/another/{id}'
    });

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponseUriTemplate);
    get
    .withArgs(rootUri + '/users/basti1302/things/4711', {}, sinon.match.func)
    .callsArgWithAsync(2, null, next);
    get
    .withArgs(rootUri + '/another/42', {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .withTemplateParameters({user: 'basti1302', thing: 4711, id: 42})
    .follow('firstTemplate', 'secondTemplate')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should evaluate URI templates for the start URI', function(done) {
    var rootUriTemplate = mockResponse(
      { we: 'can haz use uri templates for root doc, yo!' });
    var startUriTemplate = rootUri + '/{param}/whatever';
    var startUri = rootUri + '/substituted/whatever';
    var api = traverson.from(startUriTemplate).json();
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    get
    .withArgs(startUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootUriTemplate);

    api
    .newRequest()
    .withTemplateParameters({param: 'substituted'})
    .follow()
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, rootUriTemplate.doc);
        done();
      }
    );
  });

  it('should evaluate URI templates with array of template params',
      function(done) {
    var rootUriTemplate = mockResponse({
      firstTemplate: rootUri + '/users/{user}/things{/thing}'
    });
    var next = mockResponse({
      secondTemplate: rootUri + '/another_user/{user}'
    });
    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootUriTemplate);
    get
    .withArgs(rootUri + '/users/basti1302/things/4711', {}, sinon.match.func)
    .callsArgWithAsync(2, null, next);
    get
    .withArgs(rootUri + '/another_user/someone_else', {}, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api.
    follow('firstTemplate', 'secondTemplate')
    .withTemplateParameters([null,
                            {user: 'basti1302', thing: 4711},
                            {user: 'someone_else'}])
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  });

  it('should resolve optional URI templates also without template parameters',
      function(done) {
    var responseUriTemplate = mockResponse({
      template: rootUri + '/users{?page,size,sort}',
    });
    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, responseUriTemplate);
    get
    .withArgs(rootUri + '/users', {},
        sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('template')
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


