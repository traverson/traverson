'use strict';

var traverson = require('../traverson')
  , mockResponse = require('traverson-mock-response')()
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , events = require('events')
  , EventEmitter = events.EventEmitter
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , testUtil = require('./util')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);


function RequestMock() {
  EventEmitter.call(this);
}
testUtil.inherits(RequestMock, EventEmitter);

RequestMock.prototype.abort = function() {
    this.emit('abort');
};

describe('Aborting requests', function() {

  var get;
  var callback;
  var rootUri = 'http://api.example.org';
  var api = traverson.from(rootUri).json();

  beforeEach(function() {
    get = sinon.stub();
    api.walker.request = {
      get: get,
    };
    callback = sinon.spy();
  });

  it('should follow a multi element path and abort midflight', function(done) {
    var path1 = rootUri + '/path/1';
    var path2 = rootUri + '/path/2';

    var root = mockResponse({ link1: path1 });
    var response2 = mockResponse({ link2: path2 });
    var result = mockResponse({ should: 'not reach this' });

    get.returns(new RequestMock());

    get
    .withArgs(rootUri, {}, sinon.match.func)
    .callsArgWithAsync(2, null, root);
    var secondGet = get
    .withArgs(path1, {}, sinon.match.func);
    secondGet
    .callsArgWithAsync(2, null, response2);

    var traversal = api
    .newRequest()
    .follow('link1', 'link2', 'link3')
    .getResource(callback);
    waitFor(
      function() {
        return secondGet.called;
      },
      function() {
        traversal.abort();
        waitFor(
          function() {
            return callback.called;
          },
          function() {
            assert(callback.calledOnce);
            expect(callback).to.have.been.calledWith(sinon.match.
                instanceOf(Error));
            var error = callback.args[0][0];
            expect(error.message)
              .to.equal('Link traversal process has been aborted.');
            done();
          }
        );
      }
    );
  });
});
