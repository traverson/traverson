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

describe('Traverson in the maze', function() {

  var api;
  var testServer;
  var callback;
  var rootUrl = 'http://127.0.0.1:2808/maze/1/1';

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
    .from(rootUrl)
    .json()
    .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    callback = sinon.spy();
  });

  /*
   * This test is rather pointless, it just checks that the maze is solvable and
   * all maze responses from the test server are correct. The real meat is in
   * the other test in this suite.
   */
  it('should find the way when pre-programmed', function(done) {
    api
    .newRequest()
    .follow([
      'north',
      'north',
      'east',
      'south',
      'south',
      'east',
      'north',
      'north',
      'north',
      'south',
      'south',
      'east',
      'east',
      'south',
      'east',
      'north',
      'north',
      'west',
      'west',
      'north',
      'north',
      'west',
      'west',
      'south',
      'west',
      'north',
      'leave',
    ])
    .getResource(callback); waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResultDoc();
        expect(resultDoc.status).to.exist;
        expect(resultDoc.status).to.equal('finished');
        done();
      }
    );
  });

  /*
   * These test solves the maze by using a path finding algorithm. The point is
   * not to test the algorithm (in fact, the algorithm is part of the test) but
   * to prove that Traverson can be used in situations where the next step from
   * a resource can not be known in advance but has to be figured out
   * dynamically from examining the resource/response.
   */

  it('should find the way by using a maze-solving algorithm with getResource',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .getResource(solveMaze(done, 'getResource', false, null,
        function(err, resource) {
      expect(err).to.not.exist;
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  it('should find the way by using a maze-solving algorithm with get',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .get(solveMaze(done, 'get', true, null, function(err, response) {
      expect(err).to.not.exist;
      var resource = JSON.parse(response.body);
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  it('should find the way by using a maze-solving algorithm with post',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .post({}, solveMaze(done, 'post', true, {}, function(err, response) {
      expect(err).to.not.exist;
      var resource = JSON.parse(response.body);
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  it('should find the way by using a maze-solving algorithm with put',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .put({}, solveMaze(done, 'put', true, {}, function(err, response) {
      expect(err).to.not.exist;
      var resource = JSON.parse(response.body);
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  it('should find the way by using a maze-solving algorithm with patch',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .patch({}, solveMaze(done, 'patch', true, {}, function(err, response) {
      expect(err).to.not.exist;
      var resource = JSON.parse(response.body);
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  it('should find the way by using a maze-solving algorithm with delete',
      function(done) {
    api
    .newRequest()
    .follow('north')
    .delete(solveMaze(done, 'delete', true, null, function(err, response) {
      expect(err).to.not.exist;
      var resource = JSON.parse(response.body);
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  // solves the maze by using the wall follower strategy/left-hand rule.
  function solveMaze(done, method, rawResponse, body, callback) {

    // directions clockwise
    var directions = ['north', 'east', 'south', 'west'];
    var directionIndex = 0;
    var direction = null;

    /* jshint maxcomplexity: 10 */
    var fn = function(err, result, traversal) {
      if (err) {
        return done(err);
      }

      // anwer contains either the parsed resource (when method === getResource)
      // or the raw HTTP response
      var resource = rawResponse ? JSON.parse(result.body) : result;
      var request;

      // are we at an exit already?
      if (resource.leave) {
        // found exit \o/
        // console.log(resource.leave);
        request = traversal
        .continue()
        .follow('leave');
        return body ? request[method](body, callback) :
          request[method](callback);
      }

      // check if there is a wall to the left
      var leftHandIndex = mod((directionIndex - 1), 4);
      var leftHandDirection = directions[leftHandIndex];

      if (resource[leftHandDirection]) {
        // no wall to the left, so turn left in accordance with the left hand
        // rule
        directionIndex = leftHandIndex;
        direction = directions[directionIndex];
        // console.log(resource[direction]);
        request = traversal
        .continue()
        .follow(direction);
        return body ? request[method](body, fn) : request[method](fn);
      } else {
        // left hand wall exists, try other directions, starting with straight
        // ahead
        for (var i = 0; i < 4; i++) {
          var di = mod(directionIndex + i, 4);
          direction = directions[di];
          if (resource[direction]) {
            directionIndex = di;
            // console.log(resource[direction]);
            request = traversal
            .continue()
            .follow(direction);
            return body ? request[method](body, fn) : request[method](fn);
          } // else: direction is blocked by a wall
        }
        return done(new Error('no way out :-('));
      }
    };
    return fn;
  }

  function mod(i, n) {
    return ((i % n) + n) % n;
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
