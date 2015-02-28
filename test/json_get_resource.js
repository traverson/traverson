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

describe('getResource for JSON', function() {

  var get;
  var callback;
  var rootUri = 'http://api.example.org';
  var api = traverson.from(rootUri).json();

  var result = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    get = sinon.stub();
    api.walker.request = { get: get };
    callback = sinon.spy();
  });

  describe('with its basic features', function() {
    var rootStep = {
      uri: rootUri
    };
    var rootResponse = mockResponse({
      irrelevant: { stuff: 'to be ignored' },
      link: rootUri + '/link/to/thing',
      more: { stuff: { that: 'we do not care about' } }
    });

    it('should access the root URI', function() {
      api.newRequest().getResource(callback);
      expect(get).to.have.been.calledWith(rootUri, {}, sinon.match.func);
    });

    it('should call callback with the root doc', function(done) {
      get.callsArgWithAsync(2, null, rootResponse);
      api.newRequest().getResource(callback);
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
      api.newRequest().getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });

    it('should follow a single element path', function(done) {
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse);
      get.withArgs(rootUri + '/link/to/thing', {},
          sinon.match.func).callsArgWithAsync(2, null, result);
      api.newRequest().follow('link').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should follow a single element path as array', function(done) {
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse);
      get.withArgs(rootUri + '/link/to/thing', {},
          sinon.match.func).callsArgWithAsync(2, null, result);
      api.newRequest().follow(['link']).getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should call callback with err if link is not found', function(done) {
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse);
      api.newRequest().follow('non-existing-link').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          assert(callback.calledOnce);
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(callback.args[0][0].message).to.contain('Could not find ' +
              'property non-existing-link');
          done();
        }
      );
    });

    it('should call callback with err inside recursion', function(done) {
      var err = new Error('test error');
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, mockResponse({ firstLink: rootUri + '/first' }));
      get.withArgs(rootUri + '/first', {}, sinon.match.func).
          callsArgWithAsync(2, err);
      api.newRequest().follow('firstLink').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(err);
          done();
        }
      );
    });
  });

  describe('with JSONPath', function() {

    var uri = rootUri + '/path/to/resource';
    var rootResponse = mockResponse({
      deeply: { nested: { link: uri } }
    });

    var result = mockResponse({ the: 'result' });

    it('should follow to a link via JSONPath expression', function(done) {
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse);
      get.withArgs(uri, {}, sinon.match.func).callsArgWithAsync(2, null,
          result);
      api.newRequest().follow('$.deeply.nested.link').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should call callback with err if JSONPath has no match',
        function(done) {
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponse);
      api.newRequest().follow('$.deeply.nested.blink').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(callback.args[0][0].message).to.contain('JSONPath ' +
              'expression $.deeply.nested.blink returned no match');
          done();
        }
      );
    });

    it('should call callback with err if JSONPath has multiple matches',
        function(done) {
      var rootResponseMulti = mockResponse({
        arr: [ { foo: 'bar' }, { foo: 'baz' } ]
      });
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponseMulti);
      api.newRequest().follow('$.arr[*].foo').getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error));
          expect(callback.args[0][0].message).to.contain('JSONPath ' +
              'expression $.arr[*].foo returned more than one match');
          done();
        }
      );
    });
  });

  describe('with URI templating', function() {

    it('should evaluate URI templates', function(done) {
      var rootResponseUriTemplate = mockResponse({
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      });
      var next = mockResponse({
        secondTemplate: rootUri + '/another/{id}'
      });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootResponseUriTemplate);
      get.withArgs(rootUri + '/users/basti1302/things/4711', {},
          sinon.match.func).callsArgWithAsync(2, null, next);
      get.withArgs(rootUri + '/another/42', {},
          sinon.match.func).callsArgWithAsync(2, null, result);
      api
      .newRequest()
      .withTemplateParameters({user: 'basti1302', thing: 4711, id: 42})
      .follow('firstTemplate', 'secondTemplate')
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should evaluate URI templates for the start URI', function(done) {
      var rootUriTemplate = mockResponse(
        { we: 'can haz use uri templates for root doc, yo!' });
      var startUriTemplate = rootUri + '/{param}/whatever';
      var startUri = rootUri + '/substituted/whatever';
      var api = traverson.from(startUriTemplate).json();
      get = sinon.stub();
      api.walker.request = { get: get };
      get.withArgs(startUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootUriTemplate);

      api
      .newRequest()
      .withTemplateParameters({param: 'substituted'})
      .follow()
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, rootUriTemplate.doc);
          done();
        }
      );
    });

    it('should evaluate URI templates with array of template params',
        function(done) {
      var rootUriTemplate = mockResponse({
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      });
      var next = mockResponse({
        secondTemplate: rootUri + '/another_user/{user}'
      });
      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, rootUriTemplate);
      get.withArgs(rootUri + '/users/basti1302/things/4711', {},
          sinon.match.func).callsArgWithAsync(2, null, next);
      get.withArgs(rootUri + '/another_user/someone_else', {},
          sinon.match.func).callsArgWithAsync(2, null, result);
      api.follow('firstTemplate', 'secondTemplate')
        .withTemplateParameters([null,
                                {user: 'basti1302', thing: 4711},
                                {user: 'someone_else'}])
        .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should resolve optional URI templates also without template parameters',
        function(done) {
      var responseUriTemplate = mockResponse({
        template: rootUri + '/users{?page,size,sort}',
      });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, responseUriTemplate);
      get.withArgs(rootUri + '/users', {},
          sinon.match.func).callsArgWithAsync(2, null, result);
      api
      .newRequest()
      .follow('template')
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

  describe('with request options', function() {

    var response = mockResponse({
      link: rootUri + '/link',
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

  describe('with absolute and relative urls', function() {

    it('should follow links with absolute urls with protocol http',
        function(done) {
      var path1 = rootUri + '/path/1';
      var path2 = rootUri + '/path/2';

      var response1 = mockResponse({ link1: path1 });
      var response2 = mockResponse({ link2: path2 });

      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, response1);
      get
      .withArgs(path1, {}, sinon.match.func)
      .callsArgWithAsync(2, null, response2);
      get
      .withArgs(path2, {}, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .follow(['link1', 'link2'])
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should follow links with absolute urls with protocol https',
        function(done) {
      // also test case insensitive matching
      var httpsRootUri = 'HttPs://api.io';
      var path1 = httpsRootUri + '/path/1';
      var path2 = httpsRootUri + '/path/2';

      var response1 = mockResponse({ link1: path1 });
      var response2 = mockResponse({ link2: path2 });

      get.withArgs(httpsRootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, response1);
      get.withArgs(path1, {}, sinon.match.func).callsArgWithAsync(
          2, null, response2);
      get.withArgs(path2, {}, sinon.match.func).callsArgWithAsync(
          2, null, result);

      api
      .newRequest()
      .from(httpsRootUri)
      .follow(['link1', 'link2'])
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });


    it('should follow links with absolute urls without protocol',
      function(done) {
      var path1 = '/path/1';
      var path2 = '/path/2';

      var response1 = mockResponse({ link1: path1 });
      var response2 = mockResponse({ link2: path2 });

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, response1);
      get.withArgs(rootUri + path1, {}, sinon.match.func).callsArgWithAsync(
          2, null, response2);
      get.withArgs(rootUri + path2, {}, sinon.match.func).callsArgWithAsync(
          2, null, result);

      api
      .newRequest()
      .follow(['link1', 'link2'])
      .getResource(callback);
      waitFor(
        function() { return callback.called; },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc);
          done();
        }
      );
    });

    it('should follow links with relative urls', function(done) {
      var path1 = '/first';
      var path2 = '/second';

      var response1 = mockResponse({ link1: path1 });
      var response2 = mockResponse({ link2: path2 });

      get
      .withArgs(rootUri, {}, sinon.match.func)
      .callsArgWithAsync(2, null, response1);
      get
      .withArgs(rootUri + path1, {}, sinon.match.func)
      .callsArgWithAsync(2, null, response2);
      get
      .withArgs(rootUri + path1 + path2, {}, sinon.match.func)
      .callsArgWithAsync(2, null, result);

      api
      .newRequest()
      .resolveRelative()
      .follow(['link1', 'link2'])
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

  describe('in all its glory', function() {

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

      get.withArgs(rootUri, {}, sinon.match.func).callsArgWithAsync(
          2, null, root);
      get.withArgs(path1, {}, sinon.match.func).callsArgWithAsync(
          2, null, response2);
      get.withArgs(path2, {}, sinon.match.func).callsArgWithAsync(
          2, null, response3);
      get.withArgs(path3, {}, sinon.match.func).callsArgWithAsync(
          2, null, response4);
      get.withArgs(path4, {}, sinon.match.func).callsArgWithAsync(
          2, null, result);

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
