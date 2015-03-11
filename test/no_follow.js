'use strict';

var traverson = require('../traverson')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

describe('getResource without preceding follow()', function() {

  var get;
  var callback;
  var rootUri = 'http://api.io';
  var api = traverson.from(rootUri).json();
  var result = mockResponse({ foo: 'bar' });

  beforeEach(function() {
    get = sinon.stub();
    api.actions.walker.request = { get: get };
    callback = sinon.spy();
  });

  describe('with its basic features', function() {

    it('should not require an empty follow() call to access the root URI',
        function() {
      api.getResource(callback);
      expect(get).to.have.been.calledWith(rootUri, {}, sinon.match.func);
    });
  });
});


