'use strict';

var applyTransforms = require('../../lib/transforms/apply_transforms')
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect = chai.expect;

chai.use(sinonChai);

var syncTransform = function(t) {
  t.sync++;
  return true;
};

var syncTransformFailing = function(t) {
  t.syncFail++;
  t.callback(new Error('test error'));
  return false;
};

var asyncTransform = function(t, callback) {
  t.async++;
  callback(t);
};
asyncTransform.isAsync = true;

var asyncTransformFailing = function(t, callback) {
  t.asyncFail++;
  t.callback(new Error('test error'));
};
asyncTransformFailing.isAsync = true;

var t;
var callback;

describe('apply', function() {

  beforeEach(function() {
    callback = sinon.spy();
    t = {
      sync: 0,
      syncFail: 0,
      async: 0,
      asyncFail: 0,
      callback: sinon.spy(),
    };
  });

  describe('synchronous', function() {

    it('a single synchronous transform', function(done) {
      var transforms = [
        syncTransform,
      ];

      applyTransforms(transforms, t, function(t) {
        expect(t.callback).to.not.have.been.called;
        expect(t.sync).to.equal(1);
        done();
      });
    });

    it('multiple synchronous transforms', function(done) {
      var transforms = [
        syncTransform,
        syncTransform,
        syncTransform,
      ];

      applyTransforms(transforms, t, function(t) {
        expect(t.callback).to.not.have.been.called;
        expect(t.sync).to.equal(3);
        done();
      });
    });

    it('a single failing synchronous transform', function(done) {
      var transforms = [
        syncTransformFailing,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.syncFail).to.equal(1);
          done();
        }
      );
    });

    it('multiple synchronous transforms with failure', function(done) {
      var transforms = [
        syncTransform,
        syncTransform,
        syncTransform,
        syncTransformFailing,
        syncTransform,
        syncTransform,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.sync).to.equal(3);
          expect(t.syncFail).to.equal(1);
          done();
        }
      );
    });
  });

  describe('synchronous', function() {

    it('a single asynchronous transform', function(done) {
      var transforms = [
        asyncTransform,
      ];

      applyTransforms(transforms, t, function(t) {
        expect(t.callback).to.not.have.been.called;
        expect(t.async).to.equal(1);
        done();
      });
    });

    it('multiple asynchronous transforms', function(done) {
      var transforms = [
        asyncTransform,
        asyncTransform,
        asyncTransform,
      ];

      applyTransforms(transforms, t, function(t) {
        expect(t.callback).to.not.have.been.called;
        expect(t.async).to.equal(3);
        done();
      });
    });

    it('a single failing asynchronous transform', function(done) {
      var transforms = [
        asyncTransformFailing,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.asyncFail).to.equal(1);
          done();
        }
      );
    });

    it('multiple asynchronous transform with failure', function(done) {
      var transforms = [
        asyncTransform,
        asyncTransform,
        asyncTransform,
        asyncTransformFailing,
        asyncTransform,
        asyncTransform,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.async).to.equal(3);
          expect(t.asyncFail).to.equal(1);
          done();
        }
      );
    });

  });

  describe('synchronous and asynchronous (mixed)', function() {

    it('multiple synchronous and asynchronous transforms', function(done) {
      var transforms = [
        asyncTransform,
        syncTransform,
        asyncTransform,
        syncTransform,
        asyncTransform,
      ];

      applyTransforms(transforms, t, function(t) {
        expect(t.callback).to.not.have.been.called;
        expect(t.sync).to.equal(2);
        expect(t.async).to.equal(3);
        done();
      });
    });

    it('multiple transform with synchronous failure', function(done) {
      var transforms = [
        asyncTransform,
        syncTransform,
        asyncTransform,
        syncTransformFailing,
        asyncTransform,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.sync).to.equal(1);
          expect(t.async).to.equal(2);
          expect(t.syncFail).to.equal(1);
          done();
        }
      );
    });

    it('multiple transform with asynchronous failure', function(done) {
      var transforms = [
        asyncTransform,
        syncTransform,
        asyncTransformFailing,
        syncTransform,
        asyncTransform,
      ];

      applyTransforms(transforms, t, callback);
      waitFor(
        function() { return t.callback.called; },
        function() {
          expect(callback).to.not.have.been.called;
          expect(t.callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(t.sync).to.equal(1);
          expect(t.async).to.equal(1);
          expect(t.asyncFail).to.equal(1);
          done();
        }
      );
    });
  });

});
