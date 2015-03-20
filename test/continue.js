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

// TODO:
// get
// getUrl
// getResource
// post
// put
// patch
// delete
//
// first traversal without links & continuation without links
// first traversal with links & continuation without links
// first traversal without links & continuation with links
// first traversal with links & continuation with links
//
// error handling in a continued traversal
//
// cloning with traversal.continue().newRequest()
//
// abort a continuation
//
// mixed continuations (first with getResource second with get or vice versa
// plus other combinations, getUrl, post, ...)
//
// always count the number of actual http requests!

describe('Continuation of traversals', function() {

  var get;
  var callback;
  var rootUrl = 'http://api.example.org';
  var api = traverson.from(rootUrl).json();

  var url1 = rootUrl + '/1';
  var rootResponse = mockResponse({ link1: url1 });
  var url2 = rootUrl + '/2';
  var response2 = mockResponse({ link2: url2 });
  var url3 = rootUrl + '/3';
  var response3 = mockResponse({ link3: url3 });
  var response4 = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();

    get
    .withArgs(rootUrl, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse);
    get
    .withArgs(url1, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response2);
    get
    .withArgs(url2, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response3);
    get
    .withArgs(url3, {}, sinon.match.func)
    .callsArgWithAsync(2, null, response4);
  });

  describe('getResource', function() {
    defineTestsForMethod(api.getResource);
  });

  describe('get', function() {
    defineTestsForMethod(api.get);
  });

  function defineTestsForMethod(method) {

    it('should continue with links after a no-link traversal', function(done) {
      var request = api.newRequest();
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link1', 'link2', 'link3');
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4);
          expect(get.callCount).to.equal(4);
          done();
        }
      );
    });

    it('should continue with a link (1|1)', function(done) {
      var request = api.newRequest().follow('link1');
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link2');
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response3);
          expect(get.callCount).to.equal(3);
          done();
        }
      );
    });

    it('should continue with a link (2|1)', function(done) {
      var request = api.newRequest().follow('link1', 'link2');
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link3');
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4);
          expect(get.callCount).to.equal(4);
          done();
        }
      );
    });

    it('should continue with a link (1|2)', function(done) {
      var request = api.newRequest().follow('link1');
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link2', 'link3');
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4);
          expect(get.callCount).to.equal(4);
          done();
        }
      );
    });

    it('should continue with no links', function(done) {
      var request = api.newRequest().follow('link1', 'link2', 'link3');
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        traversal.continue();
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4);
          expect(get.callCount).to.equal(4);
          done();
        }
      );
    });

    it('should continue with no links after a no-link traversal',
        function(done) {
      var request = api.newRequest().follow();
      method.call(request, function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow();
        method.call(request, callback);
      });
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, rootResponse);
          expect(get.callCount).to.equal(1);
          done();
        }
      );
    });
  } // function defineTestsForMethod

  function checkResult(method, callback, response) {
    if (method === api.get) {
      expect(callback).to.have.been.calledWith(null, response);
    } else if (method === api.getResource) {
      expect(callback).to.have.been.calledWith(null, response.doc);
    } else {
      throw new Error('Unknown method: ' + method.name + ': ' +
          method);
    }
  }

});
