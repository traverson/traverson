'use strict';

var traverson = require('../traverson')
  , util = require('util')
  , mockResponse =  require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

/*
 * Tests for all of Json Walker's request methods except getResource, which is
 * tested extensively in json_get_resource.js. This test suite contains tests
 * for get, post, put, delete and patch. Each http method verb has it's own
 * describe-section. Since most of the code path is the same for getResource
 * and get, post, ..., there are just a few basic tests here for each verb.
 * The getResource tests are more comprehensive.
 */
describe('The JSON client\'s', function() {


  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();

  var getUri = rootUri + '/link/to/resource';
  var postUri = rootUri + '/post/something/here';
  var putUri = rootUri + '/put/something/here';
  var patchUri = rootUri + '/patch/me';
  var deleteUri = rootUri + '/delete/me';
  var templateUri = rootUri + '/template/{param}';

  var get;
  var post;
  var put;
  var patch;
  var del;

  var rootResponse = mockResponse({
    'get_link': getUri,
    'post_link': postUri,
    'put_link': putUri,
    'patch_link': patchUri,
    'delete_link': deleteUri,
    'template_link': templateUri
  });

  var result = mockResponse({ result: 'success' });

  var payload = {
    some: 'stuff',
    data: 4711
  };

  beforeEach(function() {
    get = sinon.stub();
    post = sinon.stub();
    put = sinon.stub();
    patch = sinon.stub();
    del = sinon.stub();
    api.walker.request = {
      get: get,
      post: post,
      put: put,
      patch: patch,
      del: del
    };
    callback = sinon.spy();

    get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
        2, null, rootResponse, rootResponse.body);
    get.withArgs(getUri, {}, sinon.match.func).callsArgWithAsync(2, null,
        result, result.body);
    get.withArgs(postUri, {}, sinon.match.func).callsArgWithAsync(1,
        new Error('GET is not implemented for this URI, please POST ' +
        'something'));
  });

  describe('get method', function() {

    it('should follow the links', function(done) {
      api
      .newRequest()
      .follow('get_link')
      .get(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result);
          done();
        }
      );
    });

    it('should call callback with err', function(done) {
      var err = new Error('test error');
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub();
      api.walker.request = { get: get };
      get.callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow()
      .get(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });

    it('should call callback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error');
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub();
      api.walker.request = { get: get };
      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      get
      .withArgs(getUri, {}, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('get_link', 'another_link')
      .get(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });

  });

  describe('getUri method', function() {
    it('should follow the links and yield the last URI', function(done) {
      api
      .newRequest()
      .follow('get_link')
      .getUri(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, getUri);
          expect(get.callCount).to.equal(1);
          done();
        }
      );
    });

    it('should yield resolved URI if last URI is a URI template',
        function(done) {
      api
      .newRequest()
      .follow('template_link')
      .withTemplateParameters({ param: 'substituted' })
      .getUri(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null,
              rootUri + '/template/substituted');
          expect(get.callCount).to.equal(1);
          done();
        }
      );
    });

  });

  describe('post method', function() {

    var result = mockResponse({ result: 'success' }, 201);

    it('should follow the links and post to the last URI',
        function(done) {
      post
      .withArgs(postUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('post_link')
      .post(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result, postUri);
          expect(post.firstCall.args[1].body).to.exist;
          expect(post.firstCall.args[1].body).to.contain(payload.some);
          expect(post.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error');
      post
      .withArgs(postUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('post_link')
      .post(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });

    it('should use request options provided as object', function(done) {
      var options = { qs: { a: 'b' } };
      runTest(
        function(requestBuilder) {
          return requestBuilder.withRequestOptions(options);
        },
        options,
        done
      );
    });

    it('should use request options provided as array', function(done) {
      var optionsArray = [{ qs: { a: 'b' } }, { auth: { user: 'fred' } }];
      runTest(
        function(requestBuilder) {
          return requestBuilder.withRequestOptions(optionsArray);
        },
        optionsArray,
        done
      );
    });

    function runTest(configure, expectedOptions, done) {
      var expected1 = expectedOptions;
      var expected2 = expectedOptions;
      if (util.isArray(expectedOptions)) {
        expected1 = expectedOptions[0];
        expected2 = expectedOptions[1];
      }

      get
      .withArgs(rootUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, rootResponse);
      post
      .withArgs(postUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      configure(api.newRequest())
      .follow('post_link')
      .post(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result, postUri);
          expect(get.firstCall.args[1]).to.deep.equal(expected1);
          expect(post.firstCall.args[1]).to.deep.equal(expected2);
          expect(post.firstCall.args[1].body).to.exist;
          expect(post.firstCall.args[1].body).to.contain(payload.some);
          expect(post.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    }

  });

  describe('put method', function() {

    var result = mockResponse({ result: 'success' }, 200);

    it('should follow the links and put to the last URI',
        function(done) {
      put
      .withArgs(putUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result, putUri);

      api
      .newRequest()
      .follow('put_link')
      .put(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result, putUri);
          expect(put.firstCall.args[1].body).to.exist;
          expect(put.firstCall.args[1].body).to.contain(payload.some);
          expect(put.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error');
      put
      .withArgs(putUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('put_link')
      .put(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('patch method', function() {

    var result = mockResponse({ result: 'success' }, 200);

    it('should follow the links and patch the last URI',
        function(done) {
      patch
      .withArgs(patchUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('patch_link')
      .patch(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result, patchUri);
          expect(patch.firstCall.args[1].body).to.exist;
          expect(patch.firstCall.args[1].body).to.contain(payload.some);
          expect(patch.firstCall.args[1].body).to.contain(payload.data);
          done();
        }
      );
    });

    it('should call callback with err when patch fails',
        function(done) {
      var err = new Error('test error');
      patch
      .withArgs(patchUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('patch_link')
      .patch(payload, callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('delete method', function() {

    var result = mockResponse(null, 204);

    it('should follow the links and delete the last URI',
        function(done) {
      del
      .withArgs(deleteUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow('delete_link')
      .delete(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result, deleteUri);
          expect(del.firstCall.args[1].body).to.not.exist;
          done();
        }
      );
    });

    it('should call callback with err when deleting fails',
        function(done) {
      var err = new Error('test error');
      del
      .withArgs(deleteUri, sinon.match.object, sinon.match.func)
      .callsArgWithAsync(2, err);

      api
      .newRequest()
      .follow('delete_link')
      .del(callback);

      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });
});
