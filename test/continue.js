'use strict';

/* jshint maxparams: 7 */

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
// getUrl - works, but I have no idea why?!?
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
// cloning with traversal.continue().newRequest(), splitting into multiple
// follow up traversals
//
// abort a continuation
//
// mixed continuations (first with getResource second with get or vice versa
// plus other combinations, getUrl, post, ...)

describe('Continuation of traversals', function() {

  var get;
  var post;
  var put;
  var patch;
  var del;
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

  var payload = { some: 'stuff' };

  beforeEach(function() {
    get = sinon.stub();
    post = sinon.stub();
    put = sinon.stub();
    patch = sinon.stub();
    del = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      post: post,
      put: put,
      patch: patch,
      del: del,
    };
    callback = sinon.spy();
    setupMocks();
  });

  describe('get', function() {
    defineTestsForMethod(api.get);
  });

  describe('getResource', function() {
    defineTestsForMethod(api.getResource);
  });

  describe('getUrl', function() {
    defineTestsForMethod(api.getUrl);
  });

  describe('post', function() {
    defineTestsForMethod(api.post, payload);
  });

  function defineTestsForMethod(method, body) {

    it('should continue with links after a no-link traversal', function(done) {
      var request = api.newRequest();
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link1', 'link2', 'link3');
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4, url3, 4);
          done();
        }
      );
    });

    it('should continue with a link (1|1)', function(done) {
      var request = api.newRequest().follow('link1');
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link2');
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response3, url2, 3);
          done();
        }
      );
    });

    it('should continue with a link (2|1)', function(done) {
      var request = api.newRequest().follow('link1', 'link2');
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link3');
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4, url3, 4);
          done();
        }
      );
    });

    it('should continue with a link (1|2)', function(done) {
      var request = api.newRequest().follow('link1');
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue().follow('link2', 'link3');
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4, url3, 4);
          done();
        }
      );
    });

    it('should continue with no links', function(done) {
      var request = api.newRequest().follow('link1', 'link2', 'link3');
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue();
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, response4, url3, 4, true);
          done();
        }
      );
    });

    it('should continue with no links after a no-link traversal',
        function(done) {
      var request = api.newRequest();
      var args = body ? [body] : [];
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        request = traversal.continue();
        args = body ? [body, callback] : [callback];
        method.apply(request, args);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback.called; },
        function() {
          checkResult(method, callback, rootResponse, rootUrl, 1, true);
          done();
        }
      );
    });
  } // function defineTestsForMethod

  function setupMocks() {
    [get, post, put, patch, del].forEach(function(fn) {
      fn
      .withArgs(rootUrl, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      fn
      .withArgs(url1, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response2);
      fn
      .withArgs(url2, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response3);
      fn
      .withArgs(url3, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, response4);
    });
  }

  function checkResult(method,
                       callback,
                       response,
                       url,
                       expectedNumberOfHttpGets,
                       noLinksForSecondTraversal) {
    if (method === api.get) {
      expect(callback).to.have.been.calledWith(null, response);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets);
    } else if (method === api.getResource) {
      expect(callback).to.have.been.calledWith(null, response.doc);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets);
    } else if (method === api.getUrl) {
      expect(callback).to.have.been.calledWith(null, url);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets - 1);
    } else if (method === api.post) {
      expect(callback).to.have.been.calledWith(null, response);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets -
         (noLinksForSecondTraversal ? 1 : 2));
      expect(post.callCount).to.equal(2);
    } else {
      throw new Error('Unknown method: ' + method.name + ': ' +
          method);
    }
  }

});
