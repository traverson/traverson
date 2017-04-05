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

describe('Traverson using request options', function() {

  var get;
  var callback;

  var rootUri = 'http://api.example.org';
  var result = mockResponse({ the: 'result' });
  var response = mockResponse({
    link: rootUri + '/link',
  });

  var api = traverson.from(rootUri).json().disableAutoHeaders();

  beforeEach(function() {
    get = sinon.stub();
    api.requestModuleInstance = { get: get };
    callback = sinon.spy();
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

  it('should use request options from withRequestOptions and ' +
      'addRequestOptions', function(done) {
    runTest(
      function(requestBuilder) {
        return requestBuilder
        .withRequestOptions({ qs: { a: 'b' } })
        .addRequestOptions({ auth: { user: 'fred' } });
      },
      { qs: { a: 'b' }, auth: { user: 'fred' } },
      done
    );
  });

  it('should merge request options of type function',
      function(done) {
    get
    .withArgs(rootUri, sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, response);
    get
    .withArgs(rootUri + '/link', sinon.match.any, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    api
    .newRequest()
    .withRequestOptions(
      { jsonReplacer: function firstReplacer() {},
        anotherOption: function anotherFunction() {}
    })
    .addRequestOptions({ jsonReplacer: function secondReplacer() {} })
    .follow('link')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        expect(callback).to.have.been.calledWith(null, result.doc);
        assert.isFunction(get.firstCall.args[1].jsonReplacer);
        expect(get.firstCall.args[1].jsonReplacer.name)
          .to.equal('secondReplacer');
        assert.isFunction(get.firstCall.args[1].anotherOption);
        expect(get.firstCall.args[1].anotherOption.name)
          .to.equal('anotherFunction');
        done();
      }
    );
  });

  it('should use request options from two addRequestOptions', function(done) {
    runTest(
      function(requestBuilder) {
        return requestBuilder
        .addRequestOptions({ qs: { a: 'b' } })
        .addRequestOptions({ auth: { user: 'fred' } });
      },
      { qs: { a: 'b' }, auth: { user: 'fred' } },
      done
    );
  });

  it('should overwrite request options with second withRequestOptions call',
      function(done) {
    runTest(
      function(requestBuilder) {
        return requestBuilder
        .withRequestOptions({ qs: { a: 'b' } })
        .withRequestOptions({ auth: { user: 'fred' } });
      },
      { auth: { user: 'fred' } },
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

  it('should merge request options arrays from withRequestOptions and ' +
      'addRequestOptions', function(done) {
    runTest(
      // configure
      function(requestBuilder) {
        return requestBuilder.withRequestOptions([
          { qs: { a: 'b' } },
          { auth: { user: 'fred' } },
        ])
        .addRequestOptions([
          { qs: { c: 'd' }, foo: 'bar' },
          { auth: { password: 'flintstone' } },
        ]);
      },
      // expected: merge each array element individually
      [
        { qs: { a: 'b', c: 'd' }, foo: 'bar' },
        { auth: { user: 'fred', password: 'flintstone' } },
      ],
      done
    );
  });

  it('should merge withRequestOptions object with addRequestOptions array',
      function(done) {
    runTest(
      // configure
      function(requestBuilder) {
        return requestBuilder.withRequestOptions({
          qs: { a: 'b' }, auth: { user: 'fred' }
        })
        .addRequestOptions([
          { qs: { c: 'd' }, foo: 'bar' },
          { auth: { password: 'flintstone' } },
        ]);
      },
      // expected: merge each per-step add-array into the base object
      [
        { qs: { a: 'b', c: 'd' }, auth: { user: 'fred' }, foo: 'bar' },
        { qs: { a: 'b', }, auth: { user: 'fred', password: 'flintstone' } },
      ],
      done
    );
  });

  it('should merge withRequestOptions array with addRequestOptions object',
      function(done) {
    runTest(
      // configure
      function(requestBuilder) {
        return requestBuilder.withRequestOptions([
          { qs: { a: 'b' }, foo: 'bar' },
          { auth: { user: 'fred' } },
        ])
        .addRequestOptions({
          qs: { c: 'd' }, auth: { password: 'flintstone' }
        });
      },
      // expected: merge the add-array into each per-step array element
      [
        {
          qs: { a: 'b', c: 'd' },
          auth: { password: 'flintstone' }, foo: 'bar'
        },
        { qs: { c: 'd', }, auth: { user: 'fred', password: 'flintstone' } },
      ],
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
    .withArgs(rootUri, expected1, sinon.match.func)
    .callsArgWithAsync(2, null, response);
    get
    .withArgs(rootUri + '/link', expected2, sinon.match.func)
    .callsArgWithAsync(2, null, result);

    configure(api.newRequest())
    .follow('link')
    .getResource(callback);

    waitFor(
      function() { return callback.called; },
      function() {
        // get.withArgs.calls already check if options are used
        expect(callback).to.have.been.calledWith(null, result.doc);
        done();
      }
    );
  }
});
