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

describe('post method', function() {

  var callback;
  var rootUri = 'http://api.example.org';
  var api = traverson.from(rootUri).json();

  var postUri = rootUri + '/post/something/here';

  var get;
  var post;

  var rootResponse = mockResponse({
    'post_link': postUri,
  });

  var resultObject = { result: 'success' };
  var result = mockResponse(resultObject, 201);

  var payload = {
    some: 'stuff',
    data: 4711
  };

  beforeEach(function() {
    get = sinon.stub();
    post = sinon.stub();
    api.requestModuleInstance = {
      get: get,
      post: post,
    };
    callback = sinon.spy();

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, rootResponse, rootResponse.body);
    get
    .withArgs(postUri, {}, sinon.match.func)
    .callsArgWithAsync(1,
        new Error('GET is not implemented for this URL, please POST ' +
        'something'));
  });

  it('should follow the links and post to the last URL',
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
        expect(callback).to.have.been.calledWith(null, result,
          sinon.match.object);
        expect(post.firstCall.args[1].body).to.exist;
        expect(post.firstCall.args[1].body).to.contain(payload.some);
        expect(post.firstCall.args[1].body).to.contain(payload.data);
        done();
      }
    );
  });

  it('should convert the response to an object', function(done) {
    post
    .withArgs(postUri, sinon.match.object, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .follow('post_link')
    .convertResponseToObject()
    .post(payload, callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, resultObject,
          sinon.match.object);
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
        expect(callback).to.have.been.calledWith(null, result,
          sinon.match.object);
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
