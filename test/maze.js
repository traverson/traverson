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
  var rootUri = 'http://127.0.0.1:2808';

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
    .from(rootUri + '/maze')
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
      'enter',
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
    .getResource(callback);
    waitFor(
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
   * This test solves the maze by using a path finding algorithm. The point is
   * not to test the algorithm (in fact, the algorithm is part of the test) but
   * to prove that Traverson can be used in situations where the next step from
   * a resource can not be known in advance but has to be figured out
   * dynamically from examining the resource.
   */
  it('should find the way by using a maze-solving algorithm', function(done) {
    api
    .newRequest()
    .follow('enter')
    .getResource(solveMaze(done, function(err, resource) {
      expect(err).to.not.exist;
      expect(resource.status).to.exist;
      expect(resource.status).to.equal('finished');
      done();
    }));
  });

  // solves the maze by using the wall follower strategy/left-hand rule.
  function solveMaze(done, callback) {

    // directions clockwise
    var directions = ['north', 'east', 'south', 'west'];
    var directionIndex = 0;
    var direction = null;
    var url = null;

    var fn = function(err, resource) {
      // console.log('=====================================');
      // console.log(JSON.stringify(resource, null, 2));
      if (err) {
        return done(err);
      }
      // try a 90° left turn first
      var leftHandIndex = mod((directionIndex - 1), 4);
      // console.log('old direction index: ' + directionIndex);
      // console.log('left hand dir index: ' + leftHandIndex);
      var leftHandDirection = directions[leftHandIndex];
      // console.log('left hand direction: ' + leftHandDirection);

      if (resource.leave) {
        // found exit \o/
        url = rootUri + resource.leave;
        // console.log('FOUND EXIT!!!!');
        // console.log('url: ' + url);
        return api
        .newRequest()
        .from(url)
        .getResource(callback);
      }
      if (resource[leftHandDirection]) {
        // no wall to the left, so turn left in accordance with the left hand
        // rule
        // console.log('no left hand wall, turn left');
        directionIndex = leftHandIndex;
        direction = directions[directionIndex];
        // console.log('direction: ' + direction);
        url = rootUri + resource[direction];
        // console.log('url: ' + url);
        return api
        .newRequest()
        .from(url)
        .getResource(fn);
      } else {
        // left hand wall exists, try other directions, starting with straight
        // ahead
        // console.log('left hand wall exists, try other directions');
        for (var i = 0; i < 4; i++) {
          // console.log('                   i: ' + i);
          var di = mod(directionIndex + i, 4);
          // console.log('loop direction index: ' + di);
          direction = directions[di];
          if (resource[direction]) {
            directionIndex = di;
            // console.log('direction: ' + direction);
            url = rootUri + resource[direction];
            // console.log(url);
            return api
            .newRequest()
            .from(url)
            .getResource(fn);
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
