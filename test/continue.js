'use strict';
/* jshint maxparams: 7 */
/* jshint maxcomplexity: 12 */

var traverson = require('../traverson')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect = chai.expect;

chai.use(sinonChai);

// TODO:
// - Refactor even more, see traverson-angular/test/continue.js
//   - use parameter object for checkResult
//   - refactor test setup into one function, setupTest and have
//     it('...', function() {...}) call that
// - getUrl works, but I have no idea why
// - error handling in a continued traversal
// - cloning with traversal.continue().newRequest(), splitting into multiple
// - follow up traversals
// - abort a continuation
// - mixed continuations (first with getResource second with get or vice versa
// - plus other combinations, getUrl, post, ...)

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

  describe('[method: get]', function() {
    defineTestsForMethod(api.get);
  });

  describe('[method: getResource]', function() {
    defineTestsForMethod(api.getResource);
  });

  describe('[method: getUrl]', function() {
    defineTestsForMethod(api.getUrl);
  });

  describe('[method: post]', function() {
    defineTestsForMethod(api.post, payload);
  });

  describe('[method: put]', function() {
    defineTestsForMethod(api.put, payload);
  });

  describe('[method: patch]', function() {
    defineTestsForMethod(api.patch, payload);
  });

  describe('[method: delete]', function() {
    defineTestsForMethod(api.delete);
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

    it('should branch out with continue and newRequest', function(done) {
      var request = api.newRequest().follow('link1');
      var args = body ? [body] : [];
      var callback1 = sinon.spy();
      var callback2 = sinon.spy();
      args.push(function(err, resource, traversal) {
        if (err) { return done(err); }
        var cont = traversal.continue();
        var request1 = cont.newRequest();
        var request2 = cont.newRequest();
        request1.follow('link2');
        request2.follow('link2', 'link3');
        var args1 = body ? [body, callback1] : [callback1];
        var args2 = body ? [body, callback2] : [callback2];
        method.apply(request1, args1);
        method.apply(request2, args2);
      });
      method.apply(request, args);
      waitFor(
        function() { return callback1.called && callback2.called; },
        function() {
          if (method === api.get) {
            expect(callback1).to.have.been.calledWith(null, response3);
            expect(callback2).to.have.been.calledWith(null, response4);
            expect(get.callCount).to.equal(5);
          } else if (method === api.getResource) {
            expect(callback1).to.have.been.calledWith(null, response3.doc);
            expect(callback2).to.have.been.calledWith(null, response4.doc);
            expect(get.callCount).to.equal(5);
          } else if (method === api.getUrl) {
            expect(callback1).to.have.been.calledWith(null, url2);
            expect(callback2).to.have.been.calledWith(null, url3);
            expect(get.callCount).to.equal(4);
          } else if (method === api.post) {
            expect(callback1).to.have.been.calledWith(null, response3);
            expect(callback2).to.have.been.calledWith(null, response4);
            expect(get.callCount).to.equal(2);
            expect(post.callCount).to.equal(3);
          } else if (method === api.put) {
            expect(callback1).to.have.been.calledWith(null, response3);
            expect(callback2).to.have.been.calledWith(null, response4);
            expect(get.callCount).to.equal(2);
            expect(put.callCount).to.equal(3);
          } else if (method === api.patch) {
            expect(callback1).to.have.been.calledWith(null, response3);
            expect(callback2).to.have.been.calledWith(null, response4);
            expect(get.callCount).to.equal(2);
            expect(patch.callCount).to.equal(3);
          } else if (method === api.delete) {
            expect(callback1).to.have.been.calledWith(null, response3);
            expect(callback2).to.have.been.calledWith(null, response4);
            expect(get.callCount).to.equal(2);
            expect(del.callCount).to.equal(3);
          } else {
            throw new Error('Unknown method: ' + method.name + ': ' +
                method);
          }
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
    } else if (method === api.put) {
      expect(callback).to.have.been.calledWith(null, response);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets -
         (noLinksForSecondTraversal ? 1 : 2));
      expect(put.callCount).to.equal(2);
    } else if (method === api.patch) {
      expect(callback).to.have.been.calledWith(null, response);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets -
         (noLinksForSecondTraversal ? 1 : 2));
      expect(patch.callCount).to.equal(2);
    } else if (method === api.delete) {
      expect(callback).to.have.been.calledWith(null, response);
      expect(get.callCount).to.equal(expectedNumberOfHttpGets -
         (noLinksForSecondTraversal ? 1 : 2));
      expect(del.callCount).to.equal(2);
    } else {
      throw new Error('Unknown method: ' + method.name + ': ' +
          method);
    }
  }
});
