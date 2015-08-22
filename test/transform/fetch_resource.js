'use strict';

var abortTraversal = require('../../lib/abort_traversal')
  , httpRequests = require('../../lib/http_requests')
  , proxyquire = require('proxyquire')
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect = chai.expect;

chai.use(sinonChai);

var t;

var fetchResource;
var httpRequestsFetchResource;
var callCallbackOnAbort;

describe('fetch resource transform', function() {

  beforeEach(function() {
    httpRequestsFetchResource = sinon.stub(httpRequests, 'fetchResource');
    callCallbackOnAbort = sinon.spy(abortTraversal, 'callCallbackOnAbort');
    fetchResource =
      proxyquire('../../lib/transforms/fetch_resource', {
        '../http_requests': httpRequests,
        '../abort_traversal': abortTraversal,
      });

    t = {
      aborted: false,
      continuation: false,
      links: [ 'first', 'second', 'third' ],
      step: {
        index: 1
      },
      callback: sinon.spy(),
    };
  });

  afterEach(function() {
    httpRequests.fetchResource.restore();
    abortTraversal.callCallbackOnAbort.restore();
  });

  describe('via http', function() {

    it('should execute httpRequests when no continuation is active',
        function(done) {
      httpRequestsFetchResource.callsArg(1);
      fetchResource(t, function(t) {
        expect(httpRequestsFetchResource).to.have.been.called;
        done();
      });
    });

    it('should call t.callback when http request fails',
        function(done) {
      httpRequestsFetchResource.callsArgWith(1, new Error(), t);
      fetchResource(t, function() {
        done(new Error('should not have been called'));
      });
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          done();
        }
      );
    });
  });

  describe('from continuation', function() {

    it('should be skipped when continuation is active', function(done) {
      t.continuation = true;
      t.step.response = {};
      fetchResource(t, function(t) {
        expect(httpRequestsFetchResource).to.not.have.been.called;
        done();
      });
    });

  });

  describe('when aborted', function() {

    it('should abort when abort has been requested',
        function(done) {
      t.aborted = true;
      fetchResource(t, function() {
        done(new Error('should not have been called'));
      });
      waitFor(
        function() { return callCallbackOnAbort.called; },
        function() {
          expect(callCallbackOnAbort).to.have.been.calledWith(t);
          expect(httpRequestsFetchResource).to.not.have.been.called;
          done();
      });
    });

  });

  describe('when link array is exhausted', function() {

    it('should call t.callback', function(done) {
      t.step.index = 3;
      fetchResource(t, function() {
        done(new Error('should not have been called'));
      });
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(httpRequestsFetchResource).to.not.have.been.called;
          done();
      });
    });

  });
});

