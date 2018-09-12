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

describe('Traverson\'s getResource', function() {

  var get;
  var callback;
  var rootUri = 'http://api.example.org';
  var api = traverson.from(rootUri).json();

  var result = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
  });

  describe('basic features', function() {
    var rootStep = {
      uri: rootUri
    };
    var rootResponse = mockResponse({
      irrelevant: { stuff: 'to be ignored' },
      link: rootUri + '/link/to/thing',
      more: { stuff: { that: 'we do not care about' } }
    });

    it('should access the root URI', function(done) {
      api
      .newRequest()
      .getResource(callback);

      waitFor(
        function() { return get.called; },
        function() {
          expect(get).to.have.been.calledWith(
            rootUri, sinon.match.any, sinon.match.func);
          done();
        }
      );
    });

    it('should call callback with the root doc', function(done) {
      get.callsArgWithAsync(2, null, rootResponse);

      api
      .newRequest()
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, rootResponse.doc);
          done();
        }
      );
    });

    it('should call callback with err', function(done) {
      var err = new Error('test error');
      get.callsArgWithAsync(2, err);

      api
      .newRequest()
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });

    it('should follow a single element path', function(done) {
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(rootUri + '/link/to/thing', sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('link')
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should follow a single element path as array', function(done) {
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(rootUri + '/link/to/thing', sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow(['link'])
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('using get (instead of getResource), but with the ' +
        '"convertResponseToObject" option', function(done) {
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(rootUri + '/link/to/thing', sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('link')
      .convertResponseToObject()
      .get(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should call callback with err if link is not found', function(done) {
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);

      api
      .newRequest()
      .follow('non-existing-link')
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          assert(callback.calledOnce);
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          var err = callback.args[0][0];
          expect(err.message).to.contain('Could not find ' +
              'property non-existing-link');
          expect(err.name).to.equal(traverson.errors.LinkError);
          done();
        }
      );
    });

    it('should call callback with err inside recursion', function(done) {
      var err = new Error('test error');
      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null,
        mockResponse({ firstLink: rootUri + '/first' }));
      get
      .withArgs(rootUri + '/first', sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('firstLink')
      .getResource(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('with multiple features combined', function() {

    it('should follow a multi element path', function(done) {
      var path1 = rootUri + '/path';
      var template2 = rootUri + '/path/to/resource{/param}';
      var path2 = rootUri + '/path/to/resource/gizmo';
      var path3 = rootUri + '/path/to/another/resource';
      var path4 = rootUri + '/path/to/the/last/resource';

      var root = mockResponse({ link1: path1 });
      var response2 = mockResponse({ link2: template2 });
      var response3 = mockResponse({
        nested: {
          array: [
            { foo: 'bar' },
            { link: path3 },
            { bar: 'baz' }
          ]
        }
      });
      var response4 = mockResponse({ link4: path4 });

      get
      .withArgs(rootUri, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, root);
      get
      .withArgs(path1, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, response2);
      get
      .withArgs(path2, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, response3);
      get
      .withArgs(path3, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, response4);
      get
      .withArgs(path4, sinon.match.any, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .withTemplateParameters({ param: 'gizmo' })
      .follow(['link1', 'link2', '$[nested][array][1].link', 'link4'])
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
});
