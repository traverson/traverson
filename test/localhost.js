'use strict';

var traverson = require('../traverson')
  , environment = require('./environment')
  , isNodeJs = environment.isNodeJs
  , isPhantomJs = environment.isPhantomJs
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('Traverson (when tested against a local server)', function() {

  var api;
  var testServer;
  var callback;
  var rootUri = 'http://127.0.0.1:2808/';

  before(function() {
    if (isNodeJs()) {
      testServer = require('traverson-test-server');
      testServer.start();
    }
  });

  after(function() {
    if (isNodeJs() && testServer) {
      testServer.stop();
    }
  });

  beforeEach(function() {
    api = traverson
    .from(rootUri)
    .json()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    callback = sinon.spy();
  });

  it('should fetch the root response', function(done) {
    api
    .newRequest()
    .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal(rootUri + 'first');
        done();
      }
    );
  });

  it('should fetch the root document', function(done) {
    api
    .newRequest()
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal(rootUri + 'first');
        done();
      }
    );
  });

  it('should follow a single element path', function(done) {
    api
    .newRequest()
    .follow('first')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.first).to.exist;
        expect(resultDoc.first).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path to a resource', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should authenticate', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      auth: {
        user: 'traverson',
        pass: 'verysecretpassword',
        sendImmediately: false
      }
    })
    .follow('auth')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.user).to.exist;
        expect(resultDoc.user).to.equal('authenticated');
        done();
      }
    );
  });

  it('should leverage JSONPath', function(done) {
    api
    .newRequest()
    .follow('$.jsonpath.nested.key')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.third).to.exist;
        expect(resultDoc.third).to.equal('document');
        done();
      }
    );
  });

  it('should leverage URI templates', function(done) {
    api
    .newRequest()
    .withTemplateParameters({param: 'foobar', id: 13})
    .follow('uri_template')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.some).to.equal('document');
        expect(resultDoc.param).to.equal('foobar');
        expect(resultDoc.id).to.equal('13');
        done();
      }
    );
  });

  it('should fail gracefully on 404 with get()', function(done) {
    api
    .newRequest()
    .follow('blind_alley', 'more', 'links')
    .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback.callCount).to.equal(1);
        var error = callback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('HTTPError');
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.');
        expect(error.uri).to.equal(rootUri + 'does/not/exist');
        expect(error.httpStatus).to.equal(404);

        var response = callback.firstCall.args[1];
        expect(response).to.exist;
        var body = response.body;
        expect(body).to.exist;
        var resultDoc = JSON.parse(body);
        expect(resultDoc.message).to.exist;
        expect(resultDoc.message).to.equal('resource not found');
        done();
      }
    );
  });

  it('should just deliver the last response of get(), even when it\'s 404',
      function(done) {
    api
    .newRequest()
    .follow('blind_alley')
    .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody(404);
        expect(resultDoc).to.exist;
        expect(resultDoc.message).to.exist;
        expect(resultDoc.message).to.equal('resource not found');
        done();
      }
    );
  });

  it('should fail gracefully on 404 with getResource()', function(done) {
    api
    .newRequest()
    .follow('blind_alley')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback.callCount).to.equal(1);
        var error = callback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('HTTPError');
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.');
        expect(error.uri).to.equal(rootUri + 'does/not/exist');
        expect(error.httpStatus).to.equal(404);

        var resultDoc = callback.firstCall.args[1];
        expect(resultDoc).to.exist;
        expect(resultDoc.message).to.exist;
        expect(resultDoc.message).to.equal('resource not found');
        done();
      }
    );
  });

  it('should fail gracefully on syntactically incorrect JSON',
      function(done) {
    traverson
    .from(rootUri)
    .json()
    .follow('garbage')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback.callCount).to.equal(1);
        var error = callback.firstCall.args[0];
        expect(error).to.exist;
        expect(error.name).to.equal('JSONError');
        expect(error.message).to.equal('The document at ' + rootUri + 'junk' +
          ' could not be parsed as JSON: { this will :: not parse');
        expect(error.uri).to.equal(rootUri + 'junk');
        expect(error.body).to.equal('{ this will :: not parse');

        var resultDoc = callback.firstCall.args[1];
        expect(resultDoc).to.not.exist;
        done();
      }
    );
  });

  it('should yield the last URI', function(done) {
    api
    .newRequest()
    .follow('second', 'doc')
    .getUri(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback.callCount).to.equal(1);
        var result = callback.firstCall.args[1];
        expect(result).to.exist;
        expect(result).to.equal(rootUri + 'second/document');
        done();
      }
    );
  });

  it('should post', function(done) {
    var payload = {'new': 'document'};
    api
    .newRequest()
    .follow('post_link')
    .post(payload, callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        console.log(resultDoc);
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('created');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should put', function(done) {
    var payload = {'updated': 'document'};
    api
    .newRequest()
    .follow('put_link')
    .put(payload, callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('overwritten');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should patch', function(done) {
    // This test will not work via mocha-phantomjs since PhantomJS currently
    // sends an empty body with a PATCH request, see
    // https://github.com/ariya/phantomjs/issues/11384
    // Skip this test if we are running in mocha-phantomjs
    // Also, currently it's not possible to skip a test from inside the test,
    // see
    // https://github.com/visionmedia/mocha/issues/332 and
    // https://github.com/visionmedia/mocha/pull/946
    // so we just mark the test as passed. Sigh.
    if (isPhantomJs()) {
      console.log('skipping test localhost.js#"should patch" in PhantomJS');
      return done();
    }

    var payload = {'patched': 'document'};
    api
    .newRequest()
    .follow('patch_link')
    .patch(payload, callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.document).to.exist;
        expect(resultDoc.document).to.equal('patched');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it('should delete', function(done) {
    api
    .newRequest()
    .follow('delete_link')
    .del(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var response = checkResponse(204);
        done();
      }
    );
  });

  it('should use provided request options', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      }
    })
    .follow('echo-headers')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        var testResponseHeader =
            resultDoc['X-Traverson-Test-Header'] ||
            resultDoc['x-traverson-test-header'];
        expect(testResponseHeader).to.exist;
        expect(testResponseHeader).to.equal('Traverson rocks!');
        done();
      }
    );
  });

  it('should use provided query string options', function(done) {
    api
    .newRequest()
    .withRequestOptions({
      qs: {
        'token': 'foobar'
      }
    })
    .follow('echo-query')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.token).to.exist;
        expect(resultDoc.token).to.equal('foobar');
        done();
      }
    );
  });

  it('should add request options on top of each other', function(done) {
    api
    .newRequest()
    .addRequestOptions({
      headers: { 'Accept': 'application/json', }
    })
    .addRequestOptions({
      headers: { 'X-Traverson-Test-Header': 'Traverson rocks!' }
    })
    .addRequestOptions({
      qs: { 'token': 'foobar' }
    })
    .follow('echo-all')
    .getResource(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseTestHeader =
            resultDoc.headers['X-Traverson-Test-Header'] ||
            resultDoc.headers['x-traverson-test-header'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseTestHeader).to.exist;
        expect(responseTestHeader).to.equal('Traverson rocks!');
        expect(resultDoc.query.token).to.equal('foobar');
        done();
      }
    );
  });

  it('should use provided request options with post', function(done) {
    var payload = { what: 'ever' };
    api
    .newRequest()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      },
      qs: { 'token': 'foobar' }
    })
    .follow('echo-all')
    .post(payload, callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        var responseTestHeader =
            resultDoc.headers['X-Traverson-Test-Header'] ||
            resultDoc.headers['x-traverson-test-header'];
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/json');
        expect(responseTestHeader).to.exist;
        expect(responseTestHeader).to.equal('Traverson rocks!');
        expect(resultDoc.query.token).to.equal('foobar');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });

  it.only('should use provided Content-Type with post', function(done) {
    var payload = { what: 'ever' };
    traverson
    .from(rootUri)
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    })
    .follow('echo-all')
    .post(payload, callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody(201);
        var responseAcceptHeader =
            resultDoc.headers.Accept ||
            resultDoc.headers.accept;
        expect(responseAcceptHeader).to.exist;
        expect(responseAcceptHeader).to.equal('application/x-www-form-urlencoded');
        expect(resultDoc.received).to.exist;
        expect(resultDoc.received).to.deep.equal(payload);
        done();
      }
    );
  });


  function checkResponseWithBody(httpStatus) {
    var response = checkResponse(httpStatus);
    var body = response.body;
    expect(body).to.exist;
    var resultDoc = JSON.parse(body);
    return resultDoc;
  }

  function checkResponse(httpStatus) {
    httpStatus = httpStatus || 200;
    expect(callback.callCount).to.equal(1);
    var error = callback.firstCall.args[0];
    expect(error).to.not.exist;
    var response = callback.firstCall.args[1];
    expect(response).to.exist;
    expect(response.statusCode).to.exist;
    expect(response.statusCode).to.equal(httpStatus);
    return response;
  }

  function checkResultDoc() {
    expect(callback.callCount).to.equal(1);
    var error = callback.firstCall.args[0];
    expect(error).to.not.exist;
    var resultDoc = callback.firstCall.args[1];
    expect(resultDoc).to.exist;
    return resultDoc;
  }
});
