;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('../../test/json_get_resource')
require('../../test/json_hal')
require('../../test/json_requests')
require('../../test/localhost')

},{"../../test/json_get_resource":62,"../../test/json_hal":63,"../../test/json_requests":64,"../../test/localhost":65}],2:[function(require,module,exports){
module.exports = require('./lib/chai');

},{"./lib/chai":3}],3:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

var used = []
  , exports = module.exports = {};

/*!
 * Chai version
 */

exports.version = '1.7.2';

/*!
 * Assertion Error
 */

exports.AssertionError = require('assertion-error');

/*!
 * Utils for plugins (not exported)
 */

var util = require('./chai/utils');

/**
 * # .use(function)
 *
 * Provides a way to extend the internals of Chai
 *
 * @param {Function}
 * @returns {this} for chaining
 * @api public
 */

exports.use = function (fn) {
  if (!~used.indexOf(fn)) {
    fn(this, util);
    used.push(fn);
  }

  return this;
};

/*!
 * Primary `Assertion` prototype
 */

var assertion = require('./chai/assertion');
exports.use(assertion);

/*!
 * Core Assertions
 */

var core = require('./chai/core/assertions');
exports.use(core);

/*!
 * Expect interface
 */

var expect = require('./chai/interface/expect');
exports.use(expect);

/*!
 * Should interface
 */

var should = require('./chai/interface/should');
exports.use(should);

/*!
 * Assert interface
 */

var assert = require('./chai/interface/assert');
exports.use(assert);

},{"./chai/assertion":4,"./chai/core/assertions":5,"./chai/interface/assert":6,"./chai/interface/expect":7,"./chai/interface/should":8,"./chai/utils":20,"assertion-error":28}],4:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (_chai, util) {
  /*!
   * Module dependencies.
   */

  var AssertionError = _chai.AssertionError
    , flag = util.flag;

  /*!
   * Module export.
   */

  _chai.Assertion = Assertion;

  /*!
   * Assertion Constructor
   *
   * Creates object for chaining.
   *
   * @api private
   */

  function Assertion (obj, msg, stack) {
    flag(this, 'ssfi', stack || arguments.callee);
    flag(this, 'object', obj);
    flag(this, 'message', msg);
  }

  /*!
    * ### Assertion.includeStack
    *
    * User configurable property, influences whether stack trace
    * is included in Assertion error message. Default of false
    * suppresses stack trace in the error message
    *
    *     Assertion.includeStack = true;  // enable stack on error
    *
    * @api public
    */

  Assertion.includeStack = false;

  /*!
   * ### Assertion.showDiff
   *
   * User configurable property, influences whether or not
   * the `showDiff` flag should be included in the thrown
   * AssertionErrors. `false` will always be `false`; `true`
   * will be true when the assertion has requested a diff
   * be shown.
   *
   * @api public
   */

  Assertion.showDiff = true;

  Assertion.addProperty = function (name, fn) {
    util.addProperty(this.prototype, name, fn);
  };

  Assertion.addMethod = function (name, fn) {
    util.addMethod(this.prototype, name, fn);
  };

  Assertion.addChainableMethod = function (name, fn, chainingBehavior) {
    util.addChainableMethod(this.prototype, name, fn, chainingBehavior);
  };

  Assertion.overwriteProperty = function (name, fn) {
    util.overwriteProperty(this.prototype, name, fn);
  };

  Assertion.overwriteMethod = function (name, fn) {
    util.overwriteMethod(this.prototype, name, fn);
  };

  /*!
   * ### .assert(expression, message, negateMessage, expected, actual)
   *
   * Executes an expression and check expectations. Throws AssertionError for reporting if test doesn't pass.
   *
   * @name assert
   * @param {Philosophical} expression to be tested
   * @param {String} message to display if fails
   * @param {String} negatedMessage to display if negated expression fails
   * @param {Mixed} expected value (remember to check for negation)
   * @param {Mixed} actual (optional) will default to `this.obj`
   * @api private
   */

  Assertion.prototype.assert = function (expr, msg, negateMsg, expected, _actual, showDiff) {
    var ok = util.test(this, arguments);
    if (true !== showDiff) showDiff = false;
    if (true !== Assertion.showDiff) showDiff = false;

    if (!ok) {
      var msg = util.getMessage(this, arguments)
        , actual = util.getActual(this, arguments);
      throw new AssertionError(msg, {
          actual: actual
        , expected: expected
        , showDiff: showDiff
      }, (Assertion.includeStack) ? this.assert : flag(this, 'ssfi'));
    }
  };

  /*!
   * ### ._obj
   *
   * Quick reference to stored `actual` value for plugin developers.
   *
   * @api private
   */

  Object.defineProperty(Assertion.prototype, '_obj',
    { get: function () {
        return flag(this, 'object');
      }
    , set: function (val) {
        flag(this, 'object', val);
      }
  });
};

},{}],5:[function(require,module,exports){
/*!
 * chai
 * http://chaijs.com
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, _) {
  var Assertion = chai.Assertion
    , toString = Object.prototype.toString
    , flag = _.flag;

  /**
   * ### Language Chains
   *
   * The following are provide as chainable getters to
   * improve the readability of your assertions. They
   * do not provide an testing capability unless they
   * have been overwritten by a plugin.
   *
   * **Chains**
   *
   * - to
   * - be
   * - been
   * - is
   * - that
   * - and
   * - have
   * - with
   * - at
   * - of
   * - same
   *
   * @name language chains
   * @api public
   */

  [ 'to', 'be', 'been'
  , 'is', 'and', 'have'
  , 'with', 'that', 'at'
  , 'of', 'same' ].forEach(function (chain) {
    Assertion.addProperty(chain, function () {
      return this;
    });
  });

  /**
   * ### .not
   *
   * Negates any of assertions following in the chain.
   *
   *     expect(foo).to.not.equal('bar');
   *     expect(goodFn).to.not.throw(Error);
   *     expect({ foo: 'baz' }).to.have.property('foo')
   *       .and.not.equal('bar');
   *
   * @name not
   * @api public
   */

  Assertion.addProperty('not', function () {
    flag(this, 'negate', true);
  });

  /**
   * ### .deep
   *
   * Sets the `deep` flag, later used by the `equal` and
   * `property` assertions.
   *
   *     expect(foo).to.deep.equal({ bar: 'baz' });
   *     expect({ foo: { bar: { baz: 'quux' } } })
   *       .to.have.deep.property('foo.bar.baz', 'quux');
   *
   * @name deep
   * @api public
   */

  Assertion.addProperty('deep', function () {
    flag(this, 'deep', true);
  });

  /**
   * ### .a(type)
   *
   * The `a` and `an` assertions are aliases that can be
   * used either as language chains or to assert a value's
   * type.
   *
   *     // typeof
   *     expect('test').to.be.a('string');
   *     expect({ foo: 'bar' }).to.be.an('object');
   *     expect(null).to.be.a('null');
   *     expect(undefined).to.be.an('undefined');
   *
   *     // language chain
   *     expect(foo).to.be.an.instanceof(Foo);
   *
   * @name a
   * @alias an
   * @param {String} type
   * @param {String} message _optional_
   * @api public
   */

  function an (type, msg) {
    if (msg) flag(this, 'message', msg);
    type = type.toLowerCase();
    var obj = flag(this, 'object')
      , article = ~[ 'a', 'e', 'i', 'o', 'u' ].indexOf(type.charAt(0)) ? 'an ' : 'a ';

    this.assert(
        type === _.type(obj)
      , 'expected #{this} to be ' + article + type
      , 'expected #{this} not to be ' + article + type
    );
  }

  Assertion.addChainableMethod('an', an);
  Assertion.addChainableMethod('a', an);

  /**
   * ### .include(value)
   *
   * The `include` and `contain` assertions can be used as either property
   * based language chains or as methods to assert the inclusion of an object
   * in an array or a substring in a string. When used as language chains,
   * they toggle the `contain` flag for the `keys` assertion.
   *
   *     expect([1,2,3]).to.include(2);
   *     expect('foobar').to.contain('foo');
   *     expect({ foo: 'bar', hello: 'universe' }).to.include.keys('foo');
   *
   * @name include
   * @alias contain
   * @param {Object|String|Number} obj
   * @param {String} message _optional_
   * @api public
   */

  function includeChainingBehavior () {
    flag(this, 'contains', true);
  }

  function include (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
    this.assert(
        ~obj.indexOf(val)
      , 'expected #{this} to include ' + _.inspect(val)
      , 'expected #{this} to not include ' + _.inspect(val));
  }

  Assertion.addChainableMethod('include', include, includeChainingBehavior);
  Assertion.addChainableMethod('contain', include, includeChainingBehavior);

  /**
   * ### .ok
   *
   * Asserts that the target is truthy.
   *
   *     expect('everthing').to.be.ok;
   *     expect(1).to.be.ok;
   *     expect(false).to.not.be.ok;
   *     expect(undefined).to.not.be.ok;
   *     expect(null).to.not.be.ok;
   *
   * @name ok
   * @api public
   */

  Assertion.addProperty('ok', function () {
    this.assert(
        flag(this, 'object')
      , 'expected #{this} to be truthy'
      , 'expected #{this} to be falsy');
  });

  /**
   * ### .true
   *
   * Asserts that the target is `true`.
   *
   *     expect(true).to.be.true;
   *     expect(1).to.not.be.true;
   *
   * @name true
   * @api public
   */

  Assertion.addProperty('true', function () {
    this.assert(
        true === flag(this, 'object')
      , 'expected #{this} to be true'
      , 'expected #{this} to be false'
      , this.negate ? false : true
    );
  });

  /**
   * ### .false
   *
   * Asserts that the target is `false`.
   *
   *     expect(false).to.be.false;
   *     expect(0).to.not.be.false;
   *
   * @name false
   * @api public
   */

  Assertion.addProperty('false', function () {
    this.assert(
        false === flag(this, 'object')
      , 'expected #{this} to be false'
      , 'expected #{this} to be true'
      , this.negate ? true : false
    );
  });

  /**
   * ### .null
   *
   * Asserts that the target is `null`.
   *
   *     expect(null).to.be.null;
   *     expect(undefined).not.to.be.null;
   *
   * @name null
   * @api public
   */

  Assertion.addProperty('null', function () {
    this.assert(
        null === flag(this, 'object')
      , 'expected #{this} to be null'
      , 'expected #{this} not to be null'
    );
  });

  /**
   * ### .undefined
   *
   * Asserts that the target is `undefined`.
   *
   *      expect(undefined).to.be.undefined;
   *      expect(null).to.not.be.undefined;
   *
   * @name undefined
   * @api public
   */

  Assertion.addProperty('undefined', function () {
    this.assert(
        undefined === flag(this, 'object')
      , 'expected #{this} to be undefined'
      , 'expected #{this} not to be undefined'
    );
  });

  /**
   * ### .exist
   *
   * Asserts that the target is neither `null` nor `undefined`.
   *
   *     var foo = 'hi'
   *       , bar = null
   *       , baz;
   *
   *     expect(foo).to.exist;
   *     expect(bar).to.not.exist;
   *     expect(baz).to.not.exist;
   *
   * @name exist
   * @api public
   */

  Assertion.addProperty('exist', function () {
    this.assert(
        null != flag(this, 'object')
      , 'expected #{this} to exist'
      , 'expected #{this} to not exist'
    );
  });


  /**
   * ### .empty
   *
   * Asserts that the target's length is `0`. For arrays, it checks
   * the `length` property. For objects, it gets the count of
   * enumerable keys.
   *
   *     expect([]).to.be.empty;
   *     expect('').to.be.empty;
   *     expect({}).to.be.empty;
   *
   * @name empty
   * @api public
   */

  Assertion.addProperty('empty', function () {
    var obj = flag(this, 'object')
      , expected = obj;

    if (Array.isArray(obj) || 'string' === typeof object) {
      expected = obj.length;
    } else if (typeof obj === 'object') {
      expected = Object.keys(obj).length;
    }

    this.assert(
        !expected
      , 'expected #{this} to be empty'
      , 'expected #{this} not to be empty'
    );
  });

  /**
   * ### .arguments
   *
   * Asserts that the target is an arguments object.
   *
   *     function test () {
   *       expect(arguments).to.be.arguments;
   *     }
   *
   * @name arguments
   * @alias Arguments
   * @api public
   */

  function checkArguments () {
    var obj = flag(this, 'object')
      , type = Object.prototype.toString.call(obj);
    this.assert(
        '[object Arguments]' === type
      , 'expected #{this} to be arguments but got ' + type
      , 'expected #{this} to not be arguments'
    );
  }

  Assertion.addProperty('arguments', checkArguments);
  Assertion.addProperty('Arguments', checkArguments);

  /**
   * ### .equal(value)
   *
   * Asserts that the target is strictly equal (`===`) to `value`.
   * Alternately, if the `deep` flag is set, asserts that
   * the target is deeply equal to `value`.
   *
   *     expect('hello').to.equal('hello');
   *     expect(42).to.equal(42);
   *     expect(1).to.not.equal(true);
   *     expect({ foo: 'bar' }).to.not.equal({ foo: 'bar' });
   *     expect({ foo: 'bar' }).to.deep.equal({ foo: 'bar' });
   *
   * @name equal
   * @alias equals
   * @alias eq
   * @alias deep.equal
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEqual (val, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'deep')) {
      return this.eql(val);
    } else {
      this.assert(
          val === obj
        , 'expected #{this} to equal #{exp}'
        , 'expected #{this} to not equal #{exp}'
        , val
        , this._obj
        , true
      );
    }
  }

  Assertion.addMethod('equal', assertEqual);
  Assertion.addMethod('equals', assertEqual);
  Assertion.addMethod('eq', assertEqual);

  /**
   * ### .eql(value)
   *
   * Asserts that the target is deeply equal to `value`.
   *
   *     expect({ foo: 'bar' }).to.eql({ foo: 'bar' });
   *     expect([ 1, 2, 3 ]).to.eql([ 1, 2, 3 ]);
   *
   * @name eql
   * @alias eqls
   * @param {Mixed} value
   * @param {String} message _optional_
   * @api public
   */

  function assertEql(obj, msg) {
    if (msg) flag(this, 'message', msg);
    this.assert(
        _.eql(obj, flag(this, 'object'))
      , 'expected #{this} to deeply equal #{exp}'
      , 'expected #{this} to not deeply equal #{exp}'
      , obj
      , this._obj
      , true
    );
  }

  Assertion.addMethod('eql', assertEql);
  Assertion.addMethod('eqls', assertEql);

  /**
   * ### .above(value)
   *
   * Asserts that the target is greater than `value`.
   *
   *     expect(10).to.be.above(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *
   * @name above
   * @alias gt
   * @alias greaterThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertAbove (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len > n
        , 'expected #{this} to have a length above #{exp} but got #{act}'
        , 'expected #{this} to not have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj > n
        , 'expected #{this} to be above ' + n
        , 'expected #{this} to be at most ' + n
      );
    }
  }

  Assertion.addMethod('above', assertAbove);
  Assertion.addMethod('gt', assertAbove);
  Assertion.addMethod('greaterThan', assertAbove);

  /**
   * ### .least(value)
   *
   * Asserts that the target is greater than or equal to `value`.
   *
   *     expect(10).to.be.at.least(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a minimum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.least(2);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.least(3);
   *
   * @name least
   * @alias gte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertLeast (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= n
        , 'expected #{this} to have a length at least #{exp} but got #{act}'
        , 'expected #{this} to have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj >= n
        , 'expected #{this} to be at least ' + n
        , 'expected #{this} to be below ' + n
      );
    }
  }

  Assertion.addMethod('least', assertLeast);
  Assertion.addMethod('gte', assertLeast);

  /**
   * ### .below(value)
   *
   * Asserts that the target is less than `value`.
   *
   *     expect(5).to.be.below(10);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *
   * @name below
   * @alias lt
   * @alias lessThan
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertBelow (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len < n
        , 'expected #{this} to have a length below #{exp} but got #{act}'
        , 'expected #{this} to not have a length below #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj < n
        , 'expected #{this} to be below ' + n
        , 'expected #{this} to be at least ' + n
      );
    }
  }

  Assertion.addMethod('below', assertBelow);
  Assertion.addMethod('lt', assertBelow);
  Assertion.addMethod('lessThan', assertBelow);

  /**
   * ### .most(value)
   *
   * Asserts that the target is less than or equal to `value`.
   *
   *     expect(5).to.be.at.most(5);
   *
   * Can also be used in conjunction with `length` to
   * assert a maximum length. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.of.at.most(4);
   *     expect([ 1, 2, 3 ]).to.have.length.of.at.most(3);
   *
   * @name most
   * @alias lte
   * @param {Number} value
   * @param {String} message _optional_
   * @api public
   */

  function assertMost (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len <= n
        , 'expected #{this} to have a length at most #{exp} but got #{act}'
        , 'expected #{this} to have a length above #{exp}'
        , n
        , len
      );
    } else {
      this.assert(
          obj <= n
        , 'expected #{this} to be at most ' + n
        , 'expected #{this} to be above ' + n
      );
    }
  }

  Assertion.addMethod('most', assertMost);
  Assertion.addMethod('lte', assertMost);

  /**
   * ### .within(start, finish)
   *
   * Asserts that the target is within a range.
   *
   *     expect(7).to.be.within(5,10);
   *
   * Can also be used in conjunction with `length` to
   * assert a length range. The benefit being a
   * more informative error message than if the length
   * was supplied directly.
   *
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name within
   * @param {Number} start lowerbound inclusive
   * @param {Number} finish upperbound inclusive
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('within', function (start, finish, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , range = start + '..' + finish;
    if (flag(this, 'doLength')) {
      new Assertion(obj, msg).to.have.property('length');
      var len = obj.length;
      this.assert(
          len >= start && len <= finish
        , 'expected #{this} to have a length within ' + range
        , 'expected #{this} to not have a length within ' + range
      );
    } else {
      this.assert(
          obj >= start && obj <= finish
        , 'expected #{this} to be within ' + range
        , 'expected #{this} to not be within ' + range
      );
    }
  });

  /**
   * ### .instanceof(constructor)
   *
   * Asserts that the target is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , Chai = new Tea('chai');
   *
   *     expect(Chai).to.be.an.instanceof(Tea);
   *     expect([ 1, 2, 3 ]).to.be.instanceof(Array);
   *
   * @name instanceof
   * @param {Constructor} constructor
   * @param {String} message _optional_
   * @alias instanceOf
   * @api public
   */

  function assertInstanceOf (constructor, msg) {
    if (msg) flag(this, 'message', msg);
    var name = _.getName(constructor);
    this.assert(
        flag(this, 'object') instanceof constructor
      , 'expected #{this} to be an instance of ' + name
      , 'expected #{this} to not be an instance of ' + name
    );
  };

  Assertion.addMethod('instanceof', assertInstanceOf);
  Assertion.addMethod('instanceOf', assertInstanceOf);

  /**
   * ### .property(name, [value])
   *
   * Asserts that the target has a property `name`, optionally asserting that
   * the value of that property is strictly equal to  `value`.
   * If the `deep` flag is set, you can use dot- and bracket-notation for deep
   * references into objects and arrays.
   *
   *     // simple referencing
   *     var obj = { foo: 'bar' };
   *     expect(obj).to.have.property('foo');
   *     expect(obj).to.have.property('foo', 'bar');
   *
   *     // deep referencing
   *     var deepObj = {
   *         green: { tea: 'matcha' }
   *       , teas: [ 'chai', 'matcha', { tea: 'konacha' } ]
   *     };

   *     expect(deepObj).to.have.deep.property('green.tea', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[1]', 'matcha');
   *     expect(deepObj).to.have.deep.property('teas[2].tea', 'konacha');
   *
   * You can also use an array as the starting point of a `deep.property`
   * assertion, or traverse nested arrays.
   *
   *     var arr = [
   *         [ 'chai', 'matcha', 'konacha' ]
   *       , [ { tea: 'chai' }
   *         , { tea: 'matcha' }
   *         , { tea: 'konacha' } ]
   *     ];
   *
   *     expect(arr).to.have.deep.property('[0][1]', 'matcha');
   *     expect(arr).to.have.deep.property('[1][2].tea', 'konacha');
   *
   * Furthermore, `property` changes the subject of the assertion
   * to be the value of that property from the original object. This
   * permits for further chainable assertions on that property.
   *
   *     expect(obj).to.have.property('foo')
   *       .that.is.a('string');
   *     expect(deepObj).to.have.property('green')
   *       .that.is.an('object')
   *       .that.deep.equals({ tea: 'matcha' });
   *     expect(deepObj).to.have.property('teas')
   *       .that.is.an('array')
   *       .with.deep.property('[2]')
   *         .that.deep.equals({ tea: 'konacha' });
   *
   * @name property
   * @alias deep.property
   * @param {String} name
   * @param {Mixed} value (optional)
   * @param {String} message _optional_
   * @returns value of property for chaining
   * @api public
   */

  Assertion.addMethod('property', function (name, val, msg) {
    if (msg) flag(this, 'message', msg);

    var descriptor = flag(this, 'deep') ? 'deep property ' : 'property '
      , negate = flag(this, 'negate')
      , obj = flag(this, 'object')
      , value = flag(this, 'deep')
        ? _.getPathValue(name, obj)
        : obj[name];

    if (negate && undefined !== val) {
      if (undefined === value) {
        msg = (msg != null) ? msg + ': ' : '';
        throw new Error(msg + _.inspect(obj) + ' has no ' + descriptor + _.inspect(name));
      }
    } else {
      this.assert(
          undefined !== value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name)
        , 'expected #{this} to not have ' + descriptor + _.inspect(name));
    }

    if (undefined !== val) {
      this.assert(
          val === value
        , 'expected #{this} to have a ' + descriptor + _.inspect(name) + ' of #{exp}, but got #{act}'
        , 'expected #{this} to not have a ' + descriptor + _.inspect(name) + ' of #{act}'
        , val
        , value
      );
    }

    flag(this, 'object', value);
  });


  /**
   * ### .ownProperty(name)
   *
   * Asserts that the target has an own property `name`.
   *
   *     expect('test').to.have.ownProperty('length');
   *
   * @name ownProperty
   * @alias haveOwnProperty
   * @param {String} name
   * @param {String} message _optional_
   * @api public
   */

  function assertOwnProperty (name, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        obj.hasOwnProperty(name)
      , 'expected #{this} to have own property ' + _.inspect(name)
      , 'expected #{this} to not have own property ' + _.inspect(name)
    );
  }

  Assertion.addMethod('ownProperty', assertOwnProperty);
  Assertion.addMethod('haveOwnProperty', assertOwnProperty);

  /**
   * ### .length(value)
   *
   * Asserts that the target's `length` property has
   * the expected value.
   *
   *     expect([ 1, 2, 3]).to.have.length(3);
   *     expect('foobar').to.have.length(6);
   *
   * Can also be used as a chain precursor to a value
   * comparison for the length property.
   *
   *     expect('foo').to.have.length.above(2);
   *     expect([ 1, 2, 3 ]).to.have.length.above(2);
   *     expect('foo').to.have.length.below(4);
   *     expect([ 1, 2, 3 ]).to.have.length.below(4);
   *     expect('foo').to.have.length.within(2,4);
   *     expect([ 1, 2, 3 ]).to.have.length.within(2,4);
   *
   * @name length
   * @alias lengthOf
   * @param {Number} length
   * @param {String} message _optional_
   * @api public
   */

  function assertLengthChain () {
    flag(this, 'doLength', true);
  }

  function assertLength (n, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).to.have.property('length');
    var len = obj.length;

    this.assert(
        len == n
      , 'expected #{this} to have a length of #{exp} but got #{act}'
      , 'expected #{this} to not have a length of #{act}'
      , n
      , len
    );
  }

  Assertion.addChainableMethod('length', assertLength, assertLengthChain);
  Assertion.addMethod('lengthOf', assertLength, assertLengthChain);

  /**
   * ### .match(regexp)
   *
   * Asserts that the target matches a regular expression.
   *
   *     expect('foobar').to.match(/^foo/);
   *
   * @name match
   * @param {RegExp} RegularExpression
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('match', function (re, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        re.exec(obj)
      , 'expected #{this} to match ' + re
      , 'expected #{this} not to match ' + re
    );
  });

  /**
   * ### .string(string)
   *
   * Asserts that the string target contains another string.
   *
   *     expect('foobar').to.have.string('bar');
   *
   * @name string
   * @param {String} string
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('string', function (str, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('string');

    this.assert(
        ~obj.indexOf(str)
      , 'expected #{this} to contain ' + _.inspect(str)
      , 'expected #{this} to not contain ' + _.inspect(str)
    );
  });


  /**
   * ### .keys(key1, [key2], [...])
   *
   * Asserts that the target has exactly the given keys, or
   * asserts the inclusion of some keys when using the
   * `include` or `contain` modifiers.
   *
   *     expect({ foo: 1, bar: 2 }).to.have.keys(['foo', 'bar']);
   *     expect({ foo: 1, bar: 2, baz: 3 }).to.contain.keys('foo', 'bar');
   *
   * @name keys
   * @alias key
   * @param {String...|Array} keys
   * @api public
   */

  function assertKeys (keys) {
    var obj = flag(this, 'object')
      , str
      , ok = true;

    keys = keys instanceof Array
      ? keys
      : Array.prototype.slice.call(arguments);

    if (!keys.length) throw new Error('keys required');

    var actual = Object.keys(obj)
      , len = keys.length;

    // Inclusion
    ok = keys.every(function(key){
      return ~actual.indexOf(key);
    });

    // Strict
    if (!flag(this, 'negate') && !flag(this, 'contains')) {
      ok = ok && keys.length == actual.length;
    }

    // Key string
    if (len > 1) {
      keys = keys.map(function(key){
        return _.inspect(key);
      });
      var last = keys.pop();
      str = keys.join(', ') + ', and ' + last;
    } else {
      str = _.inspect(keys[0]);
    }

    // Form
    str = (len > 1 ? 'keys ' : 'key ') + str;

    // Have / include
    str = (flag(this, 'contains') ? 'contain ' : 'have ') + str;

    // Assertion
    this.assert(
        ok
      , 'expected #{this} to ' + str
      , 'expected #{this} to not ' + str
    );
  }

  Assertion.addMethod('keys', assertKeys);
  Assertion.addMethod('key', assertKeys);

  /**
   * ### .throw(constructor)
   *
   * Asserts that the function target will throw a specific error, or specific type of error
   * (as determined using `instanceof`), optionally with a RegExp or string inclusion test
   * for the error's message.
   *
   *     var err = new ReferenceError('This is a bad function.');
   *     var fn = function () { throw err; }
   *     expect(fn).to.throw(ReferenceError);
   *     expect(fn).to.throw(Error);
   *     expect(fn).to.throw(/bad function/);
   *     expect(fn).to.not.throw('good function');
   *     expect(fn).to.throw(ReferenceError, /bad function/);
   *     expect(fn).to.throw(err);
   *     expect(fn).to.not.throw(new RangeError('Out of range.'));
   *
   * Please note that when a throw expectation is negated, it will check each
   * parameter independently, starting with error constructor type. The appropriate way
   * to check for the existence of a type of error but for a message that does not match
   * is to use `and`.
   *
   *     expect(fn).to.throw(ReferenceError)
   *        .and.not.throw(/good function/);
   *
   * @name throw
   * @alias throws
   * @alias Throw
   * @param {ErrorConstructor} constructor
   * @param {String|RegExp} expected error message
   * @param {String} message _optional_
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  function assertThrows (constructor, errMsg, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    new Assertion(obj, msg).is.a('function');

    var thrown = false
      , desiredError = null
      , name = null
      , thrownError = null;

    if (arguments.length === 0) {
      errMsg = null;
      constructor = null;
    } else if (constructor && (constructor instanceof RegExp || 'string' === typeof constructor)) {
      errMsg = constructor;
      constructor = null;
    } else if (constructor && constructor instanceof Error) {
      desiredError = constructor;
      constructor = null;
      errMsg = null;
    } else if (typeof constructor === 'function') {
      name = (new constructor()).name;
    } else {
      constructor = null;
    }

    try {
      obj();
    } catch (err) {
      // first, check desired error
      if (desiredError) {
        this.assert(
            err === desiredError
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp}'
          , desiredError
          , err
        );

        return this;
      }
      // next, check constructor
      if (constructor) {
        this.assert(
            err instanceof constructor
          , 'expected #{this} to throw #{exp} but #{act} was thrown'
          , 'expected #{this} to not throw #{exp} but #{act} was thrown'
          , name
          , err
        );

        if (!errMsg) return this;
      }
      // next, check message
      var message = 'object' === _.type(err) && "message" in err
        ? err.message
        : '' + err;

      if ((message != null) && errMsg && errMsg instanceof RegExp) {
        this.assert(
            errMsg.exec(message)
          , 'expected #{this} to throw error matching #{exp} but got #{act}'
          , 'expected #{this} to throw error not matching #{exp}'
          , errMsg
          , message
        );

        return this;
      } else if ((message != null) && errMsg && 'string' === typeof errMsg) {
        this.assert(
            ~message.indexOf(errMsg)
          , 'expected #{this} to throw error including #{exp} but got #{act}'
          , 'expected #{this} to throw error not including #{act}'
          , errMsg
          , message
        );

        return this;
      } else {
        thrown = true;
        thrownError = err;
      }
    }

    var actuallyGot = ''
      , expectedThrown = name !== null
        ? name
        : desiredError
          ? '#{exp}' //_.inspect(desiredError)
          : 'an error';

    if (thrown) {
      actuallyGot = ' but #{act} was thrown'
    }

    this.assert(
        thrown === true
      , 'expected #{this} to throw ' + expectedThrown + actuallyGot
      , 'expected #{this} to not throw ' + expectedThrown + actuallyGot
      , desiredError
      , thrownError
    );
  };

  Assertion.addMethod('throw', assertThrows);
  Assertion.addMethod('throws', assertThrows);
  Assertion.addMethod('Throw', assertThrows);

  /**
   * ### .respondTo(method)
   *
   * Asserts that the object or class target will respond to a method.
   *
   *     Klass.prototype.bar = function(){};
   *     expect(Klass).to.respondTo('bar');
   *     expect(obj).to.respondTo('bar');
   *
   * To check if a constructor will respond to a static function,
   * set the `itself` flag.
   *
   *    Klass.baz = function(){};
   *    expect(Klass).itself.to.respondTo('baz');
   *
   * @name respondTo
   * @param {String} method
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('respondTo', function (method, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object')
      , itself = flag(this, 'itself')
      , context = ('function' === _.type(obj) && !itself)
        ? obj.prototype[method]
        : obj[method];

    this.assert(
        'function' === typeof context
      , 'expected #{this} to respond to ' + _.inspect(method)
      , 'expected #{this} to not respond to ' + _.inspect(method)
    );
  });

  /**
   * ### .itself
   *
   * Sets the `itself` flag, later used by the `respondTo` assertion.
   *
   *    function Foo() {}
   *    Foo.bar = function() {}
   *    Foo.prototype.baz = function() {}
   *
   *    expect(Foo).itself.to.respondTo('bar');
   *    expect(Foo).itself.not.to.respondTo('baz');
   *
   * @name itself
   * @api public
   */

  Assertion.addProperty('itself', function () {
    flag(this, 'itself', true);
  });

  /**
   * ### .satisfy(method)
   *
   * Asserts that the target passes a given truth test.
   *
   *     expect(1).to.satisfy(function(num) { return num > 0; });
   *
   * @name satisfy
   * @param {Function} matcher
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('satisfy', function (matcher, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        matcher(obj)
      , 'expected #{this} to satisfy ' + _.objDisplay(matcher)
      , 'expected #{this} to not satisfy' + _.objDisplay(matcher)
      , this.negate ? false : true
      , matcher(obj)
    );
  });

  /**
   * ### .closeTo(expected, delta)
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     expect(1.5).to.be.closeTo(1, 0.5);
   *
   * @name closeTo
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('closeTo', function (expected, delta, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');
    this.assert(
        Math.abs(obj - expected) <= delta
      , 'expected #{this} to be close to ' + expected + ' +/- ' + delta
      , 'expected #{this} not to be close to ' + expected + ' +/- ' + delta
    );
  });

  function isSubsetOf(subset, superset) {
    return subset.every(function(elem) {
      return superset.indexOf(elem) !== -1;
    })
  }

  /**
   * ### .members(set)
   *
   * Asserts that the target is a superset of `set`,
   * or that the target and `set` have the same members.
   *
   *     expect([1, 2, 3]).to.include.members([3, 2]);
   *     expect([1, 2, 3]).to.not.include.members([3, 2, 8]);
   *
   *     expect([4, 2]).to.have.members([2, 4]);
   *     expect([5, 2]).to.not.have.members([5, 2, 1]);
   *
   * @name members
   * @param {Array} set
   * @param {String} message _optional_
   * @api public
   */

  Assertion.addMethod('members', function (subset, msg) {
    if (msg) flag(this, 'message', msg);
    var obj = flag(this, 'object');

    new Assertion(obj).to.be.an('array');
    new Assertion(subset).to.be.an('array');

    if (flag(this, 'contains')) {
      return this.assert(
          isSubsetOf(subset, obj)
        , 'expected #{this} to be a superset of #{act}'
        , 'expected #{this} to not be a superset of #{act}'
        , obj
        , subset
      );
    }

    this.assert(
        isSubsetOf(obj, subset) && isSubsetOf(subset, obj)
        , 'expected #{this} to have the same members as #{act}'
        , 'expected #{this} to not have the same members as #{act}'
        , obj
        , subset
    );
  });
};

},{}],6:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */


module.exports = function (chai, util) {

  /*!
   * Chai dependencies.
   */

  var Assertion = chai.Assertion
    , flag = util.flag;

  /*!
   * Module export.
   */

  /**
   * ### assert(expression, message)
   *
   * Write your own test expressions.
   *
   *     assert('foo' !== 'bar', 'foo is not bar');
   *     assert(Array.isArray([]), 'empty arrays are arrays');
   *
   * @param {Mixed} expression to test for truthiness
   * @param {String} message to display on error
   * @name assert
   * @api public
   */

  var assert = chai.assert = function (express, errmsg) {
    var test = new Assertion(null);
    test.assert(
        express
      , errmsg
      , '[ negation message unavailable ]'
    );
  };

  /**
   * ### .fail(actual, expected, [message], [operator])
   *
   * Throw a failure. Node.js `assert` module-compatible.
   *
   * @name fail
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @param {String} operator
   * @api public
   */

  assert.fail = function (actual, expected, message, operator) {
    throw new chai.AssertionError({
        actual: actual
      , expected: expected
      , message: message
      , operator: operator
      , stackStartFunction: assert.fail
    });
  };

  /**
   * ### .ok(object, [message])
   *
   * Asserts that `object` is truthy.
   *
   *     assert.ok('everything', 'everything is ok');
   *     assert.ok(false, 'this will fail');
   *
   * @name ok
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.ok = function (val, msg) {
    new Assertion(val, msg).is.ok;
  };

  /**
   * ### .notOk(object, [message])
   *
   * Asserts that `object` is falsy.
   *
   *     assert.notOk('everything', 'this will fail');
   *     assert.notOk(false, 'this will pass');
   *
   * @name notOk
   * @param {Mixed} object to test
   * @param {String} message
   * @api public
   */

  assert.notOk = function (val, msg) {
    new Assertion(val, msg).is.not.ok;
  };

  /**
   * ### .equal(actual, expected, [message])
   *
   * Asserts non-strict equality (`==`) of `actual` and `expected`.
   *
   *     assert.equal(3, '3', '== coerces values to strings');
   *
   * @name equal
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.equal = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp == flag(test, 'object')
      , 'expected #{this} to equal #{exp}'
      , 'expected #{this} to not equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .notEqual(actual, expected, [message])
   *
   * Asserts non-strict inequality (`!=`) of `actual` and `expected`.
   *
   *     assert.notEqual(3, 4, 'these numbers are not equal');
   *
   * @name notEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notEqual = function (act, exp, msg) {
    var test = new Assertion(act, msg);

    test.assert(
        exp != flag(test, 'object')
      , 'expected #{this} to not equal #{exp}'
      , 'expected #{this} to equal #{act}'
      , exp
      , act
    );
  };

  /**
   * ### .strictEqual(actual, expected, [message])
   *
   * Asserts strict equality (`===`) of `actual` and `expected`.
   *
   *     assert.strictEqual(true, true, 'these booleans are strictly equal');
   *
   * @name strictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.strictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.equal(exp);
  };

  /**
   * ### .notStrictEqual(actual, expected, [message])
   *
   * Asserts strict inequality (`!==`) of `actual` and `expected`.
   *
   *     assert.notStrictEqual(3, '3', 'no coercion for strict equality');
   *
   * @name notStrictEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notStrictEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.equal(exp);
  };

  /**
   * ### .deepEqual(actual, expected, [message])
   *
   * Asserts that `actual` is deeply equal to `expected`.
   *
   *     assert.deepEqual({ tea: 'green' }, { tea: 'green' });
   *
   * @name deepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.deepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.eql(exp);
  };

  /**
   * ### .notDeepEqual(actual, expected, [message])
   *
   * Assert that `actual` is not deeply equal to `expected`.
   *
   *     assert.notDeepEqual({ tea: 'green' }, { tea: 'jasmine' });
   *
   * @name notDeepEqual
   * @param {Mixed} actual
   * @param {Mixed} expected
   * @param {String} message
   * @api public
   */

  assert.notDeepEqual = function (act, exp, msg) {
    new Assertion(act, msg).to.not.eql(exp);
  };

  /**
   * ### .isTrue(value, [message])
   *
   * Asserts that `value` is true.
   *
   *     var teaServed = true;
   *     assert.isTrue(teaServed, 'the tea has been served');
   *
   * @name isTrue
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isTrue = function (val, msg) {
    new Assertion(val, msg).is['true'];
  };

  /**
   * ### .isFalse(value, [message])
   *
   * Asserts that `value` is false.
   *
   *     var teaServed = false;
   *     assert.isFalse(teaServed, 'no tea yet? hmm...');
   *
   * @name isFalse
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFalse = function (val, msg) {
    new Assertion(val, msg).is['false'];
  };

  /**
   * ### .isNull(value, [message])
   *
   * Asserts that `value` is null.
   *
   *     assert.isNull(err, 'there was no error');
   *
   * @name isNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNull = function (val, msg) {
    new Assertion(val, msg).to.equal(null);
  };

  /**
   * ### .isNotNull(value, [message])
   *
   * Asserts that `value` is not null.
   *
   *     var tea = 'tasty chai';
   *     assert.isNotNull(tea, 'great, time for tea!');
   *
   * @name isNotNull
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNull = function (val, msg) {
    new Assertion(val, msg).to.not.equal(null);
  };

  /**
   * ### .isUndefined(value, [message])
   *
   * Asserts that `value` is `undefined`.
   *
   *     var tea;
   *     assert.isUndefined(tea, 'no tea defined');
   *
   * @name isUndefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isUndefined = function (val, msg) {
    new Assertion(val, msg).to.equal(undefined);
  };

  /**
   * ### .isDefined(value, [message])
   *
   * Asserts that `value` is not `undefined`.
   *
   *     var tea = 'cup of chai';
   *     assert.isDefined(tea, 'tea has been defined');
   *
   * @name isDefined
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isDefined = function (val, msg) {
    new Assertion(val, msg).to.not.equal(undefined);
  };

  /**
   * ### .isFunction(value, [message])
   *
   * Asserts that `value` is a function.
   *
   *     function serveTea() { return 'cup of tea'; };
   *     assert.isFunction(serveTea, 'great, we can have tea now');
   *
   * @name isFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isFunction = function (val, msg) {
    new Assertion(val, msg).to.be.a('function');
  };

  /**
   * ### .isNotFunction(value, [message])
   *
   * Asserts that `value` is _not_ a function.
   *
   *     var serveTea = [ 'heat', 'pour', 'sip' ];
   *     assert.isNotFunction(serveTea, 'great, we have listed the steps');
   *
   * @name isNotFunction
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotFunction = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('function');
  };

  /**
   * ### .isObject(value, [message])
   *
   * Asserts that `value` is an object (as revealed by
   * `Object.prototype.toString`).
   *
   *     var selection = { name: 'Chai', serve: 'with spices' };
   *     assert.isObject(selection, 'tea selection is an object');
   *
   * @name isObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isObject = function (val, msg) {
    new Assertion(val, msg).to.be.a('object');
  };

  /**
   * ### .isNotObject(value, [message])
   *
   * Asserts that `value` is _not_ an object.
   *
   *     var selection = 'chai'
   *     assert.isObject(selection, 'tea selection is not an object');
   *     assert.isObject(null, 'null is not an object');
   *
   * @name isNotObject
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotObject = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('object');
  };

  /**
   * ### .isArray(value, [message])
   *
   * Asserts that `value` is an array.
   *
   *     var menu = [ 'green', 'chai', 'oolong' ];
   *     assert.isArray(menu, 'what kind of tea do we want?');
   *
   * @name isArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isArray = function (val, msg) {
    new Assertion(val, msg).to.be.an('array');
  };

  /**
   * ### .isNotArray(value, [message])
   *
   * Asserts that `value` is _not_ an array.
   *
   *     var menu = 'green|chai|oolong';
   *     assert.isNotArray(menu, 'what kind of tea do we want?');
   *
   * @name isNotArray
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotArray = function (val, msg) {
    new Assertion(val, msg).to.not.be.an('array');
  };

  /**
   * ### .isString(value, [message])
   *
   * Asserts that `value` is a string.
   *
   *     var teaOrder = 'chai';
   *     assert.isString(teaOrder, 'order placed');
   *
   * @name isString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isString = function (val, msg) {
    new Assertion(val, msg).to.be.a('string');
  };

  /**
   * ### .isNotString(value, [message])
   *
   * Asserts that `value` is _not_ a string.
   *
   *     var teaOrder = 4;
   *     assert.isNotString(teaOrder, 'order placed');
   *
   * @name isNotString
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotString = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('string');
  };

  /**
   * ### .isNumber(value, [message])
   *
   * Asserts that `value` is a number.
   *
   *     var cups = 2;
   *     assert.isNumber(cups, 'how many cups');
   *
   * @name isNumber
   * @param {Number} value
   * @param {String} message
   * @api public
   */

  assert.isNumber = function (val, msg) {
    new Assertion(val, msg).to.be.a('number');
  };

  /**
   * ### .isNotNumber(value, [message])
   *
   * Asserts that `value` is _not_ a number.
   *
   *     var cups = '2 cups please';
   *     assert.isNotNumber(cups, 'how many cups');
   *
   * @name isNotNumber
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotNumber = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('number');
  };

  /**
   * ### .isBoolean(value, [message])
   *
   * Asserts that `value` is a boolean.
   *
   *     var teaReady = true
   *       , teaServed = false;
   *
   *     assert.isBoolean(teaReady, 'is the tea ready');
   *     assert.isBoolean(teaServed, 'has tea been served');
   *
   * @name isBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isBoolean = function (val, msg) {
    new Assertion(val, msg).to.be.a('boolean');
  };

  /**
   * ### .isNotBoolean(value, [message])
   *
   * Asserts that `value` is _not_ a boolean.
   *
   *     var teaReady = 'yep'
   *       , teaServed = 'nope';
   *
   *     assert.isNotBoolean(teaReady, 'is the tea ready');
   *     assert.isNotBoolean(teaServed, 'has tea been served');
   *
   * @name isNotBoolean
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.isNotBoolean = function (val, msg) {
    new Assertion(val, msg).to.not.be.a('boolean');
  };

  /**
   * ### .typeOf(value, name, [message])
   *
   * Asserts that `value`'s type is `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.typeOf({ tea: 'chai' }, 'object', 'we have an object');
   *     assert.typeOf(['chai', 'jasmine'], 'array', 'we have an array');
   *     assert.typeOf('tea', 'string', 'we have a string');
   *     assert.typeOf(/tea/, 'regexp', 'we have a regular expression');
   *     assert.typeOf(null, 'null', 'we have a null');
   *     assert.typeOf(undefined, 'undefined', 'we have an undefined');
   *
   * @name typeOf
   * @param {Mixed} value
   * @param {String} name
   * @param {String} message
   * @api public
   */

  assert.typeOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.a(type);
  };

  /**
   * ### .notTypeOf(value, name, [message])
   *
   * Asserts that `value`'s type is _not_ `name`, as determined by
   * `Object.prototype.toString`.
   *
   *     assert.notTypeOf('tea', 'number', 'strings are not numbers');
   *
   * @name notTypeOf
   * @param {Mixed} value
   * @param {String} typeof name
   * @param {String} message
   * @api public
   */

  assert.notTypeOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.a(type);
  };

  /**
   * ### .instanceOf(object, constructor, [message])
   *
   * Asserts that `value` is an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new Tea('chai');
   *
   *     assert.instanceOf(chai, Tea, 'chai is an instance of tea');
   *
   * @name instanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.instanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.be.instanceOf(type);
  };

  /**
   * ### .notInstanceOf(object, constructor, [message])
   *
   * Asserts `value` is not an instance of `constructor`.
   *
   *     var Tea = function (name) { this.name = name; }
   *       , chai = new String('chai');
   *
   *     assert.notInstanceOf(chai, Tea, 'chai is not an instance of tea');
   *
   * @name notInstanceOf
   * @param {Object} object
   * @param {Constructor} constructor
   * @param {String} message
   * @api public
   */

  assert.notInstanceOf = function (val, type, msg) {
    new Assertion(val, msg).to.not.be.instanceOf(type);
  };

  /**
   * ### .include(haystack, needle, [message])
   *
   * Asserts that `haystack` includes `needle`. Works
   * for strings and arrays.
   *
   *     assert.include('foobar', 'bar', 'foobar contains string "bar"');
   *     assert.include([ 1, 2, 3 ], 3, 'array contains value');
   *
   * @name include
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.include = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.contain.string(inc);
    } else {
      throw new chai.AssertionError(
          'expected an array or string'
        , null
        , assert.include
      );
    }
  };

  /**
   * ### .notInclude(haystack, needle, [message])
   *
   * Asserts that `haystack` does not include `needle`. Works
   * for strings and arrays.
   *i
   *     assert.notInclude('foobar', 'baz', 'string not include substring');
   *     assert.notInclude([ 1, 2, 3 ], 4, 'array not include contain value');
   *
   * @name notInclude
   * @param {Array|String} haystack
   * @param {Mixed} needle
   * @param {String} message
   * @api public
   */

  assert.notInclude = function (exp, inc, msg) {
    var obj = new Assertion(exp, msg);

    if (Array.isArray(exp)) {
      obj.to.not.include(inc);
    } else if ('string' === typeof exp) {
      obj.to.not.contain.string(inc);
    } else {
      throw new chai.AssertionError(
          'expected an array or string'
        , null
        , assert.notInclude
      );
    }
  };

  /**
   * ### .match(value, regexp, [message])
   *
   * Asserts that `value` matches the regular expression `regexp`.
   *
   *     assert.match('foobar', /^foo/, 'regexp matches');
   *
   * @name match
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.match = function (exp, re, msg) {
    new Assertion(exp, msg).to.match(re);
  };

  /**
   * ### .notMatch(value, regexp, [message])
   *
   * Asserts that `value` does not match the regular expression `regexp`.
   *
   *     assert.notMatch('foobar', /^foo/, 'regexp does not match');
   *
   * @name notMatch
   * @param {Mixed} value
   * @param {RegExp} regexp
   * @param {String} message
   * @api public
   */

  assert.notMatch = function (exp, re, msg) {
    new Assertion(exp, msg).to.not.match(re);
  };

  /**
   * ### .property(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`.
   *
   *     assert.property({ tea: { green: 'matcha' }}, 'tea');
   *
   * @name property
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.property = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.property(prop);
  };

  /**
   * ### .notProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`.
   *
   *     assert.notProperty({ tea: { green: 'matcha' }}, 'coffee');
   *
   * @name notProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.property(prop);
  };

  /**
   * ### .deepProperty(object, property, [message])
   *
   * Asserts that `object` has a property named by `property`, which can be a
   * string using dot- and bracket-notation for deep reference.
   *
   *     assert.deepProperty({ tea: { green: 'matcha' }}, 'tea.green');
   *
   * @name deepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.deepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop);
  };

  /**
   * ### .notDeepProperty(object, property, [message])
   *
   * Asserts that `object` does _not_ have a property named by `property`, which
   * can be a string using dot- and bracket-notation for deep reference.
   *
   *     assert.notDeepProperty({ tea: { green: 'matcha' }}, 'tea.oolong');
   *
   * @name notDeepProperty
   * @param {Object} object
   * @param {String} property
   * @param {String} message
   * @api public
   */

  assert.notDeepProperty = function (obj, prop, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop);
  };

  /**
   * ### .propertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`.
   *
   *     assert.propertyVal({ tea: 'is good' }, 'tea', 'is good');
   *
   * @name propertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.property(prop, val);
  };

  /**
   * ### .propertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`.
   *
   *     assert.propertyNotVal({ tea: 'is good' }, 'tea', 'is bad');
   *
   * @name propertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.propertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.property(prop, val);
  };

  /**
   * ### .deepPropertyVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property` with value given
   * by `value`. `property` can use dot- and bracket-notation for deep
   * reference.
   *
   *     assert.deepPropertyVal({ tea: { green: 'matcha' }}, 'tea.green', 'matcha');
   *
   * @name deepPropertyVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.have.deep.property(prop, val);
  };

  /**
   * ### .deepPropertyNotVal(object, property, value, [message])
   *
   * Asserts that `object` has a property named by `property`, but with a value
   * different from that given by `value`. `property` can use dot- and
   * bracket-notation for deep reference.
   *
   *     assert.deepPropertyNotVal({ tea: { green: 'matcha' }}, 'tea.green', 'konacha');
   *
   * @name deepPropertyNotVal
   * @param {Object} object
   * @param {String} property
   * @param {Mixed} value
   * @param {String} message
   * @api public
   */

  assert.deepPropertyNotVal = function (obj, prop, val, msg) {
    new Assertion(obj, msg).to.not.have.deep.property(prop, val);
  };

  /**
   * ### .lengthOf(object, length, [message])
   *
   * Asserts that `object` has a `length` property with the expected value.
   *
   *     assert.lengthOf([1,2,3], 3, 'array has length of 3');
   *     assert.lengthOf('foobar', 5, 'string has length of 6');
   *
   * @name lengthOf
   * @param {Mixed} object
   * @param {Number} length
   * @param {String} message
   * @api public
   */

  assert.lengthOf = function (exp, len, msg) {
    new Assertion(exp, msg).to.have.length(len);
  };

  /**
   * ### .throws(function, [constructor/string/regexp], [string/regexp], [message])
   *
   * Asserts that `function` will throw an error that is an instance of
   * `constructor`, or alternately that it will throw an error with message
   * matching `regexp`.
   *
   *     assert.throw(fn, 'function throws a reference error');
   *     assert.throw(fn, /function throws a reference error/);
   *     assert.throw(fn, ReferenceError);
   *     assert.throw(fn, ReferenceError, 'function throws a reference error');
   *     assert.throw(fn, ReferenceError, /function throws a reference error/);
   *
   * @name throws
   * @alias throw
   * @alias Throw
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.Throw = function (fn, errt, errs, msg) {
    if ('string' === typeof errt || errt instanceof RegExp) {
      errs = errt;
      errt = null;
    }

    new Assertion(fn, msg).to.Throw(errt, errs);
  };

  /**
   * ### .doesNotThrow(function, [constructor/regexp], [message])
   *
   * Asserts that `function` will _not_ throw an error that is an instance of
   * `constructor`, or alternately that it will not throw an error with message
   * matching `regexp`.
   *
   *     assert.doesNotThrow(fn, Error, 'function does not throw');
   *
   * @name doesNotThrow
   * @param {Function} function
   * @param {ErrorConstructor} constructor
   * @param {RegExp} regexp
   * @param {String} message
   * @see https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error#Error_types
   * @api public
   */

  assert.doesNotThrow = function (fn, type, msg) {
    if ('string' === typeof type) {
      msg = type;
      type = null;
    }

    new Assertion(fn, msg).to.not.Throw(type);
  };

  /**
   * ### .operator(val1, operator, val2, [message])
   *
   * Compares two values using `operator`.
   *
   *     assert.operator(1, '<', 2, 'everything is ok');
   *     assert.operator(1, '>', 2, 'this will fail');
   *
   * @name operator
   * @param {Mixed} val1
   * @param {String} operator
   * @param {Mixed} val2
   * @param {String} message
   * @api public
   */

  assert.operator = function (val, operator, val2, msg) {
    if (!~['==', '===', '>', '>=', '<', '<=', '!=', '!=='].indexOf(operator)) {
      throw new Error('Invalid operator "' + operator + '"');
    }
    var test = new Assertion(eval(val + operator + val2), msg);
    test.assert(
        true === flag(test, 'object')
      , 'expected ' + util.inspect(val) + ' to be ' + operator + ' ' + util.inspect(val2)
      , 'expected ' + util.inspect(val) + ' to not be ' + operator + ' ' + util.inspect(val2) );
  };

  /**
   * ### .closeTo(actual, expected, delta, [message])
   *
   * Asserts that the target is equal `expected`, to within a +/- `delta` range.
   *
   *     assert.closeTo(1.5, 1, 0.5, 'numbers are close');
   *
   * @name closeTo
   * @param {Number} actual
   * @param {Number} expected
   * @param {Number} delta
   * @param {String} message
   * @api public
   */

  assert.closeTo = function (act, exp, delta, msg) {
    new Assertion(act, msg).to.be.closeTo(exp, delta);
  };

  /**
   * ### .sameMembers(set1, set2, [message])
   *
   * Asserts that `set1` and `set2` have the same members.
   * Order is not taken into account.
   *
   *     assert.sameMembers([ 1, 2, 3 ], [ 2, 1, 3 ], 'same members');
   *
   * @name sameMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.sameMembers = function (set1, set2, msg) {
    new Assertion(set1, msg).to.have.same.members(set2);
  }

  /**
   * ### .includeMembers(superset, subset, [message])
   *
   * Asserts that `subset` is included in `superset`.
   * Order is not taken into account.
   *
   *     assert.includeMembers([ 1, 2, 3 ], [ 2, 1 ], 'include members');
   *
   * @name includeMembers
   * @param {Array} superset
   * @param {Array} subset
   * @param {String} message
   * @api public
   */

  assert.includeMembers = function (superset, subset, msg) {
    new Assertion(superset, msg).to.include.members(subset);
  }

  /*!
   * Undocumented / untested
   */

  assert.ifError = function (val, msg) {
    new Assertion(val, msg).to.not.be.ok;
  };

  /*!
   * Aliases.
   */

  (function alias(name, as){
    assert[as] = assert[name];
    return alias;
  })
  ('Throw', 'throw')
  ('Throw', 'throws');
};

},{}],7:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  chai.expect = function (val, message) {
    return new chai.Assertion(val, message);
  };
};


},{}],8:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

module.exports = function (chai, util) {
  var Assertion = chai.Assertion;

  function loadShould () {
    // modify Object.prototype to have `should`
    Object.defineProperty(Object.prototype, 'should',
      {
        set: function (value) {
          // See https://github.com/chaijs/chai/issues/86: this makes
          // `whatever.should = someValue` actually set `someValue`, which is
          // especially useful for `global.should = require('chai').should()`.
          //
          // Note that we have to use [[DefineProperty]] instead of [[Put]]
          // since otherwise we would trigger this very setter!
          Object.defineProperty(this, 'should', {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        }
      , get: function(){
          if (this instanceof String || this instanceof Number) {
            return new Assertion(this.constructor(this));
          } else if (this instanceof Boolean) {
            return new Assertion(this == true);
          }
          return new Assertion(this);
        }
      , configurable: true
    });

    var should = {};

    should.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.equal(val2);
    };

    should.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.Throw(errt, errs);
    };

    should.exist = function (val, msg) {
      new Assertion(val, msg).to.exist;
    }

    // negation
    should.not = {}

    should.not.equal = function (val1, val2, msg) {
      new Assertion(val1, msg).to.not.equal(val2);
    };

    should.not.Throw = function (fn, errt, errs, msg) {
      new Assertion(fn, msg).to.not.Throw(errt, errs);
    };

    should.not.exist = function (val, msg) {
      new Assertion(val, msg).to.not.exist;
    }

    should['throw'] = should['Throw'];
    should.not['throw'] = should.not['Throw'];

    return should;
  };

  chai.should = loadShould;
  chai.Should = loadShould;
};

},{}],9:[function(require,module,exports){
/*!
 * Chai - addChainingMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependencies
 */

var transferFlags = require('./transferFlags');

/*!
 * Module variables
 */

// Check whether `__proto__` is supported
var hasProtoSupport = '__proto__' in Object;

// Without `__proto__` support, this module will need to add properties to a function.
// However, some Function.prototype methods cannot be overwritten,
// and there seems no easy cross-platform way to detect them (@see chaijs/chai/issues/69).
var excludeNames = /^(?:length|name|arguments|caller)$/;

// Cache `Function` properties
var call  = Function.prototype.call,
    apply = Function.prototype.apply;

/**
 * ### addChainableMethod (ctx, name, method, chainingBehavior)
 *
 * Adds a method to an object, such that the method can also be chained.
 *
 *     utils.addChainableMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addChainableMethod('foo', fn, chainingBehavior);
 *
 * The result can then be used as both a method assertion, executing both `method` and
 * `chainingBehavior`, or as a language chain, which only executes `chainingBehavior`.
 *
 *     expect(fooStr).to.be.foo('bar');
 *     expect(fooStr).to.be.foo.equal('foo');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for `name`, when called
 * @param {Function} chainingBehavior function to be called every time the property is accessed
 * @name addChainableMethod
 * @api public
 */

module.exports = function (ctx, name, method, chainingBehavior) {
  if (typeof chainingBehavior !== 'function')
    chainingBehavior = function () { };

  Object.defineProperty(ctx, name,
    { get: function () {
        chainingBehavior.call(this);

        var assert = function () {
          var result = method.apply(this, arguments);
          return result === undefined ? this : result;
        };

        // Use `__proto__` if available
        if (hasProtoSupport) {
          // Inherit all properties from the object by replacing the `Function` prototype
          var prototype = assert.__proto__ = Object.create(this);
          // Restore the `call` and `apply` methods from `Function`
          prototype.call = call;
          prototype.apply = apply;
        }
        // Otherwise, redefine all properties (slow!)
        else {
          var asserterNames = Object.getOwnPropertyNames(ctx);
          asserterNames.forEach(function (asserterName) {
            if (!excludeNames.test(asserterName)) {
              var pd = Object.getOwnPropertyDescriptor(ctx, asserterName);
              Object.defineProperty(assert, asserterName, pd);
            }
          });
        }

        transferFlags(this, assert);
        return assert;
      }
    , configurable: true
  });
};

},{"./transferFlags":26}],10:[function(require,module,exports){
/*!
 * Chai - addMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .addMethod (ctx, name, method)
 *
 * Adds a method to the prototype of an object.
 *
 *     utils.addMethod(chai.Assertion.prototype, 'foo', function (str) {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.equal(str);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(fooStr).to.be.foo('bar');
 *
 * @param {Object} ctx object to which the method is added
 * @param {String} name of method to add
 * @param {Function} method function to be used for name
 * @name addMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  ctx[name] = function () {
    var result = method.apply(this, arguments);
    return result === undefined ? this : result;
  };
};

},{}],11:[function(require,module,exports){
/*!
 * Chai - addProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### addProperty (ctx, name, getter)
 *
 * Adds a property to the prototype of an object.
 *
 *     utils.addProperty(chai.Assertion.prototype, 'foo', function () {
 *       var obj = utils.flag(this, 'object');
 *       new chai.Assertion(obj).to.be.instanceof(Foo);
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.addProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.foo;
 *
 * @param {Object} ctx object to which the property is added
 * @param {String} name of property to add
 * @param {Function} getter function to be used for name
 * @name addProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter.call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],12:[function(require,module,exports){
// This is (almost) directly from Node.js assert
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/assert.js

module.exports = _deepEqual;

var getEnumerableProperties = require('./getEnumerableProperties');

// for the browser
var Buffer;
try {
  Buffer = require('buffer').Buffer;
} catch (ex) {
  Buffer = {
    isBuffer: function () { return false; }
  };
}

function _deepEqual(actual, expected, memos) {

  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (Buffer.isBuffer(actual) && Buffer.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (expected instanceof Date) {
    if (!(actual instanceof Date)) return false;
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (typeof actual != 'object' && typeof expected != 'object') {
    return actual === expected;

  } else if (expected instanceof RegExp) {
    if (!(actual instanceof RegExp)) return false;
    return actual.toString() === expected.toString();

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, memos);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b, memos) {
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;

  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;

  // check if we have already compared a and b
  var i;
  if (memos) {
    for(i = 0; i < memos.length; i++) {
      if ((memos[i][0] === a && memos[i][1] === b) ||
          (memos[i][0] === b && memos[i][1] === a))
        return true;
    }
  } else {
    memos = [];
  }

  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b, memos);
  }
  try {
    var ka = getEnumerableProperties(a),
        kb = getEnumerableProperties(b),
        key;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }

  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;

  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }

  // remember objects we have compared to guard against circular references
  memos.push([ a, b ]);

  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key], memos)) return false;
  }

  return true;
}

},{"./getEnumerableProperties":15,"buffer":35}],13:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### flag(object ,key, [value])
 *
 * Get or set a flag value on an object. If a
 * value is provided it will be set, else it will
 * return the currently set value or `undefined` if
 * the value is not set.
 *
 *     utils.flag(this, 'foo', 'bar'); // setter
 *     utils.flag(this, 'foo'); // getter, returns `bar`
 *
 * @param {Object} object (constructed Assertion
 * @param {String} key
 * @param {Mixed} value (optional)
 * @name flag
 * @api private
 */

module.exports = function (obj, key, value) {
  var flags = obj.__flags || (obj.__flags = Object.create(null));
  if (arguments.length === 3) {
    flags[key] = value;
  } else {
    return flags[key];
  }
};

},{}],14:[function(require,module,exports){
/*!
 * Chai - getActual utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getActual(object, [actual])
 *
 * Returns the `actual` value for an Assertion
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var actual = args[4];
  return 'undefined' !== typeof actual ? actual : obj._obj;
};

},{}],15:[function(require,module,exports){
/*!
 * Chai - getEnumerableProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getEnumerableProperties(object)
 *
 * This allows the retrieval of enumerable property names of an object,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getEnumerableProperties
 * @api public
 */

module.exports = function getEnumerableProperties(object) {
  var result = [];
  for (var name in object) {
    result.push(name);
  }
  return result;
};

},{}],16:[function(require,module,exports){
/*!
 * Chai - message composition utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag')
  , getActual = require('./getActual')
  , inspect = require('./inspect')
  , objDisplay = require('./objDisplay');

/**
 * ### .getMessage(object, message, negateMessage)
 *
 * Construct the error message based on flags
 * and template tags. Template tags will return
 * a stringified inspection of the object referenced.
 *
 * Message template tags:
 * - `#{this}` current asserted object
 * - `#{act}` actual value
 * - `#{exp}` expected value
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 * @name getMessage
 * @api public
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , val = flag(obj, 'object')
    , expected = args[3]
    , actual = getActual(obj, args)
    , msg = negate ? args[2] : args[1]
    , flagMsg = flag(obj, 'message');

  msg = msg || '';
  msg = msg
    .replace(/#{this}/g, objDisplay(val))
    .replace(/#{act}/g, objDisplay(actual))
    .replace(/#{exp}/g, objDisplay(expected));

  return flagMsg ? flagMsg + ': ' + msg : msg;
};

},{"./flag":13,"./getActual":14,"./inspect":21,"./objDisplay":22}],17:[function(require,module,exports){
/*!
 * Chai - getName utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * # getName(func)
 *
 * Gets the name of a function, in a cross-browser way.
 *
 * @param {Function} a function (usually a constructor)
 */

module.exports = function (func) {
  if (func.name) return func.name;

  var match = /^\s?function ([^(]*)\(/.exec(func);
  return match && match[1] ? match[1] : "";
};

},{}],18:[function(require,module,exports){
/*!
 * Chai - getPathValue utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * @see https://github.com/logicalparadox/filtr
 * MIT Licensed
 */

/**
 * ### .getPathValue(path, object)
 *
 * This allows the retrieval of values in an
 * object given a string path.
 *
 *     var obj = {
 *         prop1: {
 *             arr: ['a', 'b', 'c']
 *           , str: 'Hello'
 *         }
 *       , prop2: {
 *             arr: [ { nested: 'Universe' } ]
 *           , str: 'Hello again!'
 *         }
 *     }
 *
 * The following would be the results.
 *
 *     getPathValue('prop1.str', obj); // Hello
 *     getPathValue('prop1.att[2]', obj); // b
 *     getPathValue('prop2.arr[0].nested', obj); // Universe
 *
 * @param {String} path
 * @param {Object} object
 * @returns {Object} value or `undefined`
 * @name getPathValue
 * @api public
 */

var getPathValue = module.exports = function (path, obj) {
  var parsed = parsePath(path);
  return _getPathValue(parsed, obj);
};

/*!
 * ## parsePath(path)
 *
 * Helper function used to parse string object
 * paths. Use in conjunction with `_getPathValue`.
 *
 *      var parsed = parsePath('myobject.property.subprop');
 *
 * ### Paths:
 *
 * * Can be as near infinitely deep and nested
 * * Arrays are also valid using the formal `myobject.document[3].property`.
 *
 * @param {String} path
 * @returns {Object} parsed
 * @api private
 */

function parsePath (path) {
  var str = path.replace(/\[/g, '.[')
    , parts = str.match(/(\\\.|[^.]+?)+/g);
  return parts.map(function (value) {
    var re = /\[(\d+)\]$/
      , mArr = re.exec(value)
    if (mArr) return { i: parseFloat(mArr[1]) };
    else return { p: value };
  });
};

/*!
 * ## _getPathValue(parsed, obj)
 *
 * Helper companion function for `.parsePath` that returns
 * the value located at the parsed address.
 *
 *      var value = getPathValue(parsed, obj);
 *
 * @param {Object} parsed definition from `parsePath`.
 * @param {Object} object to search against
 * @returns {Object|Undefined} value
 * @api private
 */

function _getPathValue (parsed, obj) {
  var tmp = obj
    , res;
  for (var i = 0, l = parsed.length; i < l; i++) {
    var part = parsed[i];
    if (tmp) {
      if ('undefined' !== typeof part.p)
        tmp = tmp[part.p];
      else if ('undefined' !== typeof part.i)
        tmp = tmp[part.i];
      if (i == (l - 1)) res = tmp;
    } else {
      res = undefined;
    }
  }
  return res;
};

},{}],19:[function(require,module,exports){
/*!
 * Chai - getProperties utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### .getProperties(object)
 *
 * This allows the retrieval of property names of an object, enumerable or not,
 * inherited or not.
 *
 * @param {Object} object
 * @returns {Array}
 * @name getProperties
 * @api public
 */

module.exports = function getProperties(object) {
  var result = Object.getOwnPropertyNames(subject);

  function addProperty(property) {
    if (result.indexOf(property) === -1) {
      result.push(property);
    }
  }

  var proto = Object.getPrototypeOf(subject);
  while (proto !== null) {
    Object.getOwnPropertyNames(proto).forEach(addProperty);
    proto = Object.getPrototypeOf(proto);
  }

  return result;
};

},{}],20:[function(require,module,exports){
/*!
 * chai
 * Copyright(c) 2011 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Main exports
 */

var exports = module.exports = {};

/*!
 * test utility
 */

exports.test = require('./test');

/*!
 * type utility
 */

exports.type = require('./type');

/*!
 * message utility
 */

exports.getMessage = require('./getMessage');

/*!
 * actual utility
 */

exports.getActual = require('./getActual');

/*!
 * Inspect util
 */

exports.inspect = require('./inspect');

/*!
 * Object Display util
 */

exports.objDisplay = require('./objDisplay');

/*!
 * Flag utility
 */

exports.flag = require('./flag');

/*!
 * Flag transferring utility
 */

exports.transferFlags = require('./transferFlags');

/*!
 * Deep equal utility
 */

exports.eql = require('./eql');

/*!
 * Deep path value
 */

exports.getPathValue = require('./getPathValue');

/*!
 * Function name
 */

exports.getName = require('./getName');

/*!
 * add Property
 */

exports.addProperty = require('./addProperty');

/*!
 * add Method
 */

exports.addMethod = require('./addMethod');

/*!
 * overwrite Property
 */

exports.overwriteProperty = require('./overwriteProperty');

/*!
 * overwrite Method
 */

exports.overwriteMethod = require('./overwriteMethod');

/*!
 * Add a chainable method
 */

exports.addChainableMethod = require('./addChainableMethod');


},{"./addChainableMethod":9,"./addMethod":10,"./addProperty":11,"./eql":12,"./flag":13,"./getActual":14,"./getMessage":16,"./getName":17,"./getPathValue":18,"./inspect":21,"./objDisplay":22,"./overwriteMethod":23,"./overwriteProperty":24,"./test":25,"./transferFlags":26,"./type":27}],21:[function(require,module,exports){
// This is (almost) directly from Node.js utils
// https://github.com/joyent/node/blob/f8c335d0caf47f16d31413f89aa28eda3878e3aa/lib/util.js

var getName = require('./getName');
var getProperties = require('./getProperties');
var getEnumerableProperties = require('./getEnumerableProperties');

module.exports = inspect;

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Boolean} showHidden Flag that shows hidden (not enumerable)
 *    properties of objects.
 * @param {Number} depth Depth in which to descend in object. Default is 2.
 * @param {Boolean} colors Flag to turn on ANSI escape codes to color the
 *    output. Default is false (no coloring).
 */
function inspect(obj, showHidden, depth, colors) {
  var ctx = {
    showHidden: showHidden,
    seen: [],
    stylize: function (str) { return str; }
  };
  return formatValue(ctx, obj, (typeof depth === 'undefined' ? 2 : depth));
}

// https://gist.github.com/1044128/
var getOuterHTML = function(element) {
  if ('outerHTML' in element) return element.outerHTML;
  var ns = "http://www.w3.org/1999/xhtml";
  var container = document.createElementNS(ns, '_');
  var elemProto = (window.HTMLElement || window.Element).prototype;
  var xmlSerializer = new XMLSerializer();
  var html;
  if (document.xmlVersion) {
    return xmlSerializer.serializeToString(element);
  } else {
    container.appendChild(element.cloneNode(false));
    html = container.innerHTML.replace('><', '>' + element.innerHTML + '<');
    container.innerHTML = '';
    return html;
  }
};

// Returns true if object is a DOM element.
var isDOMElement = function (object) {
  if (typeof HTMLElement === 'object') {
    return object instanceof HTMLElement;
  } else {
    return object &&
      typeof object === 'object' &&
      object.nodeType === 1 &&
      typeof object.nodeName === 'string';
  }
};

function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (value && typeof value.inspect === 'function' &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (typeof ret !== 'string') {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // If it's DOM elem, get outer HTML.
  if (isDOMElement(value)) {
    return getOuterHTML(value);
  }

  // Look up the keys of the object.
  var visibleKeys = getEnumerableProperties(value);
  var keys = ctx.showHidden ? getProperties(value) : visibleKeys;

  // Some type of object without properties can be shortcutted.
  // In IE, errors have a single `stack` property, or if they are vanilla `Error`,
  // a `stack` plus `description` property; ignore those for consistency.
  if (keys.length === 0 || (isError(value) && (
      (keys.length === 1 && keys[0] === 'stack') ||
      (keys.length === 2 && keys[0] === 'description' && keys[1] === 'stack')
     ))) {
    if (typeof value === 'function') {
      var name = getName(value);
      var nameSuffix = name ? ': ' + name : '';
      return ctx.stylize('[Function' + nameSuffix + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toUTCString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (typeof value === 'function') {
    var name = getName(value);
    var nameSuffix = name ? ': ' + name : '';
    base = ' [Function' + nameSuffix + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    return formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  switch (typeof value) {
    case 'undefined':
      return ctx.stylize('undefined', 'undefined');

    case 'string':
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');

    case 'number':
      return ctx.stylize('' + value, 'number');

    case 'boolean':
      return ctx.stylize('' + value, 'boolean');
  }
  // For some reason typeof null is "object", so special case here.
  if (value === null) {
    return ctx.stylize('null', 'null');
  }
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (Object.prototype.hasOwnProperty.call(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str;
  if (value.__lookupGetter__) {
    if (value.__lookupGetter__(key)) {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (value.__lookupSetter__(key)) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
  }
  if (visibleKeys.indexOf(key) < 0) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(value[key]) < 0) {
      if (recurseTimes === null) {
        str = formatValue(ctx, value[key], null);
      } else {
        str = formatValue(ctx, value[key], recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (typeof name === 'undefined') {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}

function isArray(ar) {
  return Array.isArray(ar) ||
         (typeof ar === 'object' && objectToString(ar) === '[object Array]');
}

function isRegExp(re) {
  return typeof re === 'object' && objectToString(re) === '[object RegExp]';
}

function isDate(d) {
  return typeof d === 'object' && objectToString(d) === '[object Date]';
}

function isError(e) {
  return typeof e === 'object' && objectToString(e) === '[object Error]';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

},{"./getEnumerableProperties":15,"./getName":17,"./getProperties":19}],22:[function(require,module,exports){
/*!
 * Chai - flag utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var inspect = require('./inspect');

/**
 * ### .objDisplay (object)
 *
 * Determines if an object or an array matches
 * criteria to be inspected in-line for error
 * messages or should be truncated.
 *
 * @param {Mixed} javascript object to inspect
 * @name objDisplay
 * @api public
 */

module.exports = function (obj) {
  var str = inspect(obj)
    , type = Object.prototype.toString.call(obj);

  if (str.length >= 40) {
    if (type === '[object Function]') {
      return !obj.name || obj.name === ''
        ? '[Function]'
        : '[Function: ' + obj.name + ']';
    } else if (type === '[object Array]') {
      return '[ Array(' + obj.length + ') ]';
    } else if (type === '[object Object]') {
      var keys = Object.keys(obj)
        , kstr = keys.length > 2
          ? keys.splice(0, 2).join(', ') + ', ...'
          : keys.join(', ');
      return '{ Object (' + kstr + ') }';
    } else {
      return str;
    }
  } else {
    return str;
  }
};

},{"./inspect":21}],23:[function(require,module,exports){
/*!
 * Chai - overwriteMethod utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteMethod (ctx, name, fn)
 *
 * Overwites an already existing method and provides
 * access to previous function. Must return function
 * to be used for name.
 *
 *     utils.overwriteMethod(chai.Assertion.prototype, 'equal', function (_super) {
 *       return function (str) {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.value).to.equal(str);
 *         } else {
 *           _super.apply(this, arguments);
 *         }
 *       }
 *     });
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteMethod('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.equal('bar');
 *
 * @param {Object} ctx object whose method is to be overwritten
 * @param {String} name of method to overwrite
 * @param {Function} method function that returns a function to be used for name
 * @name overwriteMethod
 * @api public
 */

module.exports = function (ctx, name, method) {
  var _method = ctx[name]
    , _super = function () { return this; };

  if (_method && 'function' === typeof _method)
    _super = _method;

  ctx[name] = function () {
    var result = method(_super).apply(this, arguments);
    return result === undefined ? this : result;
  }
};

},{}],24:[function(require,module,exports){
/*!
 * Chai - overwriteProperty utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### overwriteProperty (ctx, name, fn)
 *
 * Overwites an already existing property getter and provides
 * access to previous value. Must return function to use as getter.
 *
 *     utils.overwriteProperty(chai.Assertion.prototype, 'ok', function (_super) {
 *       return function () {
 *         var obj = utils.flag(this, 'object');
 *         if (obj instanceof Foo) {
 *           new chai.Assertion(obj.name).to.equal('bar');
 *         } else {
 *           _super.call(this);
 *         }
 *       }
 *     });
 *
 *
 * Can also be accessed directly from `chai.Assertion`.
 *
 *     chai.Assertion.overwriteProperty('foo', fn);
 *
 * Then can be used as any other assertion.
 *
 *     expect(myFoo).to.be.ok;
 *
 * @param {Object} ctx object whose property is to be overwritten
 * @param {String} name of property to overwrite
 * @param {Function} getter function that returns a getter function to be used for name
 * @name overwriteProperty
 * @api public
 */

module.exports = function (ctx, name, getter) {
  var _get = Object.getOwnPropertyDescriptor(ctx, name)
    , _super = function () {};

  if (_get && 'function' === typeof _get.get)
    _super = _get.get

  Object.defineProperty(ctx, name,
    { get: function () {
        var result = getter(_super).call(this);
        return result === undefined ? this : result;
      }
    , configurable: true
  });
};

},{}],25:[function(require,module,exports){
/*!
 * Chai - test utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Module dependancies
 */

var flag = require('./flag');

/**
 * # test(object, expression)
 *
 * Test and object for expression.
 *
 * @param {Object} object (constructed Assertion)
 * @param {Arguments} chai.Assertion.prototype.assert arguments
 */

module.exports = function (obj, args) {
  var negate = flag(obj, 'negate')
    , expr = args[0];
  return negate ? !expr : expr;
};

},{"./flag":13}],26:[function(require,module,exports){
/*!
 * Chai - transferFlags utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/**
 * ### transferFlags(assertion, object, includeAll = true)
 *
 * Transfer all the flags for `assertion` to `object`. If
 * `includeAll` is set to `false`, then the base Chai
 * assertion flags (namely `object`, `ssfi`, and `message`)
 * will not be transferred.
 *
 *
 *     var newAssertion = new Assertion();
 *     utils.transferFlags(assertion, newAssertion);
 *
 *     var anotherAsseriton = new Assertion(myObj);
 *     utils.transferFlags(assertion, anotherAssertion, false);
 *
 * @param {Assertion} assertion the assertion to transfer the flags from
 * @param {Object} object the object to transfer the flags too; usually a new assertion
 * @param {Boolean} includeAll
 * @name getAllFlags
 * @api private
 */

module.exports = function (assertion, object, includeAll) {
  var flags = assertion.__flags || (assertion.__flags = Object.create(null));

  if (!object.__flags) {
    object.__flags = Object.create(null);
  }

  includeAll = arguments.length === 3 ? includeAll : true;

  for (var flag in flags) {
    if (includeAll ||
        (flag !== 'object' && flag !== 'ssfi' && flag != 'message')) {
      object.__flags[flag] = flags[flag];
    }
  }
};

},{}],27:[function(require,module,exports){
/*!
 * Chai - type utility
 * Copyright(c) 2012-2013 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Detectable javascript natives
 */

var natives = {
    '[object Arguments]': 'arguments'
  , '[object Array]': 'array'
  , '[object Date]': 'date'
  , '[object Function]': 'function'
  , '[object Number]': 'number'
  , '[object RegExp]': 'regexp'
  , '[object String]': 'string'
};

/**
 * ### type(object)
 *
 * Better implementation of `typeof` detection that can
 * be used cross-browser. Handles the inconsistencies of
 * Array, `null`, and `undefined` detection.
 *
 *     utils.type({}) // 'object'
 *     utils.type(null) // `null'
 *     utils.type(undefined) // `undefined`
 *     utils.type([]) // `array`
 *
 * @param {Mixed} object to detect type of
 * @name type
 * @api private
 */

module.exports = function (obj) {
  var str = Object.prototype.toString.call(obj);
  if (natives[str]) return natives[str];
  if (obj === null) return 'null';
  if (obj === undefined) return 'undefined';
  if (obj === Object(obj)) return 'object';
  return typeof obj;
};

},{}],28:[function(require,module,exports){
/*!
 * assertion-error
 * Copyright(c) 2013 Jake Luer <jake@qualiancy.com>
 * MIT Licensed
 */

/*!
 * Return a function that will copy properties from
 * one object to another excluding any originally
 * listed. Returned function will create a new `{}`.
 *
 * @param {String} excluded properties ...
 * @return {Function}
 */

function exclude () {
  var excludes = [].slice.call(arguments);

  function excludeProps (res, obj) {
    Object.keys(obj).forEach(function (key) {
      if (!~excludes.indexOf(key)) res[key] = obj[key];
    });
  }

  return function extendExclude () {
    var args = [].slice.call(arguments)
      , i = 0
      , res = {};

    for (; i < args.length; i++) {
      excludeProps(res, args[i]);
    }

    return res;
  };
};

/*!
 * Primary Exports
 */

module.exports = AssertionError;

/**
 * ### AssertionError
 *
 * An extension of the JavaScript `Error` constructor for
 * assertion and validation scenarios.
 *
 * @param {String} message
 * @param {Object} properties to include (optional)
 * @param {callee} start stack function (optional)
 */

function AssertionError (message, _props, ssf) {
  var extend = exclude('name', 'message', 'stack', 'constructor', 'toJSON')
    , props = extend(_props || {});

  // default values
  this.message = message || 'Unspecified AssertionError';
  this.showDiff = false;

  // copy from properties
  for (var key in props) {
    this[key] = props[key];
  }

  // capture stack trace
  ssf = ssf || arguments.callee;
  if (ssf && Error.captureStackTrace) {
    Error.captureStackTrace(this, ssf);
  }
}

/*!
 * Inherit from Error.prototype
 */

AssertionError.prototype = Object.create(Error.prototype);

/*!
 * Statically set name
 */

AssertionError.prototype.name = 'AssertionError';

/*!
 * Ensure correct constructor
 */

AssertionError.prototype.constructor = AssertionError;

/**
 * Allow errors to be converted to JSON for static transfer.
 *
 * @param {Boolean} include stack (default: `true`)
 * @return {Object} object that can be `JSON.stringify`
 */

AssertionError.prototype.toJSON = function (stack) {
  var extend = exclude('constructor', 'toJSON', 'stack')
    , props = extend({ name: this.name }, this);

  // include stack if exists and not turned off
  if (false !== stack && this.stack) {
    props.stack = this.stack;
  }

  return props;
};

},{}],29:[function(require,module,exports){


//
// The shims in this file are not fully implemented shims for the ES5
// features, but do work for the particular usecases there is in
// the other modules.
//

var toString = Object.prototype.toString;
var hasOwnProperty = Object.prototype.hasOwnProperty;

// Array.isArray is supported in IE9
function isArray(xs) {
  return toString.call(xs) === '[object Array]';
}
exports.isArray = typeof Array.isArray === 'function' ? Array.isArray : isArray;

// Array.prototype.indexOf is supported in IE9
exports.indexOf = function indexOf(xs, x) {
  if (xs.indexOf) return xs.indexOf(x);
  for (var i = 0; i < xs.length; i++) {
    if (x === xs[i]) return i;
  }
  return -1;
};

// Array.prototype.filter is supported in IE9
exports.filter = function filter(xs, fn) {
  if (xs.filter) return xs.filter(fn);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    if (fn(xs[i], i, xs)) res.push(xs[i]);
  }
  return res;
};

// Array.prototype.forEach is supported in IE9
exports.forEach = function forEach(xs, fn, self) {
  if (xs.forEach) return xs.forEach(fn, self);
  for (var i = 0; i < xs.length; i++) {
    fn.call(self, xs[i], i, xs);
  }
};

// Array.prototype.map is supported in IE9
exports.map = function map(xs, fn) {
  if (xs.map) return xs.map(fn);
  var out = new Array(xs.length);
  for (var i = 0; i < xs.length; i++) {
    out[i] = fn(xs[i], i, xs);
  }
  return out;
};

// Array.prototype.reduce is supported in IE9
exports.reduce = function reduce(array, callback, opt_initialValue) {
  if (array.reduce) return array.reduce(callback, opt_initialValue);
  var value, isValueSet = false;

  if (2 < arguments.length) {
    value = opt_initialValue;
    isValueSet = true;
  }
  for (var i = 0, l = array.length; l > i; ++i) {
    if (array.hasOwnProperty(i)) {
      if (isValueSet) {
        value = callback(value, array[i], i, array);
      }
      else {
        value = array[i];
        isValueSet = true;
      }
    }
  }

  return value;
};

// String.prototype.substr - negative index don't work in IE8
if ('ab'.substr(-1) !== 'b') {
  exports.substr = function (str, start, length) {
    // did we get a negative start, calculate how much it is from the beginning of the string
    if (start < 0) start = str.length + start;

    // call the original function
    return str.substr(start, length);
  };
} else {
  exports.substr = function (str, start, length) {
    return str.substr(start, length);
  };
}

// String.prototype.trim is supported in IE9
exports.trim = function (str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
};

// Function.prototype.bind is supported in IE9
exports.bind = function () {
  var args = Array.prototype.slice.call(arguments);
  var fn = args.shift();
  if (fn.bind) return fn.bind.apply(fn, args);
  var self = args.shift();
  return function () {
    fn.apply(self, args.concat([Array.prototype.slice.call(arguments)]));
  };
};

// Object.create is supported in IE9
function create(prototype, properties) {
  var object;
  if (prototype === null) {
    object = { '__proto__' : null };
  }
  else {
    if (typeof prototype !== 'object') {
      throw new TypeError(
        'typeof prototype[' + (typeof prototype) + '] != \'object\''
      );
    }
    var Type = function () {};
    Type.prototype = prototype;
    object = new Type();
    object.__proto__ = prototype;
  }
  if (typeof properties !== 'undefined' && Object.defineProperties) {
    Object.defineProperties(object, properties);
  }
  return object;
}
exports.create = typeof Object.create === 'function' ? Object.create : create;

// Object.keys and Object.getOwnPropertyNames is supported in IE9 however
// they do show a description and number property on Error objects
function notObject(object) {
  return ((typeof object != "object" && typeof object != "function") || object === null);
}

function keysShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.keys called on a non-object");
  }

  var result = [];
  for (var name in object) {
    if (hasOwnProperty.call(object, name)) {
      result.push(name);
    }
  }
  return result;
}

// getOwnPropertyNames is almost the same as Object.keys one key feature
//  is that it returns hidden properties, since that can't be implemented,
//  this feature gets reduced so it just shows the length property on arrays
function propertyShim(object) {
  if (notObject(object)) {
    throw new TypeError("Object.getOwnPropertyNames called on a non-object");
  }

  var result = keysShim(object);
  if (exports.isArray(object) && exports.indexOf(object, 'length') === -1) {
    result.push('length');
  }
  return result;
}

var keys = typeof Object.keys === 'function' ? Object.keys : keysShim;
var getOwnPropertyNames = typeof Object.getOwnPropertyNames === 'function' ?
  Object.getOwnPropertyNames : propertyShim;

if (new Error().hasOwnProperty('description')) {
  var ERROR_PROPERTY_FILTER = function (obj, array) {
    if (toString.call(obj) === '[object Error]') {
      array = exports.filter(array, function (name) {
        return name !== 'description' && name !== 'number' && name !== 'message';
      });
    }
    return array;
  };

  exports.keys = function (object) {
    return ERROR_PROPERTY_FILTER(object, keys(object));
  };
  exports.getOwnPropertyNames = function (object) {
    return ERROR_PROPERTY_FILTER(object, getOwnPropertyNames(object));
  };
} else {
  exports.keys = keys;
  exports.getOwnPropertyNames = getOwnPropertyNames;
}

// Object.getOwnPropertyDescriptor - supported in IE8 but only on dom elements
function valueObject(value, key) {
  return { value: value[key] };
}

if (typeof Object.getOwnPropertyDescriptor === 'function') {
  try {
    Object.getOwnPropertyDescriptor({'a': 1}, 'a');
    exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
  } catch (e) {
    // IE8 dom element issue - use a try catch and default to valueObject
    exports.getOwnPropertyDescriptor = function (value, key) {
      try {
        return Object.getOwnPropertyDescriptor(value, key);
      } catch (e) {
        return valueObject(value, key);
      }
    };
  }
} else {
  exports.getOwnPropertyDescriptor = valueObject;
}

},{}],30:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// UTILITY
var util = require('util');
var shims = require('_shims');
var pSlice = Array.prototype.slice;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  this.message = options.message || getMessage(this);
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = shims.keys(a),
        kb = shims.keys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};
},{"_shims":29,"util":33}],31:[function(require,module,exports){

// not implemented
// The reason for having an empty file and not throwing is to allow
// untraditional implementation of this module.

},{}],32:[function(require,module,exports){
var process=require("__browserify_process");// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var shims = require('_shims');

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (!util.isString(path)) {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(shims.filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = shims.substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(shims.filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(shims.filter(paths, function(p, index) {
    if (!util.isString(p)) {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

},{"__browserify_process":44,"_shims":29,"util":33}],33:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var shims = require('_shims');

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  shims.forEach(array, function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = shims.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = shims.getOwnPropertyNames(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }

  shims.forEach(keys, function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = shims.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }

  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (shims.indexOf(ctx.seen, desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = shims.reduce(output, function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return shims.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) && objectToString(e) === '[object Error]';
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.binarySlice === 'function'
  ;
}
exports.isBuffer = isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = function(ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = shims.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
};

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = shims.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

},{"_shims":29}],34:[function(require,module,exports){
exports.readIEEE754 = function(buffer, offset, isBE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isBE ? 0 : (nBytes - 1),
      d = isBE ? 1 : -1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.writeIEEE754 = function(buffer, value, offset, isBE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isBE ? (nBytes - 1) : 0,
      d = isBE ? -1 : 1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],35:[function(require,module,exports){
var assert;
exports.Buffer = Buffer;
exports.SlowBuffer = Buffer;
Buffer.poolSize = 8192;
exports.INSPECT_MAX_BYTES = 50;

function stringtrim(str) {
  if (str.trim) return str.trim();
  return str.replace(/^\s+|\s+$/g, '');
}

function Buffer(subject, encoding, offset) {
  if(!assert) assert= require('assert');
  if (!(this instanceof Buffer)) {
    return new Buffer(subject, encoding, offset);
  }
  this.parent = this;
  this.offset = 0;

  // Work-around: node's base64 implementation
  // allows for non-padded strings while base64-js
  // does not..
  if (encoding == "base64" && typeof subject == "string") {
    subject = stringtrim(subject);
    while (subject.length % 4 != 0) {
      subject = subject + "="; 
    }
  }

  var type;

  // Are we slicing?
  if (typeof offset === 'number') {
    this.length = coerce(encoding);
    // slicing works, with limitations (no parent tracking/update)
    // check https://github.com/toots/buffer-browserify/issues/19
    for (var i = 0; i < this.length; i++) {
        this[i] = subject.get(i+offset);
    }
  } else {
    // Find the length
    switch (type = typeof subject) {
      case 'number':
        this.length = coerce(subject);
        break;

      case 'string':
        this.length = Buffer.byteLength(subject, encoding);
        break;

      case 'object': // Assume object is an array
        this.length = coerce(subject.length);
        break;

      default:
        throw new Error('First argument needs to be a number, ' +
                        'array or string.');
    }

    // Treat array-ish objects as a byte array.
    if (isArrayIsh(subject)) {
      for (var i = 0; i < this.length; i++) {
        if (subject instanceof Buffer) {
          this[i] = subject.readUInt8(i);
        }
        else {
          this[i] = subject[i];
        }
      }
    } else if (type == 'string') {
      // We are a string
      this.length = this.write(subject, 0, encoding);
    } else if (type === 'number') {
      for (var i = 0; i < this.length; i++) {
        this[i] = 0;
      }
    }
  }
}

Buffer.prototype.get = function get(i) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i];
};

Buffer.prototype.set = function set(i, v) {
  if (i < 0 || i >= this.length) throw new Error('oob');
  return this[i] = v;
};

Buffer.byteLength = function (str, encoding) {
  switch (encoding || "utf8") {
    case 'hex':
      return str.length / 2;

    case 'utf8':
    case 'utf-8':
      return utf8ToBytes(str).length;

    case 'ascii':
    case 'binary':
      return str.length;

    case 'base64':
      return base64ToBytes(str).length;

    default:
      throw new Error('Unknown encoding');
  }
};

Buffer.prototype.utf8Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(utf8ToBytes(string), this, offset, length);
};

Buffer.prototype.asciiWrite = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten =  blitBuffer(asciiToBytes(string), this, offset, length);
};

Buffer.prototype.binaryWrite = Buffer.prototype.asciiWrite;

Buffer.prototype.base64Write = function (string, offset, length) {
  var bytes, pos;
  return Buffer._charsWritten = blitBuffer(base64ToBytes(string), this, offset, length);
};

Buffer.prototype.base64Slice = function (start, end) {
  var bytes = Array.prototype.slice.apply(this, arguments)
  return require("base64-js").fromByteArray(bytes);
};

Buffer.prototype.utf8Slice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var res = "";
  var tmp = "";
  var i = 0;
  while (i < bytes.length) {
    if (bytes[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(bytes[i]);
      tmp = "";
    } else
      tmp += "%" + bytes[i].toString(16);

    i++;
  }

  return res + decodeUtf8Char(tmp);
}

Buffer.prototype.asciiSlice = function () {
  var bytes = Array.prototype.slice.apply(this, arguments);
  var ret = "";
  for (var i = 0; i < bytes.length; i++)
    ret += String.fromCharCode(bytes[i]);
  return ret;
}

Buffer.prototype.binarySlice = Buffer.prototype.asciiSlice;

Buffer.prototype.inspect = function() {
  var out = [],
      len = this.length;
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i]);
    if (i == exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...';
      break;
    }
  }
  return '<Buffer ' + out.join(' ') + '>';
};


Buffer.prototype.hexSlice = function(start, end) {
  var len = this.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; i++) {
    out += toHex(this[i]);
  }
  return out;
};


Buffer.prototype.toString = function(encoding, start, end) {
  encoding = String(encoding || 'utf8').toLowerCase();
  start = +start || 0;
  if (typeof end == 'undefined') end = this.length;

  // Fastpath empty strings
  if (+end == start) {
    return '';
  }

  switch (encoding) {
    case 'hex':
      return this.hexSlice(start, end);

    case 'utf8':
    case 'utf-8':
      return this.utf8Slice(start, end);

    case 'ascii':
      return this.asciiSlice(start, end);

    case 'binary':
      return this.binarySlice(start, end);

    case 'base64':
      return this.base64Slice(start, end);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Slice(start, end);

    default:
      throw new Error('Unknown encoding');
  }
};


Buffer.prototype.hexWrite = function(string, offset, length) {
  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2) {
    throw new Error('Invalid hex string');
  }
  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(byte)) throw new Error('Invalid hex string');
    this[offset + i] = byte;
  }
  Buffer._charsWritten = i * 2;
  return i;
};


Buffer.prototype.write = function(string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length;
      length = undefined;
    }
  } else {  // legacy
    var swap = encoding;
    encoding = offset;
    offset = length;
    length = swap;
  }

  offset = +offset || 0;
  var remaining = this.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = +length;
    if (length > remaining) {
      length = remaining;
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase();

  switch (encoding) {
    case 'hex':
      return this.hexWrite(string, offset, length);

    case 'utf8':
    case 'utf-8':
      return this.utf8Write(string, offset, length);

    case 'ascii':
      return this.asciiWrite(string, offset, length);

    case 'binary':
      return this.binaryWrite(string, offset, length);

    case 'base64':
      return this.base64Write(string, offset, length);

    case 'ucs2':
    case 'ucs-2':
      return this.ucs2Write(string, offset, length);

    default:
      throw new Error('Unknown encoding');
  }
};

// slice(start, end)
function clamp(index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue;
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len;
  if (index >= 0) return index;
  index += len;
  if (index >= 0) return index;
  return 0;
}

Buffer.prototype.slice = function(start, end) {
  var len = this.length;
  start = clamp(start, len, 0);
  end = clamp(end, len, len);
  return new Buffer(this, end - start, +start);
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function(target, target_start, start, end) {
  var source = this;
  start || (start = 0);
  if (end === undefined || isNaN(end)) {
    end = this.length;
  }
  target_start || (target_start = 0);

  if (end < start) throw new Error('sourceEnd < sourceStart');

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length == 0 || source.length == 0) return 0;

  if (target_start < 0 || target_start >= target.length) {
    throw new Error('targetStart out of bounds');
  }

  if (start < 0 || start >= source.length) {
    throw new Error('sourceStart out of bounds');
  }

  if (end < 0 || end > source.length) {
    throw new Error('sourceEnd out of bounds');
  }

  // Are we oob?
  if (end > this.length) {
    end = this.length;
  }

  if (target.length - target_start < end - start) {
    end = target.length - target_start + start;
  }

  var temp = [];
  for (var i=start; i<end; i++) {
    assert.ok(typeof this[i] !== 'undefined', "copying undefined buffer bytes!");
    temp.push(this[i]);
  }

  for (var i=target_start; i<target_start+temp.length; i++) {
    target[i] = temp[i-target_start];
  }
};

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill(value, start, end) {
  value || (value = 0);
  start || (start = 0);
  end || (end = this.length);

  if (typeof value === 'string') {
    value = value.charCodeAt(0);
  }
  if (!(typeof value === 'number') || isNaN(value)) {
    throw new Error('value is not a number');
  }

  if (end < start) throw new Error('end < start');

  // Fill 0 bytes; we're done
  if (end === start) return 0;
  if (this.length == 0) return 0;

  if (start < 0 || start >= this.length) {
    throw new Error('start out of bounds');
  }

  if (end < 0 || end > this.length) {
    throw new Error('end out of bounds');
  }

  for (var i = start; i < end; i++) {
    this[i] = value;
  }
}

// Static methods
Buffer.isBuffer = function isBuffer(b) {
  return b instanceof Buffer || b instanceof Buffer;
};

Buffer.concat = function (list, totalLength) {
  if (!isArray(list)) {
    throw new Error("Usage: Buffer.concat(list, [totalLength])\n \
      list should be an Array.");
  }

  if (list.length === 0) {
    return new Buffer(0);
  } else if (list.length === 1) {
    return list[0];
  }

  if (typeof totalLength !== 'number') {
    totalLength = 0;
    for (var i = 0; i < list.length; i++) {
      var buf = list[i];
      totalLength += buf.length;
    }
  }

  var buffer = new Buffer(totalLength);
  var pos = 0;
  for (var i = 0; i < list.length; i++) {
    var buf = list[i];
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer;
};

Buffer.isEncoding = function(encoding) {
  switch ((encoding + '').toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
    case 'raw':
      return true;

    default:
      return false;
  }
};

// helpers

function coerce(length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length);
  return length < 0 ? 0 : length;
}

function isArray(subject) {
  return (Array.isArray ||
    function(subject){
      return {}.toString.apply(subject) == '[object Array]'
    })
    (subject)
}

function isArrayIsh(subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
         subject && typeof subject === 'object' &&
         typeof subject.length === 'number';
}

function toHex(n) {
  if (n < 16) return '0' + n.toString(16);
  return n.toString(16);
}

function utf8ToBytes(str) {
  var byteArray = [];
  for (var i = 0; i < str.length; i++)
    if (str.charCodeAt(i) <= 0x7F)
      byteArray.push(str.charCodeAt(i));
    else {
      var h = encodeURIComponent(str.charAt(i)).substr(1).split('%');
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16));
    }

  return byteArray;
}

function asciiToBytes(str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++ )
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push( str.charCodeAt(i) & 0xFF );

  return byteArray;
}

function base64ToBytes(str) {
  return require("base64-js").toByteArray(str);
}

function blitBuffer(src, dst, offset, length) {
  var pos, i = 0;
  while (i < length) {
    if ((i+offset >= dst.length) || (i >= src.length))
      break;

    dst[i + offset] = src[i];
    i++;
  }
  return i;
}

function decodeUtf8Char(str) {
  try {
    return decodeURIComponent(str);
  } catch (err) {
    return String.fromCharCode(0xFFFD); // UTF 8 invalid char
  }
}

// read/write bit-twiddling

Buffer.prototype.readUInt8 = function(offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  return buffer[offset];
};

function readUInt16(buffer, offset, isBigEndian, noAssert) {
  var val = 0;


  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    val = buffer[offset] << 8;
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1];
    }
  } else {
    val = buffer[offset];
    if (offset + 1 < buffer.length) {
      val |= buffer[offset + 1] << 8;
    }
  }

  return val;
}

Buffer.prototype.readUInt16LE = function(offset, noAssert) {
  return readUInt16(this, offset, false, noAssert);
};

Buffer.prototype.readUInt16BE = function(offset, noAssert) {
  return readUInt16(this, offset, true, noAssert);
};

function readUInt32(buffer, offset, isBigEndian, noAssert) {
  var val = 0;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return 0;

  if (isBigEndian) {
    if (offset + 1 < buffer.length)
      val = buffer[offset + 1] << 16;
    if (offset + 2 < buffer.length)
      val |= buffer[offset + 2] << 8;
    if (offset + 3 < buffer.length)
      val |= buffer[offset + 3];
    val = val + (buffer[offset] << 24 >>> 0);
  } else {
    if (offset + 2 < buffer.length)
      val = buffer[offset + 2] << 16;
    if (offset + 1 < buffer.length)
      val |= buffer[offset + 1] << 8;
    val |= buffer[offset];
    if (offset + 3 < buffer.length)
      val = val + (buffer[offset + 3] << 24 >>> 0);
  }

  return val;
}

Buffer.prototype.readUInt32LE = function(offset, noAssert) {
  return readUInt32(this, offset, false, noAssert);
};

Buffer.prototype.readUInt32BE = function(offset, noAssert) {
  return readUInt32(this, offset, true, noAssert);
};


/*
 * Signed integer types, yay team! A reminder on how two's complement actually
 * works. The first bit is the signed bit, i.e. tells us whether or not the
 * number should be positive or negative. If the two's complement value is
 * positive, then we're done, as it's equivalent to the unsigned representation.
 *
 * Now if the number is positive, you're pretty much done, you can just leverage
 * the unsigned translations and return those. Unfortunately, negative numbers
 * aren't quite that straightforward.
 *
 * At first glance, one might be inclined to use the traditional formula to
 * translate binary numbers between the positive and negative values in two's
 * complement. (Though it doesn't quite work for the most negative value)
 * Mainly:
 *  - invert all the bits
 *  - add one to the result
 *
 * Of course, this doesn't quite work in Javascript. Take for example the value
 * of -128. This could be represented in 16 bits (big-endian) as 0xff80. But of
 * course, Javascript will do the following:
 *
 * > ~0xff80
 * -65409
 *
 * Whoh there, Javascript, that's not quite right. But wait, according to
 * Javascript that's perfectly correct. When Javascript ends up seeing the
 * constant 0xff80, it has no notion that it is actually a signed number. It
 * assumes that we've input the unsigned value 0xff80. Thus, when it does the
 * binary negation, it casts it into a signed value, (positive 0xff80). Then
 * when you perform binary negation on that, it turns it into a negative number.
 *
 * Instead, we're going to have to use the following general formula, that works
 * in a rather Javascript friendly way. I'm glad we don't support this kind of
 * weird numbering scheme in the kernel.
 *
 * (BIT-MAX - (unsigned)val + 1) * -1
 *
 * The astute observer, may think that this doesn't make sense for 8-bit numbers
 * (really it isn't necessary for them). However, when you get 16-bit numbers,
 * you do. Let's go back to our prior example and see how this will look:
 *
 * (0xffff - 0xff80 + 1) * -1
 * (0x007f + 1) * -1
 * (0x0080) * -1
 */
Buffer.prototype.readInt8 = function(offset, noAssert) {
  var buffer = this;
  var neg;

  if (!noAssert) {
    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to read beyond buffer length');
  }

  if (offset >= buffer.length) return;

  neg = buffer[offset] & 0x80;
  if (!neg) {
    return (buffer[offset]);
  }

  return ((0xff - buffer[offset] + 1) * -1);
};

function readInt16(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt16(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x8000;
  if (!neg) {
    return val;
  }

  return (0xffff - val + 1) * -1;
}

Buffer.prototype.readInt16LE = function(offset, noAssert) {
  return readInt16(this, offset, false, noAssert);
};

Buffer.prototype.readInt16BE = function(offset, noAssert) {
  return readInt16(this, offset, true, noAssert);
};

function readInt32(buffer, offset, isBigEndian, noAssert) {
  var neg, val;

  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  val = readUInt32(buffer, offset, isBigEndian, noAssert);
  neg = val & 0x80000000;
  if (!neg) {
    return (val);
  }

  return (0xffffffff - val + 1) * -1;
}

Buffer.prototype.readInt32LE = function(offset, noAssert) {
  return readInt32(this, offset, false, noAssert);
};

Buffer.prototype.readInt32BE = function(offset, noAssert) {
  return readInt32(this, offset, true, noAssert);
};

function readFloat(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 3 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.readFloatLE = function(offset, noAssert) {
  return readFloat(this, offset, false, noAssert);
};

Buffer.prototype.readFloatBE = function(offset, noAssert) {
  return readFloat(this, offset, true, noAssert);
};

function readDouble(buffer, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset + 7 < buffer.length,
        'Trying to read beyond buffer length');
  }

  return require('./buffer_ieee754').readIEEE754(buffer, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.readDoubleLE = function(offset, noAssert) {
  return readDouble(this, offset, false, noAssert);
};

Buffer.prototype.readDoubleBE = function(offset, noAssert) {
  return readDouble(this, offset, true, noAssert);
};


/*
 * We have to make sure that the value is a valid integer. This means that it is
 * non-negative. It has no fractional component and that it does not exceed the
 * maximum allowed value.
 *
 *      value           The number to check for validity
 *
 *      max             The maximum value
 */
function verifuint(value, max) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value >= 0,
      'specified a negative value for writing an unsigned value');

  assert.ok(value <= max, 'value is larger than maximum value for type');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

Buffer.prototype.writeUInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xff);
  }

  if (offset < buffer.length) {
    buffer[offset] = value;
  }
};

function writeUInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 2); i++) {
    buffer[offset + i] =
        (value & (0xff << (8 * (isBigEndian ? 1 - i : i)))) >>>
            (isBigEndian ? 1 - i : i) * 8;
  }

}

Buffer.prototype.writeUInt16LE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt16BE = function(value, offset, noAssert) {
  writeUInt16(this, value, offset, true, noAssert);
};

function writeUInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'trying to write beyond buffer length');

    verifuint(value, 0xffffffff);
  }

  for (var i = 0; i < Math.min(buffer.length - offset, 4); i++) {
    buffer[offset + i] =
        (value >>> (isBigEndian ? 3 - i : i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeUInt32BE = function(value, offset, noAssert) {
  writeUInt32(this, value, offset, true, noAssert);
};


/*
 * We now move onto our friends in the signed number category. Unlike unsigned
 * numbers, we're going to have to worry a bit more about how we put values into
 * arrays. Since we are only worrying about signed 32-bit values, we're in
 * slightly better shape. Unfortunately, we really can't do our favorite binary
 * & in this system. It really seems to do the wrong thing. For example:
 *
 * > -32 & 0xff
 * 224
 *
 * What's happening above is really: 0xe0 & 0xff = 0xe0. However, the results of
 * this aren't treated as a signed number. Ultimately a bad thing.
 *
 * What we're going to want to do is basically create the unsigned equivalent of
 * our representation and pass that off to the wuint* functions. To do that
 * we're going to do the following:
 *
 *  - if the value is positive
 *      we can pass it directly off to the equivalent wuint
 *  - if the value is negative
 *      we do the following computation:
 *         mb + val + 1, where
 *         mb   is the maximum unsigned value in that byte size
 *         val  is the Javascript negative integer
 *
 *
 * As a concrete value, take -128. In signed 16 bits this would be 0xff80. If
 * you do out the computations:
 *
 * 0xffff - 128 + 1
 * 0xffff - 127
 * 0xff80
 *
 * You can then encode this value as the signed version. This is really rather
 * hacky, but it should work and get the job done which is our goal here.
 */

/*
 * A series of checks to make sure we actually have a signed 32-bit number
 */
function verifsint(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');

  assert.ok(Math.floor(value) === value, 'value has a fractional component');
}

function verifIEEE754(value, max, min) {
  assert.ok(typeof (value) == 'number',
      'cannot write a non-number as a number');

  assert.ok(value <= max, 'value larger than maximum allowed value');

  assert.ok(value >= min, 'value smaller than minimum allowed value');
}

Buffer.prototype.writeInt8 = function(value, offset, noAssert) {
  var buffer = this;

  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7f, -0x80);
  }

  if (value >= 0) {
    buffer.writeUInt8(value, offset, noAssert);
  } else {
    buffer.writeUInt8(0xff + value + 1, offset, noAssert);
  }
};

function writeInt16(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 1 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fff, -0x8000);
  }

  if (value >= 0) {
    writeUInt16(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt16(buffer, 0xffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt16LE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt16BE = function(value, offset, noAssert) {
  writeInt16(this, value, offset, true, noAssert);
};

function writeInt32(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifsint(value, 0x7fffffff, -0x80000000);
  }

  if (value >= 0) {
    writeUInt32(buffer, value, offset, isBigEndian, noAssert);
  } else {
    writeUInt32(buffer, 0xffffffff + value + 1, offset, isBigEndian, noAssert);
  }
}

Buffer.prototype.writeInt32LE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, false, noAssert);
};

Buffer.prototype.writeInt32BE = function(value, offset, noAssert) {
  writeInt32(this, value, offset, true, noAssert);
};

function writeFloat(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 3 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      23, 4);
}

Buffer.prototype.writeFloatLE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, false, noAssert);
};

Buffer.prototype.writeFloatBE = function(value, offset, noAssert) {
  writeFloat(this, value, offset, true, noAssert);
};

function writeDouble(buffer, value, offset, isBigEndian, noAssert) {
  if (!noAssert) {
    assert.ok(value !== undefined && value !== null,
        'missing value');

    assert.ok(typeof (isBigEndian) === 'boolean',
        'missing or invalid endian');

    assert.ok(offset !== undefined && offset !== null,
        'missing offset');

    assert.ok(offset + 7 < buffer.length,
        'Trying to write beyond buffer length');

    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308);
  }

  require('./buffer_ieee754').writeIEEE754(buffer, value, offset, isBigEndian,
      52, 8);
}

Buffer.prototype.writeDoubleLE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, false, noAssert);
};

Buffer.prototype.writeDoubleBE = function(value, offset, noAssert) {
  writeDouble(this, value, offset, true, noAssert);
};

},{"./buffer_ieee754":34,"assert":30,"base64-js":36}],36:[function(require,module,exports){
(function (exports) {
	'use strict';

	var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	function b64ToByteArray(b64) {
		var i, j, l, tmp, placeHolders, arr;
	
		if (b64.length % 4 > 0) {
			throw 'Invalid string. Length must be a multiple of 4';
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		placeHolders = b64.indexOf('=');
		placeHolders = placeHolders > 0 ? b64.length - placeHolders : 0;

		// base64 is 4/3 + up to two characters of the original data
		arr = [];//new Uint8Array(b64.length * 3 / 4 - placeHolders);

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length;

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (lookup.indexOf(b64[i]) << 18) | (lookup.indexOf(b64[i + 1]) << 12) | (lookup.indexOf(b64[i + 2]) << 6) | lookup.indexOf(b64[i + 3]);
			arr.push((tmp & 0xFF0000) >> 16);
			arr.push((tmp & 0xFF00) >> 8);
			arr.push(tmp & 0xFF);
		}

		if (placeHolders === 2) {
			tmp = (lookup.indexOf(b64[i]) << 2) | (lookup.indexOf(b64[i + 1]) >> 4);
			arr.push(tmp & 0xFF);
		} else if (placeHolders === 1) {
			tmp = (lookup.indexOf(b64[i]) << 10) | (lookup.indexOf(b64[i + 1]) << 4) | (lookup.indexOf(b64[i + 2]) >> 2);
			arr.push((tmp >> 8) & 0xFF);
			arr.push(tmp & 0xFF);
		}

		return arr;
	}

	function uint8ToBase64(uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length;

		function tripletToBase64 (num) {
			return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
		};

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
			output += tripletToBase64(temp);
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1];
				output += lookup[temp >> 2];
				output += lookup[(temp << 4) & 0x3F];
				output += '==';
				break;
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
				output += lookup[temp >> 10];
				output += lookup[(temp >> 4) & 0x3F];
				output += lookup[(temp << 2) & 0x3F];
				output += '=';
				break;
		}

		return output;
	}

	module.exports.toByteArray = b64ToByteArray;
	module.exports.fromByteArray = uint8ToBase64;
}());

},{}],37:[function(require,module,exports){
var Buffer = require('buffer').Buffer;
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

},{"buffer":35}],38:[function(require,module,exports){
var Buffer = require('buffer').Buffer
var sha = require('./sha')
var sha256 = require('./sha256')
var rng = require('./rng')
var md5 = require('./md5')

var algorithms = {
  sha1: sha,
  sha256: sha256,
  md5: md5
}

var blocksize = 64
var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)
function hmac(fn, key, data) {
  if(!Buffer.isBuffer(key)) key = new Buffer(key)
  if(!Buffer.isBuffer(data)) data = new Buffer(data)

  if(key.length > blocksize) {
    key = fn(key)
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = new Buffer(blocksize), opad = new Buffer(blocksize)
  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var hash = fn(Buffer.concat([ipad, data]))
  return fn(Buffer.concat([opad, hash]))
}

function hash(alg, key) {
  alg = alg || 'sha1'
  var fn = algorithms[alg]
  var bufs = []
  var length = 0
  if(!fn) error('algorithm:', alg, 'is not yet supported')
  return {
    update: function (data) {
      if(!Buffer.isBuffer(data)) data = new Buffer(data)
        
      bufs.push(data)
      length += data.length
      return this
    },
    digest: function (enc) {
      var buf = Buffer.concat(bufs)
      var r = key ? hmac(fn, key, buf) : fn(buf)
      bufs = null
      return enc ? r.toString(enc) : r
    }
  }
}

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) { return hash(alg) }
exports.createHmac = function (alg, key) { return hash(alg, key) }
exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)))
    } catch (err) { callback(err) }
  } else {
    return new Buffer(rng(size))
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./md5":39,"./rng":40,"./sha":41,"./sha256":42,"buffer":35}],39:[function(require,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = require('./helpers');

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":37}],40:[function(require,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  if (_global.crypto && crypto.getRandomValues) {
    var _rnds = new Uint32Array(4);
    whatwgRNG = function(size) {
      var bytes = new Array(size);
      crypto.getRandomValues(_rnds);

      for (var c = 0 ; c < size; c++) {
        bytes[c] = _rnds[c >> 2] >>> ((c & 0x03) * 8) & 0xff;
      }
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())

},{}],41:[function(require,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var helpers = require('./helpers');

/*
 * Perform a simple self-test to see if the VM is working
 */
function sha1_vm_test()
{
  return hex_sha1("abc") == "a9993e364706816aba3e25717850c26c9cd0d89d";
}

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function sha1(buf) {
  return helpers.hash(buf, core_sha1, 20, true);
};

},{"./helpers":37}],42:[function(require,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var helpers = require('./helpers');

var safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

var S = function(X, n) {
  return (X >>> n) | (X << (32 - n));
};

var R = function(X, n) {
  return (X >>> n);
};

var Ch = function(x, y, z) {
  return ((x & y) ^ ((~x) & z));
};

var Maj = function(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
};

var Sigma0256 = function(x) {
  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
};

var Sigma1256 = function(x) {
  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
};

var Gamma0256 = function(x) {
  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
};

var Gamma1256 = function(x) {
  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
};

var core_sha256 = function(m, l) {
  var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;
  /* append padding */
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for (var i = 0; i < m.length; i += 16) {
    a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
    for (var j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = m[j + i];
      } else {
        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
      }
      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
      T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
    }
    HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
};

module.exports = function sha256(buf) {
  return helpers.hash(buf, core_sha256, 32, true);
};

},{"./helpers":37}],43:[function(require,module,exports){

},{}],44:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],45:[function(require,module,exports){
(function (sinonChai) {
    "use strict";

    // Module systems magic dance.

    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // NodeJS
        module.exports = sinonChai;
    } else if (typeof define === "function" && define.amd) {
        // AMD
        define(function () {
            return sinonChai;
        });
    } else {
        // Other environment (usually <script> tag): plug in to global chai instance directly.
        chai.use(sinonChai);
    }
}(function sinonChai(chai, utils) {
    "use strict";

    var slice = Array.prototype.slice;

    function isSpy(putativeSpy) {
        return typeof putativeSpy === "function" &&
               typeof putativeSpy.getCall === "function" &&
               typeof putativeSpy.calledWithExactly === "function";
    }

    function isCall(putativeCall) {
        return putativeCall && isSpy(putativeCall.proxy);
    }

    function assertCanWorkWith(assertion) {
        if (!isSpy(assertion._obj) && !isCall(assertion._obj)) {
            throw new TypeError(utils.inspect(assertion._obj) + " is not a spy or a call to a spy!");
        }
    }

    function getMessages(spy, action, nonNegatedSuffix, always, args) {
        var verbPhrase = always ? "always have " : "have ";
        nonNegatedSuffix = nonNegatedSuffix || "";
        if (isSpy(spy.proxy)) {
            spy = spy.proxy;
        }

        function printfArray(array) {
            return spy.printf.apply(spy, array);
        }

        return {
            affirmative: printfArray(["expected %n to " + verbPhrase + action + nonNegatedSuffix].concat(args)),
            negative: printfArray(["expected %n to not " + verbPhrase + action].concat(args))
        };
    }

    function sinonProperty(name, action, nonNegatedSuffix) {
        utils.addProperty(chai.Assertion.prototype, name, function () {
            assertCanWorkWith(this);

            var messages = getMessages(this._obj, action, nonNegatedSuffix, false);
            this.assert(this._obj[name], messages.affirmative, messages.negative);
        });
    }

    function createSinonMethodHandler(sinonName, action, nonNegatedSuffix) {
        return function () {
            assertCanWorkWith(this);

            var alwaysSinonMethod = "always" + sinonName[0].toUpperCase() + sinonName.substring(1);
            var shouldBeAlways = utils.flag(this, "always") && typeof this._obj[alwaysSinonMethod] === "function";
            var sinonMethod = shouldBeAlways ? alwaysSinonMethod : sinonName;

            var messages = getMessages(this._obj, action, nonNegatedSuffix, shouldBeAlways, slice.call(arguments));
            this.assert(this._obj[sinonMethod].apply(this._obj, arguments), messages.affirmative, messages.negative);
        };
    }

    function sinonMethodAsProperty(name, action, nonNegatedSuffix) {
        var handler = createSinonMethodHandler(name, action, nonNegatedSuffix);
        utils.addProperty(chai.Assertion.prototype, name, handler);
    }

    function exceptionalSinonMethod(chaiName, sinonName, action, nonNegatedSuffix) {
        var handler = createSinonMethodHandler(sinonName, action, nonNegatedSuffix);
        utils.addMethod(chai.Assertion.prototype, chaiName, handler);
    }

    function sinonMethod(name, action, nonNegatedSuffix) {
        exceptionalSinonMethod(name, name, action, nonNegatedSuffix);
    }

    utils.addProperty(chai.Assertion.prototype, "always", function () {
        utils.flag(this, "always", true);
    });

    sinonProperty("called", "been called", " at least once, but it was never called");
    sinonProperty("calledOnce", "been called exactly once", ", but it was called %c%C");
    sinonProperty("calledTwice", "been called exactly twice", ", but it was called %c%C");
    sinonProperty("calledThrice", "been called exactly thrice", ", but it was called %c%C");
    sinonMethodAsProperty("calledWithNew", "been called with new");
    sinonMethod("calledBefore", "been called before %1");
    sinonMethod("calledAfter", "been called after %1");
    sinonMethod("calledOn", "been called with %1 as this", ", but it was called with %t instead");
    sinonMethod("calledWith", "been called with arguments %*", "%C");
    sinonMethod("calledWithExactly", "been called with exact arguments %*", "%C");
    sinonMethod("calledWithMatch", "been called with arguments matching %*", "%C");
    sinonMethod("returned", "returned %1");
    exceptionalSinonMethod("thrown", "threw", "thrown %1");
}));

},{}],46:[function(require,module,exports){
/*jslint eqeqeq: false, onevar: false, forin: true, nomen: false, regexp: false, plusplus: false*/
/*global module, require, __dirname, document*/
/**
 * Sinon core utilities. For internal use only.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

var sinon = (function (buster) {
    var div = typeof document != "undefined" && document.createElement("div");
    var hasOwn = Object.prototype.hasOwnProperty;

    function isDOMNode(obj) {
        var success = false;

        try {
            obj.appendChild(div);
            success = div.parentNode == obj;
        } catch (e) {
            return false;
        } finally {
            try {
                obj.removeChild(div);
            } catch (e) {
                // Remove failed, not much we can do about that
            }
        }

        return success;
    }

    function isElement(obj) {
        return div && obj && obj.nodeType === 1 && isDOMNode(obj);
    }

    function isFunction(obj) {
        return typeof obj === "function" || !!(obj && obj.constructor && obj.call && obj.apply);
    }

    function mirrorProperties(target, source) {
        for (var prop in source) {
            if (!hasOwn.call(target, prop)) {
                target[prop] = source[prop];
            }
        }
    }

    function isRestorable (obj) {
        return typeof obj === "function" && typeof obj.restore === "function" && obj.restore.sinon;
    }

    var sinon = {
        wrapMethod: function wrapMethod(object, property, method) {
            if (!object) {
                throw new TypeError("Should wrap property of object");
            }

            if (typeof method != "function") {
                throw new TypeError("Method wrapper should be function");
            }

            var wrappedMethod = object[property];

            if (!isFunction(wrappedMethod)) {
                throw new TypeError("Attempted to wrap " + (typeof wrappedMethod) + " property " +
                                    property + " as function");
            }

            if (wrappedMethod.restore && wrappedMethod.restore.sinon) {
                throw new TypeError("Attempted to wrap " + property + " which is already wrapped");
            }

            if (wrappedMethod.calledBefore) {
                var verb = !!wrappedMethod.returns ? "stubbed" : "spied on";
                throw new TypeError("Attempted to wrap " + property + " which is already " + verb);
            }

            // IE 8 does not support hasOwnProperty on the window object.
            var owned = hasOwn.call(object, property);
            object[property] = method;
            method.displayName = property;

            method.restore = function () {
                // For prototype properties try to reset by delete first.
                // If this fails (ex: localStorage on mobile safari) then force a reset
                // via direct assignment.
                if (!owned) {
                    delete object[property];
                }
                if (object[property] === method) {
                    object[property] = wrappedMethod;
                }
            };

            method.restore.sinon = true;
            mirrorProperties(method, wrappedMethod);

            return method;
        },

        extend: function extend(target) {
            for (var i = 1, l = arguments.length; i < l; i += 1) {
                for (var prop in arguments[i]) {
                    if (arguments[i].hasOwnProperty(prop)) {
                        target[prop] = arguments[i][prop];
                    }

                    // DONT ENUM bug, only care about toString
                    if (arguments[i].hasOwnProperty("toString") &&
                        arguments[i].toString != target.toString) {
                        target.toString = arguments[i].toString;
                    }
                }
            }

            return target;
        },

        create: function create(proto) {
            var F = function () {};
            F.prototype = proto;
            return new F();
        },

        deepEqual: function deepEqual(a, b) {
            if (sinon.match && sinon.match.isMatcher(a)) {
                return a.test(b);
            }
            if (typeof a != "object" || typeof b != "object") {
                return a === b;
            }

            if (isElement(a) || isElement(b)) {
                return a === b;
            }

            if (a === b) {
                return true;
            }

            if ((a === null && b !== null) || (a !== null && b === null)) {
                return false;
            }

            var aString = Object.prototype.toString.call(a);
            if (aString != Object.prototype.toString.call(b)) {
                return false;
            }

            if (aString == "[object Array]") {
                if (a.length !== b.length) {
                    return false;
                }

                for (var i = 0, l = a.length; i < l; i += 1) {
                    if (!deepEqual(a[i], b[i])) {
                        return false;
                    }
                }

                return true;
            }

            if (aString == "[object Date]") {
                return a.valueOf() === b.valueOf();
            }

            var prop, aLength = 0, bLength = 0;

            for (prop in a) {
                aLength += 1;

                if (!deepEqual(a[prop], b[prop])) {
                    return false;
                }
            }

            for (prop in b) {
                bLength += 1;
            }

            return aLength == bLength;
        },

        functionName: function functionName(func) {
            var name = func.displayName || func.name;

            // Use function decomposition as a last resort to get function
            // name. Does not rely on function decomposition to work - if it
            // doesn't debugging will be slightly less informative
            // (i.e. toString will say 'spy' rather than 'myFunc').
            if (!name) {
                var matches = func.toString().match(/function ([^\s\(]+)/);
                name = matches && matches[1];
            }

            return name;
        },

        functionToString: function toString() {
            if (this.getCall && this.callCount) {
                var thisValue, prop, i = this.callCount;

                while (i--) {
                    thisValue = this.getCall(i).thisValue;

                    for (prop in thisValue) {
                        if (thisValue[prop] === this) {
                            return prop;
                        }
                    }
                }
            }

            return this.displayName || "sinon fake";
        },

        getConfig: function (custom) {
            var config = {};
            custom = custom || {};
            var defaults = sinon.defaultConfig;

            for (var prop in defaults) {
                if (defaults.hasOwnProperty(prop)) {
                    config[prop] = custom.hasOwnProperty(prop) ? custom[prop] : defaults[prop];
                }
            }

            return config;
        },

        format: function (val) {
            return "" + val;
        },

        defaultConfig: {
            injectIntoThis: true,
            injectInto: null,
            properties: ["spy", "stub", "mock", "clock", "server", "requests"],
            useFakeTimers: true,
            useFakeServer: true
        },

        timesInWords: function timesInWords(count) {
            return count == 1 && "once" ||
                count == 2 && "twice" ||
                count == 3 && "thrice" ||
                (count || 0) + " times";
        },

        calledInOrder: function (spies) {
            for (var i = 1, l = spies.length; i < l; i++) {
                if (!spies[i - 1].calledBefore(spies[i]) || !spies[i].called) {
                    return false;
                }
            }

            return true;
        },

        orderByFirstCall: function (spies) {
            return spies.sort(function (a, b) {
                // uuid, won't ever be equal
                var aCall = a.getCall(0);
                var bCall = b.getCall(0);
                var aId = aCall && aCall.callId || -1;
                var bId = bCall && bCall.callId || -1;

                return aId < bId ? -1 : 1;
            });
        },

        log: function () {},

        logError: function (label, err) {
            var msg = label + " threw exception: "
            sinon.log(msg + "[" + err.name + "] " + err.message);
            if (err.stack) { sinon.log(err.stack); }

            setTimeout(function () {
                err.message = msg + err.message;
                throw err;
            }, 0);
        },

        typeOf: function (value) {
            if (value === null) {
                return "null";
            }
            else if (value === undefined) {
                return "undefined";
            }
            var string = Object.prototype.toString.call(value);
            return string.substring(8, string.length - 1).toLowerCase();
        },

        createStubInstance: function (constructor) {
            if (typeof constructor !== "function") {
                throw new TypeError("The constructor should be a function.");
            }
            return sinon.stub(sinon.create(constructor.prototype));
        },

        restore: function (object) {
            if (object !== null && typeof object === "object") {
                for (var prop in object) {
                    if (isRestorable(object[prop])) {
                        object[prop].restore();
                    }
                }
            }
            else if (isRestorable(object)) {
                object.restore();
            }
        }
    };

    var isNode = typeof module == "object" && typeof require == "function";

    if (isNode) {
        try {
            buster = { format: require("buster-format") };
        } catch (e) {}
        module.exports = sinon;
        module.exports.spy = require("./sinon/spy");
        module.exports.stub = require("./sinon/stub");
        module.exports.mock = require("./sinon/mock");
        module.exports.collection = require("./sinon/collection");
        module.exports.assert = require("./sinon/assert");
        module.exports.sandbox = require("./sinon/sandbox");
        module.exports.test = require("./sinon/test");
        module.exports.testCase = require("./sinon/test_case");
        module.exports.assert = require("./sinon/assert");
        module.exports.match = require("./sinon/match");
    }

    if (buster) {
        var formatter = sinon.create(buster.format);
        formatter.quoteStrings = false;
        sinon.format = function () {
            return formatter.ascii.apply(formatter, arguments);
        };
    } else if (isNode) {
        try {
            var util = require("util");
            sinon.format = function (value) {
                return typeof value == "object" && value.toString === Object.prototype.toString ? util.inspect(value) : value;
            };
        } catch (e) {
            /* Node, but no util module - would be very old, but better safe than
             sorry */
        }
    }

    return sinon;
}(typeof buster == "object" && buster));

},{"./sinon/assert":47,"./sinon/collection":48,"./sinon/match":49,"./sinon/mock":50,"./sinon/sandbox":51,"./sinon/spy":52,"./sinon/stub":53,"./sinon/test":54,"./sinon/test_case":55,"buster-format":57,"util":33}],47:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Assertions matching the test spy retrieval interface.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon, global) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var slice = Array.prototype.slice;
    var assert;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function verifyIsStub() {
        var method;

        for (var i = 0, l = arguments.length; i < l; ++i) {
            method = arguments[i];

            if (!method) {
                assert.fail("fake is not a spy");
            }

            if (typeof method != "function") {
                assert.fail(method + " is not a function");
            }

            if (typeof method.getCall != "function") {
                assert.fail(method + " is not stubbed");
            }
        }
    }

    function failAssertion(object, msg) {
        object = object || global;
        var failMethod = object.fail || assert.fail;
        failMethod.call(object, msg);
    }

    function mirrorPropAsAssertion(name, method, message) {
        if (arguments.length == 2) {
            message = method;
            method = name;
        }

        assert[name] = function (fake) {
            verifyIsStub(fake);

            var args = slice.call(arguments, 1);
            var failed = false;

            if (typeof method == "function") {
                failed = !method(fake);
            } else {
                failed = typeof fake[method] == "function" ?
                    !fake[method].apply(fake, args) : !fake[method];
            }

            if (failed) {
                failAssertion(this, fake.printf.apply(fake, [message].concat(args)));
            } else {
                assert.pass(name);
            }
        };
    }

    function exposedName(prefix, prop) {
        return !prefix || /^fail/.test(prop) ? prop :
            prefix + prop.slice(0, 1).toUpperCase() + prop.slice(1);
    };

    assert = {
        failException: "AssertError",

        fail: function fail(message) {
            var error = new Error(message);
            error.name = this.failException || assert.failException;

            throw error;
        },

        pass: function pass(assertion) {},

        callOrder: function assertCallOrder() {
            verifyIsStub.apply(null, arguments);
            var expected = "", actual = "";

            if (!sinon.calledInOrder(arguments)) {
                try {
                    expected = [].join.call(arguments, ", ");
                    var calls = slice.call(arguments);
                    var i = calls.length;
                    while (i) {
                        if (!calls[--i].called) {
                            calls.splice(i, 1);
                        }
                    }
                    actual = sinon.orderByFirstCall(calls).join(", ");
                } catch (e) {
                    // If this fails, we'll just fall back to the blank string
                }

                failAssertion(this, "expected " + expected + " to be " +
                              "called in order but were called as " + actual);
            } else {
                assert.pass("callOrder");
            }
        },

        callCount: function assertCallCount(method, count) {
            verifyIsStub(method);

            if (method.callCount != count) {
                var msg = "expected %n to be called " + sinon.timesInWords(count) +
                    " but was called %c%C";
                failAssertion(this, method.printf(msg));
            } else {
                assert.pass("callCount");
            }
        },

        expose: function expose(target, options) {
            if (!target) {
                throw new TypeError("target is null or undefined");
            }

            var o = options || {};
            var prefix = typeof o.prefix == "undefined" && "assert" || o.prefix;
            var includeFail = typeof o.includeFail == "undefined" || !!o.includeFail;

            for (var method in this) {
                if (method != "export" && (includeFail || !/^(fail)/.test(method))) {
                    target[exposedName(prefix, method)] = this[method];
                }
            }

            return target;
        }
    };

    mirrorPropAsAssertion("called", "expected %n to have been called at least once but was never called");
    mirrorPropAsAssertion("notCalled", function (spy) { return !spy.called; },
                          "expected %n to not have been called but was called %c%C");
    mirrorPropAsAssertion("calledOnce", "expected %n to be called once but was called %c%C");
    mirrorPropAsAssertion("calledTwice", "expected %n to be called twice but was called %c%C");
    mirrorPropAsAssertion("calledThrice", "expected %n to be called thrice but was called %c%C");
    mirrorPropAsAssertion("calledOn", "expected %n to be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("alwaysCalledOn", "expected %n to always be called with %1 as this but was called with %t");
    mirrorPropAsAssertion("calledWithNew", "expected %n to be called with new");
    mirrorPropAsAssertion("alwaysCalledWithNew", "expected %n to always be called with new");
    mirrorPropAsAssertion("calledWith", "expected %n to be called with arguments %*%C");
    mirrorPropAsAssertion("calledWithMatch", "expected %n to be called with match %*%C");
    mirrorPropAsAssertion("alwaysCalledWith", "expected %n to always be called with arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithMatch", "expected %n to always be called with match %*%C");
    mirrorPropAsAssertion("calledWithExactly", "expected %n to be called with exact arguments %*%C");
    mirrorPropAsAssertion("alwaysCalledWithExactly", "expected %n to always be called with exact arguments %*%C");
    mirrorPropAsAssertion("neverCalledWith", "expected %n to never be called with arguments %*%C");
    mirrorPropAsAssertion("neverCalledWithMatch", "expected %n to never be called with match %*%C");
    mirrorPropAsAssertion("threw", "%n did not throw exception%C");
    mirrorPropAsAssertion("alwaysThrew", "%n did not always throw exception%C");

    if (commonJSModule) {
        module.exports = assert;
    } else {
        sinon.assert = assert;
    }
}(typeof sinon == "object" && sinon || null, typeof window != "undefined" ? window : (typeof self != "undefined") ? self : global));

},{"../sinon":46}],48:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true*/
/*global module, require, sinon*/
/**
 * Collections of stubs, spies and mocks.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = [].push;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function getFakes(fakeCollection) {
        if (!fakeCollection.fakes) {
            fakeCollection.fakes = [];
        }

        return fakeCollection.fakes;
    }

    function each(fakeCollection, method) {
        var fakes = getFakes(fakeCollection);

        for (var i = 0, l = fakes.length; i < l; i += 1) {
            if (typeof fakes[i][method] == "function") {
                fakes[i][method]();
            }
        }
    }

    function compact(fakeCollection) {
        var fakes = getFakes(fakeCollection);
        var i = 0;
        while (i < fakes.length) {
          fakes.splice(i, 1);
        }
    }

    var collection = {
        verify: function resolve() {
            each(this, "verify");
        },

        restore: function restore() {
            each(this, "restore");
            compact(this);
        },

        verifyAndRestore: function verifyAndRestore() {
            var exception;

            try {
                this.verify();
            } catch (e) {
                exception = e;
            }

            this.restore();

            if (exception) {
                throw exception;
            }
        },

        add: function add(fake) {
            push.call(getFakes(this), fake);
            return fake;
        },

        spy: function spy() {
            return this.add(sinon.spy.apply(sinon, arguments));
        },

        stub: function stub(object, property, value) {
            if (property) {
                var original = object[property];

                if (typeof original != "function") {
                    if (!hasOwnProperty.call(object, property)) {
                        throw new TypeError("Cannot stub non-existent own property " + property);
                    }

                    object[property] = value;

                    return this.add({
                        restore: function () {
                            object[property] = original;
                        }
                    });
                }
            }
            if (!property && !!object && typeof object == "object") {
                var stubbedObj = sinon.stub.apply(sinon, arguments);

                for (var prop in stubbedObj) {
                    if (typeof stubbedObj[prop] === "function") {
                        this.add(stubbedObj[prop]);
                    }
                }

                return stubbedObj;
            }

            return this.add(sinon.stub.apply(sinon, arguments));
        },

        mock: function mock() {
            return this.add(sinon.mock.apply(sinon, arguments));
        },

        inject: function inject(obj) {
            var col = this;

            obj.spy = function () {
                return col.spy.apply(col, arguments);
            };

            obj.stub = function () {
                return col.stub.apply(col, arguments);
            };

            obj.mock = function () {
                return col.mock.apply(col, arguments);
            };

            return obj;
        }
    };

    if (commonJSModule) {
        module.exports = collection;
    } else {
        sinon.collection = collection;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],49:[function(require,module,exports){
/* @depend ../sinon.js */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
 * Match functions
 *
 * @author Maximilian Antoni (mail@maxantoni.de)
 * @license BSD
 *
 * Copyright (c) 2012 Maximilian Antoni
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function assertType(value, type, name) {
        var actual = sinon.typeOf(value);
        if (actual !== type) {
            throw new TypeError("Expected type of " + name + " to be " +
                type + ", but was " + actual);
        }
    }

    var matcher = {
        toString: function () {
            return this.message;
        }
    };

    function isMatcher(object) {
        return matcher.isPrototypeOf(object);
    }

    function matchObject(expectation, actual) {
        if (actual === null || actual === undefined) {
            return false;
        }
        for (var key in expectation) {
            if (expectation.hasOwnProperty(key)) {
                var exp = expectation[key];
                var act = actual[key];
                if (match.isMatcher(exp)) {
                    if (!exp.test(act)) {
                        return false;
                    }
                } else if (sinon.typeOf(exp) === "object") {
                    if (!matchObject(exp, act)) {
                        return false;
                    }
                } else if (!sinon.deepEqual(exp, act)) {
                    return false;
                }
            }
        }
        return true;
    }

    matcher.or = function (m2) {
        if (!isMatcher(m2)) {
            throw new TypeError("Matcher expected");
        }
        var m1 = this;
        var or = sinon.create(matcher);
        or.test = function (actual) {
            return m1.test(actual) || m2.test(actual);
        };
        or.message = m1.message + ".or(" + m2.message + ")";
        return or;
    };

    matcher.and = function (m2) {
        if (!isMatcher(m2)) {
            throw new TypeError("Matcher expected");
        }
        var m1 = this;
        var and = sinon.create(matcher);
        and.test = function (actual) {
            return m1.test(actual) && m2.test(actual);
        };
        and.message = m1.message + ".and(" + m2.message + ")";
        return and;
    };

    var match = function (expectation, message) {
        var m = sinon.create(matcher);
        var type = sinon.typeOf(expectation);
        switch (type) {
        case "object":
            if (typeof expectation.test === "function") {
                m.test = function (actual) {
                    return expectation.test(actual) === true;
                };
                m.message = "match(" + sinon.functionName(expectation.test) + ")";
                return m;
            }
            var str = [];
            for (var key in expectation) {
                if (expectation.hasOwnProperty(key)) {
                    str.push(key + ": " + expectation[key]);
                }
            }
            m.test = function (actual) {
                return matchObject(expectation, actual);
            };
            m.message = "match(" + str.join(", ") + ")";
            break;
        case "number":
            m.test = function (actual) {
                return expectation == actual;
            };
            break;
        case "string":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return actual.indexOf(expectation) !== -1;
            };
            m.message = "match(\"" + expectation + "\")";
            break;
        case "regexp":
            m.test = function (actual) {
                if (typeof actual !== "string") {
                    return false;
                }
                return expectation.test(actual);
            };
            break;
        case "function":
            m.test = expectation;
            if (message) {
                m.message = message;
            } else {
                m.message = "match(" + sinon.functionName(expectation) + ")";
            }
            break;
        default:
            m.test = function (actual) {
              return sinon.deepEqual(expectation, actual);
            };
        }
        if (!m.message) {
            m.message = "match(" + expectation + ")";
        }
        return m;
    };

    match.isMatcher = isMatcher;

    match.any = match(function () {
        return true;
    }, "any");

    match.defined = match(function (actual) {
        return actual !== null && actual !== undefined;
    }, "defined");

    match.truthy = match(function (actual) {
        return !!actual;
    }, "truthy");

    match.falsy = match(function (actual) {
        return !actual;
    }, "falsy");

    match.same = function (expectation) {
        return match(function (actual) {
            return expectation === actual;
        }, "same(" + expectation + ")");
    };

    match.typeOf = function (type) {
        assertType(type, "string", "type");
        return match(function (actual) {
            return sinon.typeOf(actual) === type;
        }, "typeOf(\"" + type + "\")");
    };

    match.instanceOf = function (type) {
        assertType(type, "function", "type");
        return match(function (actual) {
            return actual instanceof type;
        }, "instanceOf(" + sinon.functionName(type) + ")");
    };

    function createPropertyMatcher(propertyTest, messagePrefix) {
        return function (property, value) {
            assertType(property, "string", "property");
            var onlyProperty = arguments.length === 1;
            var message = messagePrefix + "(\"" + property + "\"";
            if (!onlyProperty) {
                message += ", " + value;
            }
            message += ")";
            return match(function (actual) {
                if (actual === undefined || actual === null ||
                        !propertyTest(actual, property)) {
                    return false;
                }
                return onlyProperty || sinon.deepEqual(value, actual[property]);
            }, message);
        };
    }

    match.has = createPropertyMatcher(function (actual, property) {
        if (typeof actual === "object") {
            return property in actual;
        }
        return actual[property] !== undefined;
    }, "has");

    match.hasOwn = createPropertyMatcher(function (actual, property) {
        return actual.hasOwnProperty(property);
    }, "hasOwn");

    match.bool = match.typeOf("boolean");
    match.number = match.typeOf("number");
    match.string = match.typeOf("string");
    match.object = match.typeOf("object");
    match.func = match.typeOf("function");
    match.array = match.typeOf("array");
    match.regexp = match.typeOf("regexp");
    match.date = match.typeOf("date");

    if (commonJSModule) {
        module.exports = match;
    } else {
        sinon.match = match;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],50:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 */
/*jslint eqeqeq: false, onevar: false, nomen: false*/
/*global module, require, sinon*/
/**
 * Mock functions.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = [].push;

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function mock(object) {
        if (!object) {
            return sinon.expectation.create("Anonymous mock");
        }

        return mock.create(object);
    }

    sinon.mock = mock;

    sinon.extend(mock, (function () {
        function each(collection, callback) {
            if (!collection) {
                return;
            }

            for (var i = 0, l = collection.length; i < l; i += 1) {
                callback(collection[i]);
            }
        }

        return {
            create: function create(object) {
                if (!object) {
                    throw new TypeError("object is null");
                }

                var mockObject = sinon.extend({}, mock);
                mockObject.object = object;
                delete mockObject.create;

                return mockObject;
            },

            expects: function expects(method) {
                if (!method) {
                    throw new TypeError("method is falsy");
                }

                if (!this.expectations) {
                    this.expectations = {};
                    this.proxies = [];
                }

                if (!this.expectations[method]) {
                    this.expectations[method] = [];
                    var mockObject = this;

                    sinon.wrapMethod(this.object, method, function () {
                        return mockObject.invokeMethod(method, this, arguments);
                    });

                    push.call(this.proxies, method);
                }

                var expectation = sinon.expectation.create(method);
                push.call(this.expectations[method], expectation);

                return expectation;
            },

            restore: function restore() {
                var object = this.object;

                each(this.proxies, function (proxy) {
                    if (typeof object[proxy].restore == "function") {
                        object[proxy].restore();
                    }
                });
            },

            verify: function verify() {
                var expectations = this.expectations || {};
                var messages = [], met = [];

                each(this.proxies, function (proxy) {
                    each(expectations[proxy], function (expectation) {
                        if (!expectation.met()) {
                            push.call(messages, expectation.toString());
                        } else {
                            push.call(met, expectation.toString());
                        }
                    });
                });

                this.restore();

                if (messages.length > 0) {
                    sinon.expectation.fail(messages.concat(met).join("\n"));
                } else {
                    sinon.expectation.pass(messages.concat(met).join("\n"));
                }

                return true;
            },

            invokeMethod: function invokeMethod(method, thisValue, args) {
                var expectations = this.expectations && this.expectations[method];
                var length = expectations && expectations.length || 0, i;

                for (i = 0; i < length; i += 1) {
                    if (!expectations[i].met() &&
                        expectations[i].allowsCall(thisValue, args)) {
                        return expectations[i].apply(thisValue, args);
                    }
                }

                var messages = [], available, exhausted = 0;

                for (i = 0; i < length; i += 1) {
                    if (expectations[i].allowsCall(thisValue, args)) {
                        available = available || expectations[i];
                    } else {
                        exhausted += 1;
                    }
                    push.call(messages, "    " + expectations[i].toString());
                }

                if (exhausted === 0) {
                    return available.apply(thisValue, args);
                }

                messages.unshift("Unexpected call: " + sinon.spyCall.toString.call({
                    proxy: method,
                    args: args
                }));

                sinon.expectation.fail(messages.join("\n"));
            }
        };
    }()));

    var times = sinon.timesInWords;

    sinon.expectation = (function () {
        var slice = Array.prototype.slice;
        var _invoke = sinon.spy.invoke;

        function callCountInWords(callCount) {
            if (callCount == 0) {
                return "never called";
            } else {
                return "called " + times(callCount);
            }
        }

        function expectedCallCountInWords(expectation) {
            var min = expectation.minCalls;
            var max = expectation.maxCalls;

            if (typeof min == "number" && typeof max == "number") {
                var str = times(min);

                if (min != max) {
                    str = "at least " + str + " and at most " + times(max);
                }

                return str;
            }

            if (typeof min == "number") {
                return "at least " + times(min);
            }

            return "at most " + times(max);
        }

        function receivedMinCalls(expectation) {
            var hasMinLimit = typeof expectation.minCalls == "number";
            return !hasMinLimit || expectation.callCount >= expectation.minCalls;
        }

        function receivedMaxCalls(expectation) {
            if (typeof expectation.maxCalls != "number") {
                return false;
            }

            return expectation.callCount == expectation.maxCalls;
        }

        return {
            minCalls: 1,
            maxCalls: 1,

            create: function create(methodName) {
                var expectation = sinon.extend(sinon.stub.create(), sinon.expectation);
                delete expectation.create;
                expectation.method = methodName;

                return expectation;
            },

            invoke: function invoke(func, thisValue, args) {
                this.verifyCallAllowed(thisValue, args);

                return _invoke.apply(this, arguments);
            },

            atLeast: function atLeast(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.maxCalls = null;
                    this.limitsSet = true;
                }

                this.minCalls = num;

                return this;
            },

            atMost: function atMost(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not number");
                }

                if (!this.limitsSet) {
                    this.minCalls = null;
                    this.limitsSet = true;
                }

                this.maxCalls = num;

                return this;
            },

            never: function never() {
                return this.exactly(0);
            },

            once: function once() {
                return this.exactly(1);
            },

            twice: function twice() {
                return this.exactly(2);
            },

            thrice: function thrice() {
                return this.exactly(3);
            },

            exactly: function exactly(num) {
                if (typeof num != "number") {
                    throw new TypeError("'" + num + "' is not a number");
                }

                this.atLeast(num);
                return this.atMost(num);
            },

            met: function met() {
                return !this.failed && receivedMinCalls(this);
            },

            verifyCallAllowed: function verifyCallAllowed(thisValue, args) {
                if (receivedMaxCalls(this)) {
                    this.failed = true;
                    sinon.expectation.fail(this.method + " already called " + times(this.maxCalls));
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    sinon.expectation.fail(this.method + " called with " + thisValue + " as thisValue, expected " +
                        this.expectedThis);
                }

                if (!("expectedArguments" in this)) {
                    return;
                }

                if (!args) {
                    sinon.expectation.fail(this.method + " received no arguments, expected " +
                        sinon.format(this.expectedArguments));
                }

                if (args.length < this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too few arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    sinon.expectation.fail(this.method + " received too many arguments (" + sinon.format(args) +
                        "), expected " + sinon.format(this.expectedArguments));
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        sinon.expectation.fail(this.method + " received wrong arguments " + sinon.format(args) +
                            ", expected " + sinon.format(this.expectedArguments));
                    }
                }
            },

            allowsCall: function allowsCall(thisValue, args) {
                if (this.met() && receivedMaxCalls(this)) {
                    return false;
                }

                if ("expectedThis" in this && this.expectedThis !== thisValue) {
                    return false;
                }

                if (!("expectedArguments" in this)) {
                    return true;
                }

                args = args || [];

                if (args.length < this.expectedArguments.length) {
                    return false;
                }

                if (this.expectsExactArgCount &&
                    args.length != this.expectedArguments.length) {
                    return false;
                }

                for (var i = 0, l = this.expectedArguments.length; i < l; i += 1) {
                    if (!sinon.deepEqual(this.expectedArguments[i], args[i])) {
                        return false;
                    }
                }

                return true;
            },

            withArgs: function withArgs() {
                this.expectedArguments = slice.call(arguments);
                return this;
            },

            withExactArgs: function withExactArgs() {
                this.withArgs.apply(this, arguments);
                this.expectsExactArgCount = true;
                return this;
            },

            on: function on(thisValue) {
                this.expectedThis = thisValue;
                return this;
            },

            toString: function () {
                var args = (this.expectedArguments || []).slice();

                if (!this.expectsExactArgCount) {
                    push.call(args, "[...]");
                }

                var callStr = sinon.spyCall.toString.call({
                    proxy: this.method || "anonymous mock expectation",
                    args: args
                });

                var message = callStr.replace(", [...", "[, ...") + " " +
                    expectedCallCountInWords(this);

                if (this.met()) {
                    return "Expectation met: " + message;
                }

                return "Expected " + message + " (" +
                    callCountInWords(this.callCount) + ")";
            },

            verify: function verify() {
                if (!this.met()) {
                    sinon.expectation.fail(this.toString());
                } else {
                    sinon.expectation.pass(this.toString());
                }

                return true;
            },

            pass: function(message) {
              sinon.assert.pass(message);
            },
            fail: function (message) {
                var exception = new Error(message);
                exception.name = "ExpectationError";

                throw exception;
            }
        };
    }());

    if (commonJSModule) {
        module.exports = mock;
    } else {
        sinon.mock = mock;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],51:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend collection.js
 * @depend util/fake_timers.js
 * @depend util/fake_server_with_clock.js
 */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global require, module*/
/**
 * Manages fake collections as well as fake utilities such as Sinon's
 * timers and fake XHR implementation in one convenient object.
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

if (typeof module == "object" && typeof require == "function") {
    var sinon = require("../sinon");
    sinon.extend(sinon, require("./util/fake_timers"));
}

(function () {
    var push = [].push;

    function exposeValue(sandbox, config, key, value) {
        if (!value) {
            return;
        }

        if (config.injectInto) {
            config.injectInto[key] = value;
        } else {
            push.call(sandbox.args, value);
        }
    }

    function prepareSandboxFromConfig(config) {
        var sandbox = sinon.create(sinon.sandbox);

        if (config.useFakeServer) {
            if (typeof config.useFakeServer == "object") {
                sandbox.serverPrototype = config.useFakeServer;
            }

            sandbox.useFakeServer();
        }

        if (config.useFakeTimers) {
            if (typeof config.useFakeTimers == "object") {
                sandbox.useFakeTimers.apply(sandbox, config.useFakeTimers);
            } else {
                sandbox.useFakeTimers();
            }
        }

        return sandbox;
    }

    sinon.sandbox = sinon.extend(sinon.create(sinon.collection), {
        useFakeTimers: function useFakeTimers() {
            this.clock = sinon.useFakeTimers.apply(sinon, arguments);

            return this.add(this.clock);
        },

        serverPrototype: sinon.fakeServer,

        useFakeServer: function useFakeServer() {
            var proto = this.serverPrototype || sinon.fakeServer;

            if (!proto || !proto.create) {
                return null;
            }

            this.server = proto.create();
            return this.add(this.server);
        },

        inject: function (obj) {
            sinon.collection.inject.call(this, obj);

            if (this.clock) {
                obj.clock = this.clock;
            }

            if (this.server) {
                obj.server = this.server;
                obj.requests = this.server.requests;
            }

            return obj;
        },

        create: function (config) {
            if (!config) {
                return sinon.create(sinon.sandbox);
            }

            var sandbox = prepareSandboxFromConfig(config);
            sandbox.args = sandbox.args || [];
            var prop, value, exposed = sandbox.inject({});

            if (config.properties) {
                for (var i = 0, l = config.properties.length; i < l; i++) {
                    prop = config.properties[i];
                    value = exposed[prop] || prop == "sandbox" && sandbox;
                    exposeValue(sandbox, config, prop, value);
                }
            } else {
                exposeValue(sandbox, config, "sandbox", value);
            }

            return sandbox;
        }
    });

    sinon.sandbox.useFakeXMLHttpRequest = sinon.sandbox.useFakeServer;

    if (typeof module == "object" && typeof require == "function") {
        module.exports = sinon.sandbox;
    }
}());

},{"../sinon":46,"./util/fake_timers":56}],52:[function(require,module,exports){
/**
  * @depend ../sinon.js
  * @depend match.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy calls
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @author Maximilian Antoni (mail@maxantoni.de)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  * Copyright (c) 2013 Maximilian Antoni
  */
"use strict";

var commonJSModule = typeof module == "object" && typeof require == "function";

if (!this.sinon && commonJSModule) {
    var sinon = require("../sinon");
}

(function (sinon) {
    function throwYieldError(proxy, text, args) {
        var msg = sinon.functionName(proxy) + text;
        if (args.length) {
            msg += " Received [" + slice.call(args).join(", ") + "]";
        }
        throw new Error(msg);
    }

    var slice = Array.prototype.slice;

    var callProto = {
        calledOn: function calledOn(thisValue) {
            if (sinon.match && sinon.match.isMatcher(thisValue)) {
                return thisValue.test(this.thisValue);
            }
            return this.thisValue === thisValue;
        },

        calledWith: function calledWith() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                if (!sinon.deepEqual(arguments[i], this.args[i])) {
                    return false;
                }
            }

            return true;
        },

        calledWithMatch: function calledWithMatch() {
            for (var i = 0, l = arguments.length; i < l; i += 1) {
                var actual = this.args[i];
                var expectation = arguments[i];
                if (!sinon.match || !sinon.match(expectation).test(actual)) {
                    return false;
                }
            }
            return true;
        },

        calledWithExactly: function calledWithExactly() {
            return arguments.length == this.args.length &&
                this.calledWith.apply(this, arguments);
        },

        notCalledWith: function notCalledWith() {
            return !this.calledWith.apply(this, arguments);
        },

        notCalledWithMatch: function notCalledWithMatch() {
            return !this.calledWithMatch.apply(this, arguments);
        },

        returned: function returned(value) {
            return sinon.deepEqual(value, this.returnValue);
        },

        threw: function threw(error) {
            if (typeof error === "undefined" || !this.exception) {
                return !!this.exception;
            }

            return this.exception === error || this.exception.name === error;
        },

        calledWithNew: function calledWithNew(thisValue) {
            return this.thisValue instanceof this.proxy;
        },

        calledBefore: function (other) {
            return this.callId < other.callId;
        },

        calledAfter: function (other) {
            return this.callId > other.callId;
        },

        callArg: function (pos) {
            this.args[pos]();
        },

        callArgOn: function (pos, thisValue) {
            this.args[pos].apply(thisValue);
        },

        callArgWith: function (pos) {
            this.callArgOnWith.apply(this, [pos, null].concat(slice.call(arguments, 1)));
        },

        callArgOnWith: function (pos, thisValue) {
            var args = slice.call(arguments, 2);
            this.args[pos].apply(thisValue, args);
        },

        "yield": function () {
            this.yieldOn.apply(this, [null].concat(slice.call(arguments, 0)));
        },

        yieldOn: function (thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (typeof args[i] === "function") {
                    args[i].apply(thisValue, slice.call(arguments, 1));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield since no callback was passed.", args);
        },

        yieldTo: function (prop) {
            this.yieldToOn.apply(this, [prop, null].concat(slice.call(arguments, 1)));
        },

        yieldToOn: function (prop, thisValue) {
            var args = this.args;
            for (var i = 0, l = args.length; i < l; ++i) {
                if (args[i] && typeof args[i][prop] === "function") {
                    args[i][prop].apply(thisValue, slice.call(arguments, 2));
                    return;
                }
            }
            throwYieldError(this.proxy, " cannot yield to '" + prop +
                "' since no callback was passed.", args);
        },

        toString: function () {
            var callStr = this.proxy.toString() + "(";
            var args = [];

            for (var i = 0, l = this.args.length; i < l; ++i) {
                args.push(sinon.format(this.args[i]));
            }

            callStr = callStr + args.join(", ") + ")";

            if (typeof this.returnValue != "undefined") {
                callStr += " => " + sinon.format(this.returnValue);
            }

            if (this.exception) {
                callStr += " !" + this.exception.name;

                if (this.exception.message) {
                    callStr += "(" + this.exception.message + ")";
                }
            }

            return callStr;
        }
    };

    callProto.invokeCallback = callProto.yield;

    function createSpyCall(spy, thisValue, args, returnValue, exception, id) {
        if (typeof id !== "number") {
            throw new TypeError("Call id is not a number");
        }
        var proxyCall = sinon.create(callProto);
        proxyCall.proxy = spy;
        proxyCall.thisValue = thisValue;
        proxyCall.args = args;
        proxyCall.returnValue = returnValue;
        proxyCall.exception = exception;
        proxyCall.callId = id;

        return proxyCall;
    };
    createSpyCall.toString = callProto.toString; // used by mocks

    sinon.spyCall = createSpyCall;
}(typeof sinon == "object" && sinon || null));

/**
  * @depend ../sinon.js
  */
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global module, require, sinon*/
/**
  * Spy functions
  *
  * @author Christian Johansen (christian@cjohansen.no)
  * @license BSD
  *
  * Copyright (c) 2010-2013 Christian Johansen
  */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";
    var push = Array.prototype.push;
    var slice = Array.prototype.slice;
    var callId = 0;

    function spy(object, property) {
        if (!property && typeof object == "function") {
            return spy.create(object);
        }

        if (!object && !property) {
            return spy.create(function () { });
        }

        var method = object[property];
        return sinon.wrapMethod(object, property, spy.create(method));
    }

    function matchingFake(fakes, args, strict) {
        if (!fakes) {
            return;
        }

        var alen = args.length;

        for (var i = 0, l = fakes.length; i < l; i++) {
            if (fakes[i].matches(args, strict)) {
                return fakes[i];
            }
        }
    }

    function incrementCallCount() {
        this.called = true;
        this.callCount += 1;
        this.notCalled = false;
        this.calledOnce = this.callCount == 1;
        this.calledTwice = this.callCount == 2;
        this.calledThrice = this.callCount == 3;
    }

    function createCallProperties() {
        this.firstCall = this.getCall(0);
        this.secondCall = this.getCall(1);
        this.thirdCall = this.getCall(2);
        this.lastCall = this.getCall(this.callCount - 1);
    }

    var vars = "a,b,c,d,e,f,g,h,i,j,k,l";
    function createProxy(func) {
        // Retain the function length:
        var p;
        if (func.length) {
            eval("p = (function proxy(" + vars.substring(0, func.length * 2 - 1) +
                ") { return p.invoke(func, this, slice.call(arguments)); });");
        }
        else {
            p = function proxy() {
                return p.invoke(func, this, slice.call(arguments));
            };
        }
        return p;
    }

    var uuid = 0;

    // Public API
    var spyApi = {
        reset: function () {
            this.called = false;
            this.notCalled = true;
            this.calledOnce = false;
            this.calledTwice = false;
            this.calledThrice = false;
            this.callCount = 0;
            this.firstCall = null;
            this.secondCall = null;
            this.thirdCall = null;
            this.lastCall = null;
            this.args = [];
            this.returnValues = [];
            this.thisValues = [];
            this.exceptions = [];
            this.callIds = [];
            if (this.fakes) {
                for (var i = 0; i < this.fakes.length; i++) {
                    this.fakes[i].reset();
                }
            }
        },

        create: function create(func) {
            var name;

            if (typeof func != "function") {
                func = function () { };
            } else {
                name = sinon.functionName(func);
            }

            var proxy = createProxy(func);

            sinon.extend(proxy, spy);
            delete proxy.create;
            sinon.extend(proxy, func);

            proxy.reset();
            proxy.prototype = func.prototype;
            proxy.displayName = name || "spy";
            proxy.toString = sinon.functionToString;
            proxy._create = sinon.spy.create;
            proxy.id = "spy#" + uuid++;

            return proxy;
        },

        invoke: function invoke(func, thisValue, args) {
            var matching = matchingFake(this.fakes, args);
            var exception, returnValue;

            incrementCallCount.call(this);
            push.call(this.thisValues, thisValue);
            push.call(this.args, args);
            push.call(this.callIds, callId++);

            try {
                if (matching) {
                    returnValue = matching.invoke(func, thisValue, args);
                } else {
                    returnValue = (this.func || func).apply(thisValue, args);
                }
            } catch (e) {
                push.call(this.returnValues, undefined);
                exception = e;
                throw e;
            } finally {
                push.call(this.exceptions, exception);
            }

            push.call(this.returnValues, returnValue);

            createCallProperties.call(this);

            return returnValue;
        },

        getCall: function getCall(i) {
            if (i < 0 || i >= this.callCount) {
                return null;
            }

            return sinon.spyCall(this, this.thisValues[i], this.args[i],
                                    this.returnValues[i], this.exceptions[i],
                                    this.callIds[i]);
        },

        calledBefore: function calledBefore(spyFn) {
            if (!this.called) {
                return false;
            }

            if (!spyFn.called) {
                return true;
            }

            return this.callIds[0] < spyFn.callIds[spyFn.callIds.length - 1];
        },

        calledAfter: function calledAfter(spyFn) {
            if (!this.called || !spyFn.called) {
                return false;
            }

            return this.callIds[this.callCount - 1] > spyFn.callIds[spyFn.callCount - 1];
        },

        withArgs: function () {
            var args = slice.call(arguments);

            if (this.fakes) {
                var match = matchingFake(this.fakes, args, true);

                if (match) {
                    return match;
                }
            } else {
                this.fakes = [];
            }

            var original = this;
            var fake = this._create();
            fake.matchingAguments = args;
            push.call(this.fakes, fake);

            fake.withArgs = function () {
                return original.withArgs.apply(original, arguments);
            };

            for (var i = 0; i < this.args.length; i++) {
                if (fake.matches(this.args[i])) {
                    incrementCallCount.call(fake);
                    push.call(fake.thisValues, this.thisValues[i]);
                    push.call(fake.args, this.args[i]);
                    push.call(fake.returnValues, this.returnValues[i]);
                    push.call(fake.exceptions, this.exceptions[i]);
                    push.call(fake.callIds, this.callIds[i]);
                }
            }
            createCallProperties.call(fake);

            return fake;
        },

        matches: function (args, strict) {
            var margs = this.matchingAguments;

            if (margs.length <= args.length &&
                sinon.deepEqual(margs, args.slice(0, margs.length))) {
                return !strict || margs.length == args.length;
            }
        },

        printf: function (format) {
            var spy = this;
            var args = slice.call(arguments, 1);
            var formatter;

            return (format || "").replace(/%(.)/g, function (match, specifyer) {
                formatter = spyApi.formatters[specifyer];

                if (typeof formatter == "function") {
                    return formatter.call(null, spy, args);
                } else if (!isNaN(parseInt(specifyer), 10)) {
                    return sinon.format(args[specifyer - 1]);
                }

                return "%" + specifyer;
            });
        }
    };

    function delegateToCalls(method, matchAny, actual, notCalled) {
        spyApi[method] = function () {
            if (!this.called) {
                if (notCalled) {
                    return notCalled.apply(this, arguments);
                }
                return false;
            }

            var currentCall;
            var matches = 0;

            for (var i = 0, l = this.callCount; i < l; i += 1) {
                currentCall = this.getCall(i);

                if (currentCall[actual || method].apply(currentCall, arguments)) {
                    matches += 1;

                    if (matchAny) {
                        return true;
                    }
                }
            }

            return matches === this.callCount;
        };
    }

    delegateToCalls("calledOn", true);
    delegateToCalls("alwaysCalledOn", false, "calledOn");
    delegateToCalls("calledWith", true);
    delegateToCalls("calledWithMatch", true);
    delegateToCalls("alwaysCalledWith", false, "calledWith");
    delegateToCalls("alwaysCalledWithMatch", false, "calledWithMatch");
    delegateToCalls("calledWithExactly", true);
    delegateToCalls("alwaysCalledWithExactly", false, "calledWithExactly");
    delegateToCalls("neverCalledWith", false, "notCalledWith",
        function () { return true; });
    delegateToCalls("neverCalledWithMatch", false, "notCalledWithMatch",
        function () { return true; });
    delegateToCalls("threw", true);
    delegateToCalls("alwaysThrew", false, "threw");
    delegateToCalls("returned", true);
    delegateToCalls("alwaysReturned", false, "returned");
    delegateToCalls("calledWithNew", true);
    delegateToCalls("alwaysCalledWithNew", false, "calledWithNew");
    delegateToCalls("callArg", false, "callArgWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgWith = spyApi.callArg;
    delegateToCalls("callArgOn", false, "callArgOnWith", function () {
        throw new Error(this.toString() + " cannot call arg since it was not yet invoked.");
    });
    spyApi.callArgOnWith = spyApi.callArgOn;
    delegateToCalls("yield", false, "yield", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    // "invokeCallback" is an alias for "yield" since "yield" is invalid in strict mode.
    spyApi.invokeCallback = spyApi.yield;
    delegateToCalls("yieldOn", false, "yieldOn", function () {
        throw new Error(this.toString() + " cannot yield since it was not yet invoked.");
    });
    delegateToCalls("yieldTo", false, "yieldTo", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });
    delegateToCalls("yieldToOn", false, "yieldToOn", function (property) {
        throw new Error(this.toString() + " cannot yield to '" + property +
            "' since it was not yet invoked.");
    });

    spyApi.formatters = {
        "c": function (spy) {
            return sinon.timesInWords(spy.callCount);
        },

        "n": function (spy) {
            return spy.toString();
        },

        "C": function (spy) {
            var calls = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                var stringifiedCall = "    " + spy.getCall(i).toString();
                if (/\n/.test(calls[i - 1])) {
                    stringifiedCall = "\n" + stringifiedCall;
                }
                push.call(calls, stringifiedCall);
            }

            return calls.length > 0 ? "\n" + calls.join("\n") : "";
        },

        "t": function (spy) {
            var objects = [];

            for (var i = 0, l = spy.callCount; i < l; ++i) {
                push.call(objects, sinon.format(spy.thisValues[i]));
            }

            return objects.join(", ");
        },

        "*": function (spy, args) {
            var formatted = [];

            for (var i = 0, l = args.length; i < l; ++i) {
                push.call(formatted, sinon.format(args[i]));
            }

            return formatted.join(", ");
        }
    };

    sinon.extend(spy, spyApi);

    spy.spyCall = sinon.spyCall;

    if (commonJSModule) {
        module.exports = spy;
    } else {
        sinon.spy = spy;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],53:[function(require,module,exports){
var process=require("__browserify_process");/**
 * @depend ../sinon.js
 * @depend spy.js
 */
/*jslint eqeqeq: false, onevar: false*/
/*global module, require, sinon*/
/**
 * Stub functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function stub(object, property, func) {
        if (!!func && typeof func != "function") {
            throw new TypeError("Custom stub should be function");
        }

        var wrapper;

        if (func) {
            wrapper = sinon.spy && sinon.spy.create ? sinon.spy.create(func) : func;
        } else {
            wrapper = stub.create();
        }

        if (!object && !property) {
            return sinon.stub.create();
        }

        if (!property && !!object && typeof object == "object") {
            for (var prop in object) {
                if (typeof object[prop] === "function") {
                    stub(object, prop);
                }
            }

            return object;
        }

        return sinon.wrapMethod(object, property, wrapper);
    }

    function getChangingValue(stub, property) {
        var index = stub.callCount - 1;
        var values = stub[property];
        var prop = index in values ? values[index] : values[values.length - 1];
        stub[property + "Last"] = prop;

        return prop;
    }

    function getCallback(stub, args) {
        var callArgAt = getChangingValue(stub, "callArgAts");

        if (callArgAt < 0) {
            var callArgProp = getChangingValue(stub, "callArgProps");

            for (var i = 0, l = args.length; i < l; ++i) {
                if (!callArgProp && typeof args[i] == "function") {
                    return args[i];
                }

                if (callArgProp && args[i] &&
                    typeof args[i][callArgProp] == "function") {
                    return args[i][callArgProp];
                }
            }

            return null;
        }

        return args[callArgAt];
    }

    var join = Array.prototype.join;

    function getCallbackError(stub, func, args) {
        if (stub.callArgAtsLast < 0) {
            var msg;

            if (stub.callArgPropsLast) {
                msg = sinon.functionName(stub) +
                    " expected to yield to '" + stub.callArgPropsLast +
                    "', but no object with such a property was passed."
            } else {
                msg = sinon.functionName(stub) +
                            " expected to yield, but no callback was passed."
            }

            if (args.length > 0) {
                msg += " Received [" + join.call(args, ", ") + "]";
            }

            return msg;
        }

        return "argument at index " + stub.callArgAtsLast + " is not a function: " + func;
    }

    var nextTick = (function () {
        if (typeof process === "object" && typeof process.nextTick === "function") {
            return process.nextTick;
        } else if (typeof setImmediate === "function") {
            return setImmediate;
        } else {
            return function (callback) {
                setTimeout(callback, 0);
            };
        }
    })();

    function callCallback(stub, args) {
        if (stub.callArgAts.length > 0) {
            var func = getCallback(stub, args);

            if (typeof func != "function") {
                throw new TypeError(getCallbackError(stub, func, args));
            }

            var callbackArguments = getChangingValue(stub, "callbackArguments");
            var callbackContext = getChangingValue(stub, "callbackContexts");

            if (stub.callbackAsync) {
                nextTick(function() {
                    func.apply(callbackContext, callbackArguments);
                });
            } else {
                func.apply(callbackContext, callbackArguments);
            }
        }
    }

    var uuid = 0;

    sinon.extend(stub, (function () {
        var slice = Array.prototype.slice, proto;

        function throwsException(error, message) {
            if (typeof error == "string") {
                this.exception = new Error(message || "");
                this.exception.name = error;
            } else if (!error) {
                this.exception = new Error("Error");
            } else {
                this.exception = error;
            }

            return this;
        }

        proto = {
            create: function create() {
                var functionStub = function () {

                    callCallback(functionStub, arguments);

                    if (functionStub.exception) {
                        throw functionStub.exception;
                    } else if (typeof functionStub.returnArgAt == 'number') {
                        return arguments[functionStub.returnArgAt];
                    } else if (functionStub.returnThis) {
                        return this;
                    }
                    return functionStub.returnValue;
                };

                functionStub.id = "stub#" + uuid++;
                var orig = functionStub;
                functionStub = sinon.spy.create(functionStub);
                functionStub.func = orig;

                functionStub.callArgAts = [];
                functionStub.callbackArguments = [];
                functionStub.callbackContexts = [];
                functionStub.callArgProps = [];

                sinon.extend(functionStub, stub);
                functionStub._create = sinon.stub.create;
                functionStub.displayName = "stub";
                functionStub.toString = sinon.functionToString;

                return functionStub;
            },

            resetBehavior: function () {
                var i;

                this.callArgAts = [];
                this.callbackArguments = [];
                this.callbackContexts = [];
                this.callArgProps = [];

                delete this.returnValue;
                delete this.returnArgAt;
                this.returnThis = false;

                if (this.fakes) {
                    for (i = 0; i < this.fakes.length; i++) {
                        this.fakes[i].resetBehavior();
                    }
                }
            },

            returns: function returns(value) {
                this.returnValue = value;

                return this;
            },

            returnsArg: function returnsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.returnArgAt = pos;

                return this;
            },

            returnsThis: function returnsThis() {
                this.returnThis = true;

                return this;
            },

            "throws": throwsException,
            throwsException: throwsException,

            callsArg: function callsArg(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOn: function callsArgOn(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push([]);
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgWith: function callsArgWith(pos) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            callsArgOnWith: function callsArgWith(pos, context) {
                if (typeof pos != "number") {
                    throw new TypeError("argument index is not number");
                }
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(pos);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yields: function () {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 0));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsOn: function (context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(context);
                this.callArgProps.push(undefined);

                return this;
            },

            yieldsTo: function (prop) {
                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 1));
                this.callbackContexts.push(undefined);
                this.callArgProps.push(prop);

                return this;
            },

            yieldsToOn: function (prop, context) {
                if (typeof context != "object") {
                    throw new TypeError("argument context is not an object");
                }

                this.callArgAts.push(-1);
                this.callbackArguments.push(slice.call(arguments, 2));
                this.callbackContexts.push(context);
                this.callArgProps.push(prop);

                return this;
            }
        };

        // create asynchronous versions of callsArg* and yields* methods
        for (var method in proto) {
            // need to avoid creating anotherasync versions of the newly added async methods
            if (proto.hasOwnProperty(method) &&
                method.match(/^(callsArg|yields|thenYields$)/) &&
                !method.match(/Async/)) {
                proto[method + 'Async'] = (function (syncFnName) {
                    return function () {
                        this.callbackAsync = true;
                        return this[syncFnName].apply(this, arguments);
                    };
                })(method);
            }
        }

        return proto;

    }()));

    if (commonJSModule) {
        module.exports = stub;
    } else {
        sinon.stub = stub;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46,"__browserify_process":44}],54:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend stub.js
 * @depend mock.js
 * @depend sandbox.js
 */
/*jslint eqeqeq: false, onevar: false, forin: true, plusplus: false*/
/*global module, require, sinon*/
/**
 * Test function, sandboxes fakes
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon) {
        return;
    }

    function test(callback) {
        var type = typeof callback;

        if (type != "function") {
            throw new TypeError("sinon.test needs to wrap a test function, got " + type);
        }

        return function () {
            var config = sinon.getConfig(sinon.config);
            config.injectInto = config.injectIntoThis && this || config.injectInto;
            var sandbox = sinon.sandbox.create(config);
            var exception, result;
            var args = Array.prototype.slice.call(arguments).concat(sandbox.args);

            try {
                result = callback.apply(this, args);
            } catch (e) {
                exception = e;
            }

            if (typeof exception !== "undefined") {
                sandbox.restore();
                throw exception;
            }
            else {
                sandbox.verifyAndRestore();
            }

            return result;
        };
    }

    test.config = {
        injectIntoThis: true,
        injectInto: null,
        properties: ["spy", "stub", "mock", "clock", "server", "requests"],
        useFakeTimers: true,
        useFakeServer: true
    };

    if (commonJSModule) {
        module.exports = test;
    } else {
        sinon.test = test;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],55:[function(require,module,exports){
/**
 * @depend ../sinon.js
 * @depend test.js
 */
/*jslint eqeqeq: false, onevar: false, eqeqeq: false*/
/*global module, require, sinon*/
/**
 * Test case, sandboxes all test functions
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

(function (sinon) {
    var commonJSModule = typeof module == "object" && typeof require == "function";

    if (!sinon && commonJSModule) {
        sinon = require("../sinon");
    }

    if (!sinon || !Object.prototype.hasOwnProperty) {
        return;
    }

    function createTest(property, setUp, tearDown) {
        return function () {
            if (setUp) {
                setUp.apply(this, arguments);
            }

            var exception, result;

            try {
                result = property.apply(this, arguments);
            } catch (e) {
                exception = e;
            }

            if (tearDown) {
                tearDown.apply(this, arguments);
            }

            if (exception) {
                throw exception;
            }

            return result;
        };
    }

    function testCase(tests, prefix) {
        /*jsl:ignore*/
        if (!tests || typeof tests != "object") {
            throw new TypeError("sinon.testCase needs an object with test functions");
        }
        /*jsl:end*/

        prefix = prefix || "test";
        var rPrefix = new RegExp("^" + prefix);
        var methods = {}, testName, property, method;
        var setUp = tests.setUp;
        var tearDown = tests.tearDown;

        for (testName in tests) {
            if (tests.hasOwnProperty(testName)) {
                property = tests[testName];

                if (/^(setUp|tearDown)$/.test(testName)) {
                    continue;
                }

                if (typeof property == "function" && rPrefix.test(testName)) {
                    method = property;

                    if (setUp || tearDown) {
                        method = createTest(property, setUp, tearDown);
                    }

                    methods[testName] = sinon.test(method);
                } else {
                    methods[testName] = tests[testName];
                }
            }
        }

        return methods;
    }

    if (commonJSModule) {
        module.exports = testCase;
    } else {
        sinon.testCase = testCase;
    }
}(typeof sinon == "object" && sinon || null));

},{"../sinon":46}],56:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};/*jslint eqeqeq: false, plusplus: false, evil: true, onevar: false, browser: true, forin: false*/
/*global module, require, window*/
/**
 * Fake timer API
 * setTimeout
 * setInterval
 * clearTimeout
 * clearInterval
 * tick
 * reset
 * Date
 *
 * Inspired by jsUnitMockTimeOut from JsUnit
 *
 * @author Christian Johansen (christian@cjohansen.no)
 * @license BSD
 *
 * Copyright (c) 2010-2013 Christian Johansen
 */
"use strict";

if (typeof sinon == "undefined") {
    var sinon = {};
}

(function (global) {
    var id = 1;

    function addTimer(args, recurring) {
        if (args.length === 0) {
            throw new Error("Function requires at least 1 parameter");
        }

        var toId = id++;
        var delay = args[1] || 0;

        if (!this.timeouts) {
            this.timeouts = {};
        }

        this.timeouts[toId] = {
            id: toId,
            func: args[0],
            callAt: this.now + delay,
            invokeArgs: Array.prototype.slice.call(args, 2)
        };

        if (recurring === true) {
            this.timeouts[toId].interval = delay;
        }

        return toId;
    }

    function parseTime(str) {
        if (!str) {
            return 0;
        }

        var strings = str.split(":");
        var l = strings.length, i = l;
        var ms = 0, parsed;

        if (l > 3 || !/^(\d\d:){0,2}\d\d?$/.test(str)) {
            throw new Error("tick only understands numbers and 'h:m:s'");
        }

        while (i--) {
            parsed = parseInt(strings[i], 10);

            if (parsed >= 60) {
                throw new Error("Invalid time " + str);
            }

            ms += parsed * Math.pow(60, (l - i - 1));
        }

        return ms * 1000;
    }

    function createObject(object) {
        var newObject;

        if (Object.create) {
            newObject = Object.create(object);
        } else {
            var F = function () {};
            F.prototype = object;
            newObject = new F();
        }

        newObject.Date.clock = newObject;
        return newObject;
    }

    sinon.clock = {
        now: 0,

        create: function create(now) {
            var clock = createObject(this);

            if (typeof now == "number") {
                clock.now = now;
            }

            if (!!now && typeof now == "object") {
                throw new TypeError("now should be milliseconds since UNIX epoch");
            }

            return clock;
        },

        setTimeout: function setTimeout(callback, timeout) {
            return addTimer.call(this, arguments, false);
        },

        clearTimeout: function clearTimeout(timerId) {
            if (!this.timeouts) {
                this.timeouts = [];
            }

            if (timerId in this.timeouts) {
                delete this.timeouts[timerId];
            }
        },

        setInterval: function setInterval(callback, timeout) {
            return addTimer.call(this, arguments, true);
        },

        clearInterval: function clearInterval(timerId) {
            this.clearTimeout(timerId);
        },

        tick: function tick(ms) {
            ms = typeof ms == "number" ? ms : parseTime(ms);
            var tickFrom = this.now, tickTo = this.now + ms, previous = this.now;
            var timer = this.firstTimerInRange(tickFrom, tickTo);

            var firstException;
            while (timer && tickFrom <= tickTo) {
                if (this.timeouts[timer.id]) {
                    tickFrom = this.now = timer.callAt;
                    try {
                      this.callTimer(timer);
                    } catch (e) {
                      firstException = firstException || e;
                    }
                }

                timer = this.firstTimerInRange(previous, tickTo);
                previous = tickFrom;
            }

            this.now = tickTo;

            if (firstException) {
              throw firstException;
            }

            return this.now;
        },

        firstTimerInRange: function (from, to) {
            var timer, smallest, originalTimer;

            for (var id in this.timeouts) {
                if (this.timeouts.hasOwnProperty(id)) {
                    if (this.timeouts[id].callAt < from || this.timeouts[id].callAt > to) {
                        continue;
                    }

                    if (!smallest || this.timeouts[id].callAt < smallest) {
                        originalTimer = this.timeouts[id];
                        smallest = this.timeouts[id].callAt;

                        timer = {
                            func: this.timeouts[id].func,
                            callAt: this.timeouts[id].callAt,
                            interval: this.timeouts[id].interval,
                            id: this.timeouts[id].id,
                            invokeArgs: this.timeouts[id].invokeArgs
                        };
                    }
                }
            }

            return timer || null;
        },

        callTimer: function (timer) {
            if (typeof timer.interval == "number") {
                this.timeouts[timer.id].callAt += timer.interval;
            } else {
                delete this.timeouts[timer.id];
            }

            try {
                if (typeof timer.func == "function") {
                    timer.func.apply(null, timer.invokeArgs);
                } else {
                    eval(timer.func);
                }
            } catch (e) {
              var exception = e;
            }

            if (!this.timeouts[timer.id]) {
                if (exception) {
                  throw exception;
                }
                return;
            }

            if (exception) {
              throw exception;
            }
        },

        reset: function reset() {
            this.timeouts = {};
        },

        Date: (function () {
            var NativeDate = Date;

            function ClockDate(year, month, date, hour, minute, second, ms) {
                // Defensive and verbose to avoid potential harm in passing
                // explicit undefined when user does not pass argument
                switch (arguments.length) {
                case 0:
                    return new NativeDate(ClockDate.clock.now);
                case 1:
                    return new NativeDate(year);
                case 2:
                    return new NativeDate(year, month);
                case 3:
                    return new NativeDate(year, month, date);
                case 4:
                    return new NativeDate(year, month, date, hour);
                case 5:
                    return new NativeDate(year, month, date, hour, minute);
                case 6:
                    return new NativeDate(year, month, date, hour, minute, second);
                default:
                    return new NativeDate(year, month, date, hour, minute, second, ms);
                }
            }

            return mirrorDateProperties(ClockDate, NativeDate);
        }())
    };

    function mirrorDateProperties(target, source) {
        if (source.now) {
            target.now = function now() {
                return target.clock.now;
            };
        } else {
            delete target.now;
        }

        if (source.toSource) {
            target.toSource = function toSource() {
                return source.toSource();
            };
        } else {
            delete target.toSource;
        }

        target.toString = function toString() {
            return source.toString();
        };

        target.prototype = source.prototype;
        target.parse = source.parse;
        target.UTC = source.UTC;
        target.prototype.toUTCString = source.prototype.toUTCString;
        return target;
    }

    var methods = ["Date", "setTimeout", "setInterval",
                   "clearTimeout", "clearInterval"];

    function restore() {
        var method;

        for (var i = 0, l = this.methods.length; i < l; i++) {
            method = this.methods[i];
            if (global[method].hadOwnProperty) {
                global[method] = this["_" + method];
            } else {
                delete global[method];
            }
        }

        // Prevent multiple executions which will completely remove these props
        this.methods = [];
    }

    function stubGlobal(method, clock) {
        clock[method].hadOwnProperty = Object.prototype.hasOwnProperty.call(global, method);
        clock["_" + method] = global[method];

        if (method == "Date") {
            var date = mirrorDateProperties(clock[method], global[method]);
            global[method] = date;
        } else {
            global[method] = function () {
                return clock[method].apply(clock, arguments);
            };

            for (var prop in clock[method]) {
                if (clock[method].hasOwnProperty(prop)) {
                    global[method][prop] = clock[method][prop];
                }
            }
        }

        global[method].clock = clock;
    }

    sinon.useFakeTimers = function useFakeTimers(now) {
        var clock = sinon.clock.create(now);
        clock.restore = restore;
        clock.methods = Array.prototype.slice.call(arguments,
                                                   typeof now == "number" ? 1 : 0);

        if (clock.methods.length === 0) {
            clock.methods = methods;
        }

        for (var i = 0, l = clock.methods.length; i < l; i++) {
            stubGlobal(clock.methods[i], clock);
        }

        return clock;
    };
}(typeof global != "undefined" && typeof global !== "function" ? global : this));

sinon.timers = {
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    setInterval: setInterval,
    clearInterval: clearInterval,
    Date: Date
};

if (typeof module == "object" && typeof require == "function") {
    module.exports = sinon;
}

},{}],57:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};if (typeof buster === "undefined") {
    var buster = {};
}

if (typeof module === "object" && typeof require === "function") {
    buster = require("buster-core");
}

buster.format = buster.format || {};
buster.format.excludeConstructors = ["Object", /^.$/];
buster.format.quoteStrings = true;

buster.format.ascii = (function () {
    "use strict";

    var hasOwn = Object.prototype.hasOwnProperty;

    var specialObjects = [];
    if (typeof global != "undefined") {
        specialObjects.push({ obj: global, value: "[object global]" });
    }
    if (typeof document != "undefined") {
        specialObjects.push({ obj: document, value: "[object HTMLDocument]" });
    }
    if (typeof window != "undefined") {
        specialObjects.push({ obj: window, value: "[object Window]" });
    }

    function keys(object) {
        var k = Object.keys && Object.keys(object) || [];

        if (k.length == 0) {
            for (var prop in object) {
                if (hasOwn.call(object, prop)) {
                    k.push(prop);
                }
            }
        }

        return k.sort();
    }

    function isCircular(object, objects) {
        if (typeof object != "object") {
            return false;
        }

        for (var i = 0, l = objects.length; i < l; ++i) {
            if (objects[i] === object) {
                return true;
            }
        }

        return false;
    }

    function ascii(object, processed, indent) {
        if (typeof object == "string") {
            var quote = typeof this.quoteStrings != "boolean" || this.quoteStrings;
            return processed || quote ? '"' + object + '"' : object;
        }

        if (typeof object == "function" && !(object instanceof RegExp)) {
            return ascii.func(object);
        }

        processed = processed || [];

        if (isCircular(object, processed)) {
            return "[Circular]";
        }

        if (Object.prototype.toString.call(object) == "[object Array]") {
            return ascii.array.call(this, object, processed);
        }

        if (!object) {
            return "" + object;
        }

        if (buster.isElement(object)) {
            return ascii.element(object);
        }

        if (typeof object.toString == "function" &&
            object.toString !== Object.prototype.toString) {
            return object.toString();
        }

        for (var i = 0, l = specialObjects.length; i < l; i++) {
            if (object === specialObjects[i].obj) {
                return specialObjects[i].value;
            }
        }

        return ascii.object.call(this, object, processed, indent);
    }

    ascii.func = function (func) {
        return "function " + buster.functionName(func) + "() {}";
    };

    ascii.array = function (array, processed) {
        processed = processed || [];
        processed.push(array);
        var pieces = [];

        for (var i = 0, l = array.length; i < l; ++i) {
            pieces.push(ascii.call(this, array[i], processed));
        }

        return "[" + pieces.join(", ") + "]";
    };

    ascii.object = function (object, processed, indent) {
        processed = processed || [];
        processed.push(object);
        indent = indent || 0;
        var pieces = [], properties = keys(object), prop, str, obj;
        var is = "";
        var length = 3;

        for (var i = 0, l = indent; i < l; ++i) {
            is += " ";
        }

        for (i = 0, l = properties.length; i < l; ++i) {
            prop = properties[i];
            obj = object[prop];

            if (isCircular(obj, processed)) {
                str = "[Circular]";
            } else {
                str = ascii.call(this, obj, processed, indent + 2);
            }

            str = (/\s/.test(prop) ? '"' + prop + '"' : prop) + ": " + str;
            length += str.length;
            pieces.push(str);
        }

        var cons = ascii.constructorName.call(this, object);
        var prefix = cons ? "[" + cons + "] " : ""

        return (length + indent) > 80 ?
            prefix + "{\n  " + is + pieces.join(",\n  " + is) + "\n" + is + "}" :
            prefix + "{ " + pieces.join(", ") + " }";
    };

    ascii.element = function (element) {
        var tagName = element.tagName.toLowerCase();
        var attrs = element.attributes, attribute, pairs = [], attrName;

        for (var i = 0, l = attrs.length; i < l; ++i) {
            attribute = attrs.item(i);
            attrName = attribute.nodeName.toLowerCase().replace("html:", "");

            if (attrName == "contenteditable" && attribute.nodeValue == "inherit") {
                continue;
            }

            if (!!attribute.nodeValue) {
                pairs.push(attrName + "=\"" + attribute.nodeValue + "\"");
            }
        }

        var formatted = "<" + tagName + (pairs.length > 0 ? " " : "");
        var content = element.innerHTML;

        if (content.length > 20) {
            content = content.substr(0, 20) + "[...]";
        }

        var res = formatted + pairs.join(" ") + ">" + content + "</" + tagName + ">";

        return res.replace(/ contentEditable="inherit"/, "");
    };

    ascii.constructorName = function (object) {
        var name = buster.functionName(object && object.constructor);
        var excludes = this.excludeConstructors || buster.format.excludeConstructors || [];

        for (var i = 0, l = excludes.length; i < l; ++i) {
            if (typeof excludes[i] == "string" && excludes[i] == name) {
                return "";
            } else if (excludes[i].test && excludes[i].test(name)) {
                return "";
            }
        }

        return name;
    };

    return ascii;
}());

if (typeof module != "undefined") {
    module.exports = buster.format;
}

},{"buster-core":58}],58:[function(require,module,exports){
var process=require("__browserify_process");var buster = (function (setTimeout, B) {
    var isNode = typeof require == "function" && typeof module == "object";
    var div = typeof document != "undefined" && document.createElement("div");
    var F = function () {};

    var buster = {
        bind: function bind(obj, methOrProp) {
            var method = typeof methOrProp == "string" ? obj[methOrProp] : methOrProp;
            var args = Array.prototype.slice.call(arguments, 2);
            return function () {
                var allArgs = args.concat(Array.prototype.slice.call(arguments));
                return method.apply(obj, allArgs);
            };
        },

        partial: function partial(fn) {
            var args = [].slice.call(arguments, 1);
            return function () {
                return fn.apply(this, args.concat([].slice.call(arguments)));
            };
        },

        create: function create(object) {
            F.prototype = object;
            return new F();
        },

        extend: function extend(target) {
            if (!target) { return; }
            for (var i = 1, l = arguments.length, prop; i < l; ++i) {
                for (prop in arguments[i]) {
                    target[prop] = arguments[i][prop];
                }
            }
            return target;
        },

        nextTick: function nextTick(callback) {
            if (typeof process != "undefined" && process.nextTick) {
                return process.nextTick(callback);
            }
            setTimeout(callback, 0);
        },

        functionName: function functionName(func) {
            if (!func) return "";
            if (func.displayName) return func.displayName;
            if (func.name) return func.name;
            var matches = func.toString().match(/function\s+([^\(]+)/m);
            return matches && matches[1] || "";
        },

        isNode: function isNode(obj) {
            if (!div) return false;
            try {
                obj.appendChild(div);
                obj.removeChild(div);
            } catch (e) {
                return false;
            }
            return true;
        },

        isElement: function isElement(obj) {
            return obj && obj.nodeType === 1 && buster.isNode(obj);
        },

        isArray: function isArray(arr) {
            return Object.prototype.toString.call(arr) == "[object Array]";
        },

        flatten: function flatten(arr) {
            var result = [], arr = arr || [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                result = result.concat(buster.isArray(arr[i]) ? flatten(arr[i]) : arr[i]);
            }
            return result;
        },

        each: function each(arr, callback) {
            for (var i = 0, l = arr.length; i < l; ++i) {
                callback(arr[i]);
            }
        },

        map: function map(arr, callback) {
            var results = [];
            for (var i = 0, l = arr.length; i < l; ++i) {
                results.push(callback(arr[i]));
            }
            return results;
        },

        parallel: function parallel(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                    callback = null;
                }
            }
            if (fns.length == 0) { return cb(null, []); }
            var remaining = fns.length, results = [];
            function makeDone(num) {
                return function done(err, result) {
                    if (err) { return cb(err); }
                    results[num] = result;
                    if (--remaining == 0) { cb(null, results); }
                };
            }
            for (var i = 0, l = fns.length; i < l; ++i) {
                fns[i](makeDone(i));
            }
        },

        series: function series(fns, callback) {
            function cb(err, res) {
                if (typeof callback == "function") {
                    callback(err, res);
                }
            }
            var remaining = fns.slice();
            var results = [];
            function callNext() {
                if (remaining.length == 0) return cb(null, results);
                var promise = remaining.shift()(next);
                if (promise && typeof promise.then == "function") {
                    promise.then(buster.partial(next, null), next);
                }
            }
            function next(err, result) {
                if (err) return cb(err);
                results.push(result);
                callNext();
            }
            callNext();
        },

        countdown: function countdown(num, done) {
            return function () {
                if (--num == 0) done();
            };
        }
    };

    if (typeof process === "object" &&
        typeof require === "function" && typeof module === "object") {
        var crypto = require("crypto");
        var path = require("path");

        buster.tmpFile = function (fileName) {
            var hashed = crypto.createHash("sha1");
            hashed.update(fileName);
            var tmpfileName = hashed.digest("hex");

            if (process.platform == "win32") {
                return path.join(process.env["TEMP"], tmpfileName);
            } else {
                return path.join("/tmp", tmpfileName);
            }
        };
    }

    if (Array.prototype.some) {
        buster.some = function (arr, fn, thisp) {
            return arr.some(fn, thisp);
        };
    } else {
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/some
        buster.some = function (arr, fun, thisp) {
            "use strict";
            if (arr == null) { throw new TypeError(); }
            arr = Object(arr);
            var len = arr.length >>> 0;
            if (typeof fun !== "function") { throw new TypeError(); }

            for (var i = 0; i < len; i++) {
                if (arr.hasOwnProperty(i) && fun.call(thisp, arr[i], i, arr)) {
                    return true;
                }
            }

            return false;
        };
    }

    if (Array.prototype.filter) {
        buster.filter = function (arr, fn, thisp) {
            return arr.filter(fn, thisp);
        };
    } else {
        // https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/filter
        buster.filter = function (fn, thisp) {
            "use strict";
            if (this == null) { throw new TypeError(); }

            var t = Object(this);
            var len = t.length >>> 0;
            if (typeof fn != "function") { throw new TypeError(); }

            var res = [];
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i]; // in case fun mutates this
                    if (fn.call(thisp, val, i, t)) { res.push(val); }
                }
            }

            return res;
        };
    }

    if (isNode) {
        module.exports = buster;
        buster.eventEmitter = require("./buster-event-emitter");
        Object.defineProperty(buster, "defineVersionGetter", {
            get: function () {
                return require("./define-version-getter");
            }
        });
    }

    return buster.extend(B || {}, buster);
}(setTimeout, buster));

},{"./buster-event-emitter":59,"./define-version-getter":60,"__browserify_process":44,"crypto":38,"path":32}],59:[function(require,module,exports){
/*jslint eqeqeq: false, onevar: false, plusplus: false*/
/*global buster, require, module*/
if (typeof require == "function" && typeof module == "object") {
    var buster = require("./buster-core");
}

(function () {
    function eventListeners(eventEmitter, event) {
        if (!eventEmitter.listeners) {
            eventEmitter.listeners = {};
        }

        if (!eventEmitter.listeners[event]) {
            eventEmitter.listeners[event] = [];
        }

        return eventEmitter.listeners[event];
    }

    function throwLater(event, error) {
        buster.nextTick(function () {
            error.message = event + " listener threw error: " + error.message;
            throw error;
        });
    }

    function addSupervisor(emitter, listener, thisObject) {
        if (!emitter.supervisors) { emitter.supervisors = []; }
        emitter.supervisors.push({
            listener: listener,
            thisObject: thisObject
        });
    }

    function notifyListener(emitter, event, listener, args) {
        try {
            listener.listener.apply(listener.thisObject || emitter, args);
        } catch (e) {
            throwLater(event, e);
        }
    }

    buster.eventEmitter = {
        create: function () {
            return buster.create(this);
        },

        addListener: function addListener(event, listener, thisObject) {
            if (typeof event === "function") {
                return addSupervisor(this, event, listener);
            }
            if (typeof listener != "function") {
                throw new TypeError("Listener is not function");
            }
            eventListeners(this, event).push({
                listener: listener,
                thisObject: thisObject
            });
        },

        once: function once(event, listener, thisObject) {
            var self = this;
            this.addListener(event, listener);

            var wrapped = function () {
                self.removeListener(event, listener);
                self.removeListener(event, wrapped);
            };
            this.addListener(event, wrapped);
        },

        hasListener: function hasListener(event, listener, thisObject) {
            var listeners = eventListeners(this, event);

            for (var i = 0, l = listeners.length; i < l; i++) {
                if (listeners[i].listener === listener &&
                    listeners[i].thisObject === thisObject) {
                    return true;
                }
            }

            return false;
        },

        removeListener: function (event, listener) {
            var listeners = eventListeners(this, event);

            for (var i = 0, l = listeners.length; i < l; ++i) {
                if (listeners[i].listener == listener) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        },

        emit: function emit(event) {
            var listeners = eventListeners(this, event).slice();
            var args = Array.prototype.slice.call(arguments, 1);

            for (var i = 0, l = listeners.length; i < l; i++) {
                notifyListener(this, event, listeners[i], args);
            }

            listeners = this.supervisors || [];
            args = Array.prototype.slice.call(arguments);
            for (i = 0, l = listeners.length; i < l; ++i) {
                notifyListener(this, event, listeners[i], args);
            }
        },

        bind: function (object, events) {
            var method;

            if (!events) {
                for (method in object) {
                    if (object.hasOwnProperty(method) && typeof object[method] == "function") {
                        this.addListener(method, object[method], object);
                    }
                }
            } else if (typeof events == "string" ||
                       Object.prototype.toString.call(events) == "[object Array]") {
                events = typeof events == "string" ? [events] : events;

                for (var i = 0, l = events.length; i < l; ++i) {
                    this.addListener(events[i], object[events[i]], object);
                }
            } else {
                for (var prop in events) {
                    if (events.hasOwnProperty(prop)) {
                        method = events[prop];

                        if (typeof method == "function") {
                            object[buster.functionName(method) || prop] = method;
                        } else {
                            method = object[events[prop]];
                        }

                        this.addListener(prop, method, object);
                    }
                }
            }

            return object;
        }
    };

    buster.eventEmitter.on = buster.eventEmitter.addListener;
}());

if (typeof module != "undefined") {
    module.exports = buster.eventEmitter;
}

},{"./buster-core":58}],60:[function(require,module,exports){
var path = require("path");
var fs = require("fs");

module.exports = function defineVersionGetter(mod, dirname) {
    Object.defineProperty(mod, "VERSION", {
        get: function () {
            if (!this.version) {
                var pkgJSON = path.resolve(dirname, "..", "package.json");
                var pkg = JSON.parse(fs.readFileSync(pkgJSON, "utf8"));
                this.version = pkg.version;
            }

            return this.version;
        }
    });
};

},{"fs":31,"path":32}],61:[function(require,module,exports){
'use strict';

/*
 * Used by test/json_hal.js
 */

var embeddedOrders = [{
  '_links': {
    'self': { 'href': '/orders/123' },
    'ea:basket': { 'href': '/baskets/987' },
    'ea:customer': { 'href': '/customers/654' }
  },
  'total': 30.00,
  'currency': 'USD',
  'status': 'shipped'
}, {
  '_links': {
    'self': { 'href': '/orders/124' },
    'ea:basket': { 'href': '/baskets/321' },
    'ea:customer': { 'href': '/customers/42' }
  },
  'total': 20.00,
  'currency': 'USD',
  'status': 'processing'
}]

var embeddedWithoutSelfLink = {
  '_links': {
  },
}

module.exports = {
  root: {
    '_links': {
      'self': { 'href': '/' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:orders': { 'href': '/orders' }
    }
  },

  embeddedOrders: embeddedOrders,

  orders: {
    '_links': {
      'self': { 'href': '/orders' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'next': { 'href': '/orders?page=2' },
      'ea:find': { 'href': '/orders{/id}', 'templated': true },
      'ea:admin': [{
        'href': '/admins/2',
        'title': 'Fred'
      }, {
        'href': '/admins/5',
        'title': 'Kate',
        'name': 'boss'
      }, {
        'name': 'no-href'
      }]
    },
    'currentlyProcessing': 14,
    'shippedToday': 20,
    '_embedded': {
      'ea:order': embeddedOrders
    }
  },

  admin2: {
    '_links': {
      'self': { 'href': '/admins/2' }
    },
    'name': 'Fred'
  },
  admin5: {
    '_links': {
      'self': { 'href': '/admins/5' }
    },
    'name': 'Kate'
  },

  basket: {
    basket: 'empty'
  },
  basket1: {
    '_links': {
      'self': { 'href': '/baskets/987' }
    },
    'much': 'items'
  },
  basket3: {
    '_links': {
      'self': { 'href': '/baskets/321' }
    },
    'wow': 'such prices'
  },

  singleOrder: {
    '_links': {
      'self': { 'href': '/orders/13' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }],
      'ea:customer': { 'href': '/customers/4711' },
      'ea:basket': { 'href': '/baskets/4712' }
    },
    'total': 30.00,
    'currency': 'USD',
    'status': 'shipped'
  },

  embeddedWithoutSelfLink: embeddedWithoutSelfLink,

  customer: {
    '_links': {
      'self': { 'href': '/customer/4711' },
      'curies': [{ 'name': 'ea', 'href': 'http://example.com/docs/rels/{rel}',
          'templated': true }]
    },
    'first_name': 'Halfred',
    'last_name': 'Halfredson',
    '_embedded': {
      'ea:no_self_link': embeddedWithoutSelfLink
    }
  }
}

},{}],62:[function(require,module,exports){
'use strict';

var traverson = require('../traverson')
var mockResponse = require('./util/mock_response')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var assert = chai.assert
var expect = chai.expect
chai.use(sinonChai)

describe('getResource for JSON', function() {

  var get
  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

  var result = mockResponse({ foo: 'bar' })

  beforeEach(function() {
    api = client.newRequest()
    get = sinon.stub()
    api.walker.request = { get: get }
    callback = sinon.spy()
  })

  describe('with its basic features', function() {
    var rootStep = {
      uri: rootUri
    }
    var rootResponse = mockResponse({
      irrelevant: { stuff: 'to be ignored' },
      link: rootUri + '/link/to/thing',
      more: { stuff: { that: 'we do not care about' } }
    })

    it('should access the root URI', function() {
      api.follow().getResource(callback)
      expect(get).to.have.been.calledWith(rootUri, sinon.match.func)
    })

    it('should call callback with the root doc', function(done) {
      get.callsArgWithAsync(1, null, rootResponse)
      api.follow().getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, rootResponse.doc)
          done()
        }
      )
    })

    it('should call callback with err', function(done) {
      var err = new Error('test error')
      get.callsArgWithAsync(1, err)
      api.follow().getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })

    it('should follow a single element path', function(done) {
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      get.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, result)
      api.follow('link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })

    it('should follow a single element path as array', function(done) {
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      get.withArgs(rootUri + '/link/to/thing',
          sinon.match.func).callsArgWithAsync(1, null, result)
      api.follow(['link']).getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })

    it('should call callback with err if link is not found', function(done) {
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      api.follow('non-existing-link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          assert(callback.calledOnce)
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error))
          expect(callback.args[0][0].message).to.contain('Could not find ' +
              'property non-existing-link')
          done()
        }
      )
    })

    it('should call callback with err inside recursion', function(done) {
      var err = new Error('test error')
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, mockResponse({ firstLink: rootUri + '/first' }))
      get.withArgs(rootUri + '/first', sinon.match.func).
          callsArgWithAsync(1, err)
      api.follow('firstLink').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('with JSONPath', function() {

    var uri = rootUri + '/path/to/resource'
    var rootResponse = mockResponse({
      deeply: { nested: { link: uri } }
    })

    var result = mockResponse({ the: 'result' })

    it('should follow to a link via JSONPath expression', function(done) {
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      get.withArgs(uri, sinon.match.func).callsArgWithAsync(1, null,
          result)
      api.follow('$.deeply.nested.link').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })

    it('should call callback with err if JSONPath has no match',
        function(done) {
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      api.follow('$.deeply.nested.blink').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error))
          expect(callback.args[0][0].message).to.contain('JSONPath ' +
              'expression $.deeply.nested.blink returned no match')
          done()
        }
      )
    })

    it('should call callback with err if JSONPath has multiple matches',
        function(done) {
      var rootResponseMulti = mockResponse({
        arr: [ { foo: 'bar' }, { foo: 'baz' } ]
      })
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponseMulti)
      api.follow('$.arr[*].foo').getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(sinon.match.
              instanceOf(Error))
          expect(callback.args[0][0].message).to.contain('JSONPath ' +
              'expression $.arr[*].foo returned more than one match')
          done()
        }
      )
    })
  })

  describe('with URI templating', function() {

    it('should evaluate URI templates', function(done) {
      var rootResponseUriTemplate = mockResponse({
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      })
      var next = mockResponse({
        secondTemplate: rootUri + '/another/{id}'
      })

      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponseUriTemplate)
      get.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, next)
      get.withArgs(rootUri + '/another/42',
          sinon.match.func).callsArgWithAsync(1, null, result)
      api.follow('firstTemplate', 'secondTemplate')
         .withTemplateParameters({user: 'basti1302', thing: 4711, id: 42})
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })

    it('should evaluate URI templates for the start URI', function(done) {
      var rootUriTemplate = mockResponse(
        { we: 'can haz use uri templates for root doc, yo!' })
      var startUriTemplate = rootUri + '/{param}/whatever'
      var startUri = rootUri + '/substituted/whatever'
      var api = traverson
          .json
          .from(startUriTemplate)
          .newRequest()
      get = sinon.stub()
      api.walker.request = { get: get }
      get.withArgs(startUri, sinon.match.func).callsArgWithAsync(
          1, null, rootUriTemplate)

      api.follow()
          .withTemplateParameters({param: 'substituted'})
          .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, rootUriTemplate.doc)
          done()
        }
      )
    })

    it('should evaluate URI templates with array of template params',
        function(done) {
      var rootUriTemplate = mockResponse({
        firstTemplate: rootUri + '/users/{user}/things{/thing}'
      })
      var next = mockResponse({
        secondTemplate: rootUri + '/another_user/{user}'
      })
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootUriTemplate)
      get.withArgs(rootUri + '/users/basti1302/things/4711',
          sinon.match.func).callsArgWithAsync(1, null, next)
      get.withArgs(rootUri + '/another_user/someone_else',
          sinon.match.func).callsArgWithAsync(1, null, result)
      api.follow('firstTemplate', 'secondTemplate')
        .withTemplateParameters([null,
                                {user: 'basti1302', thing: 4711},
                                {user: 'someone_else'}])
        .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })
  })

  describe('in all its glory', function() {

    it('should follow a multi element path', function(done) {
      var path1 = rootUri + '/path'
      var template2 = rootUri + '/path/to/resource{/param}'
      var path2 = rootUri + '/path/to/resource/gizmo'
      var path3 = rootUri + '/path/to/another/resource'
      var path4 = rootUri + '/path/to/the/last/resource'

      var root = mockResponse({ link1: path1 })
      var response2 = mockResponse({ link2: template2 })
      var response3 = mockResponse({
        nested: {
          array: [
            { foo: 'bar' },
            { link: path3 },
            { bar: 'baz' }
          ]
        }
      })
      var response4 = mockResponse({ link4: path4 })

      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, root)
      get.withArgs(path1, sinon.match.func).callsArgWithAsync(
          1, null, response2)
      get.withArgs(path2, sinon.match.func).callsArgWithAsync(
          1, null, response3)
      get.withArgs(path3, sinon.match.func).callsArgWithAsync(
          1, null, response4)
      get.withArgs(path4, sinon.match.func).callsArgWithAsync(
          1, null, result)
      api.follow(['link1', 'link2', '$[nested][array][1].link', 'link4'])
         .withTemplateParameters({ param: 'gizmo' })
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result.doc)
          done()
        }
      )
    })
  })
})

},{"../traverson":"5u5bvt","./util/mock_response":66,"./util/wait_for":67,"chai":2,"sinon":46,"sinon-chai":45}],63:[function(require,module,exports){
'use strict';

var traverson = require('../traverson')
var halDocs = require('./hal_docs.js')
var mockResponse =  require('./util/mock_response')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var assert = chai.assert
var expect = chai.expect
chai.use(sinonChai)

describe('The JSON-HAL walker\'s', function() {

  var rootUri = 'http://api.io'
  var rootDoc = halDocs.root
  var ordersUri = rootUri + '/orders'
  var embeddedOrderDocs = halDocs.embeddedOrders
  var ordersDoc = halDocs.orders
  var admin2Uri = rootUri + '/admins/2'
  var admin2Doc = halDocs.admin2
  var admin5Uri = rootUri + '/admins/5'
  var admin5Doc = halDocs.admin5
  var basketDoc = halDocs.basket
  var basket1Uri = rootUri + '/baskets/987'
  var basket1Doc = halDocs.basket1
  var basket2Uri = rootUri + '/baskets/321'
  var basket2Doc = halDocs.basket2
  var singleOrderUri = ordersUri + '/13'
  var singleOrderDoc = halDocs.singleOrder
  var embeddedWithoutSelfLink = halDocs.embeddedWithoutSelfLink
  var customerUri = rootUri + '/customers/4711'
  var customerDoc = halDocs.customer

  var rootResponse = mockResponse(rootDoc)
  var ordersResponse = mockResponse(ordersDoc)
  var admin2Response = mockResponse(admin2Doc)
  var admin5Response = mockResponse(admin5Doc)
  var basket1Response = mockResponse(basket1Doc)
  var basket2Response = mockResponse(basket2Doc)
  var singleOrderResponse = mockResponse(singleOrderDoc)
  var embeddedOrdersResponse = mockResponse(embeddedOrderDocs)
  var embeddedOrderResponses = [
    mockResponse(embeddedOrderDocs[0]),
    mockResponse(embeddedOrderDocs[1])
  ]
  var customerResponse = mockResponse(customerDoc)
  var basketResponse = mockResponse(basketDoc)

  var updateResponse = mockResponse({ result: 'success' }, 200)
  var payload = {
    some: 'stuff',
    data: 4711
  }

  var get
  var executeRequest

  var callback
  var client = traverson.jsonHal.from(rootUri)
  var api

  beforeEach(function() {
    api = client.newRequest()
    get = sinon.stub()
    api.walker.request = { get: get }
    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(1, null,
        rootResponse)
    get.withArgs(ordersUri, sinon.match.func).callsArgWithAsync(1, null,
        ordersResponse)
    get.withArgs(admin2Uri, sinon.match.func).callsArgWithAsync(1, null,
        admin2Response)
    get.withArgs(admin5Uri, sinon.match.func).callsArgWithAsync(1, null,
        admin5Response)
    get.withArgs(basket1Uri, sinon.match.func).callsArgWithAsync(1, null,
        basket1Response)
    get.withArgs(basket2Uri, sinon.match.func).callsArgWithAsync(1, null,
        basket2Response)
    get.withArgs(singleOrderUri, sinon.match.func).callsArgWithAsync(1,
        null, singleOrderResponse)
    get.withArgs(rootUri + '/baskets/987', sinon.match.func).
        callsArgWithAsync(1, null, basketResponse)
    get.withArgs(customerUri, sinon.match.func).callsArgWithAsync(1,
        null, customerResponse)
    callback = sinon.spy()
    executeRequest = sinon.stub(api.finalAction.constructor.prototype,
        'executeRequest')
  })

  afterEach(function() {
    api.finalAction.constructor.prototype.executeRequest.restore()
  })

  describe('get method', function() {

    it('should follow a single link', function(done) {
      api.follow('ea:orders').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersResponse)
          done()
        }
      )
    })

    it('should follow multiple links', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, customerResponse)
          done()
        }
      )
    })

    it('should follow first link from a link array automatically',
        function(done) {
      api.follow('ea:orders', 'ea:admin')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, admin2Response)
          done()
        }
      )
    })

    it('should follow a link specified by index from a link array',
        function(done) {
      api.follow('ea:orders', 'ea:admin[1]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response)
          done()
        }
      )
    })

    it('should follow a link specified by title from a link array',
        function(done) {
      api.follow('ea:orders', 'ea:admin[title:Kate]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response)
          done()
        }
      )
    })

    it('should follow a link specified by name from a link array',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:boss]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, admin5Response)
          done()
        }
      )
    })

    it('should fail if there is no link with the specified secondary key',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:not-existing]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var err = callback.firstCall.args[0]
          expect(err.message).to.contain('but there is no such link')
          done()
        }
      )
    })

    it('should fail if the link specified by secondary key has no href',
        function(done) {
      api.follow('ea:orders', 'ea:admin[name:no-href]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var err = callback.firstCall.args[0]
          expect(err.message).to.contain('but this link had no href attribute.')
          done()
        }
      )
    })

    it('should pass first embedded document from the array into the callback ' +
        ' automatically', function(done) {
      api.follow('ea:orders', 'ea:order')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var error = callback.firstCall.args[0]
          expect(error).to.not.exist
          var response = callback.firstCall.args[1]
          expect(response).to.exist
          expect(response.body).to.equal(embeddedOrderResponses[0].body)
          expect(response.statusCode).to.equal(200)
          expect(response.remark).to.exist
          done()
        }
      )
    })

    it('should pass single element of an embedded document into the ' +
        'callback', function(done) {
      api.follow('ea:orders', 'ea:order[1]')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var error = callback.firstCall.args[0]
          expect(error).to.not.exist
          var response = callback.firstCall.args[1]
          expect(response).to.exist
          expect(response.body).to.equal(embeddedOrderResponses[1].body)
          expect(response.statusCode).to.equal(200)
          expect(response.remark).to.exist
          done()
        }
      )
    })

    it('should follow first embedded resource from an array automatically',
        function(done) {
      api.follow('ea:orders', 'ea:order', 'ea:basket')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, basket1Response)
          done()
        }
      )
    })

    it('should follow specified embedded resource from an array',
        function(done) {
      api.follow('ea:orders', 'ea:order[1]', 'ea:basket')
         .get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, basket2Response)
          done()
        }
      )
    })
  })

  describe('getResource method', function() {

    it('should return the resource', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, customerDoc)
          done()
        }
      )
    })

    it('should pass an embedded document into the callback',
        function(done) {
      api.follow('ea:orders', 'ea:order')
         .getResource(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, embeddedOrderDocs[0])
          done()
        }
      )
    })
  })

  describe('getUri method', function() {

    it('should return the last URI', function(done) {
      api.follow('ea:orders', 'ea:find')
         .withTemplateParameters({ id: 13 })
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, singleOrderUri)
          done()
        }
      )
    })

    // not sure what to do in this case
    it('returns the self-URI of an embedded document', function(done) {
      api.follow('ea:orders', 'ea:order')
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, ordersUri + '/123')
          done()
        }
      )
    })

    it('yields an error if the last URI is actually an embedded ' +
               ' resource but has no self-URI', function(done) {
      api.follow('ea:orders', 'ea:find', 'ea:customer', 'ea:no_self_link')
         .withTemplateParameters({ id: 13 })
         .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          var error = callback.firstCall.args[0]
          expect(error.message).to.contain('You requested an URI but the ' +
              'last resource is an embedded resource and has no URI of its ' +
              'own (that is, it has no link with rel=\"self\"')
          done()
        }
      )
    })

  })

  describe('post method', function() {

    it('should follow multiple links and post to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('put method', function() {

    it('should follow multiple links and put to the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('patch method', function() {

    it('should follow multiple links and patch the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when patch fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, api.request, sinon.match.func,
          payload, sinon.match.func).callsArgWithAsync(4, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('delete method', function() {

    it('should follow multiple links and delete the last URI',
        function(done) {
      executeRequest.withArgs(customerUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, null, updateResponse,
          customerUri)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .del(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(customerUri,
              api.request, sinon.match.func, null, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, updateResponse,
              customerUri)
          done()
        }
      )
    })

    it('should call callback with err when deleting fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(customerUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, err)
      api.follow('ea:orders', 'ea:find', 'ea:customer')
         .withTemplateParameters({ id: 13 })
         .del(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })
})

},{"../traverson":"5u5bvt","./hal_docs.js":61,"./util/mock_response":66,"./util/wait_for":67,"chai":2,"sinon":46,"sinon-chai":45}],64:[function(require,module,exports){
'use strict';

var traverson = require('../traverson')
var mockResponse =  require('./util/mock_response')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var assert = chai.assert
var expect = chai.expect
chai.use(sinonChai)

/*
 * Tests for all of Json Walker's request methods except getResource, which is
 * tested extensively in json_get_resource.js. This test suite contains tests
 * for get, post, put, delete and patch. Each http method verb has it's own
 * describe-section. Since most of the code path is the same for getResource
 * and get, post, ..., there are just a few basic tests here for each verb.
 * The getResource tests are more comprehensive.
 */
describe('The JSON client\'s', function() {

  var get
  var executeRequest

  var callback
  var rootUri = 'http://api.io'
  var client = traverson.json.from(rootUri)
  var api

  var getUri = rootUri + '/link/to/resource'
  var postUri = rootUri + '/post/something/here'
  var putUri = rootUri + '/put/something/here'
  var patchUri = rootUri + '/patch/me'
  var deleteUri = rootUri + '/delete/me'
  var templateUri = rootUri + '/template/{param}'

  var rootResponse = mockResponse({
    'get_link': getUri,
    'post_link': postUri,
    'put_link': putUri,
    'patch_link': patchUri,
    'delete_link': deleteUri,
    'template_link': templateUri
  })

  var result = mockResponse({ result: 'success' })

  var payload = {
    some: 'stuff',
    data: 4711
  }

  beforeEach(function() {
    api = client.newRequest()
    get = sinon.stub()
    api.walker.request = { get: get }
    callback = sinon.spy()

    get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
        1, null, rootResponse)
    get.withArgs(getUri, sinon.match.func).callsArgWithAsync(1, null,
        result)
    get.withArgs(postUri, sinon.match.func).callsArgWithAsync(1,
        new Error('GET is not implemented for this URI, please POST ' +
        'something'))

    executeRequest = sinon.stub(api.finalAction.constructor.prototype,
        'executeRequest')
  })

  afterEach(function() {
    api.finalAction.constructor.prototype.executeRequest.restore()
  })

  describe('get method', function() {

    it('should follow the links', function(done) {
      api.follow('get_link').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, result)
          done()
        }
      )
    })

    it('should call callback with err', function(done) {
      var err = new Error('test error')
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub()
      api.walker.request = { get: get }
      get.callsArgWithAsync(1, err)
      api.follow().get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })

    it('should call callback with err when walking along the links fails',
        function(done) {
      var err = new Error('test error')
      // Default stubbing from beforeEach is not what we want here.
      // IMO, get.reset() should be enough, but isnt?
      get = sinon.stub()
      api.walker.request = { get: get }
      get.withArgs(rootUri, sinon.match.func).callsArgWithAsync(
          1, null, rootResponse)
      get.withArgs(getUri, sinon.match.func).callsArgWithAsync(1, err)
      api.follow('get_link', 'another_link').get(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })

  })

  describe('getUri method', function() {
    it('should follow the links and yield the last URI', function(done) {
      api.follow('get_link').getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null, getUri)
          expect(get.callCount).to.equal(1)
          done()
        }
      )
    })

    it('should yield resolved URI if last URI is a URI template',
        function(done) {
      api.follow('template_link')
        .withTemplateParameters({ param: 'substituted' })
        .getUri(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(null,
              rootUri + '/template/substituted')
          expect(get.callCount).to.equal(1)
          done()
        }
      )
    })
  })


  describe('post method', function() {

    var result = mockResponse({ result: 'success' }, 201)

    it('should follow the links and post to the last URI',
        function(done) {
      executeRequest.withArgs(postUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, null, result, postUri)
      api.follow('post_link').post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(postUri, api.request,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, result, postUri)
          done()
        }
      )
    })

    it('should call callback with err when post fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(postUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, err)
      api.follow('post_link').post(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })

  })

  describe('put method', function() {

    var result = mockResponse({ result: 'success' }, 200)

    it('should follow the links and put to the last URI',
        function(done) {
      executeRequest.withArgs(putUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, null, result, putUri)
      api.follow('put_link').put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(putUri, api.request,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, result, putUri)
          done()
        }
      )
    })

    it('should call callback with err when put fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(putUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, err)
      api.follow('put_link').put(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('patch method', function() {

    var result = mockResponse({ result: 'success' }, 200)

    it('should follow the links and patch the last URI',
        function(done) {
      executeRequest.withArgs(patchUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, null, result, patchUri)
      api.follow('patch_link').patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(patchUri, api.request,
              sinon.match.func, payload, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, result, patchUri)
          done()
        }
      )
    })

    it('should call callback with err when patch fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(patchUri, api.request, sinon.match.func, payload,
          sinon.match.func).callsArgWithAsync(4, err, null)
      api.follow('patch_link').patch(payload, callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })

  describe('del method', function() {

    var result = mockResponse(null, 204)

    it('should follow the links and delete the last URI',
        function(done) {
      executeRequest.withArgs(deleteUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, null, result, deleteUri)
      api.follow('delete_link').del(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(executeRequest).to.have.been.calledWith(deleteUri, api.request,
              sinon.match.func, null, sinon.match.func)
          expect(callback).to.have.been.calledWith(null, result, deleteUri)
          done()
        }
      )
    })

    it('should call callback with err when deleting fails',
        function(done) {
      var err = new Error('test error')
      executeRequest.withArgs(deleteUri, api.request, sinon.match.func, null,
          sinon.match.func).callsArgWithAsync(4, err)
      api.follow('delete_link').del(callback)
      waitFor(
        function() { return callback.called },
        function() {
          expect(callback).to.have.been.calledWith(err)
          done()
        }
      )
    })
  })
})

},{"../traverson":"5u5bvt","./util/mock_response":66,"./util/wait_for":67,"chai":2,"sinon":46,"sinon-chai":45}],65:[function(require,module,exports){
var process=require("__browserify_process");'use strict';

var traverson = require('../traverson')
var waitFor = require('./util/wait_for')
var chai = require('chai')
var sinon = require('sinon')
var sinonChai = require('sinon-chai')

var assert = chai.assert
var expect = chai.expect
chai.use(sinonChai)

describe('Traverson (when tested against a local server)', function() {

  var jsonApi
  var jsonHalApi
  var testServer
  var callback
  var rootUri = 'http://127.0.0.1:2808/'

  before(function() {
    if (isNodeJs()) {
      testServer = require('../server/app')
      testServer.start()
    }
  })

  after(function() {
    if (isNodeJs() && testServer) {
      testServer.stop()
    }
  })

  beforeEach(function() {
    jsonApi = traverson
      .json
      .from(rootUri)
      .newRequest()
      .withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
    jsonHalApi = traverson.jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions({
      headers: {
        'Accept': 'application/hal+json',
        'Content-Type': 'application/json'
      }
    })
    callback = sinon.spy()
  })

  it('should fetch the root response', function(done) {
    jsonApi.follow().get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.first).to.exist
        expect(resultDoc.first).to.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should fetch the root document', function(done) {
    jsonApi.follow().getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.first).to.exist
        expect(resultDoc.first).to.equal(rootUri + 'first')
        done()
      }
    )
  })

  it('should follow a single element path', function(done) {
    jsonApi.follow('first').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.first).to.exist
        expect(resultDoc.first).to.equal('document')
        done()
      }
    )
  })

  it('should follow a multi-element path', function(done) {
    jsonApi.follow('second', 'doc').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.second).to.exist
        expect(resultDoc.second).to.equal('document')
        done()
      }
    )
  })

  it('should follow a multi-element path in hal+json', function(done) {
    jsonHalApi.follow('first', 'second').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.second).to.exist
        expect(resultDoc.second).to.equal('document')
        done()
      }
    )
  })

  it('should follow a multi-element path in hal+json using an embedded ' +
      'resource along the way', function(done) {
    jsonHalApi.follow('first',
        'contained_resource',
        'embedded_link_to_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.second).to.exist
        expect(resultDoc.second).to.equal('document')
        done()
      }
    )
  })

  it('should follow a multi-element path in hal+json yielding an embedded ' +
      'resource to the callback',
      function(done) {
    jsonHalApi.follow('first',
        'second',
        'inside_second')
      .get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.more).to.exist
        expect(resultDoc.more).to.equal('data')
        done()
      }
    )
  })

  it('should follow a multi-element path to a resource', function(done) {
    jsonApi.follow('second', 'doc').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.second).to.exist
        expect(resultDoc.second).to.equal('document')
        done()
      }
    )
  })

  it('should authenticate', function(done) {
    jsonApi
      .withRequestOptions({
        auth: {
          user: 'traverson',
          pass: 'verysecretpassword',
          sendImmediately: false
        }
      }).follow('auth')
      .getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.user).to.exist
        expect(resultDoc.user).to.equal('authenticated')
        done()
      }
    )
  })

  it('should leverage JSONPath', function(done) {
    jsonApi.follow('$.jsonpath.nested.key').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.third).to.exist
        expect(resultDoc.third).to.equal('document')
        done()
      }
    )
  })

  it('should leverage URI templates', function(done) {
    jsonApi.follow('uri_template')
       .withTemplateParameters({param: 'foobar', id: 13})
       .getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        expect(resultDoc.some).to.equal('document')
        expect(resultDoc.param).to.equal('foobar')
        expect(resultDoc.id).to.equal('13')
        done()
      }
    )
  })

  it('should fail gracefully on 404 with get()', function(done) {
    jsonApi.follow('blind_alley', 'more', 'links').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        expect(callback.callCount).to.equal(1)
        var error = callback.firstCall.args[0]
        expect(error).to.exist
        expect(error.name).to.equal('HTTPError')
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.')
        expect(error.uri).to.equal(rootUri + 'does/not/exist')
        expect(error.httpStatus).to.equal(404)

        var response = callback.firstCall.args[1]
        expect(response).to.exist
        var body = response.body
        expect(body).to.exist
        var resultDoc = JSON.parse(body)
        expect(resultDoc.message).to.exist
        expect(resultDoc.message).to.equal('resource not found')
        done()
      }
    )
  })

  it('should just deliver the last response of get(), even when it\'s 404',
      function(done) {
    jsonApi.follow('blind_alley').get(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody(404)
        expect(resultDoc).to.exist
        expect(resultDoc.message).to.exist
        expect(resultDoc.message).to.equal('resource not found')
        done()
      }
    )
  })

  it('should fail gracefully on 404 with getResource()', function(done) {
    jsonApi.follow('blind_alley').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        expect(callback.callCount).to.equal(1)
        var error = callback.firstCall.args[0]
        expect(error).to.exist
        expect(error.name).to.equal('HTTPError')
        expect(error.message).to.equal('HTTP GET for ' + rootUri +
            'does/not/exist' + ' resulted in HTTP status code 404.')
        expect(error.uri).to.equal(rootUri + 'does/not/exist')
        expect(error.httpStatus).to.equal(404)

        var resultDoc = callback.firstCall.args[1]
        expect(resultDoc).to.exist
        expect(resultDoc.message).to.exist
        expect(resultDoc.message).to.equal('resource not found')
        done()
      }
    )
  })

  it('should fail gracefully on syntactically incorrect JSON',
      function(done) {
    jsonApi.follow('garbage').getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        expect(callback.callCount).to.equal(1)
        var error = callback.firstCall.args[0]
        expect(error).to.exist
        expect(error.name).to.equal('JSONError')
        expect(error.message).to.equal('The document at ' + rootUri + 'junk' +
          ' could not be parsed as JSON: { this will :: not parse')
        expect(error.uri).to.equal(rootUri + 'junk')
        expect(error.body).to.equal('{ this will :: not parse')

        var resultDoc = callback.firstCall.args[1]
        expect(resultDoc).to.not.exist
        done()
      }
    )
  })

  it('should yield the last URI', function(done) {
    jsonApi.follow('second', 'doc').getUri(callback)
    waitFor(
      function() { return callback.called },
      function() {
        expect(callback.callCount).to.equal(1)
        var result = callback.firstCall.args[1]
        expect(result).to.exist
        expect(result).to.equal(rootUri + 'second/document')
        done()
      }
    )
  })

  it('should post', function(done) {
    var payload = {'new': 'document'}
    jsonApi.follow('post_link').post(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody(201)
        expect(resultDoc.document).to.exist
        expect(resultDoc.document).to.equal('created')
        expect(resultDoc.received).to.exist
        expect(resultDoc.received).to.deep.equal(payload)
        done()
      }
    )
  })

  it('should put', function(done) {
    var payload = {'updated': 'document'}
    jsonApi.follow('put_link').put(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.document).to.exist
        expect(resultDoc.document).to.equal('overwritten')
        expect(resultDoc.received).to.exist
        expect(resultDoc.received).to.deep.equal(payload)
        done()
      }
    )
  })

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
      console.log('skipping test localhost.js#"should patch" in PhantomJS')
      return done()
    }

    var payload = {'patched': 'document'}
    jsonApi.follow('patch_link').patch(payload, callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResponseWithBody()
        expect(resultDoc.document).to.exist
        expect(resultDoc.document).to.equal('patched')
        expect(resultDoc.received).to.exist
        expect(resultDoc.received).to.deep.equal(payload)
        done()
      }
    )
  })

  it('should delete', function(done) {
    jsonApi.follow('delete_link').del(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var response = checkResponse(204)
        done()
      }
    )
  })

  it('should use provided request options', function(done) {
    jsonApi.follow('echo-headers').withRequestOptions({
      headers: {
        'Accept': 'application/json',
        'X-Traverson-Test-Header': 'Traverson rocks!'
      }
    }).getResource(callback)
    waitFor(
      function() { return callback.called },
      function() {
        var resultDoc = checkResultDoc()
        var testResponseHeader =
            resultDoc['X-Traverson-Test-Header'] ||
            resultDoc['x-traverson-test-header']
        expect(testResponseHeader).to.exist
        expect(testResponseHeader).to.equal('Traverson rocks!')
        done()
      }
    )
  })

  function isNodeJs() {
    // can't use strict here
    if (typeof window !== 'undefined') {
      return false
    } else if (typeof process !== 'undefined') {
      return true
    } else {
      throw new Error('Can\'t figure out environment. ' +
          'Seems it\'s neither Node.js nor a browser.')
    }
  }

  function isPhantomJs() {
    return typeof window !== 'undefined' && window.mochaPhantomJS
  }

  function checkResponseWithBody(httpStatus) {
    var response = checkResponse(httpStatus)
    var body = response.body
    expect(body).to.exist
    var resultDoc = JSON.parse(body)
    return resultDoc
  }

  function checkResponse(httpStatus) {
    httpStatus = httpStatus || 200
    expect(callback.callCount).to.equal(1)
    var error = callback.firstCall.args[0]
    expect(error).to.not.exist
    var response = callback.firstCall.args[1]
    expect(response).to.exist
    expect(response.statusCode).to.exist
    expect(response.statusCode).to.equal(httpStatus)
    return response
  }

  function checkResultDoc() {
    expect(callback.callCount).to.equal(1)
    var error = callback.firstCall.args[0]
    expect(error).to.not.exist
    var resultDoc = callback.firstCall.args[1]
    expect(resultDoc).to.exist
    return resultDoc
  }
})

},{"../server/app":43,"../traverson":"5u5bvt","./util/wait_for":67,"__browserify_process":44,"chai":2,"sinon":46,"sinon-chai":45}],66:[function(require,module,exports){
'use strict';

module.exports = function mockResponse(doc, httpStatus) {
  var response = {}
  response.body = JSON.stringify(doc)
  response.statusCode = httpStatus || 200
  response.doc = doc
  return response
}

},{}],67:[function(require,module,exports){
'use strict';

module.exports = function(test, onSuccess, polling) {
  polling = polling || 10
  var handle = setInterval(function() {
    if (test()) {
      clearInterval(handle)
      onSuccess()
    }
  }, polling)
}

},{}]},{},[1])
//@ sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9icm93c2VyL3Rlc3Qvc3VpdGUuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9pbmRleC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvYXNzZXJ0aW9uLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvY29yZS9hc3NlcnRpb25zLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvaW50ZXJmYWNlL2Fzc2VydC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpL2ludGVyZmFjZS9leHBlY3QuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS9pbnRlcmZhY2Uvc2hvdWxkLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvYWRkQ2hhaW5hYmxlTWV0aG9kLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvYWRkTWV0aG9kLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvYWRkUHJvcGVydHkuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy9lcWwuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy9mbGFnLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvZ2V0QWN0dWFsLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy9nZXRNZXNzYWdlLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvZ2V0TmFtZS5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpL3V0aWxzL2dldFBhdGhWYWx1ZS5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpL3V0aWxzL2dldFByb3BlcnRpZXMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy9pbmRleC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpL3V0aWxzL2luc3BlY3QuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy9vYmpEaXNwbGF5LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvb3ZlcndyaXRlTWV0aG9kLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvb3ZlcndyaXRlUHJvcGVydHkuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9saWIvY2hhaS91dGlscy90ZXN0LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2NoYWkvbGliL2NoYWkvdXRpbHMvdHJhbnNmZXJGbGFncy5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9jaGFpL2xpYi9jaGFpL3V0aWxzL3R5cGUuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvY2hhaS9ub2RlX21vZHVsZXMvYXNzZXJ0aW9uLWVycm9yL2luZGV4LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvYnVpbHRpbi9fc2hpbXMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL2Fzc2VydC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL2J1aWx0aW4vZnMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL3BhdGguanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9idWlsdGluL3V0aWwuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvYnVmZmVyX2llZWU3NTQuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvaW5kZXguanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvYnVmZmVyLWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L2hlbHBlcnMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvY3J5cHRvLWJyb3dzZXJpZnkvaW5kZXguanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvY3J5cHRvLWJyb3dzZXJpZnkvbWQ1LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItYnVpbHRpbnMvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L3JuZy5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLWJ1aWx0aW5zL25vZGVfbW9kdWxlcy9jcnlwdG8tYnJvd3NlcmlmeS9zaGEuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvZ3J1bnQtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1idWlsdGlucy9ub2RlX21vZHVsZXMvY3J5cHRvLWJyb3dzZXJpZnkvc2hhMjU2LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL2dydW50LWJyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcmVzb2x2ZS9lbXB0eS5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9pbnNlcnQtbW9kdWxlLWdsb2JhbHMvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi1jaGFpL2xpYi9zaW5vbi1jaGFpLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi9saWIvc2lub24vYXNzZXJ0LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi9jb2xsZWN0aW9uLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi9tYXRjaC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi9saWIvc2lub24vbW9jay5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi9saWIvc2lub24vc2FuZGJveC5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi9saWIvc2lub24vc3B5LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi9zdHViLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi90ZXN0LmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL2xpYi9zaW5vbi90ZXN0X2Nhc2UuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvc2lub24vbGliL3Npbm9uL3V0aWwvZmFrZV90aW1lcnMuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvc2lub24vbm9kZV9tb2R1bGVzL2J1c3Rlci1mb3JtYXQvbGliL2J1c3Rlci1mb3JtYXQuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi9ub2RlX21vZHVsZXMvc2lub24vbm9kZV9tb2R1bGVzL2J1c3Rlci1mb3JtYXQvbm9kZV9tb2R1bGVzL2J1c3Rlci1jb3JlL2xpYi9idXN0ZXItY29yZS5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL25vZGVfbW9kdWxlcy9zaW5vbi9ub2RlX21vZHVsZXMvYnVzdGVyLWZvcm1hdC9ub2RlX21vZHVsZXMvYnVzdGVyLWNvcmUvbGliL2J1c3Rlci1ldmVudC1lbWl0dGVyLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vbm9kZV9tb2R1bGVzL3Npbm9uL25vZGVfbW9kdWxlcy9idXN0ZXItZm9ybWF0L25vZGVfbW9kdWxlcy9idXN0ZXItY29yZS9saWIvZGVmaW5lLXZlcnNpb24tZ2V0dGVyLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vdGVzdC9oYWxfZG9jcy5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL3Rlc3QvanNvbl9nZXRfcmVzb3VyY2UuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi90ZXN0L2pzb25faGFsLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vdGVzdC9qc29uX3JlcXVlc3RzLmpzIiwiL2hvbWUvYmFzdGlhbi9wcm9qZWt0ZS90cmF2ZXJzb24vdGVzdC9sb2NhbGhvc3QuanMiLCIvaG9tZS9iYXN0aWFuL3Byb2pla3RlL3RyYXZlcnNvbi90ZXN0L3V0aWwvbW9ja19yZXNwb25zZS5qcyIsIi9ob21lL2Jhc3RpYW4vcHJvamVrdGUvdHJhdmVyc29uL3Rlc3QvdXRpbC93YWl0X2Zvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0dkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BtQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4YUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbGtCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbInJlcXVpcmUoJy4uLy4uL3Rlc3QvanNvbl9nZXRfcmVzb3VyY2UnKVxucmVxdWlyZSgnLi4vLi4vdGVzdC9qc29uX2hhbCcpXG5yZXF1aXJlKCcuLi8uLi90ZXN0L2pzb25fcmVxdWVzdHMnKVxucmVxdWlyZSgnLi4vLi4vdGVzdC9sb2NhbGhvc3QnKVxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9jaGFpJyk7XG4iLCIvKiFcbiAqIGNoYWlcbiAqIENvcHlyaWdodChjKSAyMDExLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG52YXIgdXNlZCA9IFtdXG4gICwgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8qIVxuICogQ2hhaSB2ZXJzaW9uXG4gKi9cblxuZXhwb3J0cy52ZXJzaW9uID0gJzEuNy4yJztcblxuLyohXG4gKiBBc3NlcnRpb24gRXJyb3JcbiAqL1xuXG5leHBvcnRzLkFzc2VydGlvbkVycm9yID0gcmVxdWlyZSgnYXNzZXJ0aW9uLWVycm9yJyk7XG5cbi8qIVxuICogVXRpbHMgZm9yIHBsdWdpbnMgKG5vdCBleHBvcnRlZClcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vY2hhaS91dGlscycpO1xuXG4vKipcbiAqICMgLnVzZShmdW5jdGlvbilcbiAqXG4gKiBQcm92aWRlcyBhIHdheSB0byBleHRlbmQgdGhlIGludGVybmFscyBvZiBDaGFpXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn1cbiAqIEByZXR1cm5zIHt0aGlzfSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZXhwb3J0cy51c2UgPSBmdW5jdGlvbiAoZm4pIHtcbiAgaWYgKCF+dXNlZC5pbmRleE9mKGZuKSkge1xuICAgIGZuKHRoaXMsIHV0aWwpO1xuICAgIHVzZWQucHVzaChmbik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qIVxuICogUHJpbWFyeSBgQXNzZXJ0aW9uYCBwcm90b3R5cGVcbiAqL1xuXG52YXIgYXNzZXJ0aW9uID0gcmVxdWlyZSgnLi9jaGFpL2Fzc2VydGlvbicpO1xuZXhwb3J0cy51c2UoYXNzZXJ0aW9uKTtcblxuLyohXG4gKiBDb3JlIEFzc2VydGlvbnNcbiAqL1xuXG52YXIgY29yZSA9IHJlcXVpcmUoJy4vY2hhaS9jb3JlL2Fzc2VydGlvbnMnKTtcbmV4cG9ydHMudXNlKGNvcmUpO1xuXG4vKiFcbiAqIEV4cGVjdCBpbnRlcmZhY2VcbiAqL1xuXG52YXIgZXhwZWN0ID0gcmVxdWlyZSgnLi9jaGFpL2ludGVyZmFjZS9leHBlY3QnKTtcbmV4cG9ydHMudXNlKGV4cGVjdCk7XG5cbi8qIVxuICogU2hvdWxkIGludGVyZmFjZVxuICovXG5cbnZhciBzaG91bGQgPSByZXF1aXJlKCcuL2NoYWkvaW50ZXJmYWNlL3Nob3VsZCcpO1xuZXhwb3J0cy51c2Uoc2hvdWxkKTtcblxuLyohXG4gKiBBc3NlcnQgaW50ZXJmYWNlXG4gKi9cblxudmFyIGFzc2VydCA9IHJlcXVpcmUoJy4vY2hhaS9pbnRlcmZhY2UvYXNzZXJ0Jyk7XG5leHBvcnRzLnVzZShhc3NlcnQpO1xuIiwiLyohXG4gKiBjaGFpXG4gKiBodHRwOi8vY2hhaWpzLmNvbVxuICogQ29weXJpZ2h0KGMpIDIwMTEtMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKF9jaGFpLCB1dGlsKSB7XG4gIC8qIVxuICAgKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICAgKi9cblxuICB2YXIgQXNzZXJ0aW9uRXJyb3IgPSBfY2hhaS5Bc3NlcnRpb25FcnJvclxuICAgICwgZmxhZyA9IHV0aWwuZmxhZztcblxuICAvKiFcbiAgICogTW9kdWxlIGV4cG9ydC5cbiAgICovXG5cbiAgX2NoYWkuQXNzZXJ0aW9uID0gQXNzZXJ0aW9uO1xuXG4gIC8qIVxuICAgKiBBc3NlcnRpb24gQ29uc3RydWN0b3JcbiAgICpcbiAgICogQ3JlYXRlcyBvYmplY3QgZm9yIGNoYWluaW5nLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG5cbiAgZnVuY3Rpb24gQXNzZXJ0aW9uIChvYmosIG1zZywgc3RhY2spIHtcbiAgICBmbGFnKHRoaXMsICdzc2ZpJywgc3RhY2sgfHwgYXJndW1lbnRzLmNhbGxlZSk7XG4gICAgZmxhZyh0aGlzLCAnb2JqZWN0Jywgb2JqKTtcbiAgICBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgfVxuXG4gIC8qIVxuICAgICogIyMjIEFzc2VydGlvbi5pbmNsdWRlU3RhY2tcbiAgICAqXG4gICAgKiBVc2VyIGNvbmZpZ3VyYWJsZSBwcm9wZXJ0eSwgaW5mbHVlbmNlcyB3aGV0aGVyIHN0YWNrIHRyYWNlXG4gICAgKiBpcyBpbmNsdWRlZCBpbiBBc3NlcnRpb24gZXJyb3IgbWVzc2FnZS4gRGVmYXVsdCBvZiBmYWxzZVxuICAgICogc3VwcHJlc3NlcyBzdGFjayB0cmFjZSBpbiB0aGUgZXJyb3IgbWVzc2FnZVxuICAgICpcbiAgICAqICAgICBBc3NlcnRpb24uaW5jbHVkZVN0YWNrID0gdHJ1ZTsgIC8vIGVuYWJsZSBzdGFjayBvbiBlcnJvclxuICAgICpcbiAgICAqIEBhcGkgcHVibGljXG4gICAgKi9cblxuICBBc3NlcnRpb24uaW5jbHVkZVN0YWNrID0gZmFsc2U7XG5cbiAgLyohXG4gICAqICMjIyBBc3NlcnRpb24uc2hvd0RpZmZcbiAgICpcbiAgICogVXNlciBjb25maWd1cmFibGUgcHJvcGVydHksIGluZmx1ZW5jZXMgd2hldGhlciBvciBub3RcbiAgICogdGhlIGBzaG93RGlmZmAgZmxhZyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gdGhlIHRocm93blxuICAgKiBBc3NlcnRpb25FcnJvcnMuIGBmYWxzZWAgd2lsbCBhbHdheXMgYmUgYGZhbHNlYDsgYHRydWVgXG4gICAqIHdpbGwgYmUgdHJ1ZSB3aGVuIHRoZSBhc3NlcnRpb24gaGFzIHJlcXVlc3RlZCBhIGRpZmZcbiAgICogYmUgc2hvd24uXG4gICAqXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5zaG93RGlmZiA9IHRydWU7XG5cbiAgQXNzZXJ0aW9uLmFkZFByb3BlcnR5ID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgdXRpbC5hZGRQcm9wZXJ0eSh0aGlzLnByb3RvdHlwZSwgbmFtZSwgZm4pO1xuICB9O1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QgPSBmdW5jdGlvbiAobmFtZSwgZm4pIHtcbiAgICB1dGlsLmFkZE1ldGhvZCh0aGlzLnByb3RvdHlwZSwgbmFtZSwgZm4pO1xuICB9O1xuXG4gIEFzc2VydGlvbi5hZGRDaGFpbmFibGVNZXRob2QgPSBmdW5jdGlvbiAobmFtZSwgZm4sIGNoYWluaW5nQmVoYXZpb3IpIHtcbiAgICB1dGlsLmFkZENoYWluYWJsZU1ldGhvZCh0aGlzLnByb3RvdHlwZSwgbmFtZSwgZm4sIGNoYWluaW5nQmVoYXZpb3IpO1xuICB9O1xuXG4gIEFzc2VydGlvbi5vdmVyd3JpdGVQcm9wZXJ0eSA9IGZ1bmN0aW9uIChuYW1lLCBmbikge1xuICAgIHV0aWwub3ZlcndyaXRlUHJvcGVydHkodGhpcy5wcm90b3R5cGUsIG5hbWUsIGZuKTtcbiAgfTtcblxuICBBc3NlcnRpb24ub3ZlcndyaXRlTWV0aG9kID0gZnVuY3Rpb24gKG5hbWUsIGZuKSB7XG4gICAgdXRpbC5vdmVyd3JpdGVNZXRob2QodGhpcy5wcm90b3R5cGUsIG5hbWUsIGZuKTtcbiAgfTtcblxuICAvKiFcbiAgICogIyMjIC5hc3NlcnQoZXhwcmVzc2lvbiwgbWVzc2FnZSwgbmVnYXRlTWVzc2FnZSwgZXhwZWN0ZWQsIGFjdHVhbClcbiAgICpcbiAgICogRXhlY3V0ZXMgYW4gZXhwcmVzc2lvbiBhbmQgY2hlY2sgZXhwZWN0YXRpb25zLiBUaHJvd3MgQXNzZXJ0aW9uRXJyb3IgZm9yIHJlcG9ydGluZyBpZiB0ZXN0IGRvZXNuJ3QgcGFzcy5cbiAgICpcbiAgICogQG5hbWUgYXNzZXJ0XG4gICAqIEBwYXJhbSB7UGhpbG9zb3BoaWNhbH0gZXhwcmVzc2lvbiB0byBiZSB0ZXN0ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgdG8gZGlzcGxheSBpZiBmYWlsc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbmVnYXRlZE1lc3NhZ2UgdG8gZGlzcGxheSBpZiBuZWdhdGVkIGV4cHJlc3Npb24gZmFpbHNcbiAgICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWQgdmFsdWUgKHJlbWVtYmVyIHRvIGNoZWNrIGZvciBuZWdhdGlvbilcbiAgICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsIChvcHRpb25hbCkgd2lsbCBkZWZhdWx0IHRvIGB0aGlzLm9iamBcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIEFzc2VydGlvbi5wcm90b3R5cGUuYXNzZXJ0ID0gZnVuY3Rpb24gKGV4cHIsIG1zZywgbmVnYXRlTXNnLCBleHBlY3RlZCwgX2FjdHVhbCwgc2hvd0RpZmYpIHtcbiAgICB2YXIgb2sgPSB1dGlsLnRlc3QodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodHJ1ZSAhPT0gc2hvd0RpZmYpIHNob3dEaWZmID0gZmFsc2U7XG4gICAgaWYgKHRydWUgIT09IEFzc2VydGlvbi5zaG93RGlmZikgc2hvd0RpZmYgPSBmYWxzZTtcblxuICAgIGlmICghb2spIHtcbiAgICAgIHZhciBtc2cgPSB1dGlsLmdldE1lc3NhZ2UodGhpcywgYXJndW1lbnRzKVxuICAgICAgICAsIGFjdHVhbCA9IHV0aWwuZ2V0QWN0dWFsKHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB0aHJvdyBuZXcgQXNzZXJ0aW9uRXJyb3IobXNnLCB7XG4gICAgICAgICAgYWN0dWFsOiBhY3R1YWxcbiAgICAgICAgLCBleHBlY3RlZDogZXhwZWN0ZWRcbiAgICAgICAgLCBzaG93RGlmZjogc2hvd0RpZmZcbiAgICAgIH0sIChBc3NlcnRpb24uaW5jbHVkZVN0YWNrKSA/IHRoaXMuYXNzZXJ0IDogZmxhZyh0aGlzLCAnc3NmaScpKTtcbiAgICB9XG4gIH07XG5cbiAgLyohXG4gICAqICMjIyAuX29ialxuICAgKlxuICAgKiBRdWljayByZWZlcmVuY2UgdG8gc3RvcmVkIGBhY3R1YWxgIHZhbHVlIGZvciBwbHVnaW4gZGV2ZWxvcGVycy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBc3NlcnRpb24ucHJvdG90eXBlLCAnX29iaicsXG4gICAgeyBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGZsYWcodGhpcywgJ29iamVjdCcpO1xuICAgICAgfVxuICAgICwgc2V0OiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICAgIGZsYWcodGhpcywgJ29iamVjdCcsIHZhbCk7XG4gICAgICB9XG4gIH0pO1xufTtcbiIsIi8qIVxuICogY2hhaVxuICogaHR0cDovL2NoYWlqcy5jb21cbiAqIENvcHlyaWdodChjKSAyMDExLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFpLCBfKSB7XG4gIHZhciBBc3NlcnRpb24gPSBjaGFpLkFzc2VydGlvblxuICAgICwgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG4gICAgLCBmbGFnID0gXy5mbGFnO1xuXG4gIC8qKlxuICAgKiAjIyMgTGFuZ3VhZ2UgQ2hhaW5zXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgYXJlIHByb3ZpZGUgYXMgY2hhaW5hYmxlIGdldHRlcnMgdG9cbiAgICogaW1wcm92ZSB0aGUgcmVhZGFiaWxpdHkgb2YgeW91ciBhc3NlcnRpb25zLiBUaGV5XG4gICAqIGRvIG5vdCBwcm92aWRlIGFuIHRlc3RpbmcgY2FwYWJpbGl0eSB1bmxlc3MgdGhleVxuICAgKiBoYXZlIGJlZW4gb3ZlcndyaXR0ZW4gYnkgYSBwbHVnaW4uXG4gICAqXG4gICAqICoqQ2hhaW5zKipcbiAgICpcbiAgICogLSB0b1xuICAgKiAtIGJlXG4gICAqIC0gYmVlblxuICAgKiAtIGlzXG4gICAqIC0gdGhhdFxuICAgKiAtIGFuZFxuICAgKiAtIGhhdmVcbiAgICogLSB3aXRoXG4gICAqIC0gYXRcbiAgICogLSBvZlxuICAgKiAtIHNhbWVcbiAgICpcbiAgICogQG5hbWUgbGFuZ3VhZ2UgY2hhaW5zXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIFsgJ3RvJywgJ2JlJywgJ2JlZW4nXG4gICwgJ2lzJywgJ2FuZCcsICdoYXZlJ1xuICAsICd3aXRoJywgJ3RoYXQnLCAnYXQnXG4gICwgJ29mJywgJ3NhbWUnIF0uZm9yRWFjaChmdW5jdGlvbiAoY2hhaW4pIHtcbiAgICBBc3NlcnRpb24uYWRkUHJvcGVydHkoY2hhaW4sIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0pO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC5ub3RcbiAgICpcbiAgICogTmVnYXRlcyBhbnkgb2YgYXNzZXJ0aW9ucyBmb2xsb3dpbmcgaW4gdGhlIGNoYWluLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KGZvbykudG8ubm90LmVxdWFsKCdiYXInKTtcbiAgICogICAgIGV4cGVjdChnb29kRm4pLnRvLm5vdC50aHJvdyhFcnJvcik7XG4gICAqICAgICBleHBlY3QoeyBmb286ICdiYXonIH0pLnRvLmhhdmUucHJvcGVydHkoJ2ZvbycpXG4gICAqICAgICAgIC5hbmQubm90LmVxdWFsKCdiYXInKTtcbiAgICpcbiAgICogQG5hbWUgbm90XG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRQcm9wZXJ0eSgnbm90JywgZnVuY3Rpb24gKCkge1xuICAgIGZsYWcodGhpcywgJ25lZ2F0ZScsIHRydWUpO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC5kZWVwXG4gICAqXG4gICAqIFNldHMgdGhlIGBkZWVwYCBmbGFnLCBsYXRlciB1c2VkIGJ5IHRoZSBgZXF1YWxgIGFuZFxuICAgKiBgcHJvcGVydHlgIGFzc2VydGlvbnMuXG4gICAqXG4gICAqICAgICBleHBlY3QoZm9vKS50by5kZWVwLmVxdWFsKHsgYmFyOiAnYmF6JyB9KTtcbiAgICogICAgIGV4cGVjdCh7IGZvbzogeyBiYXI6IHsgYmF6OiAncXV1eCcgfSB9IH0pXG4gICAqICAgICAgIC50by5oYXZlLmRlZXAucHJvcGVydHkoJ2Zvby5iYXIuYmF6JywgJ3F1dXgnKTtcbiAgICpcbiAgICogQG5hbWUgZGVlcFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkUHJvcGVydHkoJ2RlZXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgZmxhZyh0aGlzLCAnZGVlcCcsIHRydWUpO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC5hKHR5cGUpXG4gICAqXG4gICAqIFRoZSBgYWAgYW5kIGBhbmAgYXNzZXJ0aW9ucyBhcmUgYWxpYXNlcyB0aGF0IGNhbiBiZVxuICAgKiB1c2VkIGVpdGhlciBhcyBsYW5ndWFnZSBjaGFpbnMgb3IgdG8gYXNzZXJ0IGEgdmFsdWUnc1xuICAgKiB0eXBlLlxuICAgKlxuICAgKiAgICAgLy8gdHlwZW9mXG4gICAqICAgICBleHBlY3QoJ3Rlc3QnKS50by5iZS5hKCdzdHJpbmcnKTtcbiAgICogICAgIGV4cGVjdCh7IGZvbzogJ2JhcicgfSkudG8uYmUuYW4oJ29iamVjdCcpO1xuICAgKiAgICAgZXhwZWN0KG51bGwpLnRvLmJlLmEoJ251bGwnKTtcbiAgICogICAgIGV4cGVjdCh1bmRlZmluZWQpLnRvLmJlLmFuKCd1bmRlZmluZWQnKTtcbiAgICpcbiAgICogICAgIC8vIGxhbmd1YWdlIGNoYWluXG4gICAqICAgICBleHBlY3QoZm9vKS50by5iZS5hbi5pbnN0YW5jZW9mKEZvbyk7XG4gICAqXG4gICAqIEBuYW1lIGFcbiAgICogQGFsaWFzIGFuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIF9vcHRpb25hbF9cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gYW4gKHR5cGUsIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHR5cGUgPSB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgICAsIGFydGljbGUgPSB+WyAnYScsICdlJywgJ2knLCAnbycsICd1JyBdLmluZGV4T2YodHlwZS5jaGFyQXQoMCkpID8gJ2FuICcgOiAnYSAnO1xuXG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICAgIHR5cGUgPT09IF8udHlwZShvYmopXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlICcgKyBhcnRpY2xlICsgdHlwZVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSBub3QgdG8gYmUgJyArIGFydGljbGUgKyB0eXBlXG4gICAgKTtcbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRDaGFpbmFibGVNZXRob2QoJ2FuJywgYW4pO1xuICBBc3NlcnRpb24uYWRkQ2hhaW5hYmxlTWV0aG9kKCdhJywgYW4pO1xuXG4gIC8qKlxuICAgKiAjIyMgLmluY2x1ZGUodmFsdWUpXG4gICAqXG4gICAqIFRoZSBgaW5jbHVkZWAgYW5kIGBjb250YWluYCBhc3NlcnRpb25zIGNhbiBiZSB1c2VkIGFzIGVpdGhlciBwcm9wZXJ0eVxuICAgKiBiYXNlZCBsYW5ndWFnZSBjaGFpbnMgb3IgYXMgbWV0aG9kcyB0byBhc3NlcnQgdGhlIGluY2x1c2lvbiBvZiBhbiBvYmplY3RcbiAgICogaW4gYW4gYXJyYXkgb3IgYSBzdWJzdHJpbmcgaW4gYSBzdHJpbmcuIFdoZW4gdXNlZCBhcyBsYW5ndWFnZSBjaGFpbnMsXG4gICAqIHRoZXkgdG9nZ2xlIHRoZSBgY29udGFpbmAgZmxhZyBmb3IgdGhlIGBrZXlzYCBhc3NlcnRpb24uXG4gICAqXG4gICAqICAgICBleHBlY3QoWzEsMiwzXSkudG8uaW5jbHVkZSgyKTtcbiAgICogICAgIGV4cGVjdCgnZm9vYmFyJykudG8uY29udGFpbignZm9vJyk7XG4gICAqICAgICBleHBlY3QoeyBmb286ICdiYXInLCBoZWxsbzogJ3VuaXZlcnNlJyB9KS50by5pbmNsdWRlLmtleXMoJ2ZvbycpO1xuICAgKlxuICAgKiBAbmFtZSBpbmNsdWRlXG4gICAqIEBhbGlhcyBjb250YWluXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ3xOdW1iZXJ9IG9ialxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGluY2x1ZGVDaGFpbmluZ0JlaGF2aW9yICgpIHtcbiAgICBmbGFnKHRoaXMsICdjb250YWlucycsIHRydWUpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5jbHVkZSAodmFsLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgfm9iai5pbmRleE9mKHZhbClcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gaW5jbHVkZSAnICsgXy5pbnNwZWN0KHZhbClcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGluY2x1ZGUgJyArIF8uaW5zcGVjdCh2YWwpKTtcbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRDaGFpbmFibGVNZXRob2QoJ2luY2x1ZGUnLCBpbmNsdWRlLCBpbmNsdWRlQ2hhaW5pbmdCZWhhdmlvcik7XG4gIEFzc2VydGlvbi5hZGRDaGFpbmFibGVNZXRob2QoJ2NvbnRhaW4nLCBpbmNsdWRlLCBpbmNsdWRlQ2hhaW5pbmdCZWhhdmlvcik7XG5cbiAgLyoqXG4gICAqICMjIyAub2tcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgdHJ1dGh5LlxuICAgKlxuICAgKiAgICAgZXhwZWN0KCdldmVydGhpbmcnKS50by5iZS5vaztcbiAgICogICAgIGV4cGVjdCgxKS50by5iZS5vaztcbiAgICogICAgIGV4cGVjdChmYWxzZSkudG8ubm90LmJlLm9rO1xuICAgKiAgICAgZXhwZWN0KHVuZGVmaW5lZCkudG8ubm90LmJlLm9rO1xuICAgKiAgICAgZXhwZWN0KG51bGwpLnRvLm5vdC5iZS5vaztcbiAgICpcbiAgICogQG5hbWUgb2tcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgQXNzZXJ0aW9uLmFkZFByb3BlcnR5KCdvaycsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgdHJ1dGh5J1xuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBmYWxzeScpO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC50cnVlXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGB0cnVlYC5cbiAgICpcbiAgICogICAgIGV4cGVjdCh0cnVlKS50by5iZS50cnVlO1xuICAgKiAgICAgZXhwZWN0KDEpLnRvLm5vdC5iZS50cnVlO1xuICAgKlxuICAgKiBAbmFtZSB0cnVlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRQcm9wZXJ0eSgndHJ1ZScsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgdHJ1ZSA9PT0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgdHJ1ZSdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgZmFsc2UnXG4gICAgICAsIHRoaXMubmVnYXRlID8gZmFsc2UgOiB0cnVlXG4gICAgKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAuZmFsc2VcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgYGZhbHNlYC5cbiAgICpcbiAgICogICAgIGV4cGVjdChmYWxzZSkudG8uYmUuZmFsc2U7XG4gICAqICAgICBleHBlY3QoMCkudG8ubm90LmJlLmZhbHNlO1xuICAgKlxuICAgKiBAbmFtZSBmYWxzZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkUHJvcGVydHkoJ2ZhbHNlJywgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICBmYWxzZSA9PT0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgZmFsc2UnXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIHRydWUnXG4gICAgICAsIHRoaXMubmVnYXRlID8gdHJ1ZSA6IGZhbHNlXG4gICAgKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAubnVsbFxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHRhcmdldCBpcyBgbnVsbGAuXG4gICAqXG4gICAqICAgICBleHBlY3QobnVsbCkudG8uYmUubnVsbDtcbiAgICogICAgIGV4cGVjdCh1bmRlZmluZWQpLm5vdC50by5iZS5udWxsO1xuICAgKlxuICAgKiBAbmFtZSBudWxsXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRQcm9wZXJ0eSgnbnVsbCcsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgbnVsbCA9PT0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgbnVsbCdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gbm90IHRvIGJlIG51bGwnXG4gICAgKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAudW5kZWZpbmVkXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGB1bmRlZmluZWRgLlxuICAgKlxuICAgKiAgICAgIGV4cGVjdCh1bmRlZmluZWQpLnRvLmJlLnVuZGVmaW5lZDtcbiAgICogICAgICBleHBlY3QobnVsbCkudG8ubm90LmJlLnVuZGVmaW5lZDtcbiAgICpcbiAgICogQG5hbWUgdW5kZWZpbmVkXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRQcm9wZXJ0eSgndW5kZWZpbmVkJywgZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICB1bmRlZmluZWQgPT09IGZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIHVuZGVmaW5lZCdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gbm90IHRvIGJlIHVuZGVmaW5lZCdcbiAgICApO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC5leGlzdFxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHRhcmdldCBpcyBuZWl0aGVyIGBudWxsYCBub3IgYHVuZGVmaW5lZGAuXG4gICAqXG4gICAqICAgICB2YXIgZm9vID0gJ2hpJ1xuICAgKiAgICAgICAsIGJhciA9IG51bGxcbiAgICogICAgICAgLCBiYXo7XG4gICAqXG4gICAqICAgICBleHBlY3QoZm9vKS50by5leGlzdDtcbiAgICogICAgIGV4cGVjdChiYXIpLnRvLm5vdC5leGlzdDtcbiAgICogICAgIGV4cGVjdChiYXopLnRvLm5vdC5leGlzdDtcbiAgICpcbiAgICogQG5hbWUgZXhpc3RcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgQXNzZXJ0aW9uLmFkZFByb3BlcnR5KCdleGlzdCcsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgbnVsbCAhPSBmbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBleGlzdCdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGV4aXN0J1xuICAgICk7XG4gIH0pO1xuXG5cbiAgLyoqXG4gICAqICMjIyAuZW1wdHlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQncyBsZW5ndGggaXMgYDBgLiBGb3IgYXJyYXlzLCBpdCBjaGVja3NcbiAgICogdGhlIGBsZW5ndGhgIHByb3BlcnR5LiBGb3Igb2JqZWN0cywgaXQgZ2V0cyB0aGUgY291bnQgb2ZcbiAgICogZW51bWVyYWJsZSBrZXlzLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KFtdKS50by5iZS5lbXB0eTtcbiAgICogICAgIGV4cGVjdCgnJykudG8uYmUuZW1wdHk7XG4gICAqICAgICBleHBlY3Qoe30pLnRvLmJlLmVtcHR5O1xuICAgKlxuICAgKiBAbmFtZSBlbXB0eVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkUHJvcGVydHkoJ2VtcHR5JywgZnVuY3Rpb24gKCkge1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgLCBleHBlY3RlZCA9IG9iajtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KG9iaikgfHwgJ3N0cmluZycgPT09IHR5cGVvZiBvYmplY3QpIHtcbiAgICAgIGV4cGVjdGVkID0gb2JqLmxlbmd0aDtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgICBleHBlY3RlZCA9IE9iamVjdC5rZXlzKG9iaikubGVuZ3RoO1xuICAgIH1cblxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAhZXhwZWN0ZWRcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgZW1wdHknXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IG5vdCB0byBiZSBlbXB0eSdcbiAgICApO1xuICB9KTtcblxuICAvKipcbiAgICogIyMjIC5hcmd1bWVudHNcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgYW4gYXJndW1lbnRzIG9iamVjdC5cbiAgICpcbiAgICogICAgIGZ1bmN0aW9uIHRlc3QgKCkge1xuICAgKiAgICAgICBleHBlY3QoYXJndW1lbnRzKS50by5iZS5hcmd1bWVudHM7XG4gICAqICAgICB9XG4gICAqXG4gICAqIEBuYW1lIGFyZ3VtZW50c1xuICAgKiBAYWxpYXMgQXJndW1lbnRzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGNoZWNrQXJndW1lbnRzICgpIHtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgdHlwZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAnW29iamVjdCBBcmd1bWVudHNdJyA9PT0gdHlwZVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBhcmd1bWVudHMgYnV0IGdvdCAnICsgdHlwZVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgYmUgYXJndW1lbnRzJ1xuICAgICk7XG4gIH1cblxuICBBc3NlcnRpb24uYWRkUHJvcGVydHkoJ2FyZ3VtZW50cycsIGNoZWNrQXJndW1lbnRzKTtcbiAgQXNzZXJ0aW9uLmFkZFByb3BlcnR5KCdBcmd1bWVudHMnLCBjaGVja0FyZ3VtZW50cyk7XG5cbiAgLyoqXG4gICAqICMjIyAuZXF1YWwodmFsdWUpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIHN0cmljdGx5IGVxdWFsIChgPT09YCkgdG8gYHZhbHVlYC5cbiAgICogQWx0ZXJuYXRlbHksIGlmIHRoZSBgZGVlcGAgZmxhZyBpcyBzZXQsIGFzc2VydHMgdGhhdFxuICAgKiB0aGUgdGFyZ2V0IGlzIGRlZXBseSBlcXVhbCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KCdoZWxsbycpLnRvLmVxdWFsKCdoZWxsbycpO1xuICAgKiAgICAgZXhwZWN0KDQyKS50by5lcXVhbCg0Mik7XG4gICAqICAgICBleHBlY3QoMSkudG8ubm90LmVxdWFsKHRydWUpO1xuICAgKiAgICAgZXhwZWN0KHsgZm9vOiAnYmFyJyB9KS50by5ub3QuZXF1YWwoeyBmb286ICdiYXInIH0pO1xuICAgKiAgICAgZXhwZWN0KHsgZm9vOiAnYmFyJyB9KS50by5kZWVwLmVxdWFsKHsgZm9vOiAnYmFyJyB9KTtcbiAgICpcbiAgICogQG5hbWUgZXF1YWxcbiAgICogQGFsaWFzIGVxdWFsc1xuICAgKiBAYWxpYXMgZXFcbiAgICogQGFsaWFzIGRlZXAuZXF1YWxcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBhc3NlcnRFcXVhbCAodmFsLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gICAgaWYgKGZsYWcodGhpcywgJ2RlZXAnKSkge1xuICAgICAgcmV0dXJuIHRoaXMuZXFsKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIHZhbCA9PT0gb2JqXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gZXF1YWwgI3tleHB9J1xuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBlcXVhbCAje2V4cH0nXG4gICAgICAgICwgdmFsXG4gICAgICAgICwgdGhpcy5fb2JqXG4gICAgICAgICwgdHJ1ZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdlcXVhbCcsIGFzc2VydEVxdWFsKTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnZXF1YWxzJywgYXNzZXJ0RXF1YWwpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdlcScsIGFzc2VydEVxdWFsKTtcblxuICAvKipcbiAgICogIyMjIC5lcWwodmFsdWUpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGRlZXBseSBlcXVhbCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KHsgZm9vOiAnYmFyJyB9KS50by5lcWwoeyBmb286ICdiYXInIH0pO1xuICAgKiAgICAgZXhwZWN0KFsgMSwgMiwgMyBdKS50by5lcWwoWyAxLCAyLCAzIF0pO1xuICAgKlxuICAgKiBAbmFtZSBlcWxcbiAgICogQGFsaWFzIGVxbHNcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBhc3NlcnRFcWwob2JqLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgXy5lcWwob2JqLCBmbGFnKHRoaXMsICdvYmplY3QnKSlcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gZGVlcGx5IGVxdWFsICN7ZXhwfSdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGRlZXBseSBlcXVhbCAje2V4cH0nXG4gICAgICAsIG9ialxuICAgICAgLCB0aGlzLl9vYmpcbiAgICAgICwgdHJ1ZVxuICAgICk7XG4gIH1cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdlcWwnLCBhc3NlcnRFcWwpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdlcWxzJywgYXNzZXJ0RXFsKTtcblxuICAvKipcbiAgICogIyMjIC5hYm92ZSh2YWx1ZSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgZ3JlYXRlciB0aGFuIGB2YWx1ZWAuXG4gICAqXG4gICAqICAgICBleHBlY3QoMTApLnRvLmJlLmFib3ZlKDUpO1xuICAgKlxuICAgKiBDYW4gYWxzbyBiZSB1c2VkIGluIGNvbmp1bmN0aW9uIHdpdGggYGxlbmd0aGAgdG9cbiAgICogYXNzZXJ0IGEgbWluaW11bSBsZW5ndGguIFRoZSBiZW5lZml0IGJlaW5nIGFcbiAgICogbW9yZSBpbmZvcm1hdGl2ZSBlcnJvciBtZXNzYWdlIHRoYW4gaWYgdGhlIGxlbmd0aFxuICAgKiB3YXMgc3VwcGxpZWQgZGlyZWN0bHkuXG4gICAqXG4gICAqICAgICBleHBlY3QoJ2ZvbycpLnRvLmhhdmUubGVuZ3RoLmFib3ZlKDIpO1xuICAgKiAgICAgZXhwZWN0KFsgMSwgMiwgMyBdKS50by5oYXZlLmxlbmd0aC5hYm92ZSgyKTtcbiAgICpcbiAgICogQG5hbWUgYWJvdmVcbiAgICogQGFsaWFzIGd0XG4gICAqIEBhbGlhcyBncmVhdGVyVGhhblxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBhc3NlcnRBYm92ZSAobiwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpO1xuICAgIGlmIChmbGFnKHRoaXMsICdkb0xlbmd0aCcpKSB7XG4gICAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5oYXZlLnByb3BlcnR5KCdsZW5ndGgnKTtcbiAgICAgIHZhciBsZW4gPSBvYmoubGVuZ3RoO1xuICAgICAgdGhpcy5hc3NlcnQoXG4gICAgICAgICAgbGVuID4gblxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGhhdmUgYSBsZW5ndGggYWJvdmUgI3tleHB9IGJ1dCBnb3QgI3thY3R9J1xuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBoYXZlIGEgbGVuZ3RoIGFib3ZlICN7ZXhwfSdcbiAgICAgICAgLCBuXG4gICAgICAgICwgbGVuXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICBvYmogPiBuXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgYWJvdmUgJyArIG5cbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBhdCBtb3N0ICcgKyBuXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ2Fib3ZlJywgYXNzZXJ0QWJvdmUpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdndCcsIGFzc2VydEFib3ZlKTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnZ3JlYXRlclRoYW4nLCBhc3NlcnRBYm92ZSk7XG5cbiAgLyoqXG4gICAqICMjIyAubGVhc3QodmFsdWUpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBgdmFsdWVgLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KDEwKS50by5iZS5hdC5sZWFzdCgxMCk7XG4gICAqXG4gICAqIENhbiBhbHNvIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgbGVuZ3RoYCB0b1xuICAgKiBhc3NlcnQgYSBtaW5pbXVtIGxlbmd0aC4gVGhlIGJlbmVmaXQgYmVpbmcgYVxuICAgKiBtb3JlIGluZm9ybWF0aXZlIGVycm9yIG1lc3NhZ2UgdGhhbiBpZiB0aGUgbGVuZ3RoXG4gICAqIHdhcyBzdXBwbGllZCBkaXJlY3RseS5cbiAgICpcbiAgICogICAgIGV4cGVjdCgnZm9vJykudG8uaGF2ZS5sZW5ndGgub2YuYXQubGVhc3QoMik7XG4gICAqICAgICBleHBlY3QoWyAxLCAyLCAzIF0pLnRvLmhhdmUubGVuZ3RoLm9mLmF0LmxlYXN0KDMpO1xuICAgKlxuICAgKiBAbmFtZSBsZWFzdFxuICAgKiBAYWxpYXMgZ3RlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFzc2VydExlYXN0IChuLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gICAgaWYgKGZsYWcodGhpcywgJ2RvTGVuZ3RoJykpIHtcbiAgICAgIG5ldyBBc3NlcnRpb24ob2JqLCBtc2cpLnRvLmhhdmUucHJvcGVydHkoJ2xlbmd0aCcpO1xuICAgICAgdmFyIGxlbiA9IG9iai5sZW5ndGg7XG4gICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICBsZW4gPj0gblxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGhhdmUgYSBsZW5ndGggYXQgbGVhc3QgI3tleHB9IGJ1dCBnb3QgI3thY3R9J1xuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGhhdmUgYSBsZW5ndGggYmVsb3cgI3tleHB9J1xuICAgICAgICAsIG5cbiAgICAgICAgLCBsZW5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIG9iaiA+PSBuXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgYXQgbGVhc3QgJyArIG5cbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBiZWxvdyAnICsgblxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdsZWFzdCcsIGFzc2VydExlYXN0KTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnZ3RlJywgYXNzZXJ0TGVhc3QpO1xuXG4gIC8qKlxuICAgKiAjIyMgLmJlbG93KHZhbHVlKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHRhcmdldCBpcyBsZXNzIHRoYW4gYHZhbHVlYC5cbiAgICpcbiAgICogICAgIGV4cGVjdCg1KS50by5iZS5iZWxvdygxMCk7XG4gICAqXG4gICAqIENhbiBhbHNvIGJlIHVzZWQgaW4gY29uanVuY3Rpb24gd2l0aCBgbGVuZ3RoYCB0b1xuICAgKiBhc3NlcnQgYSBtYXhpbXVtIGxlbmd0aC4gVGhlIGJlbmVmaXQgYmVpbmcgYVxuICAgKiBtb3JlIGluZm9ybWF0aXZlIGVycm9yIG1lc3NhZ2UgdGhhbiBpZiB0aGUgbGVuZ3RoXG4gICAqIHdhcyBzdXBwbGllZCBkaXJlY3RseS5cbiAgICpcbiAgICogICAgIGV4cGVjdCgnZm9vJykudG8uaGF2ZS5sZW5ndGguYmVsb3coNCk7XG4gICAqICAgICBleHBlY3QoWyAxLCAyLCAzIF0pLnRvLmhhdmUubGVuZ3RoLmJlbG93KDQpO1xuICAgKlxuICAgKiBAbmFtZSBiZWxvd1xuICAgKiBAYWxpYXMgbHRcbiAgICogQGFsaWFzIGxlc3NUaGFuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFzc2VydEJlbG93IChuLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gICAgaWYgKGZsYWcodGhpcywgJ2RvTGVuZ3RoJykpIHtcbiAgICAgIG5ldyBBc3NlcnRpb24ob2JqLCBtc2cpLnRvLmhhdmUucHJvcGVydHkoJ2xlbmd0aCcpO1xuICAgICAgdmFyIGxlbiA9IG9iai5sZW5ndGg7XG4gICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICBsZW4gPCBuXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gaGF2ZSBhIGxlbmd0aCBiZWxvdyAje2V4cH0gYnV0IGdvdCAje2FjdH0nXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGhhdmUgYSBsZW5ndGggYmVsb3cgI3tleHB9J1xuICAgICAgICAsIG5cbiAgICAgICAgLCBsZW5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIG9iaiA8IG5cbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBiZWxvdyAnICsgblxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIGF0IGxlYXN0ICcgKyBuXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ2JlbG93JywgYXNzZXJ0QmVsb3cpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdsdCcsIGFzc2VydEJlbG93KTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnbGVzc1RoYW4nLCBhc3NlcnRCZWxvdyk7XG5cbiAgLyoqXG4gICAqICMjIyAubW9zdCh2YWx1ZSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIGB2YWx1ZWAuXG4gICAqXG4gICAqICAgICBleHBlY3QoNSkudG8uYmUuYXQubW9zdCg1KTtcbiAgICpcbiAgICogQ2FuIGFsc28gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGBsZW5ndGhgIHRvXG4gICAqIGFzc2VydCBhIG1heGltdW0gbGVuZ3RoLiBUaGUgYmVuZWZpdCBiZWluZyBhXG4gICAqIG1vcmUgaW5mb3JtYXRpdmUgZXJyb3IgbWVzc2FnZSB0aGFuIGlmIHRoZSBsZW5ndGhcbiAgICogd2FzIHN1cHBsaWVkIGRpcmVjdGx5LlxuICAgKlxuICAgKiAgICAgZXhwZWN0KCdmb28nKS50by5oYXZlLmxlbmd0aC5vZi5hdC5tb3N0KDQpO1xuICAgKiAgICAgZXhwZWN0KFsgMSwgMiwgMyBdKS50by5oYXZlLmxlbmd0aC5vZi5hdC5tb3N0KDMpO1xuICAgKlxuICAgKiBAbmFtZSBtb3N0XG4gICAqIEBhbGlhcyBsdGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIF9vcHRpb25hbF9cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gYXNzZXJ0TW9zdCAobiwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpO1xuICAgIGlmIChmbGFnKHRoaXMsICdkb0xlbmd0aCcpKSB7XG4gICAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5oYXZlLnByb3BlcnR5KCdsZW5ndGgnKTtcbiAgICAgIHZhciBsZW4gPSBvYmoubGVuZ3RoO1xuICAgICAgdGhpcy5hc3NlcnQoXG4gICAgICAgICAgbGVuIDw9IG5cbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBoYXZlIGEgbGVuZ3RoIGF0IG1vc3QgI3tleHB9IGJ1dCBnb3QgI3thY3R9J1xuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGhhdmUgYSBsZW5ndGggYWJvdmUgI3tleHB9J1xuICAgICAgICAsIG5cbiAgICAgICAgLCBsZW5cbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIG9iaiA8PSBuXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgYXQgbW9zdCAnICsgblxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIGFib3ZlICcgKyBuXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ21vc3QnLCBhc3NlcnRNb3N0KTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnbHRlJywgYXNzZXJ0TW9zdCk7XG5cbiAgLyoqXG4gICAqICMjIyAud2l0aGluKHN0YXJ0LCBmaW5pc2gpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIHdpdGhpbiBhIHJhbmdlLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KDcpLnRvLmJlLndpdGhpbig1LDEwKTtcbiAgICpcbiAgICogQ2FuIGFsc28gYmUgdXNlZCBpbiBjb25qdW5jdGlvbiB3aXRoIGBsZW5ndGhgIHRvXG4gICAqIGFzc2VydCBhIGxlbmd0aCByYW5nZS4gVGhlIGJlbmVmaXQgYmVpbmcgYVxuICAgKiBtb3JlIGluZm9ybWF0aXZlIGVycm9yIG1lc3NhZ2UgdGhhbiBpZiB0aGUgbGVuZ3RoXG4gICAqIHdhcyBzdXBwbGllZCBkaXJlY3RseS5cbiAgICpcbiAgICogICAgIGV4cGVjdCgnZm9vJykudG8uaGF2ZS5sZW5ndGgud2l0aGluKDIsNCk7XG4gICAqICAgICBleHBlY3QoWyAxLCAyLCAzIF0pLnRvLmhhdmUubGVuZ3RoLndpdGhpbigyLDQpO1xuICAgKlxuICAgKiBAbmFtZSB3aXRoaW5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0IGxvd2VyYm91bmQgaW5jbHVzaXZlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBmaW5pc2ggdXBwZXJib3VuZCBpbmNsdXNpdmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCd3aXRoaW4nLCBmdW5jdGlvbiAoc3RhcnQsIGZpbmlzaCwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgICAsIHJhbmdlID0gc3RhcnQgKyAnLi4nICsgZmluaXNoO1xuICAgIGlmIChmbGFnKHRoaXMsICdkb0xlbmd0aCcpKSB7XG4gICAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5oYXZlLnByb3BlcnR5KCdsZW5ndGgnKTtcbiAgICAgIHZhciBsZW4gPSBvYmoubGVuZ3RoO1xuICAgICAgdGhpcy5hc3NlcnQoXG4gICAgICAgICAgbGVuID49IHN0YXJ0ICYmIGxlbiA8PSBmaW5pc2hcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBoYXZlIGEgbGVuZ3RoIHdpdGhpbiAnICsgcmFuZ2VcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgaGF2ZSBhIGxlbmd0aCB3aXRoaW4gJyArIHJhbmdlXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICBvYmogPj0gc3RhcnQgJiYgb2JqIDw9IGZpbmlzaFxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIHdpdGhpbiAnICsgcmFuZ2VcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgYmUgd2l0aGluICcgKyByYW5nZVxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8qKlxuICAgKiAjIyMgLmluc3RhbmNlb2YoY29uc3RydWN0b3IpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGFuIGluc3RhbmNlIG9mIGBjb25zdHJ1Y3RvcmAuXG4gICAqXG4gICAqICAgICB2YXIgVGVhID0gZnVuY3Rpb24gKG5hbWUpIHsgdGhpcy5uYW1lID0gbmFtZTsgfVxuICAgKiAgICAgICAsIENoYWkgPSBuZXcgVGVhKCdjaGFpJyk7XG4gICAqXG4gICAqICAgICBleHBlY3QoQ2hhaSkudG8uYmUuYW4uaW5zdGFuY2VvZihUZWEpO1xuICAgKiAgICAgZXhwZWN0KFsgMSwgMiwgMyBdKS50by5iZS5pbnN0YW5jZW9mKEFycmF5KTtcbiAgICpcbiAgICogQG5hbWUgaW5zdGFuY2VvZlxuICAgKiBAcGFyYW0ge0NvbnN0cnVjdG9yfSBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhbGlhcyBpbnN0YW5jZU9mXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFzc2VydEluc3RhbmNlT2YgKGNvbnN0cnVjdG9yLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgbmFtZSA9IF8uZ2V0TmFtZShjb25zdHJ1Y3Rvcik7XG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICAgIGZsYWcodGhpcywgJ29iamVjdCcpIGluc3RhbmNlb2YgY29uc3RydWN0b3JcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgYW4gaW5zdGFuY2Ugb2YgJyArIG5hbWVcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGJlIGFuIGluc3RhbmNlIG9mICcgKyBuYW1lXG4gICAgKTtcbiAgfTtcblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdpbnN0YW5jZW9mJywgYXNzZXJ0SW5zdGFuY2VPZik7XG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ2luc3RhbmNlT2YnLCBhc3NlcnRJbnN0YW5jZU9mKTtcblxuICAvKipcbiAgICogIyMjIC5wcm9wZXJ0eShuYW1lLCBbdmFsdWVdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHRhcmdldCBoYXMgYSBwcm9wZXJ0eSBgbmFtZWAsIG9wdGlvbmFsbHkgYXNzZXJ0aW5nIHRoYXRcbiAgICogdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHkgaXMgc3RyaWN0bHkgZXF1YWwgdG8gIGB2YWx1ZWAuXG4gICAqIElmIHRoZSBgZGVlcGAgZmxhZyBpcyBzZXQsIHlvdSBjYW4gdXNlIGRvdC0gYW5kIGJyYWNrZXQtbm90YXRpb24gZm9yIGRlZXBcbiAgICogcmVmZXJlbmNlcyBpbnRvIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICpcbiAgICogICAgIC8vIHNpbXBsZSByZWZlcmVuY2luZ1xuICAgKiAgICAgdmFyIG9iaiA9IHsgZm9vOiAnYmFyJyB9O1xuICAgKiAgICAgZXhwZWN0KG9iaikudG8uaGF2ZS5wcm9wZXJ0eSgnZm9vJyk7XG4gICAqICAgICBleHBlY3Qob2JqKS50by5oYXZlLnByb3BlcnR5KCdmb28nLCAnYmFyJyk7XG4gICAqXG4gICAqICAgICAvLyBkZWVwIHJlZmVyZW5jaW5nXG4gICAqICAgICB2YXIgZGVlcE9iaiA9IHtcbiAgICogICAgICAgICBncmVlbjogeyB0ZWE6ICdtYXRjaGEnIH1cbiAgICogICAgICAgLCB0ZWFzOiBbICdjaGFpJywgJ21hdGNoYScsIHsgdGVhOiAna29uYWNoYScgfSBdXG4gICAqICAgICB9O1xuXG4gICAqICAgICBleHBlY3QoZGVlcE9iaikudG8uaGF2ZS5kZWVwLnByb3BlcnR5KCdncmVlbi50ZWEnLCAnbWF0Y2hhJyk7XG4gICAqICAgICBleHBlY3QoZGVlcE9iaikudG8uaGF2ZS5kZWVwLnByb3BlcnR5KCd0ZWFzWzFdJywgJ21hdGNoYScpO1xuICAgKiAgICAgZXhwZWN0KGRlZXBPYmopLnRvLmhhdmUuZGVlcC5wcm9wZXJ0eSgndGVhc1syXS50ZWEnLCAna29uYWNoYScpO1xuICAgKlxuICAgKiBZb3UgY2FuIGFsc28gdXNlIGFuIGFycmF5IGFzIHRoZSBzdGFydGluZyBwb2ludCBvZiBhIGBkZWVwLnByb3BlcnR5YFxuICAgKiBhc3NlcnRpb24sIG9yIHRyYXZlcnNlIG5lc3RlZCBhcnJheXMuXG4gICAqXG4gICAqICAgICB2YXIgYXJyID0gW1xuICAgKiAgICAgICAgIFsgJ2NoYWknLCAnbWF0Y2hhJywgJ2tvbmFjaGEnIF1cbiAgICogICAgICAgLCBbIHsgdGVhOiAnY2hhaScgfVxuICAgKiAgICAgICAgICwgeyB0ZWE6ICdtYXRjaGEnIH1cbiAgICogICAgICAgICAsIHsgdGVhOiAna29uYWNoYScgfSBdXG4gICAqICAgICBdO1xuICAgKlxuICAgKiAgICAgZXhwZWN0KGFycikudG8uaGF2ZS5kZWVwLnByb3BlcnR5KCdbMF1bMV0nLCAnbWF0Y2hhJyk7XG4gICAqICAgICBleHBlY3QoYXJyKS50by5oYXZlLmRlZXAucHJvcGVydHkoJ1sxXVsyXS50ZWEnLCAna29uYWNoYScpO1xuICAgKlxuICAgKiBGdXJ0aGVybW9yZSwgYHByb3BlcnR5YCBjaGFuZ2VzIHRoZSBzdWJqZWN0IG9mIHRoZSBhc3NlcnRpb25cbiAgICogdG8gYmUgdGhlIHZhbHVlIG9mIHRoYXQgcHJvcGVydHkgZnJvbSB0aGUgb3JpZ2luYWwgb2JqZWN0LiBUaGlzXG4gICAqIHBlcm1pdHMgZm9yIGZ1cnRoZXIgY2hhaW5hYmxlIGFzc2VydGlvbnMgb24gdGhhdCBwcm9wZXJ0eS5cbiAgICpcbiAgICogICAgIGV4cGVjdChvYmopLnRvLmhhdmUucHJvcGVydHkoJ2ZvbycpXG4gICAqICAgICAgIC50aGF0LmlzLmEoJ3N0cmluZycpO1xuICAgKiAgICAgZXhwZWN0KGRlZXBPYmopLnRvLmhhdmUucHJvcGVydHkoJ2dyZWVuJylcbiAgICogICAgICAgLnRoYXQuaXMuYW4oJ29iamVjdCcpXG4gICAqICAgICAgIC50aGF0LmRlZXAuZXF1YWxzKHsgdGVhOiAnbWF0Y2hhJyB9KTtcbiAgICogICAgIGV4cGVjdChkZWVwT2JqKS50by5oYXZlLnByb3BlcnR5KCd0ZWFzJylcbiAgICogICAgICAgLnRoYXQuaXMuYW4oJ2FycmF5JylcbiAgICogICAgICAgLndpdGguZGVlcC5wcm9wZXJ0eSgnWzJdJylcbiAgICogICAgICAgICAudGhhdC5kZWVwLmVxdWFscyh7IHRlYTogJ2tvbmFjaGEnIH0pO1xuICAgKlxuICAgKiBAbmFtZSBwcm9wZXJ0eVxuICAgKiBAYWxpYXMgZGVlcC5wcm9wZXJ0eVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAob3B0aW9uYWwpXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIF9vcHRpb25hbF9cbiAgICogQHJldHVybnMgdmFsdWUgb2YgcHJvcGVydHkgZm9yIGNoYWluaW5nXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ3Byb3BlcnR5JywgZnVuY3Rpb24gKG5hbWUsIHZhbCwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG5cbiAgICB2YXIgZGVzY3JpcHRvciA9IGZsYWcodGhpcywgJ2RlZXAnKSA/ICdkZWVwIHByb3BlcnR5ICcgOiAncHJvcGVydHkgJ1xuICAgICAgLCBuZWdhdGUgPSBmbGFnKHRoaXMsICduZWdhdGUnKVxuICAgICAgLCBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgLCB2YWx1ZSA9IGZsYWcodGhpcywgJ2RlZXAnKVxuICAgICAgICA/IF8uZ2V0UGF0aFZhbHVlKG5hbWUsIG9iailcbiAgICAgICAgOiBvYmpbbmFtZV07XG5cbiAgICBpZiAobmVnYXRlICYmIHVuZGVmaW5lZCAhPT0gdmFsKSB7XG4gICAgICBpZiAodW5kZWZpbmVkID09PSB2YWx1ZSkge1xuICAgICAgICBtc2cgPSAobXNnICE9IG51bGwpID8gbXNnICsgJzogJyA6ICcnO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IobXNnICsgXy5pbnNwZWN0KG9iaikgKyAnIGhhcyBubyAnICsgZGVzY3JpcHRvciArIF8uaW5zcGVjdChuYW1lKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIHVuZGVmaW5lZCAhPT0gdmFsdWVcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBoYXZlIGEgJyArIGRlc2NyaXB0b3IgKyBfLmluc3BlY3QobmFtZSlcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgaGF2ZSAnICsgZGVzY3JpcHRvciArIF8uaW5zcGVjdChuYW1lKSk7XG4gICAgfVxuXG4gICAgaWYgKHVuZGVmaW5lZCAhPT0gdmFsKSB7XG4gICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICB2YWwgPT09IHZhbHVlXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gaGF2ZSBhICcgKyBkZXNjcmlwdG9yICsgXy5pbnNwZWN0KG5hbWUpICsgJyBvZiAje2V4cH0sIGJ1dCBnb3QgI3thY3R9J1xuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBoYXZlIGEgJyArIGRlc2NyaXB0b3IgKyBfLmluc3BlY3QobmFtZSkgKyAnIG9mICN7YWN0fSdcbiAgICAgICAgLCB2YWxcbiAgICAgICAgLCB2YWx1ZVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmbGFnKHRoaXMsICdvYmplY3QnLCB2YWx1ZSk7XG4gIH0pO1xuXG5cbiAgLyoqXG4gICAqICMjIyAub3duUHJvcGVydHkobmFtZSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaGFzIGFuIG93biBwcm9wZXJ0eSBgbmFtZWAuXG4gICAqXG4gICAqICAgICBleHBlY3QoJ3Rlc3QnKS50by5oYXZlLm93blByb3BlcnR5KCdsZW5ndGgnKTtcbiAgICpcbiAgICogQG5hbWUgb3duUHJvcGVydHlcbiAgICogQGFsaWFzIGhhdmVPd25Qcm9wZXJ0eVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFzc2VydE93blByb3BlcnR5IChuYW1lLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eShuYW1lKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBoYXZlIG93biBwcm9wZXJ0eSAnICsgXy5pbnNwZWN0KG5hbWUpXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBoYXZlIG93biBwcm9wZXJ0eSAnICsgXy5pbnNwZWN0KG5hbWUpXG4gICAgKTtcbiAgfVxuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ293blByb3BlcnR5JywgYXNzZXJ0T3duUHJvcGVydHkpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdoYXZlT3duUHJvcGVydHknLCBhc3NlcnRPd25Qcm9wZXJ0eSk7XG5cbiAgLyoqXG4gICAqICMjIyAubGVuZ3RoKHZhbHVlKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgdGhlIHRhcmdldCdzIGBsZW5ndGhgIHByb3BlcnR5IGhhc1xuICAgKiB0aGUgZXhwZWN0ZWQgdmFsdWUuXG4gICAqXG4gICAqICAgICBleHBlY3QoWyAxLCAyLCAzXSkudG8uaGF2ZS5sZW5ndGgoMyk7XG4gICAqICAgICBleHBlY3QoJ2Zvb2JhcicpLnRvLmhhdmUubGVuZ3RoKDYpO1xuICAgKlxuICAgKiBDYW4gYWxzbyBiZSB1c2VkIGFzIGEgY2hhaW4gcHJlY3Vyc29yIHRvIGEgdmFsdWVcbiAgICogY29tcGFyaXNvbiBmb3IgdGhlIGxlbmd0aCBwcm9wZXJ0eS5cbiAgICpcbiAgICogICAgIGV4cGVjdCgnZm9vJykudG8uaGF2ZS5sZW5ndGguYWJvdmUoMik7XG4gICAqICAgICBleHBlY3QoWyAxLCAyLCAzIF0pLnRvLmhhdmUubGVuZ3RoLmFib3ZlKDIpO1xuICAgKiAgICAgZXhwZWN0KCdmb28nKS50by5oYXZlLmxlbmd0aC5iZWxvdyg0KTtcbiAgICogICAgIGV4cGVjdChbIDEsIDIsIDMgXSkudG8uaGF2ZS5sZW5ndGguYmVsb3coNCk7XG4gICAqICAgICBleHBlY3QoJ2ZvbycpLnRvLmhhdmUubGVuZ3RoLndpdGhpbigyLDQpO1xuICAgKiAgICAgZXhwZWN0KFsgMSwgMiwgMyBdKS50by5oYXZlLmxlbmd0aC53aXRoaW4oMiw0KTtcbiAgICpcbiAgICogQG5hbWUgbGVuZ3RoXG4gICAqIEBhbGlhcyBsZW5ndGhPZlxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIF9vcHRpb25hbF9cbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgZnVuY3Rpb24gYXNzZXJ0TGVuZ3RoQ2hhaW4gKCkge1xuICAgIGZsYWcodGhpcywgJ2RvTGVuZ3RoJywgdHJ1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhc3NlcnRMZW5ndGggKG4sIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKTtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5oYXZlLnByb3BlcnR5KCdsZW5ndGgnKTtcbiAgICB2YXIgbGVuID0gb2JqLmxlbmd0aDtcblxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICBsZW4gPT0gblxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBoYXZlIGEgbGVuZ3RoIG9mICN7ZXhwfSBidXQgZ290ICN7YWN0fSdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGhhdmUgYSBsZW5ndGggb2YgI3thY3R9J1xuICAgICAgLCBuXG4gICAgICAsIGxlblxuICAgICk7XG4gIH1cblxuICBBc3NlcnRpb24uYWRkQ2hhaW5hYmxlTWV0aG9kKCdsZW5ndGgnLCBhc3NlcnRMZW5ndGgsIGFzc2VydExlbmd0aENoYWluKTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnbGVuZ3RoT2YnLCBhc3NlcnRMZW5ndGgsIGFzc2VydExlbmd0aENoYWluKTtcblxuICAvKipcbiAgICogIyMjIC5tYXRjaChyZWdleHApXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IG1hdGNoZXMgYSByZWd1bGFyIGV4cHJlc3Npb24uXG4gICAqXG4gICAqICAgICBleHBlY3QoJ2Zvb2JhcicpLnRvLm1hdGNoKC9eZm9vLyk7XG4gICAqXG4gICAqIEBuYW1lIG1hdGNoXG4gICAqIEBwYXJhbSB7UmVnRXhwfSBSZWd1bGFyRXhwcmVzc2lvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ21hdGNoJywgZnVuY3Rpb24gKHJlLCBtc2cpIHtcbiAgICBpZiAobXNnKSBmbGFnKHRoaXMsICdtZXNzYWdlJywgbXNnKTtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICAgIHJlLmV4ZWMob2JqKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBtYXRjaCAnICsgcmVcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gbm90IHRvIG1hdGNoICcgKyByZVxuICAgICk7XG4gIH0pO1xuXG4gIC8qKlxuICAgKiAjIyMgLnN0cmluZyhzdHJpbmcpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgc3RyaW5nIHRhcmdldCBjb250YWlucyBhbm90aGVyIHN0cmluZy5cbiAgICpcbiAgICogICAgIGV4cGVjdCgnZm9vYmFyJykudG8uaGF2ZS5zdHJpbmcoJ2JhcicpO1xuICAgKlxuICAgKiBAbmFtZSBzdHJpbmdcbiAgICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ3N0cmluZycsIGZ1bmN0aW9uIChzdHIsIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKTtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS5pcy5hKCdzdHJpbmcnKTtcblxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICB+b2JqLmluZGV4T2Yoc3RyKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBjb250YWluICcgKyBfLmluc3BlY3Qoc3RyKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgY29udGFpbiAnICsgXy5pbnNwZWN0KHN0cilcbiAgICApO1xuICB9KTtcblxuXG4gIC8qKlxuICAgKiAjIyMgLmtleXMoa2V5MSwgW2tleTJdLCBbLi4uXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaGFzIGV4YWN0bHkgdGhlIGdpdmVuIGtleXMsIG9yXG4gICAqIGFzc2VydHMgdGhlIGluY2x1c2lvbiBvZiBzb21lIGtleXMgd2hlbiB1c2luZyB0aGVcbiAgICogYGluY2x1ZGVgIG9yIGBjb250YWluYCBtb2RpZmllcnMuXG4gICAqXG4gICAqICAgICBleHBlY3QoeyBmb286IDEsIGJhcjogMiB9KS50by5oYXZlLmtleXMoWydmb28nLCAnYmFyJ10pO1xuICAgKiAgICAgZXhwZWN0KHsgZm9vOiAxLCBiYXI6IDIsIGJhejogMyB9KS50by5jb250YWluLmtleXMoJ2ZvbycsICdiYXInKTtcbiAgICpcbiAgICogQG5hbWUga2V5c1xuICAgKiBAYWxpYXMga2V5XG4gICAqIEBwYXJhbSB7U3RyaW5nLi4ufEFycmF5fSBrZXlzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGZ1bmN0aW9uIGFzc2VydEtleXMgKGtleXMpIHtcbiAgICB2YXIgb2JqID0gZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgICwgc3RyXG4gICAgICAsIG9rID0gdHJ1ZTtcblxuICAgIGtleXMgPSBrZXlzIGluc3RhbmNlb2YgQXJyYXlcbiAgICAgID8ga2V5c1xuICAgICAgOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXG4gICAgaWYgKCFrZXlzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdrZXlzIHJlcXVpcmVkJyk7XG5cbiAgICB2YXIgYWN0dWFsID0gT2JqZWN0LmtleXMob2JqKVxuICAgICAgLCBsZW4gPSBrZXlzLmxlbmd0aDtcblxuICAgIC8vIEluY2x1c2lvblxuICAgIG9rID0ga2V5cy5ldmVyeShmdW5jdGlvbihrZXkpe1xuICAgICAgcmV0dXJuIH5hY3R1YWwuaW5kZXhPZihrZXkpO1xuICAgIH0pO1xuXG4gICAgLy8gU3RyaWN0XG4gICAgaWYgKCFmbGFnKHRoaXMsICduZWdhdGUnKSAmJiAhZmxhZyh0aGlzLCAnY29udGFpbnMnKSkge1xuICAgICAgb2sgPSBvayAmJiBrZXlzLmxlbmd0aCA9PSBhY3R1YWwubGVuZ3RoO1xuICAgIH1cblxuICAgIC8vIEtleSBzdHJpbmdcbiAgICBpZiAobGVuID4gMSkge1xuICAgICAga2V5cyA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHJldHVybiBfLmluc3BlY3Qoa2V5KTtcbiAgICAgIH0pO1xuICAgICAgdmFyIGxhc3QgPSBrZXlzLnBvcCgpO1xuICAgICAgc3RyID0ga2V5cy5qb2luKCcsICcpICsgJywgYW5kICcgKyBsYXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBfLmluc3BlY3Qoa2V5c1swXSk7XG4gICAgfVxuXG4gICAgLy8gRm9ybVxuICAgIHN0ciA9IChsZW4gPiAxID8gJ2tleXMgJyA6ICdrZXkgJykgKyBzdHI7XG5cbiAgICAvLyBIYXZlIC8gaW5jbHVkZVxuICAgIHN0ciA9IChmbGFnKHRoaXMsICdjb250YWlucycpID8gJ2NvbnRhaW4gJyA6ICdoYXZlICcpICsgc3RyO1xuXG4gICAgLy8gQXNzZXJ0aW9uXG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICAgIG9rXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvICcgKyBzdHJcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90ICcgKyBzdHJcbiAgICApO1xuICB9XG5cbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgna2V5cycsIGFzc2VydEtleXMpO1xuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdrZXknLCBhc3NlcnRLZXlzKTtcblxuICAvKipcbiAgICogIyMjIC50aHJvdyhjb25zdHJ1Y3RvcilcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSBmdW5jdGlvbiB0YXJnZXQgd2lsbCB0aHJvdyBhIHNwZWNpZmljIGVycm9yLCBvciBzcGVjaWZpYyB0eXBlIG9mIGVycm9yXG4gICAqIChhcyBkZXRlcm1pbmVkIHVzaW5nIGBpbnN0YW5jZW9mYCksIG9wdGlvbmFsbHkgd2l0aCBhIFJlZ0V4cCBvciBzdHJpbmcgaW5jbHVzaW9uIHRlc3RcbiAgICogZm9yIHRoZSBlcnJvcidzIG1lc3NhZ2UuXG4gICAqXG4gICAqICAgICB2YXIgZXJyID0gbmV3IFJlZmVyZW5jZUVycm9yKCdUaGlzIGlzIGEgYmFkIGZ1bmN0aW9uLicpO1xuICAgKiAgICAgdmFyIGZuID0gZnVuY3Rpb24gKCkgeyB0aHJvdyBlcnI7IH1cbiAgICogICAgIGV4cGVjdChmbikudG8udGhyb3coUmVmZXJlbmNlRXJyb3IpO1xuICAgKiAgICAgZXhwZWN0KGZuKS50by50aHJvdyhFcnJvcik7XG4gICAqICAgICBleHBlY3QoZm4pLnRvLnRocm93KC9iYWQgZnVuY3Rpb24vKTtcbiAgICogICAgIGV4cGVjdChmbikudG8ubm90LnRocm93KCdnb29kIGZ1bmN0aW9uJyk7XG4gICAqICAgICBleHBlY3QoZm4pLnRvLnRocm93KFJlZmVyZW5jZUVycm9yLCAvYmFkIGZ1bmN0aW9uLyk7XG4gICAqICAgICBleHBlY3QoZm4pLnRvLnRocm93KGVycik7XG4gICAqICAgICBleHBlY3QoZm4pLnRvLm5vdC50aHJvdyhuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlLicpKTtcbiAgICpcbiAgICogUGxlYXNlIG5vdGUgdGhhdCB3aGVuIGEgdGhyb3cgZXhwZWN0YXRpb24gaXMgbmVnYXRlZCwgaXQgd2lsbCBjaGVjayBlYWNoXG4gICAqIHBhcmFtZXRlciBpbmRlcGVuZGVudGx5LCBzdGFydGluZyB3aXRoIGVycm9yIGNvbnN0cnVjdG9yIHR5cGUuIFRoZSBhcHByb3ByaWF0ZSB3YXlcbiAgICogdG8gY2hlY2sgZm9yIHRoZSBleGlzdGVuY2Ugb2YgYSB0eXBlIG9mIGVycm9yIGJ1dCBmb3IgYSBtZXNzYWdlIHRoYXQgZG9lcyBub3QgbWF0Y2hcbiAgICogaXMgdG8gdXNlIGBhbmRgLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KGZuKS50by50aHJvdyhSZWZlcmVuY2VFcnJvcilcbiAgICogICAgICAgIC5hbmQubm90LnRocm93KC9nb29kIGZ1bmN0aW9uLyk7XG4gICAqXG4gICAqIEBuYW1lIHRocm93XG4gICAqIEBhbGlhcyB0aHJvd3NcbiAgICogQGFsaWFzIFRocm93XG4gICAqIEBwYXJhbSB7RXJyb3JDb25zdHJ1Y3Rvcn0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd8UmVnRXhwfSBleHBlY3RlZCBlcnJvciBtZXNzYWdlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIF9vcHRpb25hbF9cbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvciNFcnJvcl90eXBlc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBmdW5jdGlvbiBhc3NlcnRUaHJvd3MgKGNvbnN0cnVjdG9yLCBlcnJNc2csIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKTtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS5pcy5hKCdmdW5jdGlvbicpO1xuXG4gICAgdmFyIHRocm93biA9IGZhbHNlXG4gICAgICAsIGRlc2lyZWRFcnJvciA9IG51bGxcbiAgICAgICwgbmFtZSA9IG51bGxcbiAgICAgICwgdGhyb3duRXJyb3IgPSBudWxsO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIGVyck1zZyA9IG51bGw7XG4gICAgICBjb25zdHJ1Y3RvciA9IG51bGw7XG4gICAgfSBlbHNlIGlmIChjb25zdHJ1Y3RvciAmJiAoY29uc3RydWN0b3IgaW5zdGFuY2VvZiBSZWdFeHAgfHwgJ3N0cmluZycgPT09IHR5cGVvZiBjb25zdHJ1Y3RvcikpIHtcbiAgICAgIGVyck1zZyA9IGNvbnN0cnVjdG9yO1xuICAgICAgY29uc3RydWN0b3IgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoY29uc3RydWN0b3IgJiYgY29uc3RydWN0b3IgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgZGVzaXJlZEVycm9yID0gY29uc3RydWN0b3I7XG4gICAgICBjb25zdHJ1Y3RvciA9IG51bGw7XG4gICAgICBlcnJNc2cgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGNvbnN0cnVjdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBuYW1lID0gKG5ldyBjb25zdHJ1Y3RvcigpKS5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdHJ1Y3RvciA9IG51bGw7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIG9iaigpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gZmlyc3QsIGNoZWNrIGRlc2lyZWQgZXJyb3JcbiAgICAgIGlmIChkZXNpcmVkRXJyb3IpIHtcbiAgICAgICAgdGhpcy5hc3NlcnQoXG4gICAgICAgICAgICBlcnIgPT09IGRlc2lyZWRFcnJvclxuICAgICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gdGhyb3cgI3tleHB9IGJ1dCAje2FjdH0gd2FzIHRocm93bidcbiAgICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCB0aHJvdyAje2V4cH0nXG4gICAgICAgICAgLCBkZXNpcmVkRXJyb3JcbiAgICAgICAgICAsIGVyclxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgICAgLy8gbmV4dCwgY2hlY2sgY29uc3RydWN0b3JcbiAgICAgIGlmIChjb25zdHJ1Y3Rvcikge1xuICAgICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICAgIGVyciBpbnN0YW5jZW9mIGNvbnN0cnVjdG9yXG4gICAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byB0aHJvdyAje2V4cH0gYnV0ICN7YWN0fSB3YXMgdGhyb3duJ1xuICAgICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IHRocm93ICN7ZXhwfSBidXQgI3thY3R9IHdhcyB0aHJvd24nXG4gICAgICAgICAgLCBuYW1lXG4gICAgICAgICAgLCBlcnJcbiAgICAgICAgKTtcblxuICAgICAgICBpZiAoIWVyck1zZykgcmV0dXJuIHRoaXM7XG4gICAgICB9XG4gICAgICAvLyBuZXh0LCBjaGVjayBtZXNzYWdlXG4gICAgICB2YXIgbWVzc2FnZSA9ICdvYmplY3QnID09PSBfLnR5cGUoZXJyKSAmJiBcIm1lc3NhZ2VcIiBpbiBlcnJcbiAgICAgICAgPyBlcnIubWVzc2FnZVxuICAgICAgICA6ICcnICsgZXJyO1xuXG4gICAgICBpZiAoKG1lc3NhZ2UgIT0gbnVsbCkgJiYgZXJyTXNnICYmIGVyck1zZyBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuICAgICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICAgIGVyck1zZy5leGVjKG1lc3NhZ2UpXG4gICAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byB0aHJvdyBlcnJvciBtYXRjaGluZyAje2V4cH0gYnV0IGdvdCAje2FjdH0nXG4gICAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byB0aHJvdyBlcnJvciBub3QgbWF0Y2hpbmcgI3tleHB9J1xuICAgICAgICAgICwgZXJyTXNnXG4gICAgICAgICAgLCBtZXNzYWdlXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGVsc2UgaWYgKChtZXNzYWdlICE9IG51bGwpICYmIGVyck1zZyAmJiAnc3RyaW5nJyA9PT0gdHlwZW9mIGVyck1zZykge1xuICAgICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICAgIH5tZXNzYWdlLmluZGV4T2YoZXJyTXNnKVxuICAgICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gdGhyb3cgZXJyb3IgaW5jbHVkaW5nICN7ZXhwfSBidXQgZ290ICN7YWN0fSdcbiAgICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIHRocm93IGVycm9yIG5vdCBpbmNsdWRpbmcgI3thY3R9J1xuICAgICAgICAgICwgZXJyTXNnXG4gICAgICAgICAgLCBtZXNzYWdlXG4gICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvd24gPSB0cnVlO1xuICAgICAgICB0aHJvd25FcnJvciA9IGVycjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgYWN0dWFsbHlHb3QgPSAnJ1xuICAgICAgLCBleHBlY3RlZFRocm93biA9IG5hbWUgIT09IG51bGxcbiAgICAgICAgPyBuYW1lXG4gICAgICAgIDogZGVzaXJlZEVycm9yXG4gICAgICAgICAgPyAnI3tleHB9JyAvL18uaW5zcGVjdChkZXNpcmVkRXJyb3IpXG4gICAgICAgICAgOiAnYW4gZXJyb3InO1xuXG4gICAgaWYgKHRocm93bikge1xuICAgICAgYWN0dWFsbHlHb3QgPSAnIGJ1dCAje2FjdH0gd2FzIHRocm93bidcbiAgICB9XG5cbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgdGhyb3duID09PSB0cnVlXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIHRocm93ICcgKyBleHBlY3RlZFRocm93biArIGFjdHVhbGx5R290XG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCB0aHJvdyAnICsgZXhwZWN0ZWRUaHJvd24gKyBhY3R1YWxseUdvdFxuICAgICAgLCBkZXNpcmVkRXJyb3JcbiAgICAgICwgdGhyb3duRXJyb3JcbiAgICApO1xuICB9O1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ3Rocm93JywgYXNzZXJ0VGhyb3dzKTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgndGhyb3dzJywgYXNzZXJ0VGhyb3dzKTtcbiAgQXNzZXJ0aW9uLmFkZE1ldGhvZCgnVGhyb3cnLCBhc3NlcnRUaHJvd3MpO1xuXG4gIC8qKlxuICAgKiAjIyMgLnJlc3BvbmRUbyhtZXRob2QpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgb2JqZWN0IG9yIGNsYXNzIHRhcmdldCB3aWxsIHJlc3BvbmQgdG8gYSBtZXRob2QuXG4gICAqXG4gICAqICAgICBLbGFzcy5wcm90b3R5cGUuYmFyID0gZnVuY3Rpb24oKXt9O1xuICAgKiAgICAgZXhwZWN0KEtsYXNzKS50by5yZXNwb25kVG8oJ2JhcicpO1xuICAgKiAgICAgZXhwZWN0KG9iaikudG8ucmVzcG9uZFRvKCdiYXInKTtcbiAgICpcbiAgICogVG8gY2hlY2sgaWYgYSBjb25zdHJ1Y3RvciB3aWxsIHJlc3BvbmQgdG8gYSBzdGF0aWMgZnVuY3Rpb24sXG4gICAqIHNldCB0aGUgYGl0c2VsZmAgZmxhZy5cbiAgICpcbiAgICogICAgS2xhc3MuYmF6ID0gZnVuY3Rpb24oKXt9O1xuICAgKiAgICBleHBlY3QoS2xhc3MpLml0c2VsZi50by5yZXNwb25kVG8oJ2JheicpO1xuICAgKlxuICAgKiBAbmFtZSByZXNwb25kVG9cbiAgICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBfb3B0aW9uYWxfXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIEFzc2VydGlvbi5hZGRNZXRob2QoJ3Jlc3BvbmRUbycsIGZ1bmN0aW9uIChtZXRob2QsIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgLCBpdHNlbGYgPSBmbGFnKHRoaXMsICdpdHNlbGYnKVxuICAgICAgLCBjb250ZXh0ID0gKCdmdW5jdGlvbicgPT09IF8udHlwZShvYmopICYmICFpdHNlbGYpXG4gICAgICAgID8gb2JqLnByb3RvdHlwZVttZXRob2RdXG4gICAgICAgIDogb2JqW21ldGhvZF07XG5cbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGNvbnRleHRcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gcmVzcG9uZCB0byAnICsgXy5pbnNwZWN0KG1ldGhvZClcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IHJlc3BvbmQgdG8gJyArIF8uaW5zcGVjdChtZXRob2QpXG4gICAgKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAuaXRzZWxmXG4gICAqXG4gICAqIFNldHMgdGhlIGBpdHNlbGZgIGZsYWcsIGxhdGVyIHVzZWQgYnkgdGhlIGByZXNwb25kVG9gIGFzc2VydGlvbi5cbiAgICpcbiAgICogICAgZnVuY3Rpb24gRm9vKCkge31cbiAgICogICAgRm9vLmJhciA9IGZ1bmN0aW9uKCkge31cbiAgICogICAgRm9vLnByb3RvdHlwZS5iYXogPSBmdW5jdGlvbigpIHt9XG4gICAqXG4gICAqICAgIGV4cGVjdChGb28pLml0c2VsZi50by5yZXNwb25kVG8oJ2JhcicpO1xuICAgKiAgICBleHBlY3QoRm9vKS5pdHNlbGYubm90LnRvLnJlc3BvbmRUbygnYmF6Jyk7XG4gICAqXG4gICAqIEBuYW1lIGl0c2VsZlxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkUHJvcGVydHkoJ2l0c2VsZicsIGZ1bmN0aW9uICgpIHtcbiAgICBmbGFnKHRoaXMsICdpdHNlbGYnLCB0cnVlKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAuc2F0aXNmeShtZXRob2QpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IHBhc3NlcyBhIGdpdmVuIHRydXRoIHRlc3QuXG4gICAqXG4gICAqICAgICBleHBlY3QoMSkudG8uc2F0aXNmeShmdW5jdGlvbihudW0pIHsgcmV0dXJuIG51bSA+IDA7IH0pO1xuICAgKlxuICAgKiBAbmFtZSBzYXRpc2Z5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG1hdGNoZXJcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdzYXRpc2Z5JywgZnVuY3Rpb24gKG1hdGNoZXIsIG1zZykge1xuICAgIGlmIChtc2cpIGZsYWcodGhpcywgJ21lc3NhZ2UnLCBtc2cpO1xuICAgIHZhciBvYmogPSBmbGFnKHRoaXMsICdvYmplY3QnKTtcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICAgbWF0Y2hlcihvYmopXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIHNhdGlzZnkgJyArIF8ub2JqRGlzcGxheShtYXRjaGVyKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3Qgc2F0aXNmeScgKyBfLm9iakRpc3BsYXkobWF0Y2hlcilcbiAgICAgICwgdGhpcy5uZWdhdGUgPyBmYWxzZSA6IHRydWVcbiAgICAgICwgbWF0Y2hlcihvYmopXG4gICAgKTtcbiAgfSk7XG5cbiAgLyoqXG4gICAqICMjIyAuY2xvc2VUbyhleHBlY3RlZCwgZGVsdGEpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGVxdWFsIGBleHBlY3RlZGAsIHRvIHdpdGhpbiBhICsvLSBgZGVsdGFgIHJhbmdlLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KDEuNSkudG8uYmUuY2xvc2VUbygxLCAwLjUpO1xuICAgKlxuICAgKiBAbmFtZSBjbG9zZVRvXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBleHBlY3RlZFxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsdGFcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdjbG9zZVRvJywgZnVuY3Rpb24gKGV4cGVjdGVkLCBkZWx0YSwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpO1xuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICBNYXRoLmFicyhvYmogLSBleHBlY3RlZCkgPD0gZGVsdGFcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gYmUgY2xvc2UgdG8gJyArIGV4cGVjdGVkICsgJyArLy0gJyArIGRlbHRhXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IG5vdCB0byBiZSBjbG9zZSB0byAnICsgZXhwZWN0ZWQgKyAnICsvLSAnICsgZGVsdGFcbiAgICApO1xuICB9KTtcblxuICBmdW5jdGlvbiBpc1N1YnNldE9mKHN1YnNldCwgc3VwZXJzZXQpIHtcbiAgICByZXR1cm4gc3Vic2V0LmV2ZXJ5KGZ1bmN0aW9uKGVsZW0pIHtcbiAgICAgIHJldHVybiBzdXBlcnNldC5pbmRleE9mKGVsZW0pICE9PSAtMTtcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqICMjIyAubWVtYmVycyhzZXQpXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCB0aGUgdGFyZ2V0IGlzIGEgc3VwZXJzZXQgb2YgYHNldGAsXG4gICAqIG9yIHRoYXQgdGhlIHRhcmdldCBhbmQgYHNldGAgaGF2ZSB0aGUgc2FtZSBtZW1iZXJzLlxuICAgKlxuICAgKiAgICAgZXhwZWN0KFsxLCAyLCAzXSkudG8uaW5jbHVkZS5tZW1iZXJzKFszLCAyXSk7XG4gICAqICAgICBleHBlY3QoWzEsIDIsIDNdKS50by5ub3QuaW5jbHVkZS5tZW1iZXJzKFszLCAyLCA4XSk7XG4gICAqXG4gICAqICAgICBleHBlY3QoWzQsIDJdKS50by5oYXZlLm1lbWJlcnMoWzIsIDRdKTtcbiAgICogICAgIGV4cGVjdChbNSwgMl0pLnRvLm5vdC5oYXZlLm1lbWJlcnMoWzUsIDIsIDFdKTtcbiAgICpcbiAgICogQG5hbWUgbWVtYmVyc1xuICAgKiBAcGFyYW0ge0FycmF5fSBzZXRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgX29wdGlvbmFsX1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBBc3NlcnRpb24uYWRkTWV0aG9kKCdtZW1iZXJzJywgZnVuY3Rpb24gKHN1YnNldCwgbXNnKSB7XG4gICAgaWYgKG1zZykgZmxhZyh0aGlzLCAnbWVzc2FnZScsIG1zZyk7XG4gICAgdmFyIG9iaiA9IGZsYWcodGhpcywgJ29iamVjdCcpO1xuXG4gICAgbmV3IEFzc2VydGlvbihvYmopLnRvLmJlLmFuKCdhcnJheScpO1xuICAgIG5ldyBBc3NlcnRpb24oc3Vic2V0KS50by5iZS5hbignYXJyYXknKTtcblxuICAgIGlmIChmbGFnKHRoaXMsICdjb250YWlucycpKSB7XG4gICAgICByZXR1cm4gdGhpcy5hc3NlcnQoXG4gICAgICAgICAgaXNTdWJzZXRPZihzdWJzZXQsIG9iailcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBhIHN1cGVyc2V0IG9mICN7YWN0fSdcbiAgICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgYmUgYSBzdXBlcnNldCBvZiAje2FjdH0nXG4gICAgICAgICwgb2JqXG4gICAgICAgICwgc3Vic2V0XG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICBpc1N1YnNldE9mKG9iaiwgc3Vic2V0KSAmJiBpc1N1YnNldE9mKHN1YnNldCwgb2JqKVxuICAgICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGhhdmUgdGhlIHNhbWUgbWVtYmVycyBhcyAje2FjdH0nXG4gICAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGhhdmUgdGhlIHNhbWUgbWVtYmVycyBhcyAje2FjdH0nXG4gICAgICAgICwgb2JqXG4gICAgICAgICwgc3Vic2V0XG4gICAgKTtcbiAgfSk7XG59O1xuIiwiLyohXG4gKiBjaGFpXG4gKiBDb3B5cmlnaHQoYykgMjAxMS0yMDEzIEpha2UgTHVlciA8amFrZUBhbG9naWNhbHBhcmFkb3guY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFpLCB1dGlsKSB7XG5cbiAgLyohXG4gICAqIENoYWkgZGVwZW5kZW5jaWVzLlxuICAgKi9cblxuICB2YXIgQXNzZXJ0aW9uID0gY2hhaS5Bc3NlcnRpb25cbiAgICAsIGZsYWcgPSB1dGlsLmZsYWc7XG5cbiAgLyohXG4gICAqIE1vZHVsZSBleHBvcnQuXG4gICAqL1xuXG4gIC8qKlxuICAgKiAjIyMgYXNzZXJ0KGV4cHJlc3Npb24sIG1lc3NhZ2UpXG4gICAqXG4gICAqIFdyaXRlIHlvdXIgb3duIHRlc3QgZXhwcmVzc2lvbnMuXG4gICAqXG4gICAqICAgICBhc3NlcnQoJ2ZvbycgIT09ICdiYXInLCAnZm9vIGlzIG5vdCBiYXInKTtcbiAgICogICAgIGFzc2VydChBcnJheS5pc0FycmF5KFtdKSwgJ2VtcHR5IGFycmF5cyBhcmUgYXJyYXlzJyk7XG4gICAqXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGV4cHJlc3Npb24gdG8gdGVzdCBmb3IgdHJ1dGhpbmVzc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSB0byBkaXNwbGF5IG9uIGVycm9yXG4gICAqIEBuYW1lIGFzc2VydFxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICB2YXIgYXNzZXJ0ID0gY2hhaS5hc3NlcnQgPSBmdW5jdGlvbiAoZXhwcmVzcywgZXJybXNnKSB7XG4gICAgdmFyIHRlc3QgPSBuZXcgQXNzZXJ0aW9uKG51bGwpO1xuICAgIHRlc3QuYXNzZXJ0KFxuICAgICAgICBleHByZXNzXG4gICAgICAsIGVycm1zZ1xuICAgICAgLCAnWyBuZWdhdGlvbiBtZXNzYWdlIHVuYXZhaWxhYmxlIF0nXG4gICAgKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5mYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIFttZXNzYWdlXSwgW29wZXJhdG9yXSlcbiAgICpcbiAgICogVGhyb3cgYSBmYWlsdXJlLiBOb2RlLmpzIGBhc3NlcnRgIG1vZHVsZS1jb21wYXRpYmxlLlxuICAgKlxuICAgKiBAbmFtZSBmYWlsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gb3BlcmF0b3JcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmZhaWwgPSBmdW5jdGlvbiAoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgb3BlcmF0b3IpIHtcbiAgICB0aHJvdyBuZXcgY2hhaS5Bc3NlcnRpb25FcnJvcih7XG4gICAgICAgIGFjdHVhbDogYWN0dWFsXG4gICAgICAsIGV4cGVjdGVkOiBleHBlY3RlZFxuICAgICAgLCBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICAsIG9wZXJhdG9yOiBvcGVyYXRvclxuICAgICAgLCBzdGFja1N0YXJ0RnVuY3Rpb246IGFzc2VydC5mYWlsXG4gICAgfSk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAub2sob2JqZWN0LCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgb2JqZWN0YCBpcyB0cnV0aHkuXG4gICAqXG4gICAqICAgICBhc3NlcnQub2soJ2V2ZXJ5dGhpbmcnLCAnZXZlcnl0aGluZyBpcyBvaycpO1xuICAgKiAgICAgYXNzZXJ0Lm9rKGZhbHNlLCAndGhpcyB3aWxsIGZhaWwnKTtcbiAgICpcbiAgICogQG5hbWUgb2tcbiAgICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0IHRvIHRlc3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm9rID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykuaXMub2s7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90T2sob2JqZWN0LCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgb2JqZWN0YCBpcyBmYWxzeS5cbiAgICpcbiAgICogICAgIGFzc2VydC5ub3RPaygnZXZlcnl0aGluZycsICd0aGlzIHdpbGwgZmFpbCcpO1xuICAgKiAgICAgYXNzZXJ0Lm5vdE9rKGZhbHNlLCAndGhpcyB3aWxsIHBhc3MnKTtcbiAgICpcbiAgICogQG5hbWUgbm90T2tcbiAgICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0IHRvIHRlc3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm5vdE9rID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykuaXMubm90Lm9rO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyBub24tc3RyaWN0IGVxdWFsaXR5IChgPT1gKSBvZiBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYC5cbiAgICpcbiAgICogICAgIGFzc2VydC5lcXVhbCgzLCAnMycsICc9PSBjb2VyY2VzIHZhbHVlcyB0byBzdHJpbmdzJyk7XG4gICAqXG4gICAqIEBuYW1lIGVxdWFsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuZXF1YWwgPSBmdW5jdGlvbiAoYWN0LCBleHAsIG1zZykge1xuICAgIHZhciB0ZXN0ID0gbmV3IEFzc2VydGlvbihhY3QsIG1zZyk7XG5cbiAgICB0ZXN0LmFzc2VydChcbiAgICAgICAgZXhwID09IGZsYWcodGVzdCwgJ29iamVjdCcpXG4gICAgICAsICdleHBlY3RlZCAje3RoaXN9IHRvIGVxdWFsICN7ZXhwfSdcbiAgICAgICwgJ2V4cGVjdGVkICN7dGhpc30gdG8gbm90IGVxdWFsICN7YWN0fSdcbiAgICAgICwgZXhwXG4gICAgICAsIGFjdFxuICAgICk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIG5vbi1zdHJpY3QgaW5lcXVhbGl0eSAoYCE9YCkgb2YgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQubm90RXF1YWwoMywgNCwgJ3RoZXNlIG51bWJlcnMgYXJlIG5vdCBlcXVhbCcpO1xuICAgKlxuICAgKiBAbmFtZSBub3RFcXVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAgICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm5vdEVxdWFsID0gZnVuY3Rpb24gKGFjdCwgZXhwLCBtc2cpIHtcbiAgICB2YXIgdGVzdCA9IG5ldyBBc3NlcnRpb24oYWN0LCBtc2cpO1xuXG4gICAgdGVzdC5hc3NlcnQoXG4gICAgICAgIGV4cCAhPSBmbGFnKHRlc3QsICdvYmplY3QnKVxuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgZXF1YWwgI3tleHB9J1xuICAgICAgLCAnZXhwZWN0ZWQgI3t0aGlzfSB0byBlcXVhbCAje2FjdH0nXG4gICAgICAsIGV4cFxuICAgICAgLCBhY3RcbiAgICApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyBzdHJpY3QgZXF1YWxpdHkgKGA9PT1gKSBvZiBgYWN0dWFsYCBhbmQgYGV4cGVjdGVkYC5cbiAgICpcbiAgICogICAgIGFzc2VydC5zdHJpY3RFcXVhbCh0cnVlLCB0cnVlLCAndGhlc2UgYm9vbGVhbnMgYXJlIHN0cmljdGx5IGVxdWFsJyk7XG4gICAqXG4gICAqIEBuYW1lIHN0cmljdEVxdWFsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuc3RyaWN0RXF1YWwgPSBmdW5jdGlvbiAoYWN0LCBleHAsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24oYWN0LCBtc2cpLnRvLmVxdWFsKGV4cCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHN0cmljdCBpbmVxdWFsaXR5IChgIT09YCkgb2YgYGFjdHVhbGAgYW5kIGBleHBlY3RlZGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQubm90U3RyaWN0RXF1YWwoMywgJzMnLCAnbm8gY29lcmNpb24gZm9yIHN0cmljdCBlcXVhbGl0eScpO1xuICAgKlxuICAgKiBAbmFtZSBub3RTdHJpY3RFcXVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBhY3R1YWxcbiAgICogQHBhcmFtIHtNaXhlZH0gZXhwZWN0ZWRcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsID0gZnVuY3Rpb24gKGFjdCwgZXhwLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKGFjdCwgbXNnKS50by5ub3QuZXF1YWwoZXhwKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYGFjdHVhbGAgaXMgZGVlcGx5IGVxdWFsIHRvIGBleHBlY3RlZGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQuZGVlcEVxdWFsKHsgdGVhOiAnZ3JlZW4nIH0sIHsgdGVhOiAnZ3JlZW4nIH0pO1xuICAgKlxuICAgKiBAbmFtZSBkZWVwRXF1YWxcbiAgICogQHBhcmFtIHtNaXhlZH0gYWN0dWFsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGV4cGVjdGVkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiAoYWN0LCBleHAsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24oYWN0LCBtc2cpLnRvLmVxbChleHApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydCB0aGF0IGBhY3R1YWxgIGlzIG5vdCBkZWVwbHkgZXF1YWwgdG8gYGV4cGVjdGVkYC5cbiAgICpcbiAgICogICAgIGFzc2VydC5ub3REZWVwRXF1YWwoeyB0ZWE6ICdncmVlbicgfSwgeyB0ZWE6ICdqYXNtaW5lJyB9KTtcbiAgICpcbiAgICogQG5hbWUgbm90RGVlcEVxdWFsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGFjdHVhbFxuICAgKiBAcGFyYW0ge01peGVkfSBleHBlY3RlZFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQubm90RGVlcEVxdWFsID0gZnVuY3Rpb24gKGFjdCwgZXhwLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKGFjdCwgbXNnKS50by5ub3QuZXFsKGV4cCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNUcnVlKHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgIGlzIHRydWUuXG4gICAqXG4gICAqICAgICB2YXIgdGVhU2VydmVkID0gdHJ1ZTtcbiAgICogICAgIGFzc2VydC5pc1RydWUodGVhU2VydmVkLCAndGhlIHRlYSBoYXMgYmVlbiBzZXJ2ZWQnKTtcbiAgICpcbiAgICogQG5hbWUgaXNUcnVlXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pc1RydWUgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS5pc1sndHJ1ZSddO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmlzRmFsc2UodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgZmFsc2UuXG4gICAqXG4gICAqICAgICB2YXIgdGVhU2VydmVkID0gZmFsc2U7XG4gICAqICAgICBhc3NlcnQuaXNGYWxzZSh0ZWFTZXJ2ZWQsICdubyB0ZWEgeWV0PyBobW0uLi4nKTtcbiAgICpcbiAgICogQG5hbWUgaXNGYWxzZVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNGYWxzZSA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLmlzWydmYWxzZSddO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmlzTnVsbCh2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBudWxsLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0LmlzTnVsbChlcnIsICd0aGVyZSB3YXMgbm8gZXJyb3InKTtcbiAgICpcbiAgICogQG5hbWUgaXNOdWxsXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pc051bGwgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5lcXVhbChudWxsKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pc05vdE51bGwodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgbm90IG51bGwuXG4gICAqXG4gICAqICAgICB2YXIgdGVhID0gJ3Rhc3R5IGNoYWknO1xuICAgKiAgICAgYXNzZXJ0LmlzTm90TnVsbCh0ZWEsICdncmVhdCwgdGltZSBmb3IgdGVhIScpO1xuICAgKlxuICAgKiBAbmFtZSBpc05vdE51bGxcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzTm90TnVsbCA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLm5vdC5lcXVhbChudWxsKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pc1VuZGVmaW5lZCh2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBgdW5kZWZpbmVkYC5cbiAgICpcbiAgICogICAgIHZhciB0ZWE7XG4gICAqICAgICBhc3NlcnQuaXNVbmRlZmluZWQodGVhLCAnbm8gdGVhIGRlZmluZWQnKTtcbiAgICpcbiAgICogQG5hbWUgaXNVbmRlZmluZWRcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzVW5kZWZpbmVkID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8uZXF1YWwodW5kZWZpbmVkKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pc0RlZmluZWQodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgbm90IGB1bmRlZmluZWRgLlxuICAgKlxuICAgKiAgICAgdmFyIHRlYSA9ICdjdXAgb2YgY2hhaSc7XG4gICAqICAgICBhc3NlcnQuaXNEZWZpbmVkKHRlYSwgJ3RlYSBoYXMgYmVlbiBkZWZpbmVkJyk7XG4gICAqXG4gICAqIEBuYW1lIGlzRGVmaW5lZFxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNEZWZpbmVkID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8ubm90LmVxdWFsKHVuZGVmaW5lZCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNGdW5jdGlvbih2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBhIGZ1bmN0aW9uLlxuICAgKlxuICAgKiAgICAgZnVuY3Rpb24gc2VydmVUZWEoKSB7IHJldHVybiAnY3VwIG9mIHRlYSc7IH07XG4gICAqICAgICBhc3NlcnQuaXNGdW5jdGlvbihzZXJ2ZVRlYSwgJ2dyZWF0LCB3ZSBjYW4gaGF2ZSB0ZWEgbm93Jyk7XG4gICAqXG4gICAqIEBuYW1lIGlzRnVuY3Rpb25cbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5iZS5hKCdmdW5jdGlvbicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmlzTm90RnVuY3Rpb24odmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgX25vdF8gYSBmdW5jdGlvbi5cbiAgICpcbiAgICogICAgIHZhciBzZXJ2ZVRlYSA9IFsgJ2hlYXQnLCAncG91cicsICdzaXAnIF07XG4gICAqICAgICBhc3NlcnQuaXNOb3RGdW5jdGlvbihzZXJ2ZVRlYSwgJ2dyZWF0LCB3ZSBoYXZlIGxpc3RlZCB0aGUgc3RlcHMnKTtcbiAgICpcbiAgICogQG5hbWUgaXNOb3RGdW5jdGlvblxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNOb3RGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLm5vdC5iZS5hKCdmdW5jdGlvbicpO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmlzT2JqZWN0KHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgIGlzIGFuIG9iamVjdCAoYXMgcmV2ZWFsZWQgYnlcbiAgICogYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgKS5cbiAgICpcbiAgICogICAgIHZhciBzZWxlY3Rpb24gPSB7IG5hbWU6ICdDaGFpJywgc2VydmU6ICd3aXRoIHNwaWNlcycgfTtcbiAgICogICAgIGFzc2VydC5pc09iamVjdChzZWxlY3Rpb24sICd0ZWEgc2VsZWN0aW9uIGlzIGFuIG9iamVjdCcpO1xuICAgKlxuICAgKiBAbmFtZSBpc09iamVjdFxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNPYmplY3QgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5iZS5hKCdvYmplY3QnKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pc05vdE9iamVjdCh2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBfbm90XyBhbiBvYmplY3QuXG4gICAqXG4gICAqICAgICB2YXIgc2VsZWN0aW9uID0gJ2NoYWknXG4gICAqICAgICBhc3NlcnQuaXNPYmplY3Qoc2VsZWN0aW9uLCAndGVhIHNlbGVjdGlvbiBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAqICAgICBhc3NlcnQuaXNPYmplY3QobnVsbCwgJ251bGwgaXMgbm90IGFuIG9iamVjdCcpO1xuICAgKlxuICAgKiBAbmFtZSBpc05vdE9iamVjdFxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNOb3RPYmplY3QgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuYmUuYSgnb2JqZWN0Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNBcnJheSh2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBhbiBhcnJheS5cbiAgICpcbiAgICogICAgIHZhciBtZW51ID0gWyAnZ3JlZW4nLCAnY2hhaScsICdvb2xvbmcnIF07XG4gICAqICAgICBhc3NlcnQuaXNBcnJheShtZW51LCAnd2hhdCBraW5kIG9mIHRlYSBkbyB3ZSB3YW50PycpO1xuICAgKlxuICAgKiBAbmFtZSBpc0FycmF5XG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pc0FycmF5ID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8uYmUuYW4oJ2FycmF5Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNOb3RBcnJheSh2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBfbm90XyBhbiBhcnJheS5cbiAgICpcbiAgICogICAgIHZhciBtZW51ID0gJ2dyZWVufGNoYWl8b29sb25nJztcbiAgICogICAgIGFzc2VydC5pc05vdEFycmF5KG1lbnUsICd3aGF0IGtpbmQgb2YgdGVhIGRvIHdlIHdhbnQ/Jyk7XG4gICAqXG4gICAqIEBuYW1lIGlzTm90QXJyYXlcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzTm90QXJyYXkgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuYmUuYW4oJ2FycmF5Jyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNTdHJpbmcodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgYSBzdHJpbmcuXG4gICAqXG4gICAqICAgICB2YXIgdGVhT3JkZXIgPSAnY2hhaSc7XG4gICAqICAgICBhc3NlcnQuaXNTdHJpbmcodGVhT3JkZXIsICdvcmRlciBwbGFjZWQnKTtcbiAgICpcbiAgICogQG5hbWUgaXNTdHJpbmdcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzU3RyaW5nID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8uYmUuYSgnc3RyaW5nJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNOb3RTdHJpbmcodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgX25vdF8gYSBzdHJpbmcuXG4gICAqXG4gICAqICAgICB2YXIgdGVhT3JkZXIgPSA0O1xuICAgKiAgICAgYXNzZXJ0LmlzTm90U3RyaW5nKHRlYU9yZGVyLCAnb3JkZXIgcGxhY2VkJyk7XG4gICAqXG4gICAqIEBuYW1lIGlzTm90U3RyaW5nXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pc05vdFN0cmluZyA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLm5vdC5iZS5hKCdzdHJpbmcnKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pc051bWJlcih2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBpcyBhIG51bWJlci5cbiAgICpcbiAgICogICAgIHZhciBjdXBzID0gMjtcbiAgICogICAgIGFzc2VydC5pc051bWJlcihjdXBzLCAnaG93IG1hbnkgY3VwcycpO1xuICAgKlxuICAgKiBAbmFtZSBpc051bWJlclxuICAgKiBAcGFyYW0ge051bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzTnVtYmVyID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8uYmUuYSgnbnVtYmVyJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNOb3ROdW1iZXIodmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgX25vdF8gYSBudW1iZXIuXG4gICAqXG4gICAqICAgICB2YXIgY3VwcyA9ICcyIGN1cHMgcGxlYXNlJztcbiAgICogICAgIGFzc2VydC5pc05vdE51bWJlcihjdXBzLCAnaG93IG1hbnkgY3VwcycpO1xuICAgKlxuICAgKiBAbmFtZSBpc05vdE51bWJlclxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaXNOb3ROdW1iZXIgPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuYmUuYSgnbnVtYmVyJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNCb29sZWFuKHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgIGlzIGEgYm9vbGVhbi5cbiAgICpcbiAgICogICAgIHZhciB0ZWFSZWFkeSA9IHRydWVcbiAgICogICAgICAgLCB0ZWFTZXJ2ZWQgPSBmYWxzZTtcbiAgICpcbiAgICogICAgIGFzc2VydC5pc0Jvb2xlYW4odGVhUmVhZHksICdpcyB0aGUgdGVhIHJlYWR5Jyk7XG4gICAqICAgICBhc3NlcnQuaXNCb29sZWFuKHRlYVNlcnZlZCwgJ2hhcyB0ZWEgYmVlbiBzZXJ2ZWQnKTtcbiAgICpcbiAgICogQG5hbWUgaXNCb29sZWFuXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pc0Jvb2xlYW4gPSBmdW5jdGlvbiAodmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5iZS5hKCdib29sZWFuJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuaXNOb3RCb29sZWFuKHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgIGlzIF9ub3RfIGEgYm9vbGVhbi5cbiAgICpcbiAgICogICAgIHZhciB0ZWFSZWFkeSA9ICd5ZXAnXG4gICAqICAgICAgICwgdGVhU2VydmVkID0gJ25vcGUnO1xuICAgKlxuICAgKiAgICAgYXNzZXJ0LmlzTm90Qm9vbGVhbih0ZWFSZWFkeSwgJ2lzIHRoZSB0ZWEgcmVhZHknKTtcbiAgICogICAgIGFzc2VydC5pc05vdEJvb2xlYW4odGVhU2VydmVkLCAnaGFzIHRlYSBiZWVuIHNlcnZlZCcpO1xuICAgKlxuICAgKiBAbmFtZSBpc05vdEJvb2xlYW5cbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LmlzTm90Qm9vbGVhbiA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLm5vdC5iZS5hKCdib29sZWFuJyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAudHlwZU9mKHZhbHVlLCBuYW1lLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgJ3MgdHlwZSBpcyBgbmFtZWAsIGFzIGRldGVybWluZWQgYnlcbiAgICogYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0LnR5cGVPZih7IHRlYTogJ2NoYWknIH0sICdvYmplY3QnLCAnd2UgaGF2ZSBhbiBvYmplY3QnKTtcbiAgICogICAgIGFzc2VydC50eXBlT2YoWydjaGFpJywgJ2phc21pbmUnXSwgJ2FycmF5JywgJ3dlIGhhdmUgYW4gYXJyYXknKTtcbiAgICogICAgIGFzc2VydC50eXBlT2YoJ3RlYScsICdzdHJpbmcnLCAnd2UgaGF2ZSBhIHN0cmluZycpO1xuICAgKiAgICAgYXNzZXJ0LnR5cGVPZigvdGVhLywgJ3JlZ2V4cCcsICd3ZSBoYXZlIGEgcmVndWxhciBleHByZXNzaW9uJyk7XG4gICAqICAgICBhc3NlcnQudHlwZU9mKG51bGwsICdudWxsJywgJ3dlIGhhdmUgYSBudWxsJyk7XG4gICAqICAgICBhc3NlcnQudHlwZU9mKHVuZGVmaW5lZCwgJ3VuZGVmaW5lZCcsICd3ZSBoYXZlIGFuIHVuZGVmaW5lZCcpO1xuICAgKlxuICAgKiBAbmFtZSB0eXBlT2ZcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0LnR5cGVPZiA9IGZ1bmN0aW9uICh2YWwsIHR5cGUsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLmJlLmEodHlwZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90VHlwZU9mKHZhbHVlLCBuYW1lLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgJ3MgdHlwZSBpcyBfbm90XyBgbmFtZWAsIGFzIGRldGVybWluZWQgYnlcbiAgICogYE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdgLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0Lm5vdFR5cGVPZigndGVhJywgJ251bWJlcicsICdzdHJpbmdzIGFyZSBub3QgbnVtYmVycycpO1xuICAgKlxuICAgKiBAbmFtZSBub3RUeXBlT2ZcbiAgICogQHBhcmFtIHtNaXhlZH0gdmFsdWVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVvZiBuYW1lXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5ub3RUeXBlT2YgPSBmdW5jdGlvbiAodmFsLCB0eXBlLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuYmUuYSh0eXBlKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pbnN0YW5jZU9mKG9iamVjdCwgY29uc3RydWN0b3IsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGB2YWx1ZWAgaXMgYW4gaW5zdGFuY2Ugb2YgYGNvbnN0cnVjdG9yYC5cbiAgICpcbiAgICogICAgIHZhciBUZWEgPSBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XG4gICAqICAgICAgICwgY2hhaSA9IG5ldyBUZWEoJ2NoYWknKTtcbiAgICpcbiAgICogICAgIGFzc2VydC5pbnN0YW5jZU9mKGNoYWksIFRlYSwgJ2NoYWkgaXMgYW4gaW5zdGFuY2Ugb2YgdGVhJyk7XG4gICAqXG4gICAqIEBuYW1lIGluc3RhbmNlT2ZcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgKiBAcGFyYW0ge0NvbnN0cnVjdG9yfSBjb25zdHJ1Y3RvclxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuaW5zdGFuY2VPZiA9IGZ1bmN0aW9uICh2YWwsIHR5cGUsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24odmFsLCBtc2cpLnRvLmJlLmluc3RhbmNlT2YodHlwZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90SW5zdGFuY2VPZihvYmplY3QsIGNvbnN0cnVjdG9yLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgYHZhbHVlYCBpcyBub3QgYW4gaW5zdGFuY2Ugb2YgYGNvbnN0cnVjdG9yYC5cbiAgICpcbiAgICogICAgIHZhciBUZWEgPSBmdW5jdGlvbiAobmFtZSkgeyB0aGlzLm5hbWUgPSBuYW1lOyB9XG4gICAqICAgICAgICwgY2hhaSA9IG5ldyBTdHJpbmcoJ2NoYWknKTtcbiAgICpcbiAgICogICAgIGFzc2VydC5ub3RJbnN0YW5jZU9mKGNoYWksIFRlYSwgJ2NoYWkgaXMgbm90IGFuIGluc3RhbmNlIG9mIHRlYScpO1xuICAgKlxuICAgKiBAbmFtZSBub3RJbnN0YW5jZU9mXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtDb25zdHJ1Y3Rvcn0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm5vdEluc3RhbmNlT2YgPSBmdW5jdGlvbiAodmFsLCB0eXBlLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuYmUuaW5zdGFuY2VPZih0eXBlKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5pbmNsdWRlKGhheXN0YWNrLCBuZWVkbGUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBoYXlzdGFja2AgaW5jbHVkZXMgYG5lZWRsZWAuIFdvcmtzXG4gICAqIGZvciBzdHJpbmdzIGFuZCBhcnJheXMuXG4gICAqXG4gICAqICAgICBhc3NlcnQuaW5jbHVkZSgnZm9vYmFyJywgJ2JhcicsICdmb29iYXIgY29udGFpbnMgc3RyaW5nIFwiYmFyXCInKTtcbiAgICogICAgIGFzc2VydC5pbmNsdWRlKFsgMSwgMiwgMyBdLCAzLCAnYXJyYXkgY29udGFpbnMgdmFsdWUnKTtcbiAgICpcbiAgICogQG5hbWUgaW5jbHVkZVxuICAgKiBAcGFyYW0ge0FycmF5fFN0cmluZ30gaGF5c3RhY2tcbiAgICogQHBhcmFtIHtNaXhlZH0gbmVlZGxlXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pbmNsdWRlID0gZnVuY3Rpb24gKGV4cCwgaW5jLCBtc2cpIHtcbiAgICB2YXIgb2JqID0gbmV3IEFzc2VydGlvbihleHAsIG1zZyk7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShleHApKSB7XG4gICAgICBvYmoudG8uaW5jbHVkZShpbmMpO1xuICAgIH0gZWxzZSBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiBleHApIHtcbiAgICAgIG9iai50by5jb250YWluLnN0cmluZyhpbmMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgY2hhaS5Bc3NlcnRpb25FcnJvcihcbiAgICAgICAgICAnZXhwZWN0ZWQgYW4gYXJyYXkgb3Igc3RyaW5nJ1xuICAgICAgICAsIG51bGxcbiAgICAgICAgLCBhc3NlcnQuaW5jbHVkZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90SW5jbHVkZShoYXlzdGFjaywgbmVlZGxlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgaGF5c3RhY2tgIGRvZXMgbm90IGluY2x1ZGUgYG5lZWRsZWAuIFdvcmtzXG4gICAqIGZvciBzdHJpbmdzIGFuZCBhcnJheXMuXG4gICAqaVxuICAgKiAgICAgYXNzZXJ0Lm5vdEluY2x1ZGUoJ2Zvb2JhcicsICdiYXonLCAnc3RyaW5nIG5vdCBpbmNsdWRlIHN1YnN0cmluZycpO1xuICAgKiAgICAgYXNzZXJ0Lm5vdEluY2x1ZGUoWyAxLCAyLCAzIF0sIDQsICdhcnJheSBub3QgaW5jbHVkZSBjb250YWluIHZhbHVlJyk7XG4gICAqXG4gICAqIEBuYW1lIG5vdEluY2x1ZGVcbiAgICogQHBhcmFtIHtBcnJheXxTdHJpbmd9IGhheXN0YWNrXG4gICAqIEBwYXJhbSB7TWl4ZWR9IG5lZWRsZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQubm90SW5jbHVkZSA9IGZ1bmN0aW9uIChleHAsIGluYywgbXNnKSB7XG4gICAgdmFyIG9iaiA9IG5ldyBBc3NlcnRpb24oZXhwLCBtc2cpO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZXhwKSkge1xuICAgICAgb2JqLnRvLm5vdC5pbmNsdWRlKGluYyk7XG4gICAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PT0gdHlwZW9mIGV4cCkge1xuICAgICAgb2JqLnRvLm5vdC5jb250YWluLnN0cmluZyhpbmMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgY2hhaS5Bc3NlcnRpb25FcnJvcihcbiAgICAgICAgICAnZXhwZWN0ZWQgYW4gYXJyYXkgb3Igc3RyaW5nJ1xuICAgICAgICAsIG51bGxcbiAgICAgICAgLCBhc3NlcnQubm90SW5jbHVkZVxuICAgICAgKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubWF0Y2godmFsdWUsIHJlZ2V4cCwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHZhbHVlYCBtYXRjaGVzIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gYHJlZ2V4cGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQubWF0Y2goJ2Zvb2JhcicsIC9eZm9vLywgJ3JlZ2V4cCBtYXRjaGVzJyk7XG4gICAqXG4gICAqIEBuYW1lIG1hdGNoXG4gICAqIEBwYXJhbSB7TWl4ZWR9IHZhbHVlXG4gICAqIEBwYXJhbSB7UmVnRXhwfSByZWdleHBcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm1hdGNoID0gZnVuY3Rpb24gKGV4cCwgcmUsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24oZXhwLCBtc2cpLnRvLm1hdGNoKHJlKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5ub3RNYXRjaCh2YWx1ZSwgcmVnZXhwLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgdmFsdWVgIGRvZXMgbm90IG1hdGNoIHRoZSByZWd1bGFyIGV4cHJlc3Npb24gYHJlZ2V4cGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQubm90TWF0Y2goJ2Zvb2JhcicsIC9eZm9vLywgJ3JlZ2V4cCBkb2VzIG5vdCBtYXRjaCcpO1xuICAgKlxuICAgKiBAbmFtZSBub3RNYXRjaFxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1JlZ0V4cH0gcmVnZXhwXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5ub3RNYXRjaCA9IGZ1bmN0aW9uIChleHAsIHJlLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKGV4cCwgbXNnKS50by5ub3QubWF0Y2gocmUpO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLnByb3BlcnR5KG9iamVjdCwgcHJvcGVydHksIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBvYmplY3RgIGhhcyBhIHByb3BlcnR5IG5hbWVkIGJ5IGBwcm9wZXJ0eWAuXG4gICAqXG4gICAqICAgICBhc3NlcnQucHJvcGVydHkoeyB0ZWE6IHsgZ3JlZW46ICdtYXRjaGEnIH19LCAndGVhJyk7XG4gICAqXG4gICAqIEBuYW1lIHByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5wcm9wZXJ0eSA9IGZ1bmN0aW9uIChvYmosIHByb3AsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24ob2JqLCBtc2cpLnRvLmhhdmUucHJvcGVydHkocHJvcCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubm90UHJvcGVydHkob2JqZWN0LCBwcm9wZXJ0eSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYG9iamVjdGAgZG9lcyBfbm90XyBoYXZlIGEgcHJvcGVydHkgbmFtZWQgYnkgYHByb3BlcnR5YC5cbiAgICpcbiAgICogICAgIGFzc2VydC5ub3RQcm9wZXJ0eSh7IHRlYTogeyBncmVlbjogJ21hdGNoYScgfX0sICdjb2ZmZWUnKTtcbiAgICpcbiAgICogQG5hbWUgbm90UHJvcGVydHlcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lm5vdFByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbihvYmosIG1zZykudG8ubm90LmhhdmUucHJvcGVydHkocHJvcCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuZGVlcFByb3BlcnR5KG9iamVjdCwgcHJvcGVydHksIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBvYmplY3RgIGhhcyBhIHByb3BlcnR5IG5hbWVkIGJ5IGBwcm9wZXJ0eWAsIHdoaWNoIGNhbiBiZSBhXG4gICAqIHN0cmluZyB1c2luZyBkb3QtIGFuZCBicmFja2V0LW5vdGF0aW9uIGZvciBkZWVwIHJlZmVyZW5jZS5cbiAgICpcbiAgICogICAgIGFzc2VydC5kZWVwUHJvcGVydHkoeyB0ZWE6IHsgZ3JlZW46ICdtYXRjaGEnIH19LCAndGVhLmdyZWVuJyk7XG4gICAqXG4gICAqIEBuYW1lIGRlZXBQcm9wZXJ0eVxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuZGVlcFByb3BlcnR5ID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbihvYmosIG1zZykudG8uaGF2ZS5kZWVwLnByb3BlcnR5KHByb3ApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLm5vdERlZXBQcm9wZXJ0eShvYmplY3QsIHByb3BlcnR5LCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgb2JqZWN0YCBkb2VzIF9ub3RfIGhhdmUgYSBwcm9wZXJ0eSBuYW1lZCBieSBgcHJvcGVydHlgLCB3aGljaFxuICAgKiBjYW4gYmUgYSBzdHJpbmcgdXNpbmcgZG90LSBhbmQgYnJhY2tldC1ub3RhdGlvbiBmb3IgZGVlcCByZWZlcmVuY2UuXG4gICAqXG4gICAqICAgICBhc3NlcnQubm90RGVlcFByb3BlcnR5KHsgdGVhOiB7IGdyZWVuOiAnbWF0Y2hhJyB9fSwgJ3RlYS5vb2xvbmcnKTtcbiAgICpcbiAgICogQG5hbWUgbm90RGVlcFByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5ub3REZWVwUHJvcGVydHkgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5ub3QuaGF2ZS5kZWVwLnByb3BlcnR5KHByb3ApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLnByb3BlcnR5VmFsKG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgb2JqZWN0YCBoYXMgYSBwcm9wZXJ0eSBuYW1lZCBieSBgcHJvcGVydHlgIHdpdGggdmFsdWUgZ2l2ZW5cbiAgICogYnkgYHZhbHVlYC5cbiAgICpcbiAgICogICAgIGFzc2VydC5wcm9wZXJ0eVZhbCh7IHRlYTogJ2lzIGdvb2QnIH0sICd0ZWEnLCAnaXMgZ29vZCcpO1xuICAgKlxuICAgKiBAbmFtZSBwcm9wZXJ0eVZhbFxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQucHJvcGVydHlWYWwgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24ob2JqLCBtc2cpLnRvLmhhdmUucHJvcGVydHkocHJvcCwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5wcm9wZXJ0eU5vdFZhbChvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYG9iamVjdGAgaGFzIGEgcHJvcGVydHkgbmFtZWQgYnkgYHByb3BlcnR5YCwgYnV0IHdpdGggYSB2YWx1ZVxuICAgKiBkaWZmZXJlbnQgZnJvbSB0aGF0IGdpdmVuIGJ5IGB2YWx1ZWAuXG4gICAqXG4gICAqICAgICBhc3NlcnQucHJvcGVydHlOb3RWYWwoeyB0ZWE6ICdpcyBnb29kJyB9LCAndGVhJywgJ2lzIGJhZCcpO1xuICAgKlxuICAgKiBAbmFtZSBwcm9wZXJ0eU5vdFZhbFxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQucHJvcGVydHlOb3RWYWwgPSBmdW5jdGlvbiAob2JqLCBwcm9wLCB2YWwsIG1zZykge1xuICAgIG5ldyBBc3NlcnRpb24ob2JqLCBtc2cpLnRvLm5vdC5oYXZlLnByb3BlcnR5KHByb3AsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuZGVlcFByb3BlcnR5VmFsKG9iamVjdCwgcHJvcGVydHksIHZhbHVlLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgb2JqZWN0YCBoYXMgYSBwcm9wZXJ0eSBuYW1lZCBieSBgcHJvcGVydHlgIHdpdGggdmFsdWUgZ2l2ZW5cbiAgICogYnkgYHZhbHVlYC4gYHByb3BlcnR5YCBjYW4gdXNlIGRvdC0gYW5kIGJyYWNrZXQtbm90YXRpb24gZm9yIGRlZXBcbiAgICogcmVmZXJlbmNlLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0LmRlZXBQcm9wZXJ0eVZhbCh7IHRlYTogeyBncmVlbjogJ21hdGNoYScgfX0sICd0ZWEuZ3JlZW4nLCAnbWF0Y2hhJyk7XG4gICAqXG4gICAqIEBuYW1lIGRlZXBQcm9wZXJ0eVZhbFxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuZGVlcFByb3BlcnR5VmFsID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgdmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5oYXZlLmRlZXAucHJvcGVydHkocHJvcCwgdmFsKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5kZWVwUHJvcGVydHlOb3RWYWwob2JqZWN0LCBwcm9wZXJ0eSwgdmFsdWUsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBvYmplY3RgIGhhcyBhIHByb3BlcnR5IG5hbWVkIGJ5IGBwcm9wZXJ0eWAsIGJ1dCB3aXRoIGEgdmFsdWVcbiAgICogZGlmZmVyZW50IGZyb20gdGhhdCBnaXZlbiBieSBgdmFsdWVgLiBgcHJvcGVydHlgIGNhbiB1c2UgZG90LSBhbmRcbiAgICogYnJhY2tldC1ub3RhdGlvbiBmb3IgZGVlcCByZWZlcmVuY2UuXG4gICAqXG4gICAqICAgICBhc3NlcnQuZGVlcFByb3BlcnR5Tm90VmFsKHsgdGVhOiB7IGdyZWVuOiAnbWF0Y2hhJyB9fSwgJ3RlYS5ncmVlbicsICdrb25hY2hhJyk7XG4gICAqXG4gICAqIEBuYW1lIGRlZXBQcm9wZXJ0eU5vdFZhbFxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge01peGVkfSB2YWx1ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuZGVlcFByb3BlcnR5Tm90VmFsID0gZnVuY3Rpb24gKG9iaiwgcHJvcCwgdmFsLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKG9iaiwgbXNnKS50by5ub3QuaGF2ZS5kZWVwLnByb3BlcnR5KHByb3AsIHZhbCk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAubGVuZ3RoT2Yob2JqZWN0LCBsZW5ndGgsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBvYmplY3RgIGhhcyBhIGBsZW5ndGhgIHByb3BlcnR5IHdpdGggdGhlIGV4cGVjdGVkIHZhbHVlLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0Lmxlbmd0aE9mKFsxLDIsM10sIDMsICdhcnJheSBoYXMgbGVuZ3RoIG9mIDMnKTtcbiAgICogICAgIGFzc2VydC5sZW5ndGhPZignZm9vYmFyJywgNSwgJ3N0cmluZyBoYXMgbGVuZ3RoIG9mIDYnKTtcbiAgICpcbiAgICogQG5hbWUgbGVuZ3RoT2ZcbiAgICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQGFwaSBwdWJsaWNcbiAgICovXG5cbiAgYXNzZXJ0Lmxlbmd0aE9mID0gZnVuY3Rpb24gKGV4cCwgbGVuLCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKGV4cCwgbXNnKS50by5oYXZlLmxlbmd0aChsZW4pO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLnRocm93cyhmdW5jdGlvbiwgW2NvbnN0cnVjdG9yL3N0cmluZy9yZWdleHBdLCBbc3RyaW5nL3JlZ2V4cF0sIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IGBmdW5jdGlvbmAgd2lsbCB0aHJvdyBhbiBlcnJvciB0aGF0IGlzIGFuIGluc3RhbmNlIG9mXG4gICAqIGBjb25zdHJ1Y3RvcmAsIG9yIGFsdGVybmF0ZWx5IHRoYXQgaXQgd2lsbCB0aHJvdyBhbiBlcnJvciB3aXRoIG1lc3NhZ2VcbiAgICogbWF0Y2hpbmcgYHJlZ2V4cGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQudGhyb3coZm4sICdmdW5jdGlvbiB0aHJvd3MgYSByZWZlcmVuY2UgZXJyb3InKTtcbiAgICogICAgIGFzc2VydC50aHJvdyhmbiwgL2Z1bmN0aW9uIHRocm93cyBhIHJlZmVyZW5jZSBlcnJvci8pO1xuICAgKiAgICAgYXNzZXJ0LnRocm93KGZuLCBSZWZlcmVuY2VFcnJvcik7XG4gICAqICAgICBhc3NlcnQudGhyb3coZm4sIFJlZmVyZW5jZUVycm9yLCAnZnVuY3Rpb24gdGhyb3dzIGEgcmVmZXJlbmNlIGVycm9yJyk7XG4gICAqICAgICBhc3NlcnQudGhyb3coZm4sIFJlZmVyZW5jZUVycm9yLCAvZnVuY3Rpb24gdGhyb3dzIGEgcmVmZXJlbmNlIGVycm9yLyk7XG4gICAqXG4gICAqIEBuYW1lIHRocm93c1xuICAgKiBAYWxpYXMgdGhyb3dcbiAgICogQGFsaWFzIFRocm93XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7RXJyb3JDb25zdHJ1Y3Rvcn0gY29uc3RydWN0b3JcbiAgICogQHBhcmFtIHtSZWdFeHB9IHJlZ2V4cFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0Vycm9yI0Vycm9yX3R5cGVzXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5UaHJvdyA9IGZ1bmN0aW9uIChmbiwgZXJydCwgZXJycywgbXNnKSB7XG4gICAgaWYgKCdzdHJpbmcnID09PSB0eXBlb2YgZXJydCB8fCBlcnJ0IGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICBlcnJzID0gZXJydDtcbiAgICAgIGVycnQgPSBudWxsO1xuICAgIH1cblxuICAgIG5ldyBBc3NlcnRpb24oZm4sIG1zZykudG8uVGhyb3coZXJydCwgZXJycyk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAuZG9lc05vdFRocm93KGZ1bmN0aW9uLCBbY29uc3RydWN0b3IvcmVnZXhwXSwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYGZ1bmN0aW9uYCB3aWxsIF9ub3RfIHRocm93IGFuIGVycm9yIHRoYXQgaXMgYW4gaW5zdGFuY2Ugb2ZcbiAgICogYGNvbnN0cnVjdG9yYCwgb3IgYWx0ZXJuYXRlbHkgdGhhdCBpdCB3aWxsIG5vdCB0aHJvdyBhbiBlcnJvciB3aXRoIG1lc3NhZ2VcbiAgICogbWF0Y2hpbmcgYHJlZ2V4cGAuXG4gICAqXG4gICAqICAgICBhc3NlcnQuZG9lc05vdFRocm93KGZuLCBFcnJvciwgJ2Z1bmN0aW9uIGRvZXMgbm90IHRocm93Jyk7XG4gICAqXG4gICAqIEBuYW1lIGRvZXNOb3RUaHJvd1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Vycm9yQ29uc3RydWN0b3J9IGNvbnN0cnVjdG9yXG4gICAqIEBwYXJhbSB7UmVnRXhwfSByZWdleHBcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAgICogQHNlZSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9FcnJvciNFcnJvcl90eXBlc1xuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24gKGZuLCB0eXBlLCBtc2cpIHtcbiAgICBpZiAoJ3N0cmluZycgPT09IHR5cGVvZiB0eXBlKSB7XG4gICAgICBtc2cgPSB0eXBlO1xuICAgICAgdHlwZSA9IG51bGw7XG4gICAgfVxuXG4gICAgbmV3IEFzc2VydGlvbihmbiwgbXNnKS50by5ub3QuVGhyb3codHlwZSk7XG4gIH07XG5cbiAgLyoqXG4gICAqICMjIyAub3BlcmF0b3IodmFsMSwgb3BlcmF0b3IsIHZhbDIsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQ29tcGFyZXMgdHdvIHZhbHVlcyB1c2luZyBgb3BlcmF0b3JgLlxuICAgKlxuICAgKiAgICAgYXNzZXJ0Lm9wZXJhdG9yKDEsICc8JywgMiwgJ2V2ZXJ5dGhpbmcgaXMgb2snKTtcbiAgICogICAgIGFzc2VydC5vcGVyYXRvcigxLCAnPicsIDIsICd0aGlzIHdpbGwgZmFpbCcpO1xuICAgKlxuICAgKiBAbmFtZSBvcGVyYXRvclxuICAgKiBAcGFyYW0ge01peGVkfSB2YWwxXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvcGVyYXRvclxuICAgKiBAcGFyYW0ge01peGVkfSB2YWwyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5vcGVyYXRvciA9IGZ1bmN0aW9uICh2YWwsIG9wZXJhdG9yLCB2YWwyLCBtc2cpIHtcbiAgICBpZiAoIX5bJz09JywgJz09PScsICc+JywgJz49JywgJzwnLCAnPD0nLCAnIT0nLCAnIT09J10uaW5kZXhPZihvcGVyYXRvcikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBvcGVyYXRvciBcIicgKyBvcGVyYXRvciArICdcIicpO1xuICAgIH1cbiAgICB2YXIgdGVzdCA9IG5ldyBBc3NlcnRpb24oZXZhbCh2YWwgKyBvcGVyYXRvciArIHZhbDIpLCBtc2cpO1xuICAgIHRlc3QuYXNzZXJ0KFxuICAgICAgICB0cnVlID09PSBmbGFnKHRlc3QsICdvYmplY3QnKVxuICAgICAgLCAnZXhwZWN0ZWQgJyArIHV0aWwuaW5zcGVjdCh2YWwpICsgJyB0byBiZSAnICsgb3BlcmF0b3IgKyAnICcgKyB1dGlsLmluc3BlY3QodmFsMilcbiAgICAgICwgJ2V4cGVjdGVkICcgKyB1dGlsLmluc3BlY3QodmFsKSArICcgdG8gbm90IGJlICcgKyBvcGVyYXRvciArICcgJyArIHV0aWwuaW5zcGVjdCh2YWwyKSApO1xuICB9O1xuXG4gIC8qKlxuICAgKiAjIyMgLmNsb3NlVG8oYWN0dWFsLCBleHBlY3RlZCwgZGVsdGEsIFttZXNzYWdlXSlcbiAgICpcbiAgICogQXNzZXJ0cyB0aGF0IHRoZSB0YXJnZXQgaXMgZXF1YWwgYGV4cGVjdGVkYCwgdG8gd2l0aGluIGEgKy8tIGBkZWx0YWAgcmFuZ2UuXG4gICAqXG4gICAqICAgICBhc3NlcnQuY2xvc2VUbygxLjUsIDEsIDAuNSwgJ251bWJlcnMgYXJlIGNsb3NlJyk7XG4gICAqXG4gICAqIEBuYW1lIGNsb3NlVG9cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFjdHVhbFxuICAgKiBAcGFyYW0ge051bWJlcn0gZXhwZWN0ZWRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5jbG9zZVRvID0gZnVuY3Rpb24gKGFjdCwgZXhwLCBkZWx0YSwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbihhY3QsIG1zZykudG8uYmUuY2xvc2VUbyhleHAsIGRlbHRhKTtcbiAgfTtcblxuICAvKipcbiAgICogIyMjIC5zYW1lTWVtYmVycyhzZXQxLCBzZXQyLCBbbWVzc2FnZV0pXG4gICAqXG4gICAqIEFzc2VydHMgdGhhdCBgc2V0MWAgYW5kIGBzZXQyYCBoYXZlIHRoZSBzYW1lIG1lbWJlcnMuXG4gICAqIE9yZGVyIGlzIG5vdCB0YWtlbiBpbnRvIGFjY291bnQuXG4gICAqXG4gICAqICAgICBhc3NlcnQuc2FtZU1lbWJlcnMoWyAxLCAyLCAzIF0sIFsgMiwgMSwgMyBdLCAnc2FtZSBtZW1iZXJzJyk7XG4gICAqXG4gICAqIEBuYW1lIHNhbWVNZW1iZXJzXG4gICAqIEBwYXJhbSB7QXJyYXl9IHN1cGVyc2V0XG4gICAqIEBwYXJhbSB7QXJyYXl9IHN1YnNldFxuICAgKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZVxuICAgKiBAYXBpIHB1YmxpY1xuICAgKi9cblxuICBhc3NlcnQuc2FtZU1lbWJlcnMgPSBmdW5jdGlvbiAoc2V0MSwgc2V0MiwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbihzZXQxLCBtc2cpLnRvLmhhdmUuc2FtZS5tZW1iZXJzKHNldDIpO1xuICB9XG5cbiAgLyoqXG4gICAqICMjIyAuaW5jbHVkZU1lbWJlcnMoc3VwZXJzZXQsIHN1YnNldCwgW21lc3NhZ2VdKVxuICAgKlxuICAgKiBBc3NlcnRzIHRoYXQgYHN1YnNldGAgaXMgaW5jbHVkZWQgaW4gYHN1cGVyc2V0YC5cbiAgICogT3JkZXIgaXMgbm90IHRha2VuIGludG8gYWNjb3VudC5cbiAgICpcbiAgICogICAgIGFzc2VydC5pbmNsdWRlTWVtYmVycyhbIDEsIDIsIDMgXSwgWyAyLCAxIF0sICdpbmNsdWRlIG1lbWJlcnMnKTtcbiAgICpcbiAgICogQG5hbWUgaW5jbHVkZU1lbWJlcnNcbiAgICogQHBhcmFtIHtBcnJheX0gc3VwZXJzZXRcbiAgICogQHBhcmFtIHtBcnJheX0gc3Vic2V0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gICAqIEBhcGkgcHVibGljXG4gICAqL1xuXG4gIGFzc2VydC5pbmNsdWRlTWVtYmVycyA9IGZ1bmN0aW9uIChzdXBlcnNldCwgc3Vic2V0LCBtc2cpIHtcbiAgICBuZXcgQXNzZXJ0aW9uKHN1cGVyc2V0LCBtc2cpLnRvLmluY2x1ZGUubWVtYmVycyhzdWJzZXQpO1xuICB9XG5cbiAgLyohXG4gICAqIFVuZG9jdW1lbnRlZCAvIHVudGVzdGVkXG4gICAqL1xuXG4gIGFzc2VydC5pZkVycm9yID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8ubm90LmJlLm9rO1xuICB9O1xuXG4gIC8qIVxuICAgKiBBbGlhc2VzLlxuICAgKi9cblxuICAoZnVuY3Rpb24gYWxpYXMobmFtZSwgYXMpe1xuICAgIGFzc2VydFthc10gPSBhc3NlcnRbbmFtZV07XG4gICAgcmV0dXJuIGFsaWFzO1xuICB9KVxuICAoJ1Rocm93JywgJ3Rocm93JylcbiAgKCdUaHJvdycsICd0aHJvd3MnKTtcbn07XG4iLCIvKiFcbiAqIGNoYWlcbiAqIENvcHlyaWdodChjKSAyMDExLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjaGFpLCB1dGlsKSB7XG4gIGNoYWkuZXhwZWN0ID0gZnVuY3Rpb24gKHZhbCwgbWVzc2FnZSkge1xuICAgIHJldHVybiBuZXcgY2hhaS5Bc3NlcnRpb24odmFsLCBtZXNzYWdlKTtcbiAgfTtcbn07XG5cbiIsIi8qIVxuICogY2hhaVxuICogQ29weXJpZ2h0KGMpIDIwMTEtMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNoYWksIHV0aWwpIHtcbiAgdmFyIEFzc2VydGlvbiA9IGNoYWkuQXNzZXJ0aW9uO1xuXG4gIGZ1bmN0aW9uIGxvYWRTaG91bGQgKCkge1xuICAgIC8vIG1vZGlmeSBPYmplY3QucHJvdG90eXBlIHRvIGhhdmUgYHNob3VsZGBcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoT2JqZWN0LnByb3RvdHlwZSwgJ3Nob3VsZCcsXG4gICAgICB7XG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgLy8gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9jaGFpanMvY2hhaS9pc3N1ZXMvODY6IHRoaXMgbWFrZXNcbiAgICAgICAgICAvLyBgd2hhdGV2ZXIuc2hvdWxkID0gc29tZVZhbHVlYCBhY3R1YWxseSBzZXQgYHNvbWVWYWx1ZWAsIHdoaWNoIGlzXG4gICAgICAgICAgLy8gZXNwZWNpYWxseSB1c2VmdWwgZm9yIGBnbG9iYWwuc2hvdWxkID0gcmVxdWlyZSgnY2hhaScpLnNob3VsZCgpYC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIE5vdGUgdGhhdCB3ZSBoYXZlIHRvIHVzZSBbW0RlZmluZVByb3BlcnR5XV0gaW5zdGVhZCBvZiBbW1B1dF1dXG4gICAgICAgICAgLy8gc2luY2Ugb3RoZXJ3aXNlIHdlIHdvdWxkIHRyaWdnZXIgdGhpcyB2ZXJ5IHNldHRlciFcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Nob3VsZCcsIHtcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgICB3cml0YWJsZTogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAsIGdldDogZnVuY3Rpb24oKXtcbiAgICAgICAgICBpZiAodGhpcyBpbnN0YW5jZW9mIFN0cmluZyB8fCB0aGlzIGluc3RhbmNlb2YgTnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFzc2VydGlvbih0aGlzLmNvbnN0cnVjdG9yKHRoaXMpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMgaW5zdGFuY2VvZiBCb29sZWFuKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEFzc2VydGlvbih0aGlzID09IHRydWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IEFzc2VydGlvbih0aGlzKTtcbiAgICAgICAgfVxuICAgICAgLCBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcblxuICAgIHZhciBzaG91bGQgPSB7fTtcblxuICAgIHNob3VsZC5lcXVhbCA9IGZ1bmN0aW9uICh2YWwxLCB2YWwyLCBtc2cpIHtcbiAgICAgIG5ldyBBc3NlcnRpb24odmFsMSwgbXNnKS50by5lcXVhbCh2YWwyKTtcbiAgICB9O1xuXG4gICAgc2hvdWxkLlRocm93ID0gZnVuY3Rpb24gKGZuLCBlcnJ0LCBlcnJzLCBtc2cpIHtcbiAgICAgIG5ldyBBc3NlcnRpb24oZm4sIG1zZykudG8uVGhyb3coZXJydCwgZXJycyk7XG4gICAgfTtcblxuICAgIHNob3VsZC5leGlzdCA9IGZ1bmN0aW9uICh2YWwsIG1zZykge1xuICAgICAgbmV3IEFzc2VydGlvbih2YWwsIG1zZykudG8uZXhpc3Q7XG4gICAgfVxuXG4gICAgLy8gbmVnYXRpb25cbiAgICBzaG91bGQubm90ID0ge31cblxuICAgIHNob3VsZC5ub3QuZXF1YWwgPSBmdW5jdGlvbiAodmFsMSwgdmFsMiwgbXNnKSB7XG4gICAgICBuZXcgQXNzZXJ0aW9uKHZhbDEsIG1zZykudG8ubm90LmVxdWFsKHZhbDIpO1xuICAgIH07XG5cbiAgICBzaG91bGQubm90LlRocm93ID0gZnVuY3Rpb24gKGZuLCBlcnJ0LCBlcnJzLCBtc2cpIHtcbiAgICAgIG5ldyBBc3NlcnRpb24oZm4sIG1zZykudG8ubm90LlRocm93KGVycnQsIGVycnMpO1xuICAgIH07XG5cbiAgICBzaG91bGQubm90LmV4aXN0ID0gZnVuY3Rpb24gKHZhbCwgbXNnKSB7XG4gICAgICBuZXcgQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5ub3QuZXhpc3Q7XG4gICAgfVxuXG4gICAgc2hvdWxkWyd0aHJvdyddID0gc2hvdWxkWydUaHJvdyddO1xuICAgIHNob3VsZC5ub3RbJ3Rocm93J10gPSBzaG91bGQubm90WydUaHJvdyddO1xuXG4gICAgcmV0dXJuIHNob3VsZDtcbiAgfTtcblxuICBjaGFpLnNob3VsZCA9IGxvYWRTaG91bGQ7XG4gIGNoYWkuU2hvdWxkID0gbG9hZFNob3VsZDtcbn07XG4iLCIvKiFcbiAqIENoYWkgLSBhZGRDaGFpbmluZ01ldGhvZCB1dGlsaXR5XG4gKiBDb3B5cmlnaHQoYykgMjAxMi0yMDEzIEpha2UgTHVlciA8amFrZUBhbG9naWNhbHBhcmFkb3guY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyohXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzXG4gKi9cblxudmFyIHRyYW5zZmVyRmxhZ3MgPSByZXF1aXJlKCcuL3RyYW5zZmVyRmxhZ3MnKTtcblxuLyohXG4gKiBNb2R1bGUgdmFyaWFibGVzXG4gKi9cblxuLy8gQ2hlY2sgd2hldGhlciBgX19wcm90b19fYCBpcyBzdXBwb3J0ZWRcbnZhciBoYXNQcm90b1N1cHBvcnQgPSAnX19wcm90b19fJyBpbiBPYmplY3Q7XG5cbi8vIFdpdGhvdXQgYF9fcHJvdG9fX2Agc3VwcG9ydCwgdGhpcyBtb2R1bGUgd2lsbCBuZWVkIHRvIGFkZCBwcm9wZXJ0aWVzIHRvIGEgZnVuY3Rpb24uXG4vLyBIb3dldmVyLCBzb21lIEZ1bmN0aW9uLnByb3RvdHlwZSBtZXRob2RzIGNhbm5vdCBiZSBvdmVyd3JpdHRlbixcbi8vIGFuZCB0aGVyZSBzZWVtcyBubyBlYXN5IGNyb3NzLXBsYXRmb3JtIHdheSB0byBkZXRlY3QgdGhlbSAoQHNlZSBjaGFpanMvY2hhaS9pc3N1ZXMvNjkpLlxudmFyIGV4Y2x1ZGVOYW1lcyA9IC9eKD86bGVuZ3RofG5hbWV8YXJndW1lbnRzfGNhbGxlcikkLztcblxuLy8gQ2FjaGUgYEZ1bmN0aW9uYCBwcm9wZXJ0aWVzXG52YXIgY2FsbCAgPSBGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCxcbiAgICBhcHBseSA9IEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseTtcblxuLyoqXG4gKiAjIyMgYWRkQ2hhaW5hYmxlTWV0aG9kIChjdHgsIG5hbWUsIG1ldGhvZCwgY2hhaW5pbmdCZWhhdmlvcilcbiAqXG4gKiBBZGRzIGEgbWV0aG9kIHRvIGFuIG9iamVjdCwgc3VjaCB0aGF0IHRoZSBtZXRob2QgY2FuIGFsc28gYmUgY2hhaW5lZC5cbiAqXG4gKiAgICAgdXRpbHMuYWRkQ2hhaW5hYmxlTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgJ2ZvbycsIGZ1bmN0aW9uIChzdHIpIHtcbiAqICAgICAgIHZhciBvYmogPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKTtcbiAqICAgICAgIG5ldyBjaGFpLkFzc2VydGlvbihvYmopLnRvLmJlLmVxdWFsKHN0cik7XG4gKiAgICAgfSk7XG4gKlxuICogQ2FuIGFsc28gYmUgYWNjZXNzZWQgZGlyZWN0bHkgZnJvbSBgY2hhaS5Bc3NlcnRpb25gLlxuICpcbiAqICAgICBjaGFpLkFzc2VydGlvbi5hZGRDaGFpbmFibGVNZXRob2QoJ2ZvbycsIGZuLCBjaGFpbmluZ0JlaGF2aW9yKTtcbiAqXG4gKiBUaGUgcmVzdWx0IGNhbiB0aGVuIGJlIHVzZWQgYXMgYm90aCBhIG1ldGhvZCBhc3NlcnRpb24sIGV4ZWN1dGluZyBib3RoIGBtZXRob2RgIGFuZFxuICogYGNoYWluaW5nQmVoYXZpb3JgLCBvciBhcyBhIGxhbmd1YWdlIGNoYWluLCB3aGljaCBvbmx5IGV4ZWN1dGVzIGBjaGFpbmluZ0JlaGF2aW9yYC5cbiAqXG4gKiAgICAgZXhwZWN0KGZvb1N0cikudG8uYmUuZm9vKCdiYXInKTtcbiAqICAgICBleHBlY3QoZm9vU3RyKS50by5iZS5mb28uZXF1YWwoJ2ZvbycpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggb2JqZWN0IHRvIHdoaWNoIHRoZSBtZXRob2QgaXMgYWRkZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG9mIG1ldGhvZCB0byBhZGRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciBgbmFtZWAsIHdoZW4gY2FsbGVkXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGFpbmluZ0JlaGF2aW9yIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBldmVyeSB0aW1lIHRoZSBwcm9wZXJ0eSBpcyBhY2Nlc3NlZFxuICogQG5hbWUgYWRkQ2hhaW5hYmxlTWV0aG9kXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGN0eCwgbmFtZSwgbWV0aG9kLCBjaGFpbmluZ0JlaGF2aW9yKSB7XG4gIGlmICh0eXBlb2YgY2hhaW5pbmdCZWhhdmlvciAhPT0gJ2Z1bmN0aW9uJylcbiAgICBjaGFpbmluZ0JlaGF2aW9yID0gZnVuY3Rpb24gKCkgeyB9O1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjdHgsIG5hbWUsXG4gICAgeyBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2hhaW5pbmdCZWhhdmlvci5jYWxsKHRoaXMpO1xuXG4gICAgICAgIHZhciBhc3NlcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgdmFyIHJlc3VsdCA9IG1ldGhvZC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgIHJldHVybiByZXN1bHQgPT09IHVuZGVmaW5lZCA/IHRoaXMgOiByZXN1bHQ7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gVXNlIGBfX3Byb3RvX19gIGlmIGF2YWlsYWJsZVxuICAgICAgICBpZiAoaGFzUHJvdG9TdXBwb3J0KSB7XG4gICAgICAgICAgLy8gSW5oZXJpdCBhbGwgcHJvcGVydGllcyBmcm9tIHRoZSBvYmplY3QgYnkgcmVwbGFjaW5nIHRoZSBgRnVuY3Rpb25gIHByb3RvdHlwZVxuICAgICAgICAgIHZhciBwcm90b3R5cGUgPSBhc3NlcnQuX19wcm90b19fID0gT2JqZWN0LmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgICAvLyBSZXN0b3JlIHRoZSBgY2FsbGAgYW5kIGBhcHBseWAgbWV0aG9kcyBmcm9tIGBGdW5jdGlvbmBcbiAgICAgICAgICBwcm90b3R5cGUuY2FsbCA9IGNhbGw7XG4gICAgICAgICAgcHJvdG90eXBlLmFwcGx5ID0gYXBwbHk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCByZWRlZmluZSBhbGwgcHJvcGVydGllcyAoc2xvdyEpXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHZhciBhc3NlcnRlck5hbWVzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoY3R4KTtcbiAgICAgICAgICBhc3NlcnRlck5hbWVzLmZvckVhY2goZnVuY3Rpb24gKGFzc2VydGVyTmFtZSkge1xuICAgICAgICAgICAgaWYgKCFleGNsdWRlTmFtZXMudGVzdChhc3NlcnRlck5hbWUpKSB7XG4gICAgICAgICAgICAgIHZhciBwZCA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoY3R4LCBhc3NlcnRlck5hbWUpO1xuICAgICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoYXNzZXJ0LCBhc3NlcnRlck5hbWUsIHBkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRyYW5zZmVyRmxhZ3ModGhpcywgYXNzZXJ0KTtcbiAgICAgICAgcmV0dXJuIGFzc2VydDtcbiAgICAgIH1cbiAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbn07XG4iLCIvKiFcbiAqIENoYWkgLSBhZGRNZXRob2QgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qKlxuICogIyMjIC5hZGRNZXRob2QgKGN0eCwgbmFtZSwgbWV0aG9kKVxuICpcbiAqIEFkZHMgYSBtZXRob2QgdG8gdGhlIHByb3RvdHlwZSBvZiBhbiBvYmplY3QuXG4gKlxuICogICAgIHV0aWxzLmFkZE1ldGhvZChjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUsICdmb28nLCBmdW5jdGlvbiAoc3RyKSB7XG4gKiAgICAgICB2YXIgb2JqID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gKiAgICAgICBuZXcgY2hhaS5Bc3NlcnRpb24ob2JqKS50by5iZS5lcXVhbChzdHIpO1xuICogICAgIH0pO1xuICpcbiAqIENhbiBhbHNvIGJlIGFjY2Vzc2VkIGRpcmVjdGx5IGZyb20gYGNoYWkuQXNzZXJ0aW9uYC5cbiAqXG4gKiAgICAgY2hhaS5Bc3NlcnRpb24uYWRkTWV0aG9kKCdmb28nLCBmbik7XG4gKlxuICogVGhlbiBjYW4gYmUgdXNlZCBhcyBhbnkgb3RoZXIgYXNzZXJ0aW9uLlxuICpcbiAqICAgICBleHBlY3QoZm9vU3RyKS50by5iZS5mb28oJ2JhcicpO1xuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjdHggb2JqZWN0IHRvIHdoaWNoIHRoZSBtZXRob2QgaXMgYWRkZWRcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG9mIG1ldGhvZCB0byBhZGRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciBuYW1lXG4gKiBAbmFtZSBhZGRNZXRob2RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3R4LCBuYW1lLCBtZXRob2QpIHtcbiAgY3R4W25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXN1bHQgPSBtZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyB0aGlzIDogcmVzdWx0O1xuICB9O1xufTtcbiIsIi8qIVxuICogQ2hhaSAtIGFkZFByb3BlcnR5IHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyBhZGRQcm9wZXJ0eSAoY3R4LCBuYW1lLCBnZXR0ZXIpXG4gKlxuICogQWRkcyBhIHByb3BlcnR5IHRvIHRoZSBwcm90b3R5cGUgb2YgYW4gb2JqZWN0LlxuICpcbiAqICAgICB1dGlscy5hZGRQcm9wZXJ0eShjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUsICdmb28nLCBmdW5jdGlvbiAoKSB7XG4gKiAgICAgICB2YXIgb2JqID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG4gKiAgICAgICBuZXcgY2hhaS5Bc3NlcnRpb24ob2JqKS50by5iZS5pbnN0YW5jZW9mKEZvbyk7XG4gKiAgICAgfSk7XG4gKlxuICogQ2FuIGFsc28gYmUgYWNjZXNzZWQgZGlyZWN0bHkgZnJvbSBgY2hhaS5Bc3NlcnRpb25gLlxuICpcbiAqICAgICBjaGFpLkFzc2VydGlvbi5hZGRQcm9wZXJ0eSgnZm9vJywgZm4pO1xuICpcbiAqIFRoZW4gY2FuIGJlIHVzZWQgYXMgYW55IG90aGVyIGFzc2VydGlvbi5cbiAqXG4gKiAgICAgZXhwZWN0KG15Rm9vKS50by5iZS5mb287XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGN0eCBvYmplY3QgdG8gd2hpY2ggdGhlIHByb3BlcnR5IGlzIGFkZGVkXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZSBvZiBwcm9wZXJ0eSB0byBhZGRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGdldHRlciBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciBuYW1lXG4gKiBAbmFtZSBhZGRQcm9wZXJ0eVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjdHgsIG5hbWUsIGdldHRlcikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3R4LCBuYW1lLFxuICAgIHsgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBnZXR0ZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gdGhpcyA6IHJlc3VsdDtcbiAgICAgIH1cbiAgICAsIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICB9KTtcbn07XG4iLCIvLyBUaGlzIGlzIChhbG1vc3QpIGRpcmVjdGx5IGZyb20gTm9kZS5qcyBhc3NlcnRcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3llbnQvbm9kZS9ibG9iL2Y4YzMzNWQwY2FmNDdmMTZkMzE0MTNmODlhYTI4ZWRhMzg3OGUzYWEvbGliL2Fzc2VydC5qc1xuXG5tb2R1bGUuZXhwb3J0cyA9IF9kZWVwRXF1YWw7XG5cbnZhciBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4vZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMnKTtcblxuLy8gZm9yIHRoZSBicm93c2VyXG52YXIgQnVmZmVyO1xudHJ5IHtcbiAgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyO1xufSBjYXRjaCAoZXgpIHtcbiAgQnVmZmVyID0ge1xuICAgIGlzQnVmZmVyOiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfVxuICB9O1xufVxuXG5mdW5jdGlvbiBfZGVlcEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lbW9zKSB7XG5cbiAgLy8gNy4xLiBBbGwgaWRlbnRpY2FsIHZhbHVlcyBhcmUgZXF1aXZhbGVudCwgYXMgZGV0ZXJtaW5lZCBieSA9PT0uXG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgcmV0dXJuIHRydWU7XG5cbiAgfSBlbHNlIGlmIChCdWZmZXIuaXNCdWZmZXIoYWN0dWFsKSAmJiBCdWZmZXIuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBEYXRlKSB7XG4gICAgaWYgKCEoYWN0dWFsIGluc3RhbmNlb2YgRGF0ZSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMy4gT3RoZXIgcGFpcnMgdGhhdCBkbyBub3QgYm90aCBwYXNzIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0JyxcbiAgLy8gZXF1aXZhbGVuY2UgaXMgZGV0ZXJtaW5lZCBieSA9PS5cbiAgfSBlbHNlIGlmICh0eXBlb2YgYWN0dWFsICE9ICdvYmplY3QnICYmIHR5cGVvZiBleHBlY3RlZCAhPSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBhY3R1YWwgPT09IGV4cGVjdGVkO1xuXG4gIH0gZWxzZSBpZiAoZXhwZWN0ZWQgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICBpZiAoIShhY3R1YWwgaW5zdGFuY2VvZiBSZWdFeHApKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIGFjdHVhbC50b1N0cmluZygpID09PSBleHBlY3RlZC50b1N0cmluZygpO1xuXG4gIC8vIDcuNC4gRm9yIGFsbCBvdGhlciBPYmplY3QgcGFpcnMsIGluY2x1ZGluZyBBcnJheSBvYmplY3RzLCBlcXVpdmFsZW5jZSBpc1xuICAvLyBkZXRlcm1pbmVkIGJ5IGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoYXMgdmVyaWZpZWRcbiAgLy8gd2l0aCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwpLCB0aGUgc2FtZSBzZXQgb2Yga2V5c1xuICAvLyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSwgZXF1aXZhbGVudCB2YWx1ZXMgZm9yIGV2ZXJ5XG4gIC8vIGNvcnJlc3BvbmRpbmcga2V5LCBhbmQgYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LiBOb3RlOiB0aGlzXG4gIC8vIGFjY291bnRzIGZvciBib3RoIG5hbWVkIGFuZCBpbmRleGVkIHByb3BlcnRpZXMgb24gQXJyYXlzLlxuICB9IGVsc2Uge1xuICAgIHJldHVybiBvYmpFcXVpdihhY3R1YWwsIGV4cGVjdGVkLCBtZW1vcyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWRPck51bGwodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIsIG1lbW9zKSB7XG4gIGlmIChpc1VuZGVmaW5lZE9yTnVsbChhKSB8fCBpc1VuZGVmaW5lZE9yTnVsbChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgLy8gYW4gaWRlbnRpY2FsICdwcm90b3R5cGUnIHByb3BlcnR5LlxuICBpZiAoYS5wcm90b3R5cGUgIT09IGIucHJvdG90eXBlKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBhbHJlYWR5IGNvbXBhcmVkIGEgYW5kIGJcbiAgdmFyIGk7XG4gIGlmIChtZW1vcykge1xuICAgIGZvcihpID0gMDsgaSA8IG1lbW9zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoKG1lbW9zW2ldWzBdID09PSBhICYmIG1lbW9zW2ldWzFdID09PSBiKSB8fFxuICAgICAgICAgIChtZW1vc1tpXVswXSA9PT0gYiAmJiBtZW1vc1tpXVsxXSA9PT0gYSkpXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBtZW1vcyA9IFtdO1xuICB9XG5cbiAgLy9+fn5JJ3ZlIG1hbmFnZWQgdG8gYnJlYWsgT2JqZWN0LmtleXMgdGhyb3VnaCBzY3Jld3kgYXJndW1lbnRzIHBhc3NpbmcuXG4gIC8vICAgQ29udmVydGluZyB0byBhcnJheSBzb2x2ZXMgdGhlIHByb2JsZW0uXG4gIGlmIChpc0FyZ3VtZW50cyhhKSkge1xuICAgIGlmICghaXNBcmd1bWVudHMoYikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgYSA9IHBTbGljZS5jYWxsKGEpO1xuICAgIGIgPSBwU2xpY2UuY2FsbChiKTtcbiAgICByZXR1cm4gX2RlZXBFcXVhbChhLCBiLCBtZW1vcyk7XG4gIH1cbiAgdHJ5IHtcbiAgICB2YXIga2EgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhhKSxcbiAgICAgICAga2IgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhiKSxcbiAgICAgICAga2V5O1xuICB9IGNhdGNoIChlKSB7Ly9oYXBwZW5zIHdoZW4gb25lIGlzIGEgc3RyaW5nIGxpdGVyYWwgYW5kIHRoZSBvdGhlciBpc24ndFxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcblxuICAvL3RoZSBzYW1lIHNldCBvZiBrZXlzIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLFxuICBrYS5zb3J0KCk7XG4gIGtiLnNvcnQoKTtcbiAgLy9+fn5jaGVhcCBrZXkgdGVzdFxuICBmb3IgKGkgPSBrYS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIGlmIChrYVtpXSAhPSBrYltpXSlcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8vIHJlbWVtYmVyIG9iamVjdHMgd2UgaGF2ZSBjb21wYXJlZCB0byBndWFyZCBhZ2FpbnN0IGNpcmN1bGFyIHJlZmVyZW5jZXNcbiAgbWVtb3MucHVzaChbIGEsIGIgXSk7XG5cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0sIG1lbW9zKSkgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG4iLCIvKiFcbiAqIENoYWkgLSBmbGFnIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyBmbGFnKG9iamVjdCAsa2V5LCBbdmFsdWVdKVxuICpcbiAqIEdldCBvciBzZXQgYSBmbGFnIHZhbHVlIG9uIGFuIG9iamVjdC4gSWYgYVxuICogdmFsdWUgaXMgcHJvdmlkZWQgaXQgd2lsbCBiZSBzZXQsIGVsc2UgaXQgd2lsbFxuICogcmV0dXJuIHRoZSBjdXJyZW50bHkgc2V0IHZhbHVlIG9yIGB1bmRlZmluZWRgIGlmXG4gKiB0aGUgdmFsdWUgaXMgbm90IHNldC5cbiAqXG4gKiAgICAgdXRpbHMuZmxhZyh0aGlzLCAnZm9vJywgJ2JhcicpOyAvLyBzZXR0ZXJcbiAqICAgICB1dGlscy5mbGFnKHRoaXMsICdmb28nKTsgLy8gZ2V0dGVyLCByZXR1cm5zIGBiYXJgXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAoY29uc3RydWN0ZWQgQXNzZXJ0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge01peGVkfSB2YWx1ZSAob3B0aW9uYWwpXG4gKiBAbmFtZSBmbGFnXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmosIGtleSwgdmFsdWUpIHtcbiAgdmFyIGZsYWdzID0gb2JqLl9fZmxhZ3MgfHwgKG9iai5fX2ZsYWdzID0gT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgZmxhZ3Nba2V5XSA9IHZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmbGFnc1trZXldO1xuICB9XG59O1xuIiwiLyohXG4gKiBDaGFpIC0gZ2V0QWN0dWFsIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMgZ2V0QWN0dWFsKG9iamVjdCwgW2FjdHVhbF0pXG4gKlxuICogUmV0dXJucyB0aGUgYGFjdHVhbGAgdmFsdWUgZm9yIGFuIEFzc2VydGlvblxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgKGNvbnN0cnVjdGVkIEFzc2VydGlvbilcbiAqIEBwYXJhbSB7QXJndW1lbnRzfSBjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUuYXNzZXJ0IGFyZ3VtZW50c1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iaiwgYXJncykge1xuICB2YXIgYWN0dWFsID0gYXJnc1s0XTtcbiAgcmV0dXJuICd1bmRlZmluZWQnICE9PSB0eXBlb2YgYWN0dWFsID8gYWN0dWFsIDogb2JqLl9vYmo7XG59O1xuIiwiLyohXG4gKiBDaGFpIC0gZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qKlxuICogIyMjIC5nZXRFbnVtZXJhYmxlUHJvcGVydGllcyhvYmplY3QpXG4gKlxuICogVGhpcyBhbGxvd3MgdGhlIHJldHJpZXZhbCBvZiBlbnVtZXJhYmxlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdCxcbiAqIGluaGVyaXRlZCBvciBub3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybnMge0FycmF5fVxuICogQG5hbWUgZ2V0RW51bWVyYWJsZVByb3BlcnRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyhvYmplY3QpIHtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBuYW1lIGluIG9iamVjdCkge1xuICAgIHJlc3VsdC5wdXNoKG5hbWUpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLyohXG4gKiBDaGFpIC0gbWVzc2FnZSBjb21wb3NpdGlvbiB1dGlsaXR5XG4gKiBDb3B5cmlnaHQoYykgMjAxMi0yMDEzIEpha2UgTHVlciA8amFrZUBhbG9naWNhbHBhcmFkb3guY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyohXG4gKiBNb2R1bGUgZGVwZW5kYW5jaWVzXG4gKi9cblxudmFyIGZsYWcgPSByZXF1aXJlKCcuL2ZsYWcnKVxuICAsIGdldEFjdHVhbCA9IHJlcXVpcmUoJy4vZ2V0QWN0dWFsJylcbiAgLCBpbnNwZWN0ID0gcmVxdWlyZSgnLi9pbnNwZWN0JylcbiAgLCBvYmpEaXNwbGF5ID0gcmVxdWlyZSgnLi9vYmpEaXNwbGF5Jyk7XG5cbi8qKlxuICogIyMjIC5nZXRNZXNzYWdlKG9iamVjdCwgbWVzc2FnZSwgbmVnYXRlTWVzc2FnZSlcbiAqXG4gKiBDb25zdHJ1Y3QgdGhlIGVycm9yIG1lc3NhZ2UgYmFzZWQgb24gZmxhZ3NcbiAqIGFuZCB0ZW1wbGF0ZSB0YWdzLiBUZW1wbGF0ZSB0YWdzIHdpbGwgcmV0dXJuXG4gKiBhIHN0cmluZ2lmaWVkIGluc3BlY3Rpb24gb2YgdGhlIG9iamVjdCByZWZlcmVuY2VkLlxuICpcbiAqIE1lc3NhZ2UgdGVtcGxhdGUgdGFnczpcbiAqIC0gYCN7dGhpc31gIGN1cnJlbnQgYXNzZXJ0ZWQgb2JqZWN0XG4gKiAtIGAje2FjdH1gIGFjdHVhbCB2YWx1ZVxuICogLSBgI3tleHB9YCBleHBlY3RlZCB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3QgKGNvbnN0cnVjdGVkIEFzc2VydGlvbilcbiAqIEBwYXJhbSB7QXJndW1lbnRzfSBjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUuYXNzZXJ0IGFyZ3VtZW50c1xuICogQG5hbWUgZ2V0TWVzc2FnZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmosIGFyZ3MpIHtcbiAgdmFyIG5lZ2F0ZSA9IGZsYWcob2JqLCAnbmVnYXRlJylcbiAgICAsIHZhbCA9IGZsYWcob2JqLCAnb2JqZWN0JylcbiAgICAsIGV4cGVjdGVkID0gYXJnc1szXVxuICAgICwgYWN0dWFsID0gZ2V0QWN0dWFsKG9iaiwgYXJncylcbiAgICAsIG1zZyA9IG5lZ2F0ZSA/IGFyZ3NbMl0gOiBhcmdzWzFdXG4gICAgLCBmbGFnTXNnID0gZmxhZyhvYmosICdtZXNzYWdlJyk7XG5cbiAgbXNnID0gbXNnIHx8ICcnO1xuICBtc2cgPSBtc2dcbiAgICAucmVwbGFjZSgvI3t0aGlzfS9nLCBvYmpEaXNwbGF5KHZhbCkpXG4gICAgLnJlcGxhY2UoLyN7YWN0fS9nLCBvYmpEaXNwbGF5KGFjdHVhbCkpXG4gICAgLnJlcGxhY2UoLyN7ZXhwfS9nLCBvYmpEaXNwbGF5KGV4cGVjdGVkKSk7XG5cbiAgcmV0dXJuIGZsYWdNc2cgPyBmbGFnTXNnICsgJzogJyArIG1zZyA6IG1zZztcbn07XG4iLCIvKiFcbiAqIENoYWkgLSBnZXROYW1lIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMgZ2V0TmFtZShmdW5jKVxuICpcbiAqIEdldHMgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiwgaW4gYSBjcm9zcy1icm93c2VyIHdheS5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhIGZ1bmN0aW9uICh1c3VhbGx5IGEgY29uc3RydWN0b3IpXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZnVuYykge1xuICBpZiAoZnVuYy5uYW1lKSByZXR1cm4gZnVuYy5uYW1lO1xuXG4gIHZhciBtYXRjaCA9IC9eXFxzP2Z1bmN0aW9uIChbXihdKilcXCgvLmV4ZWMoZnVuYyk7XG4gIHJldHVybiBtYXRjaCAmJiBtYXRjaFsxXSA/IG1hdGNoWzFdIDogXCJcIjtcbn07XG4iLCIvKiFcbiAqIENoYWkgLSBnZXRQYXRoVmFsdWUgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIEBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2xvZ2ljYWxwYXJhZG94L2ZpbHRyXG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyAuZ2V0UGF0aFZhbHVlKHBhdGgsIG9iamVjdClcbiAqXG4gKiBUaGlzIGFsbG93cyB0aGUgcmV0cmlldmFsIG9mIHZhbHVlcyBpbiBhblxuICogb2JqZWN0IGdpdmVuIGEgc3RyaW5nIHBhdGguXG4gKlxuICogICAgIHZhciBvYmogPSB7XG4gKiAgICAgICAgIHByb3AxOiB7XG4gKiAgICAgICAgICAgICBhcnI6IFsnYScsICdiJywgJ2MnXVxuICogICAgICAgICAgICwgc3RyOiAnSGVsbG8nXG4gKiAgICAgICAgIH1cbiAqICAgICAgICwgcHJvcDI6IHtcbiAqICAgICAgICAgICAgIGFycjogWyB7IG5lc3RlZDogJ1VuaXZlcnNlJyB9IF1cbiAqICAgICAgICAgICAsIHN0cjogJ0hlbGxvIGFnYWluISdcbiAqICAgICAgICAgfVxuICogICAgIH1cbiAqXG4gKiBUaGUgZm9sbG93aW5nIHdvdWxkIGJlIHRoZSByZXN1bHRzLlxuICpcbiAqICAgICBnZXRQYXRoVmFsdWUoJ3Byb3AxLnN0cicsIG9iaik7IC8vIEhlbGxvXG4gKiAgICAgZ2V0UGF0aFZhbHVlKCdwcm9wMS5hdHRbMl0nLCBvYmopOyAvLyBiXG4gKiAgICAgZ2V0UGF0aFZhbHVlKCdwcm9wMi5hcnJbMF0ubmVzdGVkJywgb2JqKTsgLy8gVW5pdmVyc2VcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybnMge09iamVjdH0gdmFsdWUgb3IgYHVuZGVmaW5lZGBcbiAqIEBuYW1lIGdldFBhdGhWYWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG52YXIgZ2V0UGF0aFZhbHVlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocGF0aCwgb2JqKSB7XG4gIHZhciBwYXJzZWQgPSBwYXJzZVBhdGgocGF0aCk7XG4gIHJldHVybiBfZ2V0UGF0aFZhbHVlKHBhcnNlZCwgb2JqKTtcbn07XG5cbi8qIVxuICogIyMgcGFyc2VQYXRoKHBhdGgpXG4gKlxuICogSGVscGVyIGZ1bmN0aW9uIHVzZWQgdG8gcGFyc2Ugc3RyaW5nIG9iamVjdFxuICogcGF0aHMuIFVzZSBpbiBjb25qdW5jdGlvbiB3aXRoIGBfZ2V0UGF0aFZhbHVlYC5cbiAqXG4gKiAgICAgIHZhciBwYXJzZWQgPSBwYXJzZVBhdGgoJ215b2JqZWN0LnByb3BlcnR5LnN1YnByb3AnKTtcbiAqXG4gKiAjIyMgUGF0aHM6XG4gKlxuICogKiBDYW4gYmUgYXMgbmVhciBpbmZpbml0ZWx5IGRlZXAgYW5kIG5lc3RlZFxuICogKiBBcnJheXMgYXJlIGFsc28gdmFsaWQgdXNpbmcgdGhlIGZvcm1hbCBgbXlvYmplY3QuZG9jdW1lbnRbM10ucHJvcGVydHlgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBwYXJzZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlUGF0aCAocGF0aCkge1xuICB2YXIgc3RyID0gcGF0aC5yZXBsYWNlKC9cXFsvZywgJy5bJylcbiAgICAsIHBhcnRzID0gc3RyLm1hdGNoKC8oXFxcXFxcLnxbXi5dKz8pKy9nKTtcbiAgcmV0dXJuIHBhcnRzLm1hcChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YXIgcmUgPSAvXFxbKFxcZCspXFxdJC9cbiAgICAgICwgbUFyciA9IHJlLmV4ZWModmFsdWUpXG4gICAgaWYgKG1BcnIpIHJldHVybiB7IGk6IHBhcnNlRmxvYXQobUFyclsxXSkgfTtcbiAgICBlbHNlIHJldHVybiB7IHA6IHZhbHVlIH07XG4gIH0pO1xufTtcblxuLyohXG4gKiAjIyBfZ2V0UGF0aFZhbHVlKHBhcnNlZCwgb2JqKVxuICpcbiAqIEhlbHBlciBjb21wYW5pb24gZnVuY3Rpb24gZm9yIGAucGFyc2VQYXRoYCB0aGF0IHJldHVybnNcbiAqIHRoZSB2YWx1ZSBsb2NhdGVkIGF0IHRoZSBwYXJzZWQgYWRkcmVzcy5cbiAqXG4gKiAgICAgIHZhciB2YWx1ZSA9IGdldFBhdGhWYWx1ZShwYXJzZWQsIG9iaik7XG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhcnNlZCBkZWZpbml0aW9uIGZyb20gYHBhcnNlUGF0aGAuXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IHRvIHNlYXJjaCBhZ2FpbnN0XG4gKiBAcmV0dXJucyB7T2JqZWN0fFVuZGVmaW5lZH0gdmFsdWVcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIF9nZXRQYXRoVmFsdWUgKHBhcnNlZCwgb2JqKSB7XG4gIHZhciB0bXAgPSBvYmpcbiAgICAsIHJlcztcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBwYXJzZWQubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdmFyIHBhcnQgPSBwYXJzZWRbaV07XG4gICAgaWYgKHRtcCkge1xuICAgICAgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgcGFydC5wKVxuICAgICAgICB0bXAgPSB0bXBbcGFydC5wXTtcbiAgICAgIGVsc2UgaWYgKCd1bmRlZmluZWQnICE9PSB0eXBlb2YgcGFydC5pKVxuICAgICAgICB0bXAgPSB0bXBbcGFydC5pXTtcbiAgICAgIGlmIChpID09IChsIC0gMSkpIHJlcyA9IHRtcDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufTtcbiIsIi8qIVxuICogQ2hhaSAtIGdldFByb3BlcnRpZXMgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qKlxuICogIyMjIC5nZXRQcm9wZXJ0aWVzKG9iamVjdClcbiAqXG4gKiBUaGlzIGFsbG93cyB0aGUgcmV0cmlldmFsIG9mIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdCwgZW51bWVyYWJsZSBvciBub3QsXG4gKiBpbmhlcml0ZWQgb3Igbm90LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqIEBuYW1lIGdldFByb3BlcnRpZXNcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRQcm9wZXJ0aWVzKG9iamVjdCkge1xuICB2YXIgcmVzdWx0ID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoc3ViamVjdCk7XG5cbiAgZnVuY3Rpb24gYWRkUHJvcGVydHkocHJvcGVydHkpIHtcbiAgICBpZiAocmVzdWx0LmluZGV4T2YocHJvcGVydHkpID09PSAtMSkge1xuICAgICAgcmVzdWx0LnB1c2gocHJvcGVydHkpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBwcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihzdWJqZWN0KTtcbiAgd2hpbGUgKHByb3RvICE9PSBudWxsKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocHJvdG8pLmZvckVhY2goYWRkUHJvcGVydHkpO1xuICAgIHByb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHByb3RvKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLyohXG4gKiBjaGFpXG4gKiBDb3B5cmlnaHQoYykgMjAxMSBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qIVxuICogTWFpbiBleHBvcnRzXG4gKi9cblxudmFyIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vKiFcbiAqIHRlc3QgdXRpbGl0eVxuICovXG5cbmV4cG9ydHMudGVzdCA9IHJlcXVpcmUoJy4vdGVzdCcpO1xuXG4vKiFcbiAqIHR5cGUgdXRpbGl0eVxuICovXG5cbmV4cG9ydHMudHlwZSA9IHJlcXVpcmUoJy4vdHlwZScpO1xuXG4vKiFcbiAqIG1lc3NhZ2UgdXRpbGl0eVxuICovXG5cbmV4cG9ydHMuZ2V0TWVzc2FnZSA9IHJlcXVpcmUoJy4vZ2V0TWVzc2FnZScpO1xuXG4vKiFcbiAqIGFjdHVhbCB1dGlsaXR5XG4gKi9cblxuZXhwb3J0cy5nZXRBY3R1YWwgPSByZXF1aXJlKCcuL2dldEFjdHVhbCcpO1xuXG4vKiFcbiAqIEluc3BlY3QgdXRpbFxuICovXG5cbmV4cG9ydHMuaW5zcGVjdCA9IHJlcXVpcmUoJy4vaW5zcGVjdCcpO1xuXG4vKiFcbiAqIE9iamVjdCBEaXNwbGF5IHV0aWxcbiAqL1xuXG5leHBvcnRzLm9iakRpc3BsYXkgPSByZXF1aXJlKCcuL29iakRpc3BsYXknKTtcblxuLyohXG4gKiBGbGFnIHV0aWxpdHlcbiAqL1xuXG5leHBvcnRzLmZsYWcgPSByZXF1aXJlKCcuL2ZsYWcnKTtcblxuLyohXG4gKiBGbGFnIHRyYW5zZmVycmluZyB1dGlsaXR5XG4gKi9cblxuZXhwb3J0cy50cmFuc2ZlckZsYWdzID0gcmVxdWlyZSgnLi90cmFuc2ZlckZsYWdzJyk7XG5cbi8qIVxuICogRGVlcCBlcXVhbCB1dGlsaXR5XG4gKi9cblxuZXhwb3J0cy5lcWwgPSByZXF1aXJlKCcuL2VxbCcpO1xuXG4vKiFcbiAqIERlZXAgcGF0aCB2YWx1ZVxuICovXG5cbmV4cG9ydHMuZ2V0UGF0aFZhbHVlID0gcmVxdWlyZSgnLi9nZXRQYXRoVmFsdWUnKTtcblxuLyohXG4gKiBGdW5jdGlvbiBuYW1lXG4gKi9cblxuZXhwb3J0cy5nZXROYW1lID0gcmVxdWlyZSgnLi9nZXROYW1lJyk7XG5cbi8qIVxuICogYWRkIFByb3BlcnR5XG4gKi9cblxuZXhwb3J0cy5hZGRQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vYWRkUHJvcGVydHknKTtcblxuLyohXG4gKiBhZGQgTWV0aG9kXG4gKi9cblxuZXhwb3J0cy5hZGRNZXRob2QgPSByZXF1aXJlKCcuL2FkZE1ldGhvZCcpO1xuXG4vKiFcbiAqIG92ZXJ3cml0ZSBQcm9wZXJ0eVxuICovXG5cbmV4cG9ydHMub3ZlcndyaXRlUHJvcGVydHkgPSByZXF1aXJlKCcuL292ZXJ3cml0ZVByb3BlcnR5Jyk7XG5cbi8qIVxuICogb3ZlcndyaXRlIE1ldGhvZFxuICovXG5cbmV4cG9ydHMub3ZlcndyaXRlTWV0aG9kID0gcmVxdWlyZSgnLi9vdmVyd3JpdGVNZXRob2QnKTtcblxuLyohXG4gKiBBZGQgYSBjaGFpbmFibGUgbWV0aG9kXG4gKi9cblxuZXhwb3J0cy5hZGRDaGFpbmFibGVNZXRob2QgPSByZXF1aXJlKCcuL2FkZENoYWluYWJsZU1ldGhvZCcpO1xuXG4iLCIvLyBUaGlzIGlzIChhbG1vc3QpIGRpcmVjdGx5IGZyb20gTm9kZS5qcyB1dGlsc1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2Jsb2IvZjhjMzM1ZDBjYWY0N2YxNmQzMTQxM2Y4OWFhMjhlZGEzODc4ZTNhYS9saWIvdXRpbC5qc1xuXG52YXIgZ2V0TmFtZSA9IHJlcXVpcmUoJy4vZ2V0TmFtZScpO1xudmFyIGdldFByb3BlcnRpZXMgPSByZXF1aXJlKCcuL2dldFByb3BlcnRpZXMnKTtcbnZhciBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyA9IHJlcXVpcmUoJy4vZ2V0RW51bWVyYWJsZVByb3BlcnRpZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnNwZWN0O1xuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHNob3dIaWRkZW4gRmxhZyB0aGF0IHNob3dzIGhpZGRlbiAobm90IGVudW1lcmFibGUpXG4gKiAgICBwcm9wZXJ0aWVzIG9mIG9iamVjdHMuXG4gKiBAcGFyYW0ge051bWJlcn0gZGVwdGggRGVwdGggaW4gd2hpY2ggdG8gZGVzY2VuZCBpbiBvYmplY3QuIERlZmF1bHQgaXMgMi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gY29sb3JzIEZsYWcgdG8gdHVybiBvbiBBTlNJIGVzY2FwZSBjb2RlcyB0byBjb2xvciB0aGVcbiAqICAgIG91dHB1dC4gRGVmYXVsdCBpcyBmYWxzZSAobm8gY29sb3JpbmcpLlxuICovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycykge1xuICB2YXIgY3R4ID0ge1xuICAgIHNob3dIaWRkZW46IHNob3dIaWRkZW4sXG4gICAgc2VlbjogW10sXG4gICAgc3R5bGl6ZTogZnVuY3Rpb24gKHN0cikgeyByZXR1cm4gc3RyOyB9XG4gIH07XG4gIHJldHVybiBmb3JtYXRWYWx1ZShjdHgsIG9iaiwgKHR5cGVvZiBkZXB0aCA9PT0gJ3VuZGVmaW5lZCcgPyAyIDogZGVwdGgpKTtcbn1cblxuLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vMTA0NDEyOC9cbnZhciBnZXRPdXRlckhUTUwgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gIGlmICgnb3V0ZXJIVE1MJyBpbiBlbGVtZW50KSByZXR1cm4gZWxlbWVudC5vdXRlckhUTUw7XG4gIHZhciBucyA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKG5zLCAnXycpO1xuICB2YXIgZWxlbVByb3RvID0gKHdpbmRvdy5IVE1MRWxlbWVudCB8fCB3aW5kb3cuRWxlbWVudCkucHJvdG90eXBlO1xuICB2YXIgeG1sU2VyaWFsaXplciA9IG5ldyBYTUxTZXJpYWxpemVyKCk7XG4gIHZhciBodG1sO1xuICBpZiAoZG9jdW1lbnQueG1sVmVyc2lvbikge1xuICAgIHJldHVybiB4bWxTZXJpYWxpemVyLnNlcmlhbGl6ZVRvU3RyaW5nKGVsZW1lbnQpO1xuICB9IGVsc2Uge1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChlbGVtZW50LmNsb25lTm9kZShmYWxzZSkpO1xuICAgIGh0bWwgPSBjb250YWluZXIuaW5uZXJIVE1MLnJlcGxhY2UoJz48JywgJz4nICsgZWxlbWVudC5pbm5lckhUTUwgKyAnPCcpO1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxufTtcblxuLy8gUmV0dXJucyB0cnVlIGlmIG9iamVjdCBpcyBhIERPTSBlbGVtZW50LlxudmFyIGlzRE9NRWxlbWVudCA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgaWYgKHR5cGVvZiBIVE1MRWxlbWVudCA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iamVjdCAmJlxuICAgICAgdHlwZW9mIG9iamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIG9iamVjdC5ub2RlVHlwZSA9PT0gMSAmJlxuICAgICAgdHlwZW9mIG9iamVjdC5ub2RlTmFtZSA9PT0gJ3N0cmluZyc7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlLmluc3BlY3QgPT09ICdmdW5jdGlvbicgJiZcbiAgICAgIC8vIEZpbHRlciBvdXQgdGhlIHV0aWwgbW9kdWxlLCBpdCdzIGluc3BlY3QgZnVuY3Rpb24gaXMgc3BlY2lhbFxuICAgICAgdmFsdWUuaW5zcGVjdCAhPT0gZXhwb3J0cy5pbnNwZWN0ICYmXG4gICAgICAvLyBBbHNvIGZpbHRlciBvdXQgYW55IHByb3RvdHlwZSBvYmplY3RzIHVzaW5nIHRoZSBjaXJjdWxhciBjaGVjay5cbiAgICAgICEodmFsdWUuY29uc3RydWN0b3IgJiYgdmFsdWUuY29uc3RydWN0b3IucHJvdG90eXBlID09PSB2YWx1ZSkpIHtcbiAgICB2YXIgcmV0ID0gdmFsdWUuaW5zcGVjdChyZWN1cnNlVGltZXMpO1xuICAgIGlmICh0eXBlb2YgcmV0ICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIElmIGl0J3MgRE9NIGVsZW0sIGdldCBvdXRlciBIVE1MLlxuICBpZiAoaXNET01FbGVtZW50KHZhbHVlKSkge1xuICAgIHJldHVybiBnZXRPdXRlckhUTUwodmFsdWUpO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIgdmlzaWJsZUtleXMgPSBnZXRFbnVtZXJhYmxlUHJvcGVydGllcyh2YWx1ZSk7XG4gIHZhciBrZXlzID0gY3R4LnNob3dIaWRkZW4gPyBnZXRQcm9wZXJ0aWVzKHZhbHVlKSA6IHZpc2libGVLZXlzO1xuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgLy8gSW4gSUUsIGVycm9ycyBoYXZlIGEgc2luZ2xlIGBzdGFja2AgcHJvcGVydHksIG9yIGlmIHRoZXkgYXJlIHZhbmlsbGEgYEVycm9yYCxcbiAgLy8gYSBgc3RhY2tgIHBsdXMgYGRlc2NyaXB0aW9uYCBwcm9wZXJ0eTsgaWdub3JlIHRob3NlIGZvciBjb25zaXN0ZW5jeS5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwIHx8IChpc0Vycm9yKHZhbHVlKSAmJiAoXG4gICAgICAoa2V5cy5sZW5ndGggPT09IDEgJiYga2V5c1swXSA9PT0gJ3N0YWNrJykgfHxcbiAgICAgIChrZXlzLmxlbmd0aCA9PT0gMiAmJiBrZXlzWzBdID09PSAnZGVzY3JpcHRpb24nICYmIGtleXNbMV0gPT09ICdzdGFjaycpXG4gICAgICkpKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdmFyIG5hbWUgPSBnZXROYW1lKHZhbHVlKTtcbiAgICAgIHZhciBuYW1lU3VmZml4ID0gbmFtZSA/ICc6ICcgKyBuYW1lIDogJyc7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tGdW5jdGlvbicgKyBuYW1lU3VmZml4ICsgJ10nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH1cbiAgICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpLCAnZGF0ZScpO1xuICAgIH1cbiAgICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJhc2UgPSAnJywgYXJyYXkgPSBmYWxzZSwgYnJhY2VzID0gWyd7JywgJ30nXTtcblxuICAvLyBNYWtlIEFycmF5IHNheSB0aGF0IHRoZXkgYXJlIEFycmF5XG4gIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgIGFycmF5ID0gdHJ1ZTtcbiAgICBicmFjZXMgPSBbJ1snLCAnXSddO1xuICB9XG5cbiAgLy8gTWFrZSBmdW5jdGlvbnMgc2F5IHRoYXQgdGhleSBhcmUgZnVuY3Rpb25zXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2YXIgbmFtZSA9IGdldE5hbWUodmFsdWUpO1xuICAgIHZhciBuYW1lU3VmZml4ID0gbmFtZSA/ICc6ICcgKyBuYW1lIDogJyc7XG4gICAgYmFzZSA9ICcgW0Z1bmN0aW9uJyArIG5hbWVTdWZmaXggKyAnXSc7XG4gIH1cblxuICAvLyBNYWtlIFJlZ0V4cHMgc2F5IHRoYXQgdGhleSBhcmUgUmVnRXhwc1xuICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGRhdGVzIHdpdGggcHJvcGVydGllcyBmaXJzdCBzYXkgdGhlIGRhdGVcbiAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgRGF0ZS5wcm90b3R5cGUudG9VVENTdHJpbmcuY2FsbCh2YWx1ZSk7XG4gIH1cblxuICAvLyBNYWtlIGVycm9yIHdpdGggbWVzc2FnZSBmaXJzdCBzYXkgdGhlIGVycm9yXG4gIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgIHJldHVybiBmb3JtYXRFcnJvcih2YWx1ZSk7XG4gIH1cblxuICBpZiAoa2V5cy5sZW5ndGggPT09IDAgJiYgKCFhcnJheSB8fCB2YWx1ZS5sZW5ndGggPT0gMCkpIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICsgYmFzZSArIGJyYWNlc1sxXTtcbiAgfVxuXG4gIGlmIChyZWN1cnNlVGltZXMgPCAwKSB7XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbT2JqZWN0XScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG5cbiAgY3R4LnNlZW4ucHVzaCh2YWx1ZSk7XG5cbiAgdmFyIG91dHB1dDtcbiAgaWYgKGFycmF5KSB7XG4gICAgb3V0cHV0ID0gZm9ybWF0QXJyYXkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5cyk7XG4gIH0gZWxzZSB7XG4gICAgb3V0cHV0ID0ga2V5cy5tYXAoZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSk7XG4gICAgfSk7XG4gIH1cblxuICBjdHguc2Vlbi5wb3AoKTtcblxuICByZXR1cm4gcmVkdWNlVG9TaW5nbGVTdHJpbmcob3V0cHV0LCBiYXNlLCBicmFjZXMpO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByaW1pdGl2ZShjdHgsIHZhbHVlKSB7XG4gIHN3aXRjaCAodHlwZW9mIHZhbHVlKSB7XG4gICAgY2FzZSAndW5kZWZpbmVkJzpcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuXG4gICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJykgKyAnXFwnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcblxuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ251bWJlcicpO1xuXG4gICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJycgKyB2YWx1ZSwgJ2Jvb2xlYW4nKTtcbiAgfVxuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0cjtcbiAgaWYgKHZhbHVlLl9fbG9va3VwR2V0dGVyX18pIHtcbiAgICBpZiAodmFsdWUuX19sb29rdXBHZXR0ZXJfXyhrZXkpKSB7XG4gICAgICBpZiAodmFsdWUuX19sb29rdXBTZXR0ZXJfXyhrZXkpKSB7XG4gICAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyL1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZhbHVlLl9fbG9va3VwU2V0dGVyX18oa2V5KSkge1xuICAgICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW1NldHRlcl0nLCAnc3BlY2lhbCcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAodmlzaWJsZUtleXMuaW5kZXhPZihrZXkpIDwgMCkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZih2YWx1ZVtrZXldKSA8IDApIHtcbiAgICAgIGlmIChyZWN1cnNlVGltZXMgPT09IG51bGwpIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCB2YWx1ZVtrZXldLCBudWxsKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0ciA9IGZvcm1hdFZhbHVlKGN0eCwgdmFsdWVba2V5XSwgcmVjdXJzZVRpbWVzIC0gMSk7XG4gICAgICB9XG4gICAgICBpZiAoc3RyLmluZGV4T2YoJ1xcbicpID4gLTEpIHtcbiAgICAgICAgaWYgKGFycmF5KSB7XG4gICAgICAgICAgc3RyID0gc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICcgKyBsaW5lO1xuICAgICAgICAgIH0pLmpvaW4oJ1xcbicpLnN1YnN0cigyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHIgPSAnXFxuJyArIHN0ci5zcGxpdCgnXFxuJykubWFwKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIHJldHVybiAnICAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tDaXJjdWxhcl0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuICBpZiAodHlwZW9mIG5hbWUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKGFycmF5ICYmIGtleS5tYXRjaCgvXlxcZCskLykpIHtcbiAgICAgIHJldHVybiBzdHI7XG4gICAgfVxuICAgIG5hbWUgPSBKU09OLnN0cmluZ2lmeSgnJyArIGtleSk7XG4gICAgaWYgKG5hbWUubWF0Y2goL15cIihbYS16QS1aX11bYS16QS1aXzAtOV0qKVwiJC8pKSB7XG4gICAgICBuYW1lID0gbmFtZS5zdWJzdHIoMSwgbmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnbmFtZScpO1xuICAgIH0gZWxzZSB7XG4gICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIilcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKVxuICAgICAgICAgICAgICAgICAucmVwbGFjZSgvKF5cInxcIiQpL2csIFwiJ1wiKTtcbiAgICAgIG5hbWUgPSBjdHguc3R5bGl6ZShuYW1lLCAnc3RyaW5nJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWUgKyAnOiAnICsgc3RyO1xufVxuXG5cbmZ1bmN0aW9uIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKSB7XG4gIHZhciBudW1MaW5lc0VzdCA9IDA7XG4gIHZhciBsZW5ndGggPSBvdXRwdXQucmVkdWNlKGZ1bmN0aW9uKHByZXYsIGN1cikge1xuICAgIG51bUxpbmVzRXN0Kys7XG4gICAgaWYgKGN1ci5pbmRleE9mKCdcXG4nKSA+PSAwKSBudW1MaW5lc0VzdCsrO1xuICAgIHJldHVybiBwcmV2ICsgY3VyLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcikgfHxcbiAgICAgICAgICh0eXBlb2YgYXIgPT09ICdvYmplY3QnICYmIG9iamVjdFRvU3RyaW5nKGFyKSA9PT0gJ1tvYmplY3QgQXJyYXldJyk7XG59XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiB0eXBlb2YgcmUgPT09ICdvYmplY3QnICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiB0eXBlb2YgZCA9PT0gJ29iamVjdCcgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcihlKSB7XG4gIHJldHVybiB0eXBlb2YgZSA9PT0gJ29iamVjdCcgJiYgb2JqZWN0VG9TdHJpbmcoZSkgPT09ICdbb2JqZWN0IEVycm9yXSc7XG59XG5cbmZ1bmN0aW9uIG9iamVjdFRvU3RyaW5nKG8pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKTtcbn1cbiIsIi8qIVxuICogQ2hhaSAtIGZsYWcgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qIVxuICogTW9kdWxlIGRlcGVuZGFuY2llc1xuICovXG5cbnZhciBpbnNwZWN0ID0gcmVxdWlyZSgnLi9pbnNwZWN0Jyk7XG5cbi8qKlxuICogIyMjIC5vYmpEaXNwbGF5IChvYmplY3QpXG4gKlxuICogRGV0ZXJtaW5lcyBpZiBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgbWF0Y2hlc1xuICogY3JpdGVyaWEgdG8gYmUgaW5zcGVjdGVkIGluLWxpbmUgZm9yIGVycm9yXG4gKiBtZXNzYWdlcyBvciBzaG91bGQgYmUgdHJ1bmNhdGVkLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IGphdmFzY3JpcHQgb2JqZWN0IHRvIGluc3BlY3RcbiAqIEBuYW1lIG9iakRpc3BsYXlcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBzdHIgPSBpbnNwZWN0KG9iailcbiAgICAsIHR5cGUgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKTtcblxuICBpZiAoc3RyLmxlbmd0aCA+PSA0MCkge1xuICAgIGlmICh0eXBlID09PSAnW29iamVjdCBGdW5jdGlvbl0nKSB7XG4gICAgICByZXR1cm4gIW9iai5uYW1lIHx8IG9iai5uYW1lID09PSAnJ1xuICAgICAgICA/ICdbRnVuY3Rpb25dJ1xuICAgICAgICA6ICdbRnVuY3Rpb246ICcgKyBvYmoubmFtZSArICddJztcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgIHJldHVybiAnWyBBcnJheSgnICsgb2JqLmxlbmd0aCArICcpIF0nO1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqKVxuICAgICAgICAsIGtzdHIgPSBrZXlzLmxlbmd0aCA+IDJcbiAgICAgICAgICA/IGtleXMuc3BsaWNlKDAsIDIpLmpvaW4oJywgJykgKyAnLCAuLi4nXG4gICAgICAgICAgOiBrZXlzLmpvaW4oJywgJyk7XG4gICAgICByZXR1cm4gJ3sgT2JqZWN0ICgnICsga3N0ciArICcpIH0nO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gc3RyO1xuICB9XG59O1xuIiwiLyohXG4gKiBDaGFpIC0gb3ZlcndyaXRlTWV0aG9kIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyBvdmVyd3JpdGVNZXRob2QgKGN0eCwgbmFtZSwgZm4pXG4gKlxuICogT3ZlcndpdGVzIGFuIGFscmVhZHkgZXhpc3RpbmcgbWV0aG9kIGFuZCBwcm92aWRlc1xuICogYWNjZXNzIHRvIHByZXZpb3VzIGZ1bmN0aW9uLiBNdXN0IHJldHVybiBmdW5jdGlvblxuICogdG8gYmUgdXNlZCBmb3IgbmFtZS5cbiAqXG4gKiAgICAgdXRpbHMub3ZlcndyaXRlTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgJ2VxdWFsJywgZnVuY3Rpb24gKF9zdXBlcikge1xuICogICAgICAgcmV0dXJuIGZ1bmN0aW9uIChzdHIpIHtcbiAqICAgICAgICAgdmFyIG9iaiA9IHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcpO1xuICogICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRm9vKSB7XG4gKiAgICAgICAgICAgbmV3IGNoYWkuQXNzZXJ0aW9uKG9iai52YWx1ZSkudG8uZXF1YWwoc3RyKTtcbiAqICAgICAgICAgfSBlbHNlIHtcbiAqICAgICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAqICAgICAgICAgfVxuICogICAgICAgfVxuICogICAgIH0pO1xuICpcbiAqIENhbiBhbHNvIGJlIGFjY2Vzc2VkIGRpcmVjdGx5IGZyb20gYGNoYWkuQXNzZXJ0aW9uYC5cbiAqXG4gKiAgICAgY2hhaS5Bc3NlcnRpb24ub3ZlcndyaXRlTWV0aG9kKCdmb28nLCBmbik7XG4gKlxuICogVGhlbiBjYW4gYmUgdXNlZCBhcyBhbnkgb3RoZXIgYXNzZXJ0aW9uLlxuICpcbiAqICAgICBleHBlY3QobXlGb28pLnRvLmVxdWFsKCdiYXInKTtcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4IG9iamVjdCB3aG9zZSBtZXRob2QgaXMgdG8gYmUgb3ZlcndyaXR0ZW5cbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIG9mIG1ldGhvZCB0byBvdmVyd3JpdGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBmdW5jdGlvbiB0byBiZSB1c2VkIGZvciBuYW1lXG4gKiBAbmFtZSBvdmVyd3JpdGVNZXRob2RcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY3R4LCBuYW1lLCBtZXRob2QpIHtcbiAgdmFyIF9tZXRob2QgPSBjdHhbbmFtZV1cbiAgICAsIF9zdXBlciA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH07XG5cbiAgaWYgKF9tZXRob2QgJiYgJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIF9tZXRob2QpXG4gICAgX3N1cGVyID0gX21ldGhvZDtcblxuICBjdHhbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc3VsdCA9IG1ldGhvZChfc3VwZXIpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHJlc3VsdCA9PT0gdW5kZWZpbmVkID8gdGhpcyA6IHJlc3VsdDtcbiAgfVxufTtcbiIsIi8qIVxuICogQ2hhaSAtIG92ZXJ3cml0ZVByb3BlcnR5IHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyBvdmVyd3JpdGVQcm9wZXJ0eSAoY3R4LCBuYW1lLCBmbilcbiAqXG4gKiBPdmVyd2l0ZXMgYW4gYWxyZWFkeSBleGlzdGluZyBwcm9wZXJ0eSBnZXR0ZXIgYW5kIHByb3ZpZGVzXG4gKiBhY2Nlc3MgdG8gcHJldmlvdXMgdmFsdWUuIE11c3QgcmV0dXJuIGZ1bmN0aW9uIHRvIHVzZSBhcyBnZXR0ZXIuXG4gKlxuICogICAgIHV0aWxzLm92ZXJ3cml0ZVByb3BlcnR5KGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgJ29rJywgZnVuY3Rpb24gKF9zdXBlcikge1xuICogICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAqICAgICAgICAgdmFyIG9iaiA9IHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcpO1xuICogICAgICAgICBpZiAob2JqIGluc3RhbmNlb2YgRm9vKSB7XG4gKiAgICAgICAgICAgbmV3IGNoYWkuQXNzZXJ0aW9uKG9iai5uYW1lKS50by5lcXVhbCgnYmFyJyk7XG4gKiAgICAgICAgIH0gZWxzZSB7XG4gKiAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcyk7XG4gKiAgICAgICAgIH1cbiAqICAgICAgIH1cbiAqICAgICB9KTtcbiAqXG4gKlxuICogQ2FuIGFsc28gYmUgYWNjZXNzZWQgZGlyZWN0bHkgZnJvbSBgY2hhaS5Bc3NlcnRpb25gLlxuICpcbiAqICAgICBjaGFpLkFzc2VydGlvbi5vdmVyd3JpdGVQcm9wZXJ0eSgnZm9vJywgZm4pO1xuICpcbiAqIFRoZW4gY2FuIGJlIHVzZWQgYXMgYW55IG90aGVyIGFzc2VydGlvbi5cbiAqXG4gKiAgICAgZXhwZWN0KG15Rm9vKS50by5iZS5vaztcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4IG9iamVjdCB3aG9zZSBwcm9wZXJ0eSBpcyB0byBiZSBvdmVyd3JpdHRlblxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgb2YgcHJvcGVydHkgdG8gb3ZlcndyaXRlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBnZXR0ZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgZ2V0dGVyIGZ1bmN0aW9uIHRvIGJlIHVzZWQgZm9yIG5hbWVcbiAqIEBuYW1lIG92ZXJ3cml0ZVByb3BlcnR5XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGN0eCwgbmFtZSwgZ2V0dGVyKSB7XG4gIHZhciBfZ2V0ID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihjdHgsIG5hbWUpXG4gICAgLCBfc3VwZXIgPSBmdW5jdGlvbiAoKSB7fTtcblxuICBpZiAoX2dldCAmJiAnZnVuY3Rpb24nID09PSB0eXBlb2YgX2dldC5nZXQpXG4gICAgX3N1cGVyID0gX2dldC5nZXRcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3R4LCBuYW1lLFxuICAgIHsgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBnZXR0ZXIoX3N1cGVyKS5jYWxsKHRoaXMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyB0aGlzIDogcmVzdWx0O1xuICAgICAgfVxuICAgICwgY29uZmlndXJhYmxlOiB0cnVlXG4gIH0pO1xufTtcbiIsIi8qIVxuICogQ2hhaSAtIHRlc3QgdXRpbGl0eVxuICogQ29weXJpZ2h0KGMpIDIwMTItMjAxMyBKYWtlIEx1ZXIgPGpha2VAYWxvZ2ljYWxwYXJhZG94LmNvbT5cbiAqIE1JVCBMaWNlbnNlZFxuICovXG5cbi8qIVxuICogTW9kdWxlIGRlcGVuZGFuY2llc1xuICovXG5cbnZhciBmbGFnID0gcmVxdWlyZSgnLi9mbGFnJyk7XG5cbi8qKlxuICogIyB0ZXN0KG9iamVjdCwgZXhwcmVzc2lvbilcbiAqXG4gKiBUZXN0IGFuZCBvYmplY3QgZm9yIGV4cHJlc3Npb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdCAoY29uc3RydWN0ZWQgQXNzZXJ0aW9uKVxuICogQHBhcmFtIHtBcmd1bWVudHN9IGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZS5hc3NlcnQgYXJndW1lbnRzXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqLCBhcmdzKSB7XG4gIHZhciBuZWdhdGUgPSBmbGFnKG9iaiwgJ25lZ2F0ZScpXG4gICAgLCBleHByID0gYXJnc1swXTtcbiAgcmV0dXJuIG5lZ2F0ZSA/ICFleHByIDogZXhwcjtcbn07XG4iLCIvKiFcbiAqIENoYWkgLSB0cmFuc2ZlckZsYWdzIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKipcbiAqICMjIyB0cmFuc2ZlckZsYWdzKGFzc2VydGlvbiwgb2JqZWN0LCBpbmNsdWRlQWxsID0gdHJ1ZSlcbiAqXG4gKiBUcmFuc2ZlciBhbGwgdGhlIGZsYWdzIGZvciBgYXNzZXJ0aW9uYCB0byBgb2JqZWN0YC4gSWZcbiAqIGBpbmNsdWRlQWxsYCBpcyBzZXQgdG8gYGZhbHNlYCwgdGhlbiB0aGUgYmFzZSBDaGFpXG4gKiBhc3NlcnRpb24gZmxhZ3MgKG5hbWVseSBgb2JqZWN0YCwgYHNzZmlgLCBhbmQgYG1lc3NhZ2VgKVxuICogd2lsbCBub3QgYmUgdHJhbnNmZXJyZWQuXG4gKlxuICpcbiAqICAgICB2YXIgbmV3QXNzZXJ0aW9uID0gbmV3IEFzc2VydGlvbigpO1xuICogICAgIHV0aWxzLnRyYW5zZmVyRmxhZ3MoYXNzZXJ0aW9uLCBuZXdBc3NlcnRpb24pO1xuICpcbiAqICAgICB2YXIgYW5vdGhlckFzc2VyaXRvbiA9IG5ldyBBc3NlcnRpb24obXlPYmopO1xuICogICAgIHV0aWxzLnRyYW5zZmVyRmxhZ3MoYXNzZXJ0aW9uLCBhbm90aGVyQXNzZXJ0aW9uLCBmYWxzZSk7XG4gKlxuICogQHBhcmFtIHtBc3NlcnRpb259IGFzc2VydGlvbiB0aGUgYXNzZXJ0aW9uIHRvIHRyYW5zZmVyIHRoZSBmbGFncyBmcm9tXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0IHRoZSBvYmplY3QgdG8gdHJhbnNmZXIgdGhlIGZsYWdzIHRvbzsgdXN1YWxseSBhIG5ldyBhc3NlcnRpb25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaW5jbHVkZUFsbFxuICogQG5hbWUgZ2V0QWxsRmxhZ3NcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFzc2VydGlvbiwgb2JqZWN0LCBpbmNsdWRlQWxsKSB7XG4gIHZhciBmbGFncyA9IGFzc2VydGlvbi5fX2ZsYWdzIHx8IChhc3NlcnRpb24uX19mbGFncyA9IE9iamVjdC5jcmVhdGUobnVsbCkpO1xuXG4gIGlmICghb2JqZWN0Ll9fZmxhZ3MpIHtcbiAgICBvYmplY3QuX19mbGFncyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIH1cblxuICBpbmNsdWRlQWxsID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMyA/IGluY2x1ZGVBbGwgOiB0cnVlO1xuXG4gIGZvciAodmFyIGZsYWcgaW4gZmxhZ3MpIHtcbiAgICBpZiAoaW5jbHVkZUFsbCB8fFxuICAgICAgICAoZmxhZyAhPT0gJ29iamVjdCcgJiYgZmxhZyAhPT0gJ3NzZmknICYmIGZsYWcgIT0gJ21lc3NhZ2UnKSkge1xuICAgICAgb2JqZWN0Ll9fZmxhZ3NbZmxhZ10gPSBmbGFnc1tmbGFnXTtcbiAgICB9XG4gIH1cbn07XG4iLCIvKiFcbiAqIENoYWkgLSB0eXBlIHV0aWxpdHlcbiAqIENvcHlyaWdodChjKSAyMDEyLTIwMTMgSmFrZSBMdWVyIDxqYWtlQGFsb2dpY2FscGFyYWRveC5jb20+XG4gKiBNSVQgTGljZW5zZWRcbiAqL1xuXG4vKiFcbiAqIERldGVjdGFibGUgamF2YXNjcmlwdCBuYXRpdmVzXG4gKi9cblxudmFyIG5hdGl2ZXMgPSB7XG4gICAgJ1tvYmplY3QgQXJndW1lbnRzXSc6ICdhcmd1bWVudHMnXG4gICwgJ1tvYmplY3QgQXJyYXldJzogJ2FycmF5J1xuICAsICdbb2JqZWN0IERhdGVdJzogJ2RhdGUnXG4gICwgJ1tvYmplY3QgRnVuY3Rpb25dJzogJ2Z1bmN0aW9uJ1xuICAsICdbb2JqZWN0IE51bWJlcl0nOiAnbnVtYmVyJ1xuICAsICdbb2JqZWN0IFJlZ0V4cF0nOiAncmVnZXhwJ1xuICAsICdbb2JqZWN0IFN0cmluZ10nOiAnc3RyaW5nJ1xufTtcblxuLyoqXG4gKiAjIyMgdHlwZShvYmplY3QpXG4gKlxuICogQmV0dGVyIGltcGxlbWVudGF0aW9uIG9mIGB0eXBlb2ZgIGRldGVjdGlvbiB0aGF0IGNhblxuICogYmUgdXNlZCBjcm9zcy1icm93c2VyLiBIYW5kbGVzIHRoZSBpbmNvbnNpc3RlbmNpZXMgb2ZcbiAqIEFycmF5LCBgbnVsbGAsIGFuZCBgdW5kZWZpbmVkYCBkZXRlY3Rpb24uXG4gKlxuICogICAgIHV0aWxzLnR5cGUoe30pIC8vICdvYmplY3QnXG4gKiAgICAgdXRpbHMudHlwZShudWxsKSAvLyBgbnVsbCdcbiAqICAgICB1dGlscy50eXBlKHVuZGVmaW5lZCkgLy8gYHVuZGVmaW5lZGBcbiAqICAgICB1dGlscy50eXBlKFtdKSAvLyBgYXJyYXlgXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0IHRvIGRldGVjdCB0eXBlIG9mXG4gKiBAbmFtZSB0eXBlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xuICBpZiAobmF0aXZlc1tzdHJdKSByZXR1cm4gbmF0aXZlc1tzdHJdO1xuICBpZiAob2JqID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAob2JqID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKG9iaiA9PT0gT2JqZWN0KG9iaikpIHJldHVybiAnb2JqZWN0JztcbiAgcmV0dXJuIHR5cGVvZiBvYmo7XG59O1xuIiwiLyohXG4gKiBhc3NlcnRpb24tZXJyb3JcbiAqIENvcHlyaWdodChjKSAyMDEzIEpha2UgTHVlciA8amFrZUBxdWFsaWFuY3kuY29tPlxuICogTUlUIExpY2Vuc2VkXG4gKi9cblxuLyohXG4gKiBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IHdpbGwgY29weSBwcm9wZXJ0aWVzIGZyb21cbiAqIG9uZSBvYmplY3QgdG8gYW5vdGhlciBleGNsdWRpbmcgYW55IG9yaWdpbmFsbHlcbiAqIGxpc3RlZC4gUmV0dXJuZWQgZnVuY3Rpb24gd2lsbCBjcmVhdGUgYSBuZXcgYHt9YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhjbHVkZWQgcHJvcGVydGllcyAuLi5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5cbmZ1bmN0aW9uIGV4Y2x1ZGUgKCkge1xuICB2YXIgZXhjbHVkZXMgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cbiAgZnVuY3Rpb24gZXhjbHVkZVByb3BzIChyZXMsIG9iaikge1xuICAgIE9iamVjdC5rZXlzKG9iaikuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBpZiAoIX5leGNsdWRlcy5pbmRleE9mKGtleSkpIHJlc1trZXldID0gb2JqW2tleV07XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZXh0ZW5kRXhjbHVkZSAoKSB7XG4gICAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cylcbiAgICAgICwgaSA9IDBcbiAgICAgICwgcmVzID0ge307XG5cbiAgICBmb3IgKDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGV4Y2x1ZGVQcm9wcyhyZXMsIGFyZ3NbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXM7XG4gIH07XG59O1xuXG4vKiFcbiAqIFByaW1hcnkgRXhwb3J0c1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gQXNzZXJ0aW9uRXJyb3I7XG5cbi8qKlxuICogIyMjIEFzc2VydGlvbkVycm9yXG4gKlxuICogQW4gZXh0ZW5zaW9uIG9mIHRoZSBKYXZhU2NyaXB0IGBFcnJvcmAgY29uc3RydWN0b3IgZm9yXG4gKiBhc3NlcnRpb24gYW5kIHZhbGlkYXRpb24gc2NlbmFyaW9zLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllcyB0byBpbmNsdWRlIChvcHRpb25hbClcbiAqIEBwYXJhbSB7Y2FsbGVlfSBzdGFydCBzdGFjayBmdW5jdGlvbiAob3B0aW9uYWwpXG4gKi9cblxuZnVuY3Rpb24gQXNzZXJ0aW9uRXJyb3IgKG1lc3NhZ2UsIF9wcm9wcywgc3NmKSB7XG4gIHZhciBleHRlbmQgPSBleGNsdWRlKCduYW1lJywgJ21lc3NhZ2UnLCAnc3RhY2snLCAnY29uc3RydWN0b3InLCAndG9KU09OJylcbiAgICAsIHByb3BzID0gZXh0ZW5kKF9wcm9wcyB8fCB7fSk7XG5cbiAgLy8gZGVmYXVsdCB2YWx1ZXNcbiAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZSB8fCAnVW5zcGVjaWZpZWQgQXNzZXJ0aW9uRXJyb3InO1xuICB0aGlzLnNob3dEaWZmID0gZmFsc2U7XG5cbiAgLy8gY29weSBmcm9tIHByb3BlcnRpZXNcbiAgZm9yICh2YXIga2V5IGluIHByb3BzKSB7XG4gICAgdGhpc1trZXldID0gcHJvcHNba2V5XTtcbiAgfVxuXG4gIC8vIGNhcHR1cmUgc3RhY2sgdHJhY2VcbiAgc3NmID0gc3NmIHx8IGFyZ3VtZW50cy5jYWxsZWU7XG4gIGlmIChzc2YgJiYgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzc2YpO1xuICB9XG59XG5cbi8qIVxuICogSW5oZXJpdCBmcm9tIEVycm9yLnByb3RvdHlwZVxuICovXG5cbkFzc2VydGlvbkVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcblxuLyohXG4gKiBTdGF0aWNhbGx5IHNldCBuYW1lXG4gKi9cblxuQXNzZXJ0aW9uRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnQXNzZXJ0aW9uRXJyb3InO1xuXG4vKiFcbiAqIEVuc3VyZSBjb3JyZWN0IGNvbnN0cnVjdG9yXG4gKi9cblxuQXNzZXJ0aW9uRXJyb3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQXNzZXJ0aW9uRXJyb3I7XG5cbi8qKlxuICogQWxsb3cgZXJyb3JzIHRvIGJlIGNvbnZlcnRlZCB0byBKU09OIGZvciBzdGF0aWMgdHJhbnNmZXIuXG4gKlxuICogQHBhcmFtIHtCb29sZWFufSBpbmNsdWRlIHN0YWNrIChkZWZhdWx0OiBgdHJ1ZWApXG4gKiBAcmV0dXJuIHtPYmplY3R9IG9iamVjdCB0aGF0IGNhbiBiZSBgSlNPTi5zdHJpbmdpZnlgXG4gKi9cblxuQXNzZXJ0aW9uRXJyb3IucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIChzdGFjaykge1xuICB2YXIgZXh0ZW5kID0gZXhjbHVkZSgnY29uc3RydWN0b3InLCAndG9KU09OJywgJ3N0YWNrJylcbiAgICAsIHByb3BzID0gZXh0ZW5kKHsgbmFtZTogdGhpcy5uYW1lIH0sIHRoaXMpO1xuXG4gIC8vIGluY2x1ZGUgc3RhY2sgaWYgZXhpc3RzIGFuZCBub3QgdHVybmVkIG9mZlxuICBpZiAoZmFsc2UgIT09IHN0YWNrICYmIHRoaXMuc3RhY2spIHtcbiAgICBwcm9wcy5zdGFjayA9IHRoaXMuc3RhY2s7XG4gIH1cblxuICByZXR1cm4gcHJvcHM7XG59O1xuIiwiXG5cbi8vXG4vLyBUaGUgc2hpbXMgaW4gdGhpcyBmaWxlIGFyZSBub3QgZnVsbHkgaW1wbGVtZW50ZWQgc2hpbXMgZm9yIHRoZSBFUzVcbi8vIGZlYXR1cmVzLCBidXQgZG8gd29yayBmb3IgdGhlIHBhcnRpY3VsYXIgdXNlY2FzZXMgdGhlcmUgaXMgaW5cbi8vIHRoZSBvdGhlciBtb2R1bGVzLlxuLy9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIEFycmF5LmlzQXJyYXkgaXMgc3VwcG9ydGVkIGluIElFOVxuZnVuY3Rpb24gaXNBcnJheSh4cykge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59XG5leHBvcnRzLmlzQXJyYXkgPSB0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJyA/IEFycmF5LmlzQXJyYXkgOiBpc0FycmF5O1xuXG4vLyBBcnJheS5wcm90b3R5cGUuaW5kZXhPZiBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mKHhzLCB4KSB7XG4gIGlmICh4cy5pbmRleE9mKSByZXR1cm4geHMuaW5kZXhPZih4KTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIGlmICh4ID09PSB4c1tpXSkgcmV0dXJuIGk7XG4gIH1cbiAgcmV0dXJuIC0xO1xufTtcblxuLy8gQXJyYXkucHJvdG90eXBlLmZpbHRlciBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5leHBvcnRzLmZpbHRlciA9IGZ1bmN0aW9uIGZpbHRlcih4cywgZm4pIHtcbiAgaWYgKHhzLmZpbHRlcikgcmV0dXJuIHhzLmZpbHRlcihmbik7XG4gIHZhciByZXMgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChmbih4c1tpXSwgaSwgeHMpKSByZXMucHVzaCh4c1tpXSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5mb3JFYWNoIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuZm9yRWFjaCA9IGZ1bmN0aW9uIGZvckVhY2goeHMsIGZuLCBzZWxmKSB7XG4gIGlmICh4cy5mb3JFYWNoKSByZXR1cm4geHMuZm9yRWFjaChmbiwgc2VsZik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBmbi5jYWxsKHNlbGYsIHhzW2ldLCBpLCB4cyk7XG4gIH1cbn07XG5cbi8vIEFycmF5LnByb3RvdHlwZS5tYXAgaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy5tYXAgPSBmdW5jdGlvbiBtYXAoeHMsIGZuKSB7XG4gIGlmICh4cy5tYXApIHJldHVybiB4cy5tYXAoZm4pO1xuICB2YXIgb3V0ID0gbmV3IEFycmF5KHhzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgeHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRbaV0gPSBmbih4c1tpXSwgaSwgeHMpO1xuICB9XG4gIHJldHVybiBvdXQ7XG59O1xuXG4vLyBBcnJheS5wcm90b3R5cGUucmVkdWNlIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMucmVkdWNlID0gZnVuY3Rpb24gcmVkdWNlKGFycmF5LCBjYWxsYmFjaywgb3B0X2luaXRpYWxWYWx1ZSkge1xuICBpZiAoYXJyYXkucmVkdWNlKSByZXR1cm4gYXJyYXkucmVkdWNlKGNhbGxiYWNrLCBvcHRfaW5pdGlhbFZhbHVlKTtcbiAgdmFyIHZhbHVlLCBpc1ZhbHVlU2V0ID0gZmFsc2U7XG5cbiAgaWYgKDIgPCBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdmFsdWUgPSBvcHRfaW5pdGlhbFZhbHVlO1xuICAgIGlzVmFsdWVTZXQgPSB0cnVlO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBsID4gaTsgKytpKSB7XG4gICAgaWYgKGFycmF5Lmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICBpZiAoaXNWYWx1ZVNldCkge1xuICAgICAgICB2YWx1ZSA9IGNhbGxiYWNrKHZhbHVlLCBhcnJheVtpXSwgaSwgYXJyYXkpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHZhbHVlID0gYXJyYXlbaV07XG4gICAgICAgIGlzVmFsdWVTZXQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbi8vIFN0cmluZy5wcm90b3R5cGUuc3Vic3RyIC0gbmVnYXRpdmUgaW5kZXggZG9uJ3Qgd29yayBpbiBJRThcbmlmICgnYWInLnN1YnN0cigtMSkgIT09ICdiJykge1xuICBleHBvcnRzLnN1YnN0ciA9IGZ1bmN0aW9uIChzdHIsIHN0YXJ0LCBsZW5ndGgpIHtcbiAgICAvLyBkaWQgd2UgZ2V0IGEgbmVnYXRpdmUgc3RhcnQsIGNhbGN1bGF0ZSBob3cgbXVjaCBpdCBpcyBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHN0cmluZ1xuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gc3RyLmxlbmd0aCArIHN0YXJ0O1xuXG4gICAgLy8gY2FsbCB0aGUgb3JpZ2luYWwgZnVuY3Rpb25cbiAgICByZXR1cm4gc3RyLnN1YnN0cihzdGFydCwgbGVuZ3RoKTtcbiAgfTtcbn0gZWxzZSB7XG4gIGV4cG9ydHMuc3Vic3RyID0gZnVuY3Rpb24gKHN0ciwgc3RhcnQsIGxlbmd0aCkge1xuICAgIHJldHVybiBzdHIuc3Vic3RyKHN0YXJ0LCBsZW5ndGgpO1xuICB9O1xufVxuXG4vLyBTdHJpbmcucHJvdG90eXBlLnRyaW0gaXMgc3VwcG9ydGVkIGluIElFOVxuZXhwb3J0cy50cmltID0gZnVuY3Rpb24gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpO1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKTtcbn07XG5cbi8vIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kIGlzIHN1cHBvcnRlZCBpbiBJRTlcbmV4cG9ydHMuYmluZCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICB2YXIgZm4gPSBhcmdzLnNoaWZ0KCk7XG4gIGlmIChmbi5iaW5kKSByZXR1cm4gZm4uYmluZC5hcHBseShmbiwgYXJncyk7XG4gIHZhciBzZWxmID0gYXJncy5zaGlmdCgpO1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGZuLmFwcGx5KHNlbGYsIGFyZ3MuY29uY2F0KFtBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpXSkpO1xuICB9O1xufTtcblxuLy8gT2JqZWN0LmNyZWF0ZSBpcyBzdXBwb3J0ZWQgaW4gSUU5XG5mdW5jdGlvbiBjcmVhdGUocHJvdG90eXBlLCBwcm9wZXJ0aWVzKSB7XG4gIHZhciBvYmplY3Q7XG4gIGlmIChwcm90b3R5cGUgPT09IG51bGwpIHtcbiAgICBvYmplY3QgPSB7ICdfX3Byb3RvX18nIDogbnVsbCB9O1xuICB9XG4gIGVsc2Uge1xuICAgIGlmICh0eXBlb2YgcHJvdG90eXBlICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ3R5cGVvZiBwcm90b3R5cGVbJyArICh0eXBlb2YgcHJvdG90eXBlKSArICddICE9IFxcJ29iamVjdFxcJydcbiAgICAgICk7XG4gICAgfVxuICAgIHZhciBUeXBlID0gZnVuY3Rpb24gKCkge307XG4gICAgVHlwZS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgb2JqZWN0ID0gbmV3IFR5cGUoKTtcbiAgICBvYmplY3QuX19wcm90b19fID0gcHJvdG90eXBlO1xuICB9XG4gIGlmICh0eXBlb2YgcHJvcGVydGllcyAhPT0gJ3VuZGVmaW5lZCcgJiYgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhvYmplY3QsIHByb3BlcnRpZXMpO1xuICB9XG4gIHJldHVybiBvYmplY3Q7XG59XG5leHBvcnRzLmNyZWF0ZSA9IHR5cGVvZiBPYmplY3QuY3JlYXRlID09PSAnZnVuY3Rpb24nID8gT2JqZWN0LmNyZWF0ZSA6IGNyZWF0ZTtcblxuLy8gT2JqZWN0LmtleXMgYW5kIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIGlzIHN1cHBvcnRlZCBpbiBJRTkgaG93ZXZlclxuLy8gdGhleSBkbyBzaG93IGEgZGVzY3JpcHRpb24gYW5kIG51bWJlciBwcm9wZXJ0eSBvbiBFcnJvciBvYmplY3RzXG5mdW5jdGlvbiBub3RPYmplY3Qob2JqZWN0KSB7XG4gIHJldHVybiAoKHR5cGVvZiBvYmplY3QgIT0gXCJvYmplY3RcIiAmJiB0eXBlb2Ygb2JqZWN0ICE9IFwiZnVuY3Rpb25cIikgfHwgb2JqZWN0ID09PSBudWxsKTtcbn1cblxuZnVuY3Rpb24ga2V5c1NoaW0ob2JqZWN0KSB7XG4gIGlmIChub3RPYmplY3Qob2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3Qua2V5cyBjYWxsZWQgb24gYSBub24tb2JqZWN0XCIpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IFtdO1xuICBmb3IgKHZhciBuYW1lIGluIG9iamVjdCkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgbmFtZSkpIHtcbiAgICAgIHJlc3VsdC5wdXNoKG5hbWUpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBnZXRPd25Qcm9wZXJ0eU5hbWVzIGlzIGFsbW9zdCB0aGUgc2FtZSBhcyBPYmplY3Qua2V5cyBvbmUga2V5IGZlYXR1cmVcbi8vICBpcyB0aGF0IGl0IHJldHVybnMgaGlkZGVuIHByb3BlcnRpZXMsIHNpbmNlIHRoYXQgY2FuJ3QgYmUgaW1wbGVtZW50ZWQsXG4vLyAgdGhpcyBmZWF0dXJlIGdldHMgcmVkdWNlZCBzbyBpdCBqdXN0IHNob3dzIHRoZSBsZW5ndGggcHJvcGVydHkgb24gYXJyYXlzXG5mdW5jdGlvbiBwcm9wZXJ0eVNoaW0ob2JqZWN0KSB7XG4gIGlmIChub3RPYmplY3Qob2JqZWN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyBjYWxsZWQgb24gYSBub24tb2JqZWN0XCIpO1xuICB9XG5cbiAgdmFyIHJlc3VsdCA9IGtleXNTaGltKG9iamVjdCk7XG4gIGlmIChleHBvcnRzLmlzQXJyYXkob2JqZWN0KSAmJiBleHBvcnRzLmluZGV4T2Yob2JqZWN0LCAnbGVuZ3RoJykgPT09IC0xKSB7XG4gICAgcmVzdWx0LnB1c2goJ2xlbmd0aCcpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbnZhciBrZXlzID0gdHlwZW9mIE9iamVjdC5rZXlzID09PSAnZnVuY3Rpb24nID8gT2JqZWN0LmtleXMgOiBrZXlzU2hpbTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gdHlwZW9mIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzID09PSAnZnVuY3Rpb24nID9cbiAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMgOiBwcm9wZXJ0eVNoaW07XG5cbmlmIChuZXcgRXJyb3IoKS5oYXNPd25Qcm9wZXJ0eSgnZGVzY3JpcHRpb24nKSkge1xuICB2YXIgRVJST1JfUFJPUEVSVFlfRklMVEVSID0gZnVuY3Rpb24gKG9iaiwgYXJyYXkpIHtcbiAgICBpZiAodG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBFcnJvcl0nKSB7XG4gICAgICBhcnJheSA9IGV4cG9ydHMuZmlsdGVyKGFycmF5LCBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gbmFtZSAhPT0gJ2Rlc2NyaXB0aW9uJyAmJiBuYW1lICE9PSAnbnVtYmVyJyAmJiBuYW1lICE9PSAnbWVzc2FnZSc7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5O1xuICB9O1xuXG4gIGV4cG9ydHMua2V5cyA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICByZXR1cm4gRVJST1JfUFJPUEVSVFlfRklMVEVSKG9iamVjdCwga2V5cyhvYmplY3QpKTtcbiAgfTtcbiAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gKG9iamVjdCkge1xuICAgIHJldHVybiBFUlJPUl9QUk9QRVJUWV9GSUxURVIob2JqZWN0LCBnZXRPd25Qcm9wZXJ0eU5hbWVzKG9iamVjdCkpO1xuICB9O1xufSBlbHNlIHtcbiAgZXhwb3J0cy5rZXlzID0ga2V5cztcbiAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eU5hbWVzID0gZ2V0T3duUHJvcGVydHlOYW1lcztcbn1cblxuLy8gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciAtIHN1cHBvcnRlZCBpbiBJRTggYnV0IG9ubHkgb24gZG9tIGVsZW1lbnRzXG5mdW5jdGlvbiB2YWx1ZU9iamVjdCh2YWx1ZSwga2V5KSB7XG4gIHJldHVybiB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG59XG5cbmlmICh0eXBlb2YgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICB0cnkge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoeydhJzogMX0sICdhJyk7XG4gICAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSUU4IGRvbSBlbGVtZW50IGlzc3VlIC0gdXNlIGEgdHJ5IGNhdGNoIGFuZCBkZWZhdWx0IHRvIHZhbHVlT2JqZWN0XG4gICAgZXhwb3J0cy5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodmFsdWUsIGtleSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZU9iamVjdCh2YWx1ZSwga2V5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59IGVsc2Uge1xuICBleHBvcnRzLmdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHZhbHVlT2JqZWN0O1xufVxuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIFVUSUxJVFlcbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpO1xudmFyIHNoaW1zID0gcmVxdWlyZSgnX3NoaW1zJyk7XG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyAxLiBUaGUgYXNzZXJ0IG1vZHVsZSBwcm92aWRlcyBmdW5jdGlvbnMgdGhhdCB0aHJvd1xuLy8gQXNzZXJ0aW9uRXJyb3IncyB3aGVuIHBhcnRpY3VsYXIgY29uZGl0aW9ucyBhcmUgbm90IG1ldC4gVGhlXG4vLyBhc3NlcnQgbW9kdWxlIG11c3QgY29uZm9ybSB0byB0aGUgZm9sbG93aW5nIGludGVyZmFjZS5cblxudmFyIGFzc2VydCA9IG1vZHVsZS5leHBvcnRzID0gb2s7XG5cbi8vIDIuIFRoZSBBc3NlcnRpb25FcnJvciBpcyBkZWZpbmVkIGluIGFzc2VydC5cbi8vIG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IoeyBtZXNzYWdlOiBtZXNzYWdlLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbDogYWN0dWFsLFxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkOiBleHBlY3RlZCB9KVxuXG5hc3NlcnQuQXNzZXJ0aW9uRXJyb3IgPSBmdW5jdGlvbiBBc3NlcnRpb25FcnJvcihvcHRpb25zKSB7XG4gIHRoaXMubmFtZSA9ICdBc3NlcnRpb25FcnJvcic7XG4gIHRoaXMuYWN0dWFsID0gb3B0aW9ucy5hY3R1YWw7XG4gIHRoaXMuZXhwZWN0ZWQgPSBvcHRpb25zLmV4cGVjdGVkO1xuICB0aGlzLm9wZXJhdG9yID0gb3B0aW9ucy5vcGVyYXRvcjtcbiAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlIHx8IGdldE1lc3NhZ2UodGhpcyk7XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gc2hpbXMua2V5cyhhKSxcbiAgICAgICAga2IgPSBzaGltcy5rZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319OyIsIlxuLy8gbm90IGltcGxlbWVudGVkXG4vLyBUaGUgcmVhc29uIGZvciBoYXZpbmcgYW4gZW1wdHkgZmlsZSBhbmQgbm90IHRocm93aW5nIGlzIHRvIGFsbG93XG4vLyB1bnRyYWRpdGlvbmFsIGltcGxlbWVudGF0aW9uIG9mIHRoaXMgbW9kdWxlLlxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpOy8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgdXRpbCA9IHJlcXVpcmUoJ3V0aWwnKTtcbnZhciBzaGltcyA9IHJlcXVpcmUoJ19zaGltcycpO1xuXG4vLyByZXNvbHZlcyAuIGFuZCAuLiBlbGVtZW50cyBpbiBhIHBhdGggYXJyYXkgd2l0aCBkaXJlY3RvcnkgbmFtZXMgdGhlcmVcbi8vIG11c3QgYmUgbm8gc2xhc2hlcywgZW1wdHkgZWxlbWVudHMsIG9yIGRldmljZSBuYW1lcyAoYzpcXCkgaW4gdGhlIGFycmF5XG4vLyAoc28gYWxzbyBubyBsZWFkaW5nIGFuZCB0cmFpbGluZyBzbGFzaGVzIC0gaXQgZG9lcyBub3QgZGlzdGluZ3Vpc2hcbi8vIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBwYXRocylcbmZ1bmN0aW9uIG5vcm1hbGl6ZUFycmF5KHBhcnRzLCBhbGxvd0Fib3ZlUm9vdCkge1xuICAvLyBpZiB0aGUgcGF0aCB0cmllcyB0byBnbyBhYm92ZSB0aGUgcm9vdCwgYHVwYCBlbmRzIHVwID4gMFxuICB2YXIgdXAgPSAwO1xuICBmb3IgKHZhciBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgbGFzdCA9IHBhcnRzW2ldO1xuICAgIGlmIChsYXN0ID09PSAnLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICB9IGVsc2UgaWYgKGxhc3QgPT09ICcuLicpIHtcbiAgICAgIHBhcnRzLnNwbGljZShpLCAxKTtcbiAgICAgIHVwKys7XG4gICAgfSBlbHNlIGlmICh1cCkge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgICAgdXAtLTtcbiAgICB9XG4gIH1cblxuICAvLyBpZiB0aGUgcGF0aCBpcyBhbGxvd2VkIHRvIGdvIGFib3ZlIHRoZSByb290LCByZXN0b3JlIGxlYWRpbmcgLi5zXG4gIGlmIChhbGxvd0Fib3ZlUm9vdCkge1xuICAgIGZvciAoOyB1cC0tOyB1cCkge1xuICAgICAgcGFydHMudW5zaGlmdCgnLi4nKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcGFydHM7XG59XG5cbi8vIFNwbGl0IGEgZmlsZW5hbWUgaW50byBbcm9vdCwgZGlyLCBiYXNlbmFtZSwgZXh0XSwgdW5peCB2ZXJzaW9uXG4vLyAncm9vdCcgaXMganVzdCBhIHNsYXNoLCBvciBub3RoaW5nLlxudmFyIHNwbGl0UGF0aFJlID1cbiAgICAvXihcXC8/fCkoW1xcc1xcU10qPykoKD86XFwuezEsMn18W15cXC9dKz98KShcXC5bXi5cXC9dKnwpKSg/OltcXC9dKikkLztcbnZhciBzcGxpdFBhdGggPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICByZXR1cm4gc3BsaXRQYXRoUmUuZXhlYyhmaWxlbmFtZSkuc2xpY2UoMSk7XG59O1xuXG4vLyBwYXRoLnJlc29sdmUoW2Zyb20gLi4uXSwgdG8pXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc29sdmVkUGF0aCA9ICcnLFxuICAgICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuXG4gIGZvciAodmFyIGkgPSBhcmd1bWVudHMubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgdmFyIHBhdGggPSAoaSA+PSAwKSA/IGFyZ3VtZW50c1tpXSA6IHByb2Nlc3MuY3dkKCk7XG5cbiAgICAvLyBTa2lwIGVtcHR5IGFuZCBpbnZhbGlkIGVudHJpZXNcbiAgICBpZiAoIXV0aWwuaXNTdHJpbmcocGF0aCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLnJlc29sdmUgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfSBlbHNlIGlmICghcGF0aCkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuXG4gICAgcmVzb2x2ZWRQYXRoID0gcGF0aCArICcvJyArIHJlc29sdmVkUGF0aDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gcGF0aC5jaGFyQXQoMCkgPT09ICcvJztcbiAgfVxuXG4gIC8vIEF0IHRoaXMgcG9pbnQgdGhlIHBhdGggc2hvdWxkIGJlIHJlc29sdmVkIHRvIGEgZnVsbCBhYnNvbHV0ZSBwYXRoLCBidXRcbiAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzIHRvIGJlIHNhZmUgKG1pZ2h0IGhhcHBlbiB3aGVuIHByb2Nlc3MuY3dkKCkgZmFpbHMpXG5cbiAgLy8gTm9ybWFsaXplIHRoZSBwYXRoXG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZUFycmF5KHNoaW1zLmZpbHRlcihyZXNvbHZlZFBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhcmVzb2x2ZWRBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIHJldHVybiAoKHJlc29sdmVkQWJzb2x1dGUgPyAnLycgOiAnJykgKyByZXNvbHZlZFBhdGgpIHx8ICcuJztcbn07XG5cbi8vIHBhdGgubm9ybWFsaXplKHBhdGgpXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgdmFyIGlzQWJzb2x1dGUgPSBleHBvcnRzLmlzQWJzb2x1dGUocGF0aCksXG4gICAgICB0cmFpbGluZ1NsYXNoID0gc2hpbXMuc3Vic3RyKHBhdGgsIC0xKSA9PT0gJy8nO1xuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgcGF0aFxuICBwYXRoID0gbm9ybWFsaXplQXJyYXkoc2hpbXMuZmlsdGVyKHBhdGguc3BsaXQoJy8nKSwgZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiAhIXA7XG4gIH0pLCAhaXNBYnNvbHV0ZSkuam9pbignLycpO1xuXG4gIGlmICghcGF0aCAmJiAhaXNBYnNvbHV0ZSkge1xuICAgIHBhdGggPSAnLic7XG4gIH1cbiAgaWYgKHBhdGggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gJy8nO1xuICB9XG5cbiAgcmV0dXJuIChpc0Fic29sdXRlID8gJy8nIDogJycpICsgcGF0aDtcbn07XG5cbi8vIHBvc2l4IHZlcnNpb25cbmV4cG9ydHMuaXNBYnNvbHV0ZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHBhdGguY2hhckF0KDApID09PSAnLyc7XG59O1xuXG4vLyBwb3NpeCB2ZXJzaW9uXG5leHBvcnRzLmpvaW4gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHBhdGhzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKTtcbiAgcmV0dXJuIGV4cG9ydHMubm9ybWFsaXplKHNoaW1zLmZpbHRlcihwYXRocywgZnVuY3Rpb24ocCwgaW5kZXgpIHtcbiAgICBpZiAoIXV0aWwuaXNTdHJpbmcocCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyB0byBwYXRoLmpvaW4gbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICAgIHJldHVybiBwO1xuICB9KS5qb2luKCcvJykpO1xufTtcblxuXG4vLyBwYXRoLnJlbGF0aXZlKGZyb20sIHRvKVxuLy8gcG9zaXggdmVyc2lvblxuZXhwb3J0cy5yZWxhdGl2ZSA9IGZ1bmN0aW9uKGZyb20sIHRvKSB7XG4gIGZyb20gPSBleHBvcnRzLnJlc29sdmUoZnJvbSkuc3Vic3RyKDEpO1xuICB0byA9IGV4cG9ydHMucmVzb2x2ZSh0bykuc3Vic3RyKDEpO1xuXG4gIGZ1bmN0aW9uIHRyaW0oYXJyKSB7XG4gICAgdmFyIHN0YXJ0ID0gMDtcbiAgICBmb3IgKDsgc3RhcnQgPCBhcnIubGVuZ3RoOyBzdGFydCsrKSB7XG4gICAgICBpZiAoYXJyW3N0YXJ0XSAhPT0gJycpIGJyZWFrO1xuICAgIH1cblxuICAgIHZhciBlbmQgPSBhcnIubGVuZ3RoIC0gMTtcbiAgICBmb3IgKDsgZW5kID49IDA7IGVuZC0tKSB7XG4gICAgICBpZiAoYXJyW2VuZF0gIT09ICcnKSBicmVhaztcbiAgICB9XG5cbiAgICBpZiAoc3RhcnQgPiBlbmQpIHJldHVybiBbXTtcbiAgICByZXR1cm4gYXJyLnNsaWNlKHN0YXJ0LCBlbmQgLSBzdGFydCArIDEpO1xuICB9XG5cbiAgdmFyIGZyb21QYXJ0cyA9IHRyaW0oZnJvbS5zcGxpdCgnLycpKTtcbiAgdmFyIHRvUGFydHMgPSB0cmltKHRvLnNwbGl0KCcvJykpO1xuXG4gIHZhciBsZW5ndGggPSBNYXRoLm1pbihmcm9tUGFydHMubGVuZ3RoLCB0b1BhcnRzLmxlbmd0aCk7XG4gIHZhciBzYW1lUGFydHNMZW5ndGggPSBsZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZnJvbVBhcnRzW2ldICE9PSB0b1BhcnRzW2ldKSB7XG4gICAgICBzYW1lUGFydHNMZW5ndGggPSBpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgdmFyIG91dHB1dFBhcnRzID0gW107XG4gIGZvciAodmFyIGkgPSBzYW1lUGFydHNMZW5ndGg7IGkgPCBmcm9tUGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICBvdXRwdXRQYXJ0cy5wdXNoKCcuLicpO1xuICB9XG5cbiAgb3V0cHV0UGFydHMgPSBvdXRwdXRQYXJ0cy5jb25jYXQodG9QYXJ0cy5zbGljZShzYW1lUGFydHNMZW5ndGgpKTtcblxuICByZXR1cm4gb3V0cHV0UGFydHMuam9pbignLycpO1xufTtcblxuZXhwb3J0cy5zZXAgPSAnLyc7XG5leHBvcnRzLmRlbGltaXRlciA9ICc6JztcblxuZXhwb3J0cy5kaXJuYW1lID0gZnVuY3Rpb24ocGF0aCkge1xuICB2YXIgcmVzdWx0ID0gc3BsaXRQYXRoKHBhdGgpLFxuICAgICAgcm9vdCA9IHJlc3VsdFswXSxcbiAgICAgIGRpciA9IHJlc3VsdFsxXTtcblxuICBpZiAoIXJvb3QgJiYgIWRpcikge1xuICAgIC8vIE5vIGRpcm5hbWUgd2hhdHNvZXZlclxuICAgIHJldHVybiAnLic7XG4gIH1cblxuICBpZiAoZGlyKSB7XG4gICAgLy8gSXQgaGFzIGEgZGlybmFtZSwgc3RyaXAgdHJhaWxpbmcgc2xhc2hcbiAgICBkaXIgPSBkaXIuc3Vic3RyKDAsIGRpci5sZW5ndGggLSAxKTtcbiAgfVxuXG4gIHJldHVybiByb290ICsgZGlyO1xufTtcblxuXG5leHBvcnRzLmJhc2VuYW1lID0gZnVuY3Rpb24ocGF0aCwgZXh0KSB7XG4gIHZhciBmID0gc3BsaXRQYXRoKHBhdGgpWzJdO1xuICAvLyBUT0RPOiBtYWtlIHRoaXMgY29tcGFyaXNvbiBjYXNlLWluc2Vuc2l0aXZlIG9uIHdpbmRvd3M/XG4gIGlmIChleHQgJiYgZi5zdWJzdHIoLTEgKiBleHQubGVuZ3RoKSA9PT0gZXh0KSB7XG4gICAgZiA9IGYuc3Vic3RyKDAsIGYubGVuZ3RoIC0gZXh0Lmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIGY7XG59O1xuXG5cbmV4cG9ydHMuZXh0bmFtZSA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgcmV0dXJuIHNwbGl0UGF0aChwYXRoKVszXTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxudmFyIHNoaW1zID0gcmVxdWlyZSgnX3NoaW1zJyk7XG5cbnZhciBmb3JtYXRSZWdFeHAgPSAvJVtzZGolXS9nO1xuZXhwb3J0cy5mb3JtYXQgPSBmdW5jdGlvbihmKSB7XG4gIGlmICghaXNTdHJpbmcoZikpIHtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBvYmplY3RzLnB1c2goaW5zcGVjdChhcmd1bWVudHNbaV0pKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iamVjdHMuam9pbignICcpO1xuICB9XG5cbiAgdmFyIGkgPSAxO1xuICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgdmFyIGxlbiA9IGFyZ3MubGVuZ3RoO1xuICB2YXIgc3RyID0gU3RyaW5nKGYpLnJlcGxhY2UoZm9ybWF0UmVnRXhwLCBmdW5jdGlvbih4KSB7XG4gICAgaWYgKHggPT09ICclJScpIHJldHVybiAnJSc7XG4gICAgaWYgKGkgPj0gbGVuKSByZXR1cm4geDtcbiAgICBzd2l0Y2ggKHgpIHtcbiAgICAgIGNhc2UgJyVzJzogcmV0dXJuIFN0cmluZyhhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWQnOiByZXR1cm4gTnVtYmVyKGFyZ3NbaSsrXSk7XG4gICAgICBjYXNlICclaic6XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGFyZ3NbaSsrXSk7XG4gICAgICAgIH0gY2F0Y2ggKF8pIHtcbiAgICAgICAgICByZXR1cm4gJ1tDaXJjdWxhcl0nO1xuICAgICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gIH0pO1xuICBmb3IgKHZhciB4ID0gYXJnc1tpXTsgaSA8IGxlbjsgeCA9IGFyZ3NbKytpXSkge1xuICAgIGlmIChpc051bGwoeCkgfHwgIWlzT2JqZWN0KHgpKSB7XG4gICAgICBzdHIgKz0gJyAnICsgeDtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RyICs9ICcgJyArIGluc3BlY3QoeCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBzdHI7XG59O1xuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgc2hpbXMuZm9yRWFjaChhcnJheSwgZnVuY3Rpb24odmFsLCBpZHgpIHtcbiAgICBoYXNoW3ZhbF0gPSB0cnVlO1xuICB9KTtcblxuICByZXR1cm4gaGFzaDtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRWYWx1ZShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMpIHtcbiAgLy8gUHJvdmlkZSBhIGhvb2sgZm9yIHVzZXItc3BlY2lmaWVkIGluc3BlY3QgZnVuY3Rpb25zLlxuICAvLyBDaGVjayB0aGF0IHZhbHVlIGlzIGFuIG9iamVjdCB3aXRoIGFuIGluc3BlY3QgZnVuY3Rpb24gb24gaXRcbiAgaWYgKGN0eC5jdXN0b21JbnNwZWN0ICYmXG4gICAgICB2YWx1ZSAmJlxuICAgICAgaXNGdW5jdGlvbih2YWx1ZS5pbnNwZWN0KSAmJlxuICAgICAgLy8gRmlsdGVyIG91dCB0aGUgdXRpbCBtb2R1bGUsIGl0J3MgaW5zcGVjdCBmdW5jdGlvbiBpcyBzcGVjaWFsXG4gICAgICB2YWx1ZS5pbnNwZWN0ICE9PSBleHBvcnRzLmluc3BlY3QgJiZcbiAgICAgIC8vIEFsc28gZmlsdGVyIG91dCBhbnkgcHJvdG90eXBlIG9iamVjdHMgdXNpbmcgdGhlIGNpcmN1bGFyIGNoZWNrLlxuICAgICAgISh2YWx1ZS5jb25zdHJ1Y3RvciAmJiB2YWx1ZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IHZhbHVlKSkge1xuICAgIHZhciByZXQgPSB2YWx1ZS5pbnNwZWN0KHJlY3Vyc2VUaW1lcyk7XG4gICAgaWYgKCFpc1N0cmluZyhyZXQpKSB7XG4gICAgICByZXQgPSBmb3JtYXRWYWx1ZShjdHgsIHJldCwgcmVjdXJzZVRpbWVzKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8vIFByaW1pdGl2ZSB0eXBlcyBjYW5ub3QgaGF2ZSBwcm9wZXJ0aWVzXG4gIHZhciBwcmltaXRpdmUgPSBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSk7XG4gIGlmIChwcmltaXRpdmUpIHtcbiAgICByZXR1cm4gcHJpbWl0aXZlO1xuICB9XG5cbiAgLy8gTG9vayB1cCB0aGUga2V5cyBvZiB0aGUgb2JqZWN0LlxuICB2YXIga2V5cyA9IHNoaW1zLmtleXModmFsdWUpO1xuICB2YXIgdmlzaWJsZUtleXMgPSBhcnJheVRvSGFzaChrZXlzKTtcblxuICBpZiAoY3R4LnNob3dIaWRkZW4pIHtcbiAgICBrZXlzID0gc2hpbXMuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBTb21lIHR5cGUgb2Ygb2JqZWN0IHdpdGhvdXQgcHJvcGVydGllcyBjYW4gYmUgc2hvcnRjdXR0ZWQuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgdmFyIG5hbWUgPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW0Z1bmN0aW9uJyArIG5hbWUgKyAnXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfVxuICAgIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoRGF0ZS5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdkYXRlJyk7XG4gICAgfVxuICAgIGlmIChpc0Vycm9yKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgICB9XG4gIH1cblxuICB2YXIgYmFzZSA9ICcnLCBhcnJheSA9IGZhbHNlLCBicmFjZXMgPSBbJ3snLCAnfSddO1xuXG4gIC8vIE1ha2UgQXJyYXkgc2F5IHRoYXQgdGhleSBhcmUgQXJyYXlcbiAgaWYgKGlzQXJyYXkodmFsdWUpKSB7XG4gICAgYXJyYXkgPSB0cnVlO1xuICAgIGJyYWNlcyA9IFsnWycsICddJ107XG4gIH1cblxuICAvLyBNYWtlIGZ1bmN0aW9ucyBzYXkgdGhhdCB0aGV5IGFyZSBmdW5jdGlvbnNcbiAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgdmFyIG4gPSB2YWx1ZS5uYW1lID8gJzogJyArIHZhbHVlLm5hbWUgOiAnJztcbiAgICBiYXNlID0gJyBbRnVuY3Rpb24nICsgbiArICddJztcbiAgfVxuXG4gIC8vIE1ha2UgUmVnRXhwcyBzYXkgdGhhdCB0aGV5IGFyZSBSZWdFeHBzXG4gIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZGF0ZXMgd2l0aCBwcm9wZXJ0aWVzIGZpcnN0IHNheSB0aGUgZGF0ZVxuICBpZiAoaXNEYXRlKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBEYXRlLnByb3RvdHlwZS50b1VUQ1N0cmluZy5jYWxsKHZhbHVlKTtcbiAgfVxuXG4gIC8vIE1ha2UgZXJyb3Igd2l0aCBtZXNzYWdlIGZpcnN0IHNheSB0aGUgZXJyb3JcbiAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIGlmIChrZXlzLmxlbmd0aCA9PT0gMCAmJiAoIWFycmF5IHx8IHZhbHVlLmxlbmd0aCA9PSAwKSkge1xuICAgIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgYnJhY2VzWzFdO1xuICB9XG5cbiAgaWYgKHJlY3Vyc2VUaW1lcyA8IDApIHtcbiAgICBpZiAoaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoUmVnRXhwLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ3JlZ2V4cCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY3R4LnN0eWxpemUoJ1tPYmplY3RdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBjdHguc2Vlbi5wdXNoKHZhbHVlKTtcblxuICB2YXIgb3V0cHV0O1xuICBpZiAoYXJyYXkpIHtcbiAgICBvdXRwdXQgPSBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKTtcbiAgfSBlbHNlIHtcbiAgICBvdXRwdXQgPSBrZXlzLm1hcChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXksIGFycmF5KTtcbiAgICB9KTtcbiAgfVxuXG4gIGN0eC5zZWVuLnBvcCgpO1xuXG4gIHJldHVybiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKHZhbHVlKSlcbiAgICByZXR1cm4gY3R4LnN0eWxpemUoJ3VuZGVmaW5lZCcsICd1bmRlZmluZWQnKTtcbiAgaWYgKGlzU3RyaW5nKHZhbHVlKSkge1xuICAgIHZhciBzaW1wbGUgPSAnXFwnJyArIEpTT04uc3RyaW5naWZ5KHZhbHVlKS5yZXBsYWNlKC9eXCJ8XCIkL2csICcnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLycvZywgXCJcXFxcJ1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1xcXFxcIi9nLCAnXCInKSArICdcXCcnO1xuICAgIHJldHVybiBjdHguc3R5bGl6ZShzaW1wbGUsICdzdHJpbmcnKTtcbiAgfVxuICBpZiAoaXNOdW1iZXIodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnbnVtYmVyJyk7XG4gIGlmIChpc0Jvb2xlYW4odmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnJyArIHZhbHVlLCAnYm9vbGVhbicpO1xuICAvLyBGb3Igc29tZSByZWFzb24gdHlwZW9mIG51bGwgaXMgXCJvYmplY3RcIiwgc28gc3BlY2lhbCBjYXNlIGhlcmUuXG4gIGlmIChpc051bGwodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgnbnVsbCcsICdudWxsJyk7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0RXJyb3IodmFsdWUpIHtcbiAgcmV0dXJuICdbJyArIEVycm9yLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSArICddJztcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRBcnJheShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLCBrZXlzKSB7XG4gIHZhciBvdXRwdXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB2YWx1ZS5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICBpZiAoaGFzT3duUHJvcGVydHkodmFsdWUsIFN0cmluZyhpKSkpIHtcbiAgICAgIG91dHB1dC5wdXNoKGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsXG4gICAgICAgICAgU3RyaW5nKGkpLCB0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIG91dHB1dC5wdXNoKCcnKTtcbiAgICB9XG4gIH1cblxuICBzaGltcy5mb3JFYWNoKGtleXMsIGZ1bmN0aW9uKGtleSkge1xuICAgIGlmICgha2V5Lm1hdGNoKC9eXFxkKyQvKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBrZXksIHRydWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gb3V0cHV0O1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpIHtcbiAgdmFyIG5hbWUsIHN0ciwgZGVzYztcbiAgZGVzYyA9IHNoaW1zLmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWhhc093blByb3BlcnR5KHZpc2libGVLZXlzLCBrZXkpKSB7XG4gICAgbmFtZSA9ICdbJyArIGtleSArICddJztcbiAgfVxuICBpZiAoIXN0cikge1xuICAgIGlmIChzaGltcy5pbmRleE9mKGN0eC5zZWVuLCBkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gc2hpbXMucmVkdWNlKG91dHB1dCwgZnVuY3Rpb24ocHJldiwgY3VyKSB7XG4gICAgbnVtTGluZXNFc3QrKztcbiAgICBpZiAoY3VyLmluZGV4T2YoJ1xcbicpID49IDApIG51bUxpbmVzRXN0Kys7XG4gICAgcmV0dXJuIHByZXYgKyBjdXIucmVwbGFjZSgvXFx1MDAxYlxcW1xcZFxcZD9tL2csICcnKS5sZW5ndGggKyAxO1xuICB9LCAwKTtcblxuICBpZiAobGVuZ3RoID4gNjApIHtcbiAgICByZXR1cm4gYnJhY2VzWzBdICtcbiAgICAgICAgICAgKGJhc2UgPT09ICcnID8gJycgOiBiYXNlICsgJ1xcbiAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIG91dHB1dC5qb2luKCcsXFxuICAnKSArXG4gICAgICAgICAgICcgJyArXG4gICAgICAgICAgIGJyYWNlc1sxXTtcbiAgfVxuXG4gIHJldHVybiBicmFjZXNbMF0gKyBiYXNlICsgJyAnICsgb3V0cHV0LmpvaW4oJywgJykgKyAnICcgKyBicmFjZXNbMV07XG59XG5cblxuLy8gTk9URTogVGhlc2UgdHlwZSBjaGVja2luZyBmdW5jdGlvbnMgaW50ZW50aW9uYWxseSBkb24ndCB1c2UgYGluc3RhbmNlb2ZgXG4vLyBiZWNhdXNlIGl0IGlzIGZyYWdpbGUgYW5kIGNhbiBiZSBlYXNpbHkgZmFrZWQgd2l0aCBgT2JqZWN0LmNyZWF0ZSgpYC5cbmZ1bmN0aW9uIGlzQXJyYXkoYXIpIHtcbiAgcmV0dXJuIHNoaW1zLmlzQXJyYXkoYXIpO1xufVxuZXhwb3J0cy5pc0FycmF5ID0gaXNBcnJheTtcblxuZnVuY3Rpb24gaXNCb29sZWFuKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nO1xufVxuZXhwb3J0cy5pc0Jvb2xlYW4gPSBpc0Jvb2xlYW47XG5cbmZ1bmN0aW9uIGlzTnVsbChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbDtcbn1cbmV4cG9ydHMuaXNOdWxsID0gaXNOdWxsO1xuXG5mdW5jdGlvbiBpc051bGxPclVuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGxPclVuZGVmaW5lZCA9IGlzTnVsbE9yVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuZXhwb3J0cy5pc051bWJlciA9IGlzTnVtYmVyO1xuXG5mdW5jdGlvbiBpc1N0cmluZyhhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnO1xufVxuZXhwb3J0cy5pc1N0cmluZyA9IGlzU3RyaW5nO1xuXG5mdW5jdGlvbiBpc1N5bWJvbChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnO1xufVxuZXhwb3J0cy5pc1N5bWJvbCA9IGlzU3ltYm9sO1xuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuZXhwb3J0cy5pc1VuZGVmaW5lZCA9IGlzVW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBpc1JlZ0V4cChyZSkge1xuICByZXR1cm4gaXNPYmplY3QocmUpICYmIG9iamVjdFRvU3RyaW5nKHJlKSA9PT0gJ1tvYmplY3QgUmVnRXhwXSc7XG59XG5leHBvcnRzLmlzUmVnRXhwID0gaXNSZWdFeHA7XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnO1xufVxuZXhwb3J0cy5pc09iamVjdCA9IGlzT2JqZWN0O1xuXG5mdW5jdGlvbiBpc0RhdGUoZCkge1xuICByZXR1cm4gaXNPYmplY3QoZCkgJiYgb2JqZWN0VG9TdHJpbmcoZCkgPT09ICdbb2JqZWN0IERhdGVdJztcbn1cbmV4cG9ydHMuaXNEYXRlID0gaXNEYXRlO1xuXG5mdW5jdGlvbiBpc0Vycm9yKGUpIHtcbiAgcmV0dXJuIGlzT2JqZWN0KGUpICYmIG9iamVjdFRvU3RyaW5nKGUpID09PSAnW29iamVjdCBFcnJvcl0nO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmJpbmFyeVNsaWNlID09PSAnZnVuY3Rpb24nXG4gIDtcbn1cbmV4cG9ydHMuaXNCdWZmZXIgPSBpc0J1ZmZlcjtcblxuZnVuY3Rpb24gb2JqZWN0VG9TdHJpbmcobykge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pO1xufVxuXG5cbmZ1bmN0aW9uIHBhZChuKSB7XG4gIHJldHVybiBuIDwgMTAgPyAnMCcgKyBuLnRvU3RyaW5nKDEwKSA6IG4udG9TdHJpbmcoMTApO1xufVxuXG5cbnZhciBtb250aHMgPSBbJ0phbicsICdGZWInLCAnTWFyJywgJ0FwcicsICdNYXknLCAnSnVuJywgJ0p1bCcsICdBdWcnLCAnU2VwJyxcbiAgICAgICAgICAgICAgJ09jdCcsICdOb3YnLCAnRGVjJ107XG5cbi8vIDI2IEZlYiAxNjoxOTozNFxuZnVuY3Rpb24gdGltZXN0YW1wKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCk7XG4gIHZhciB0aW1lID0gW3BhZChkLmdldEhvdXJzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRNaW51dGVzKCkpLFxuICAgICAgICAgICAgICBwYWQoZC5nZXRTZWNvbmRzKCkpXS5qb2luKCc6Jyk7XG4gIHJldHVybiBbZC5nZXREYXRlKCksIG1vbnRoc1tkLmdldE1vbnRoKCldLCB0aW1lXS5qb2luKCcgJyk7XG59XG5cblxuLy8gbG9nIGlzIGp1c3QgYSB0aGluIHdyYXBwZXIgdG8gY29uc29sZS5sb2cgdGhhdCBwcmVwZW5kcyBhIHRpbWVzdGFtcFxuZXhwb3J0cy5sb2cgPSBmdW5jdGlvbigpIHtcbiAgY29uc29sZS5sb2coJyVzIC0gJXMnLCB0aW1lc3RhbXAoKSwgZXhwb3J0cy5mb3JtYXQuYXBwbHkoZXhwb3J0cywgYXJndW1lbnRzKSk7XG59O1xuXG5cbi8qKlxuICogSW5oZXJpdCB0aGUgcHJvdG90eXBlIG1ldGhvZHMgZnJvbSBvbmUgY29uc3RydWN0b3IgaW50byBhbm90aGVyLlxuICpcbiAqIFRoZSBGdW5jdGlvbi5wcm90b3R5cGUuaW5oZXJpdHMgZnJvbSBsYW5nLmpzIHJld3JpdHRlbiBhcyBhIHN0YW5kYWxvbmVcbiAqIGZ1bmN0aW9uIChub3Qgb24gRnVuY3Rpb24ucHJvdG90eXBlKS4gTk9URTogSWYgdGhpcyBmaWxlIGlzIHRvIGJlIGxvYWRlZFxuICogZHVyaW5nIGJvb3RzdHJhcHBpbmcgdGhpcyBmdW5jdGlvbiBuZWVkcyB0byBiZSByZXdyaXR0ZW4gdXNpbmcgc29tZSBuYXRpdmVcbiAqIGZ1bmN0aW9ucyBhcyBwcm90b3R5cGUgc2V0dXAgdXNpbmcgbm9ybWFsIEphdmFTY3JpcHQgZG9lcyBub3Qgd29yayBhc1xuICogZXhwZWN0ZWQgZHVyaW5nIGJvb3RzdHJhcHBpbmcgKHNlZSBtaXJyb3IuanMgaW4gcjExNDkwMykuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB3aGljaCBuZWVkcyB0byBpbmhlcml0IHRoZVxuICogICAgIHByb3RvdHlwZS5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHN1cGVyQ3RvciBDb25zdHJ1Y3RvciBmdW5jdGlvbiB0byBpbmhlcml0IHByb3RvdHlwZSBmcm9tLlxuICovXG5leHBvcnRzLmluaGVyaXRzID0gZnVuY3Rpb24oY3Rvciwgc3VwZXJDdG9yKSB7XG4gIGN0b3Iuc3VwZXJfID0gc3VwZXJDdG9yO1xuICBjdG9yLnByb3RvdHlwZSA9IHNoaW1zLmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBjdG9yLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG59O1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gc2hpbXMua2V5cyhhZGQpO1xuICB2YXIgaSA9IGtleXMubGVuZ3RoO1xuICB3aGlsZSAoaS0tKSB7XG4gICAgb3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuICB9XG4gIHJldHVybiBvcmlnaW47XG59O1xuXG5mdW5jdGlvbiBoYXNPd25Qcm9wZXJ0eShvYmosIHByb3ApIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApO1xufVxuIiwiZXhwb3J0cy5yZWFkSUVFRTc1NCA9IGZ1bmN0aW9uKGJ1ZmZlciwgb2Zmc2V0LCBpc0JFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgbkJpdHMgPSAtNyxcbiAgICAgIGkgPSBpc0JFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0JFID8gMSA6IC0xLFxuICAgICAgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXTtcblxuICBpICs9IGQ7XG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSk7XG4gIHMgPj49ICgtbkJpdHMpO1xuICBuQml0cyArPSBlTGVuO1xuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KTtcblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgZSA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IG1MZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhcztcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpO1xuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbik7XG4gICAgZSA9IGUgLSBlQmlhcztcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKTtcbn07XG5cbmV4cG9ydHMud3JpdGVJRUVFNzU0ID0gZnVuY3Rpb24oYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGMsXG4gICAgICBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxLFxuICAgICAgZU1heCA9ICgxIDw8IGVMZW4pIC0gMSxcbiAgICAgIGVCaWFzID0gZU1heCA+PiAxLFxuICAgICAgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApLFxuICAgICAgaSA9IGlzQkUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzQkUgPyAtMSA6IDEsXG4gICAgICBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwO1xuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpO1xuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwO1xuICAgIGUgPSBlTWF4O1xuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKTtcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS07XG4gICAgICBjICo9IDI7XG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcyk7XG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrO1xuICAgICAgYyAvPSAyO1xuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDA7XG4gICAgICBlID0gZU1heDtcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gZSArIGVCaWFzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbik7XG4gICAgICBlID0gMDtcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KTtcblxuICBlID0gKGUgPDwgbUxlbikgfCBtO1xuICBlTGVuICs9IG1MZW47XG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCk7XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4O1xufTtcbiIsInZhciBhc3NlcnQ7XG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlcjtcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlcjtcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTI7XG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTA7XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0oc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKCk7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xufVxuXG5mdW5jdGlvbiBCdWZmZXIoc3ViamVjdCwgZW5jb2RpbmcsIG9mZnNldCkge1xuICBpZighYXNzZXJ0KSBhc3NlcnQ9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBvZmZzZXQpO1xuICB9XG4gIHRoaXMucGFyZW50ID0gdGhpcztcbiAgdGhpcy5vZmZzZXQgPSAwO1xuXG4gIC8vIFdvcmstYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uXG4gIC8vIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzIHdoaWxlIGJhc2U2NC1qc1xuICAvLyBkb2VzIG5vdC4uXG4gIGlmIChlbmNvZGluZyA9PSBcImJhc2U2NFwiICYmIHR5cGVvZiBzdWJqZWN0ID09IFwic3RyaW5nXCIpIHtcbiAgICBzdWJqZWN0ID0gc3RyaW5ndHJpbShzdWJqZWN0KTtcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9IDApIHtcbiAgICAgIHN1YmplY3QgPSBzdWJqZWN0ICsgXCI9XCI7IFxuICAgIH1cbiAgfVxuXG4gIHZhciB0eXBlO1xuXG4gIC8vIEFyZSB3ZSBzbGljaW5nP1xuICBpZiAodHlwZW9mIG9mZnNldCA9PT0gJ251bWJlcicpIHtcbiAgICB0aGlzLmxlbmd0aCA9IGNvZXJjZShlbmNvZGluZyk7XG4gICAgLy8gc2xpY2luZyB3b3Jrcywgd2l0aCBsaW1pdGF0aW9ucyAobm8gcGFyZW50IHRyYWNraW5nL3VwZGF0ZSlcbiAgICAvLyBjaGVjayBodHRwczovL2dpdGh1Yi5jb20vdG9vdHMvYnVmZmVyLWJyb3dzZXJpZnkvaXNzdWVzLzE5XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXNbaV0gPSBzdWJqZWN0LmdldChpK29mZnNldCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIEZpbmQgdGhlIGxlbmd0aFxuICAgIHN3aXRjaCAodHlwZSA9IHR5cGVvZiBzdWJqZWN0KSB7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgICB0aGlzLmxlbmd0aCA9IGNvZXJjZShzdWJqZWN0KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgIHRoaXMubGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAnb2JqZWN0JzogLy8gQXNzdW1lIG9iamVjdCBpcyBhbiBhcnJheVxuICAgICAgICB0aGlzLmxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhcnJheSBvciBzdHJpbmcuJyk7XG4gICAgfVxuXG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5LlxuICAgIGlmIChpc0FycmF5SXNoKHN1YmplY3QpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHN1YmplY3QgaW5zdGFuY2VvZiBCdWZmZXIpIHtcbiAgICAgICAgICB0aGlzW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpc1tpXSA9IHN1YmplY3RbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3N0cmluZycpIHtcbiAgICAgIC8vIFdlIGFyZSBhIHN0cmluZ1xuICAgICAgdGhpcy5sZW5ndGggPSB0aGlzLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpc1tpXSA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0KGkpIHtcbiAgaWYgKGkgPCAwIHx8IGkgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcignb29iJyk7XG4gIHJldHVybiB0aGlzW2ldO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQoaSwgdikge1xuICBpZiAoaSA8IDAgfHwgaSA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdvb2InKTtcbiAgcmV0dXJuIHRoaXNbaV0gPSB2O1xufTtcblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICBzd2l0Y2ggKGVuY29kaW5nIHx8IFwidXRmOFwiKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldHVybiBzdHIubGVuZ3RoIC8gMjtcblxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHIpLmxlbmd0aDtcblxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0dXJuIHN0ci5sZW5ndGg7XG5cbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGg7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJyk7XG4gIH1cbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUudXRmOFdyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGJ5dGVzLCBwb3M7XG4gIHJldHVybiBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9ICBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZyksIHRoaXMsIG9mZnNldCwgbGVuZ3RoKTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUuYXNjaWlXcml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBieXRlcywgcG9zO1xuICByZXR1cm4gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgdGhpcywgb2Zmc2V0LCBsZW5ndGgpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5iaW5hcnlXcml0ZSA9IEJ1ZmZlci5wcm90b3R5cGUuYXNjaWlXcml0ZTtcblxuQnVmZmVyLnByb3RvdHlwZS5iYXNlNjRXcml0ZSA9IGZ1bmN0aW9uIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBieXRlcywgcG9zO1xuICByZXR1cm4gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPSBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgdGhpcywgb2Zmc2V0LCBsZW5ndGgpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5iYXNlNjRTbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gIHJldHVybiByZXF1aXJlKFwiYmFzZTY0LWpzXCIpLmZyb21CeXRlQXJyYXkoYnl0ZXMpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS51dGY4U2xpY2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBieXRlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB2YXIgcmVzID0gXCJcIjtcbiAgdmFyIHRtcCA9IFwiXCI7XG4gIHZhciBpID0gMDtcbiAgd2hpbGUgKGkgPCBieXRlcy5sZW5ndGgpIHtcbiAgICBpZiAoYnl0ZXNbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldKTtcbiAgICAgIHRtcCA9IFwiXCI7XG4gICAgfSBlbHNlXG4gICAgICB0bXAgKz0gXCIlXCIgKyBieXRlc1tpXS50b1N0cmluZygxNik7XG5cbiAgICBpKys7XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5hc2NpaVNsaWNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYnl0ZXMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgdmFyIHJldCA9IFwiXCI7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0pO1xuICByZXR1cm4gcmV0O1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmJpbmFyeVNsaWNlID0gQnVmZmVyLnByb3RvdHlwZS5hc2NpaVNsaWNlO1xuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG91dCA9IFtdLFxuICAgICAgbGVuID0gdGhpcy5sZW5ndGg7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKTtcbiAgICBpZiAoaSA9PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLic7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nO1xufTtcblxuXG5CdWZmZXIucHJvdG90eXBlLmhleFNsaWNlID0gZnVuY3Rpb24oc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGg7XG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMDtcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlbjtcblxuICB2YXIgb3V0ID0gJyc7XG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KHRoaXNbaV0pO1xuICB9XG4gIHJldHVybiBvdXQ7XG59O1xuXG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbihlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZyB8fCAndXRmOCcpLnRvTG93ZXJDYXNlKCk7XG4gIHN0YXJ0ID0gK3N0YXJ0IHx8IDA7XG4gIGlmICh0eXBlb2YgZW5kID09ICd1bmRlZmluZWQnKSBlbmQgPSB0aGlzLmxlbmd0aDtcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmICgrZW5kID09IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXR1cm4gdGhpcy5oZXhTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldHVybiB0aGlzLnV0ZjhTbGljZShzdGFydCwgZW5kKTtcblxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldHVybiB0aGlzLmFzY2lpU2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0dXJuIHRoaXMuYmluYXJ5U2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgcmV0dXJuIHRoaXMuYmFzZTY0U2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgICByZXR1cm4gdGhpcy51Y3MyU2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJyk7XG4gIH1cbn07XG5cblxuQnVmZmVyLnByb3RvdHlwZS5oZXhXcml0ZSA9IGZ1bmN0aW9uKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gK29mZnNldCB8fCAwO1xuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXQ7XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nO1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9ICtsZW5ndGg7XG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nO1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoO1xuICBpZiAoc3RyTGVuICUgMikge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJyk7XG4gIH1cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyO1xuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgYnl0ZSA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNik7XG4gICAgaWYgKGlzTmFOKGJ5dGUpKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpO1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSBieXRlO1xuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDI7XG4gIHJldHVybiBpO1xufTtcblxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24oc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGg7XG4gICAgICBsZW5ndGggPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9IGVsc2UgeyAgLy8gbGVnYWN5XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZztcbiAgICBlbmNvZGluZyA9IG9mZnNldDtcbiAgICBvZmZzZXQgPSBsZW5ndGg7XG4gICAgbGVuZ3RoID0gc3dhcDtcbiAgfVxuXG4gIG9mZnNldCA9ICtvZmZzZXQgfHwgMDtcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0O1xuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZztcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSArbGVuZ3RoO1xuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZztcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpO1xuXG4gIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0dXJuIHRoaXMuaGV4V3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXR1cm4gdGhpcy51dGY4V3JpdGUoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCk7XG5cbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXR1cm4gdGhpcy5hc2NpaVdyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIHJldHVybiB0aGlzLmJpbmFyeVdyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldHVybiB0aGlzLmJhc2U2NFdyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgICAgcmV0dXJuIHRoaXMudWNzMldyaXRlKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpO1xuICB9XG59O1xuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlO1xuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlbjtcbiAgaWYgKGluZGV4ID49IDApIHJldHVybiBpbmRleDtcbiAgaW5kZXggKz0gbGVuO1xuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4O1xuICByZXR1cm4gMDtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoO1xuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApO1xuICBlbmQgPSBjbGFtcChlbmQsIGxlbiwgbGVuKTtcbiAgcmV0dXJuIG5ldyBCdWZmZXIodGhpcywgZW5kIC0gc3RhcnQsICtzdGFydCk7XG59O1xuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbih0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpcztcbiAgc3RhcnQgfHwgKHN0YXJ0ID0gMCk7XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBpc05hTihlbmQpKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGg7XG4gIH1cbiAgdGFyZ2V0X3N0YXJ0IHx8ICh0YXJnZXRfc3RhcnQgPSAwKTtcblxuICBpZiAoZW5kIDwgc3RhcnQpIHRocm93IG5ldyBFcnJvcignc291cmNlRW5kIDwgc291cmNlU3RhcnQnKTtcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwO1xuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PSAwIHx8IHNvdXJjZS5sZW5ndGggPT0gMCkgcmV0dXJuIDA7XG5cbiAgaWYgKHRhcmdldF9zdGFydCA8IDAgfHwgdGFyZ2V0X3N0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKTtcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gc291cmNlLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpO1xuICB9XG5cbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gc291cmNlLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKTtcbiAgfVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoO1xuICB9XG5cbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgKyBzdGFydDtcbiAgfVxuXG4gIHZhciB0ZW1wID0gW107XG4gIGZvciAodmFyIGk9c3RhcnQ7IGk8ZW5kOyBpKyspIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIHRoaXNbaV0gIT09ICd1bmRlZmluZWQnLCBcImNvcHlpbmcgdW5kZWZpbmVkIGJ1ZmZlciBieXRlcyFcIik7XG4gICAgdGVtcC5wdXNoKHRoaXNbaV0pO1xuICB9XG5cbiAgZm9yICh2YXIgaT10YXJnZXRfc3RhcnQ7IGk8dGFyZ2V0X3N0YXJ0K3RlbXAubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXRbaV0gPSB0ZW1wW2ktdGFyZ2V0X3N0YXJ0XTtcbiAgfVxufTtcblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIHZhbHVlIHx8ICh2YWx1ZSA9IDApO1xuICBzdGFydCB8fCAoc3RhcnQgPSAwKTtcbiAgZW5kIHx8IChlbmQgPSB0aGlzLmxlbmd0aCk7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMCk7XG4gIH1cbiAgaWYgKCEodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykgfHwgaXNOYU4odmFsdWUpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd2YWx1ZSBpcyBub3QgYSBudW1iZXInKTtcbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IEVycm9yKCdlbmQgPCBzdGFydCcpO1xuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDA7XG4gIGlmICh0aGlzLmxlbmd0aCA9PSAwKSByZXR1cm4gMDtcblxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJyk7XG4gIH1cblxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBFcnJvcignZW5kIG91dCBvZiBib3VuZHMnKTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlO1xuICB9XG59XG5cbi8vIFN0YXRpYyBtZXRob2RzXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlcihiKSB7XG4gIHJldHVybiBiIGluc3RhbmNlb2YgQnVmZmVyIHx8IGIgaW5zdGFuY2VvZiBCdWZmZXI7XG59O1xuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gKGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmICghaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlVzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuIFxcXG4gICAgICBsaXN0IHNob3VsZCBiZSBhbiBBcnJheS5cIik7XG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKTtcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB0b3RhbExlbmd0aCAhPT0gJ251bWJlcicpIHtcbiAgICB0b3RhbExlbmd0aCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYnVmID0gbGlzdFtpXTtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGJ1Zi5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpO1xuICB2YXIgcG9zID0gMDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV07XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpO1xuICAgIHBvcyArPSBidWYubGVuZ3RoO1xuICB9XG4gIHJldHVybiBidWZmZXI7XG59O1xuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuLy8gaGVscGVyc1xuXG5mdW5jdGlvbiBjb2VyY2UobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aCk7XG4gIHJldHVybiBsZW5ndGggPCAwID8gMCA6IGxlbmd0aDtcbn1cblxuZnVuY3Rpb24gaXNBcnJheShzdWJqZWN0KSB7XG4gIHJldHVybiAoQXJyYXkuaXNBcnJheSB8fFxuICAgIGZ1bmN0aW9uKHN1YmplY3Qpe1xuICAgICAgcmV0dXJuIHt9LnRvU3RyaW5nLmFwcGx5KHN1YmplY3QpID09ICdbb2JqZWN0IEFycmF5XSdcbiAgICB9KVxuICAgIChzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5SXNoKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gdG9IZXgobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNik7XG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KTtcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspXG4gICAgaWYgKHN0ci5jaGFyQ29kZUF0KGkpIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSk7XG4gICAgZWxzZSB7XG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuY2hhckF0KGkpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgaC5sZW5ndGg7IGorKylcbiAgICAgICAgYnl0ZUFycmF5LnB1c2gocGFyc2VJbnQoaFtqXSwgMTYpKTtcbiAgICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheTtcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKysgKVxuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKCBzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYgKTtcblxuICByZXR1cm4gYnl0ZUFycmF5O1xufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzKHN0cikge1xuICByZXR1cm4gcmVxdWlyZShcImJhc2U2NC1qc1wiKS50b0J5dGVBcnJheShzdHIpO1xufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgcG9zLCBpID0gMDtcbiAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICBpZiAoKGkrb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWs7XG5cbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV07XG4gICAgaSsrO1xuICB9XG4gIHJldHVybiBpO1xufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhcihzdHIpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZGVjb2RlVVJJQ29tcG9uZW50KHN0cik7XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCk7IC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8vIHJlYWQvd3JpdGUgYml0LXR3aWRkbGluZ1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXM7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgaWYgKG9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSByZXR1cm47XG5cbiAgcmV0dXJuIGJ1ZmZlcltvZmZzZXRdO1xufTtcblxuZnVuY3Rpb24gcmVhZFVJbnQxNihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhciB2YWwgPSAwO1xuXG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgaWYgKG9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSByZXR1cm4gMDtcblxuICBpZiAoaXNCaWdFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZmZXJbb2Zmc2V0XSA8PCA4O1xuICAgIGlmIChvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCkge1xuICAgICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXQgKyAxXTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmZmVyW29mZnNldF07XG4gICAgaWYgKG9mZnNldCArIDEgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgICB2YWwgfD0gYnVmZmVyW29mZnNldCArIDFdIDw8IDg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkVUludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRVSW50MzIoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YXIgdmFsID0gMDtcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICBpZiAob2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHJldHVybiAwO1xuXG4gIGlmIChpc0JpZ0VuZGlhbikge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCA9IGJ1ZmZlcltvZmZzZXQgKyAxXSA8PCAxNjtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgfD0gYnVmZmVyW29mZnNldCArIDJdIDw8IDg7XG4gICAgaWYgKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoKVxuICAgICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXQgKyAzXTtcbiAgICB2YWwgPSB2YWwgKyAoYnVmZmVyW29mZnNldF0gPDwgMjQgPj4+IDApO1xuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAyIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCA9IGJ1ZmZlcltvZmZzZXQgKyAyXSA8PCAxNjtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgpXG4gICAgICB2YWwgfD0gYnVmZmVyW29mZnNldCArIDFdIDw8IDg7XG4gICAgdmFsIHw9IGJ1ZmZlcltvZmZzZXRdO1xuICAgIGlmIChvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aClcbiAgICAgIHZhbCA9IHZhbCArIChidWZmZXJbb2Zmc2V0ICsgM10gPDwgMjQgPj4+IDApO1xuICB9XG5cbiAgcmV0dXJuIHZhbDtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkVUludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cblxuLypcbiAqIFNpZ25lZCBpbnRlZ2VyIHR5cGVzLCB5YXkgdGVhbSEgQSByZW1pbmRlciBvbiBob3cgdHdvJ3MgY29tcGxlbWVudCBhY3R1YWxseVxuICogd29ya3MuIFRoZSBmaXJzdCBiaXQgaXMgdGhlIHNpZ25lZCBiaXQsIGkuZS4gdGVsbHMgdXMgd2hldGhlciBvciBub3QgdGhlXG4gKiBudW1iZXIgc2hvdWxkIGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLiBJZiB0aGUgdHdvJ3MgY29tcGxlbWVudCB2YWx1ZSBpc1xuICogcG9zaXRpdmUsIHRoZW4gd2UncmUgZG9uZSwgYXMgaXQncyBlcXVpdmFsZW50IHRvIHRoZSB1bnNpZ25lZCByZXByZXNlbnRhdGlvbi5cbiAqXG4gKiBOb3cgaWYgdGhlIG51bWJlciBpcyBwb3NpdGl2ZSwgeW91J3JlIHByZXR0eSBtdWNoIGRvbmUsIHlvdSBjYW4ganVzdCBsZXZlcmFnZVxuICogdGhlIHVuc2lnbmVkIHRyYW5zbGF0aW9ucyBhbmQgcmV0dXJuIHRob3NlLiBVbmZvcnR1bmF0ZWx5LCBuZWdhdGl2ZSBudW1iZXJzXG4gKiBhcmVuJ3QgcXVpdGUgdGhhdCBzdHJhaWdodGZvcndhcmQuXG4gKlxuICogQXQgZmlyc3QgZ2xhbmNlLCBvbmUgbWlnaHQgYmUgaW5jbGluZWQgdG8gdXNlIHRoZSB0cmFkaXRpb25hbCBmb3JtdWxhIHRvXG4gKiB0cmFuc2xhdGUgYmluYXJ5IG51bWJlcnMgYmV0d2VlbiB0aGUgcG9zaXRpdmUgYW5kIG5lZ2F0aXZlIHZhbHVlcyBpbiB0d28nc1xuICogY29tcGxlbWVudC4gKFRob3VnaCBpdCBkb2Vzbid0IHF1aXRlIHdvcmsgZm9yIHRoZSBtb3N0IG5lZ2F0aXZlIHZhbHVlKVxuICogTWFpbmx5OlxuICogIC0gaW52ZXJ0IGFsbCB0aGUgYml0c1xuICogIC0gYWRkIG9uZSB0byB0aGUgcmVzdWx0XG4gKlxuICogT2YgY291cnNlLCB0aGlzIGRvZXNuJ3QgcXVpdGUgd29yayBpbiBKYXZhc2NyaXB0LiBUYWtlIGZvciBleGFtcGxlIHRoZSB2YWx1ZVxuICogb2YgLTEyOC4gVGhpcyBjb3VsZCBiZSByZXByZXNlbnRlZCBpbiAxNiBiaXRzIChiaWctZW5kaWFuKSBhcyAweGZmODAuIEJ1dCBvZlxuICogY291cnNlLCBKYXZhc2NyaXB0IHdpbGwgZG8gdGhlIGZvbGxvd2luZzpcbiAqXG4gKiA+IH4weGZmODBcbiAqIC02NTQwOVxuICpcbiAqIFdob2ggdGhlcmUsIEphdmFzY3JpcHQsIHRoYXQncyBub3QgcXVpdGUgcmlnaHQuIEJ1dCB3YWl0LCBhY2NvcmRpbmcgdG9cbiAqIEphdmFzY3JpcHQgdGhhdCdzIHBlcmZlY3RseSBjb3JyZWN0LiBXaGVuIEphdmFzY3JpcHQgZW5kcyB1cCBzZWVpbmcgdGhlXG4gKiBjb25zdGFudCAweGZmODAsIGl0IGhhcyBubyBub3Rpb24gdGhhdCBpdCBpcyBhY3R1YWxseSBhIHNpZ25lZCBudW1iZXIuIEl0XG4gKiBhc3N1bWVzIHRoYXQgd2UndmUgaW5wdXQgdGhlIHVuc2lnbmVkIHZhbHVlIDB4ZmY4MC4gVGh1cywgd2hlbiBpdCBkb2VzIHRoZVxuICogYmluYXJ5IG5lZ2F0aW9uLCBpdCBjYXN0cyBpdCBpbnRvIGEgc2lnbmVkIHZhbHVlLCAocG9zaXRpdmUgMHhmZjgwKS4gVGhlblxuICogd2hlbiB5b3UgcGVyZm9ybSBiaW5hcnkgbmVnYXRpb24gb24gdGhhdCwgaXQgdHVybnMgaXQgaW50byBhIG5lZ2F0aXZlIG51bWJlci5cbiAqXG4gKiBJbnN0ZWFkLCB3ZSdyZSBnb2luZyB0byBoYXZlIHRvIHVzZSB0aGUgZm9sbG93aW5nIGdlbmVyYWwgZm9ybXVsYSwgdGhhdCB3b3Jrc1xuICogaW4gYSByYXRoZXIgSmF2YXNjcmlwdCBmcmllbmRseSB3YXkuIEknbSBnbGFkIHdlIGRvbid0IHN1cHBvcnQgdGhpcyBraW5kIG9mXG4gKiB3ZWlyZCBudW1iZXJpbmcgc2NoZW1lIGluIHRoZSBrZXJuZWwuXG4gKlxuICogKEJJVC1NQVggLSAodW5zaWduZWQpdmFsICsgMSkgKiAtMVxuICpcbiAqIFRoZSBhc3R1dGUgb2JzZXJ2ZXIsIG1heSB0aGluayB0aGF0IHRoaXMgZG9lc24ndCBtYWtlIHNlbnNlIGZvciA4LWJpdCBudW1iZXJzXG4gKiAocmVhbGx5IGl0IGlzbid0IG5lY2Vzc2FyeSBmb3IgdGhlbSkuIEhvd2V2ZXIsIHdoZW4geW91IGdldCAxNi1iaXQgbnVtYmVycyxcbiAqIHlvdSBkby4gTGV0J3MgZ28gYmFjayB0byBvdXIgcHJpb3IgZXhhbXBsZSBhbmQgc2VlIGhvdyB0aGlzIHdpbGwgbG9vazpcbiAqXG4gKiAoMHhmZmZmIC0gMHhmZjgwICsgMSkgKiAtMVxuICogKDB4MDA3ZiArIDEpICogLTFcbiAqICgweDAwODApICogLTFcbiAqL1xuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXM7XG4gIHZhciBuZWc7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgaWYgKG9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSByZXR1cm47XG5cbiAgbmVnID0gYnVmZmVyW29mZnNldF0gJiAweDgwO1xuICBpZiAoIW5lZykge1xuICAgIHJldHVybiAoYnVmZmVyW29mZnNldF0pO1xuICB9XG5cbiAgcmV0dXJuICgoMHhmZiAtIGJ1ZmZlcltvZmZzZXRdICsgMSkgKiAtMSk7XG59O1xuXG5mdW5jdGlvbiByZWFkSW50MTYoYnVmZmVyLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YXIgbmVnLCB2YWw7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuICB9XG5cbiAgdmFsID0gcmVhZFVJbnQxNihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KTtcbiAgbmVnID0gdmFsICYgMHg4MDAwO1xuICBpZiAoIW5lZykge1xuICAgIHJldHVybiB2YWw7XG4gIH1cblxuICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTE7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRJbnQzMihidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhciBuZWcsIHZhbDtcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICB2YWwgPSByZWFkVUludDMyKGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICBuZWcgPSB2YWwgJiAweDgwMDAwMDAwO1xuICBpZiAoIW5lZykge1xuICAgIHJldHVybiAodmFsKTtcbiAgfVxuXG4gIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTE7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHJlYWRGbG9hdChidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICByZXR1cm4gcmVxdWlyZSgnLi9idWZmZXJfaWVlZTc1NCcpLnJlYWRJRUVFNzU0KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbixcbiAgICAgIDIzLCA0KTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHJlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gcmVhZERvdWJsZShidWZmZXIsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyA3IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG4gIH1cblxuICByZXR1cm4gcmVxdWlyZSgnLi9idWZmZXJfaWVlZTc1NCcpLnJlYWRJRUVFNzU0KGJ1ZmZlciwgb2Zmc2V0LCBpc0JpZ0VuZGlhbixcbiAgICAgIDUyLCA4KTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbihvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiByZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KTtcbn07XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24ob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0IGlzXG4gKiBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdCBleGNlZWQgdGhlXG4gKiBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKlxuICogICAgICB2YWx1ZSAgICAgICAgICAgVGhlIG51bWJlciB0byBjaGVjayBmb3IgdmFsaWRpdHlcbiAqXG4gKiAgICAgIG1heCAgICAgICAgICAgICBUaGUgbWF4aW11bSB2YWx1ZVxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQodmFsdWUsIG1heCkge1xuICBhc3NlcnQub2sodHlwZW9mICh2YWx1ZSkgPT0gJ251bWJlcicsXG4gICAgICAnY2Fubm90IHdyaXRlIGEgbm9uLW51bWJlciBhcyBhIG51bWJlcicpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA+PSAwLFxuICAgICAgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKTtcblxuICBhc3NlcnQub2soTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFyIGJ1ZmZlciA9IHRoaXM7XG5cbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0IDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmKTtcbiAgfVxuXG4gIGlmIChvZmZzZXQgPCBidWZmZXIubGVuZ3RoKSB7XG4gICAgYnVmZmVyW29mZnNldF0gPSB2YWx1ZTtcbiAgfVxufTtcblxuZnVuY3Rpb24gd3JpdGVVSW50MTYoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAxIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpO1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBNYXRoLm1pbihidWZmZXIubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSsrKSB7XG4gICAgYnVmZmVyW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAoaXNCaWdFbmRpYW4gPyAxIC0gaSA6IGkpKSkpID4+PlxuICAgICAgICAgICAgKGlzQmlnRW5kaWFuID8gMSAtIGkgOiBpKSAqIDg7XG4gIH1cblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gd3JpdGVVSW50MzIoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKTtcbiAgfVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgTWF0aC5taW4oYnVmZmVyLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkrKykge1xuICAgIGJ1ZmZlcltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGlzQmlnRW5kaWFuID8gMyAtIGkgOiBpKSAqIDgpICYgMHhmZjtcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuXG4vKlxuICogV2Ugbm93IG1vdmUgb250byBvdXIgZnJpZW5kcyBpbiB0aGUgc2lnbmVkIG51bWJlciBjYXRlZ29yeS4gVW5saWtlIHVuc2lnbmVkXG4gKiBudW1iZXJzLCB3ZSdyZSBnb2luZyB0byBoYXZlIHRvIHdvcnJ5IGEgYml0IG1vcmUgYWJvdXQgaG93IHdlIHB1dCB2YWx1ZXMgaW50b1xuICogYXJyYXlzLiBTaW5jZSB3ZSBhcmUgb25seSB3b3JyeWluZyBhYm91dCBzaWduZWQgMzItYml0IHZhbHVlcywgd2UncmUgaW5cbiAqIHNsaWdodGx5IGJldHRlciBzaGFwZS4gVW5mb3J0dW5hdGVseSwgd2UgcmVhbGx5IGNhbid0IGRvIG91ciBmYXZvcml0ZSBiaW5hcnlcbiAqICYgaW4gdGhpcyBzeXN0ZW0uIEl0IHJlYWxseSBzZWVtcyB0byBkbyB0aGUgd3JvbmcgdGhpbmcuIEZvciBleGFtcGxlOlxuICpcbiAqID4gLTMyICYgMHhmZlxuICogMjI0XG4gKlxuICogV2hhdCdzIGhhcHBlbmluZyBhYm92ZSBpcyByZWFsbHk6IDB4ZTAgJiAweGZmID0gMHhlMC4gSG93ZXZlciwgdGhlIHJlc3VsdHMgb2ZcbiAqIHRoaXMgYXJlbid0IHRyZWF0ZWQgYXMgYSBzaWduZWQgbnVtYmVyLiBVbHRpbWF0ZWx5IGEgYmFkIHRoaW5nLlxuICpcbiAqIFdoYXQgd2UncmUgZ29pbmcgdG8gd2FudCB0byBkbyBpcyBiYXNpY2FsbHkgY3JlYXRlIHRoZSB1bnNpZ25lZCBlcXVpdmFsZW50IG9mXG4gKiBvdXIgcmVwcmVzZW50YXRpb24gYW5kIHBhc3MgdGhhdCBvZmYgdG8gdGhlIHd1aW50KiBmdW5jdGlvbnMuIFRvIGRvIHRoYXRcbiAqIHdlJ3JlIGdvaW5nIHRvIGRvIHRoZSBmb2xsb3dpbmc6XG4gKlxuICogIC0gaWYgdGhlIHZhbHVlIGlzIHBvc2l0aXZlXG4gKiAgICAgIHdlIGNhbiBwYXNzIGl0IGRpcmVjdGx5IG9mZiB0byB0aGUgZXF1aXZhbGVudCB3dWludFxuICogIC0gaWYgdGhlIHZhbHVlIGlzIG5lZ2F0aXZlXG4gKiAgICAgIHdlIGRvIHRoZSBmb2xsb3dpbmcgY29tcHV0YXRpb246XG4gKiAgICAgICAgIG1iICsgdmFsICsgMSwgd2hlcmVcbiAqICAgICAgICAgbWIgICBpcyB0aGUgbWF4aW11bSB1bnNpZ25lZCB2YWx1ZSBpbiB0aGF0IGJ5dGUgc2l6ZVxuICogICAgICAgICB2YWwgIGlzIHRoZSBKYXZhc2NyaXB0IG5lZ2F0aXZlIGludGVnZXJcbiAqXG4gKlxuICogQXMgYSBjb25jcmV0ZSB2YWx1ZSwgdGFrZSAtMTI4LiBJbiBzaWduZWQgMTYgYml0cyB0aGlzIHdvdWxkIGJlIDB4ZmY4MC4gSWZcbiAqIHlvdSBkbyBvdXQgdGhlIGNvbXB1dGF0aW9uczpcbiAqXG4gKiAweGZmZmYgLSAxMjggKyAxXG4gKiAweGZmZmYgLSAxMjdcbiAqIDB4ZmY4MFxuICpcbiAqIFlvdSBjYW4gdGhlbiBlbmNvZGUgdGhpcyB2YWx1ZSBhcyB0aGUgc2lnbmVkIHZlcnNpb24uIFRoaXMgaXMgcmVhbGx5IHJhdGhlclxuICogaGFja3ksIGJ1dCBpdCBzaG91bGQgd29yayBhbmQgZ2V0IHRoZSBqb2IgZG9uZSB3aGljaCBpcyBvdXIgZ29hbCBoZXJlLlxuICovXG5cbi8qXG4gKiBBIHNlcmllcyBvZiBjaGVja3MgdG8gbWFrZSBzdXJlIHdlIGFjdHVhbGx5IGhhdmUgYSBzaWduZWQgMzItYml0IG51bWJlclxuICovXG5mdW5jdGlvbiB2ZXJpZnNpbnQodmFsdWUsIG1heCwgbWluKSB7XG4gIGFzc2VydC5vayh0eXBlb2YgKHZhbHVlKSA9PSAnbnVtYmVyJyxcbiAgICAgICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpO1xuXG4gIGFzc2VydC5vayh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJyk7XG5cbiAgYXNzZXJ0Lm9rKE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jyk7XG59XG5cbmZ1bmN0aW9uIHZlcmlmSUVFRTc1NCh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0Lm9rKHR5cGVvZiAodmFsdWUpID09ICdudW1iZXInLFxuICAgICAgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKTtcblxuICBhc3NlcnQub2sodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJyk7XG5cbiAgYXNzZXJ0Lm9rKHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKTtcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YXIgYnVmZmVyID0gdGhpcztcblxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2YsIC0weDgwKTtcbiAgfVxuXG4gIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgYnVmZmVyLndyaXRlVUludDgodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpO1xuICB9IGVsc2Uge1xuICAgIGJ1ZmZlci53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpO1xuICB9XG59O1xuXG5mdW5jdGlvbiB3cml0ZUludDE2KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgMSA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmLCAtMHg4MDAwKTtcbiAgfVxuXG4gIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgd3JpdGVVSW50MTYoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICB9IGVsc2Uge1xuICAgIHdyaXRlVUludDE2KGJ1ZmZlciwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCk7XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpO1xufTtcblxuZnVuY3Rpb24gd3JpdGVJbnQzMihidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzQmlnRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIHZhbHVlJyk7XG5cbiAgICBhc3NlcnQub2sodHlwZW9mIChpc0JpZ0VuZGlhbikgPT09ICdib29sZWFuJyxcbiAgICAgICAgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsXG4gICAgICAgICdtaXNzaW5nIG9mZnNldCcpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCArIDMgPCBidWZmZXIubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJyk7XG5cbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKTtcbiAgfVxuXG4gIGlmICh2YWx1ZSA+PSAwKSB7XG4gICAgd3JpdGVVSW50MzIoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICB9IGVsc2Uge1xuICAgIHdyaXRlVUludDMyKGJ1ZmZlciwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpO1xuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0JpZ0VuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydC5vayh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyB2YWx1ZScpO1xuXG4gICAgYXNzZXJ0Lm9rKHR5cGVvZiAoaXNCaWdFbmRpYW4pID09PSAnYm9vbGVhbicsXG4gICAgICAgICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKTtcblxuICAgIGFzc2VydC5vayhvZmZzZXQgKyAzIDwgYnVmZmVyLmxlbmd0aCxcbiAgICAgICAgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpO1xuXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOCk7XG4gIH1cblxuICByZXF1aXJlKCcuL2J1ZmZlcl9pZWVlNzU0Jykud3JpdGVJRUVFNzU0KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sXG4gICAgICAyMywgNCk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24odmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpO1xufTtcblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KTtcbn07XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQub2sodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3NpbmcgdmFsdWUnKTtcblxuICAgIGFzc2VydC5vayh0eXBlb2YgKGlzQmlnRW5kaWFuKSA9PT0gJ2Jvb2xlYW4nLFxuICAgICAgICAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpO1xuXG4gICAgYXNzZXJ0Lm9rKG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0Jyk7XG5cbiAgICBhc3NlcnQub2sob2Zmc2V0ICsgNyA8IGJ1ZmZlci5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKTtcblxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCk7XG4gIH1cblxuICByZXF1aXJlKCcuL2J1ZmZlcl9pZWVlNzU0Jykud3JpdGVJRUVFNzU0KGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNCaWdFbmRpYW4sXG4gICAgICA1MiwgOCk7XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydCk7XG59O1xuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbih2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydCk7XG59O1xuIiwiKGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuXHR2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5KGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyO1xuXHRcblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyAnSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCc7XG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHBsYWNlSG9sZGVycyA9IGI2NC5pbmRleE9mKCc9Jyk7XG5cdFx0cGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSBwbGFjZUhvbGRlcnMgOiAwO1xuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gW107Ly9uZXcgVWludDhBcnJheShiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpO1xuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoO1xuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGxvb2t1cC5pbmRleE9mKGI2NFtpXSkgPDwgMTgpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pIDw8IDEyKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA8PCA2KSB8IGxvb2t1cC5pbmRleE9mKGI2NFtpICsgM10pO1xuXHRcdFx0YXJyLnB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNik7XG5cdFx0XHRhcnIucHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDIpIHwgKGxvb2t1cC5pbmRleE9mKGI2NFtpICsgMV0pID4+IDQpO1xuXHRcdFx0YXJyLnB1c2godG1wICYgMHhGRik7XG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChsb29rdXAuaW5kZXhPZihiNjRbaV0pIDw8IDEwKSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDFdKSA8PCA0KSB8IChsb29rdXAuaW5kZXhPZihiNjRbaSArIDJdKSA+PiAyKTtcblx0XHRcdGFyci5wdXNoKCh0bXAgPj4gOCkgJiAweEZGKTtcblx0XHRcdGFyci5wdXNoKHRtcCAmIDB4RkYpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0KHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGg7XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdO1xuXHRcdH07XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKTtcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcCk7XG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbdGVtcCA+PiAyXTtcblx0XHRcdFx0b3V0cHV0ICs9IGxvb2t1cFsodGVtcCA8PCA0KSAmIDB4M0ZdO1xuXHRcdFx0XHRvdXRwdXQgKz0gJz09Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwW3RlbXAgPj4gMTBdO1xuXHRcdFx0XHRvdXRwdXQgKz0gbG9va3VwWyh0ZW1wID4+IDQpICYgMHgzRl07XG5cdFx0XHRcdG91dHB1dCArPSBsb29rdXBbKHRlbXAgPDwgMikgJiAweDNGXTtcblx0XHRcdFx0b3V0cHV0ICs9ICc9Jztcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdG1vZHVsZS5leHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXk7XG5cdG1vZHVsZS5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0O1xufSgpKTtcbiIsInZhciBCdWZmZXIgPSByZXF1aXJlKCdidWZmZXInKS5CdWZmZXI7XG52YXIgaW50U2l6ZSA9IDQ7XG52YXIgemVyb0J1ZmZlciA9IG5ldyBCdWZmZXIoaW50U2l6ZSk7IHplcm9CdWZmZXIuZmlsbCgwKTtcbnZhciBjaHJzeiA9IDg7XG5cbmZ1bmN0aW9uIHRvQXJyYXkoYnVmLCBiaWdFbmRpYW4pIHtcbiAgaWYgKChidWYubGVuZ3RoICUgaW50U2l6ZSkgIT09IDApIHtcbiAgICB2YXIgbGVuID0gYnVmLmxlbmd0aCArIChpbnRTaXplIC0gKGJ1Zi5sZW5ndGggJSBpbnRTaXplKSk7XG4gICAgYnVmID0gQnVmZmVyLmNvbmNhdChbYnVmLCB6ZXJvQnVmZmVyXSwgbGVuKTtcbiAgfVxuXG4gIHZhciBhcnIgPSBbXTtcbiAgdmFyIGZuID0gYmlnRW5kaWFuID8gYnVmLnJlYWRJbnQzMkJFIDogYnVmLnJlYWRJbnQzMkxFO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1Zi5sZW5ndGg7IGkgKz0gaW50U2l6ZSkge1xuICAgIGFyci5wdXNoKGZuLmNhbGwoYnVmLCBpKSk7XG4gIH1cbiAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gdG9CdWZmZXIoYXJyLCBzaXplLCBiaWdFbmRpYW4pIHtcbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIoc2l6ZSk7XG4gIHZhciBmbiA9IGJpZ0VuZGlhbiA/IGJ1Zi53cml0ZUludDMyQkUgOiBidWYud3JpdGVJbnQzMkxFO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgIGZuLmNhbGwoYnVmLCBhcnJbaV0sIGkgKiA0LCB0cnVlKTtcbiAgfVxuICByZXR1cm4gYnVmO1xufVxuXG5mdW5jdGlvbiBoYXNoKGJ1ZiwgZm4sIGhhc2hTaXplLCBiaWdFbmRpYW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgYnVmID0gbmV3IEJ1ZmZlcihidWYpO1xuICB2YXIgYXJyID0gZm4odG9BcnJheShidWYsIGJpZ0VuZGlhbiksIGJ1Zi5sZW5ndGggKiBjaHJzeik7XG4gIHJldHVybiB0b0J1ZmZlcihhcnIsIGhhc2hTaXplLCBiaWdFbmRpYW4pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgaGFzaDogaGFzaCB9O1xuIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlclxudmFyIHNoYSA9IHJlcXVpcmUoJy4vc2hhJylcbnZhciBzaGEyNTYgPSByZXF1aXJlKCcuL3NoYTI1NicpXG52YXIgcm5nID0gcmVxdWlyZSgnLi9ybmcnKVxudmFyIG1kNSA9IHJlcXVpcmUoJy4vbWQ1JylcblxudmFyIGFsZ29yaXRobXMgPSB7XG4gIHNoYTE6IHNoYSxcbiAgc2hhMjU2OiBzaGEyNTYsXG4gIG1kNTogbWQ1XG59XG5cbnZhciBibG9ja3NpemUgPSA2NFxudmFyIHplcm9CdWZmZXIgPSBuZXcgQnVmZmVyKGJsb2Nrc2l6ZSk7IHplcm9CdWZmZXIuZmlsbCgwKVxuZnVuY3Rpb24gaG1hYyhmbiwga2V5LCBkYXRhKSB7XG4gIGlmKCFCdWZmZXIuaXNCdWZmZXIoa2V5KSkga2V5ID0gbmV3IEJ1ZmZlcihrZXkpXG4gIGlmKCFCdWZmZXIuaXNCdWZmZXIoZGF0YSkpIGRhdGEgPSBuZXcgQnVmZmVyKGRhdGEpXG5cbiAgaWYoa2V5Lmxlbmd0aCA+IGJsb2Nrc2l6ZSkge1xuICAgIGtleSA9IGZuKGtleSlcbiAgfSBlbHNlIGlmKGtleS5sZW5ndGggPCBibG9ja3NpemUpIHtcbiAgICBrZXkgPSBCdWZmZXIuY29uY2F0KFtrZXksIHplcm9CdWZmZXJdLCBibG9ja3NpemUpXG4gIH1cblxuICB2YXIgaXBhZCA9IG5ldyBCdWZmZXIoYmxvY2tzaXplKSwgb3BhZCA9IG5ldyBCdWZmZXIoYmxvY2tzaXplKVxuICBmb3IodmFyIGkgPSAwOyBpIDwgYmxvY2tzaXplOyBpKyspIHtcbiAgICBpcGFkW2ldID0ga2V5W2ldIF4gMHgzNlxuICAgIG9wYWRbaV0gPSBrZXlbaV0gXiAweDVDXG4gIH1cblxuICB2YXIgaGFzaCA9IGZuKEJ1ZmZlci5jb25jYXQoW2lwYWQsIGRhdGFdKSlcbiAgcmV0dXJuIGZuKEJ1ZmZlci5jb25jYXQoW29wYWQsIGhhc2hdKSlcbn1cblxuZnVuY3Rpb24gaGFzaChhbGcsIGtleSkge1xuICBhbGcgPSBhbGcgfHwgJ3NoYTEnXG4gIHZhciBmbiA9IGFsZ29yaXRobXNbYWxnXVxuICB2YXIgYnVmcyA9IFtdXG4gIHZhciBsZW5ndGggPSAwXG4gIGlmKCFmbikgZXJyb3IoJ2FsZ29yaXRobTonLCBhbGcsICdpcyBub3QgeWV0IHN1cHBvcnRlZCcpXG4gIHJldHVybiB7XG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkgZGF0YSA9IG5ldyBCdWZmZXIoZGF0YSlcbiAgICAgICAgXG4gICAgICBidWZzLnB1c2goZGF0YSlcbiAgICAgIGxlbmd0aCArPSBkYXRhLmxlbmd0aFxuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9LFxuICAgIGRpZ2VzdDogZnVuY3Rpb24gKGVuYykge1xuICAgICAgdmFyIGJ1ZiA9IEJ1ZmZlci5jb25jYXQoYnVmcylcbiAgICAgIHZhciByID0ga2V5ID8gaG1hYyhmbiwga2V5LCBidWYpIDogZm4oYnVmKVxuICAgICAgYnVmcyA9IG51bGxcbiAgICAgIHJldHVybiBlbmMgPyByLnRvU3RyaW5nKGVuYykgOiByXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGVycm9yICgpIHtcbiAgdmFyIG0gPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cykuam9pbignICcpXG4gIHRocm93IG5ldyBFcnJvcihbXG4gICAgbSxcbiAgICAnd2UgYWNjZXB0IHB1bGwgcmVxdWVzdHMnLFxuICAgICdodHRwOi8vZ2l0aHViLmNvbS9kb21pbmljdGFyci9jcnlwdG8tYnJvd3NlcmlmeSdcbiAgICBdLmpvaW4oJ1xcbicpKVxufVxuXG5leHBvcnRzLmNyZWF0ZUhhc2ggPSBmdW5jdGlvbiAoYWxnKSB7IHJldHVybiBoYXNoKGFsZykgfVxuZXhwb3J0cy5jcmVhdGVIbWFjID0gZnVuY3Rpb24gKGFsZywga2V5KSB7IHJldHVybiBoYXNoKGFsZywga2V5KSB9XG5leHBvcnRzLnJhbmRvbUJ5dGVzID0gZnVuY3Rpb24oc2l6ZSwgY2FsbGJhY2spIHtcbiAgaWYgKGNhbGxiYWNrICYmIGNhbGxiYWNrLmNhbGwpIHtcbiAgICB0cnkge1xuICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCB1bmRlZmluZWQsIG5ldyBCdWZmZXIocm5nKHNpemUpKSlcbiAgICB9IGNhdGNoIChlcnIpIHsgY2FsbGJhY2soZXJyKSB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIocm5nKHNpemUpKVxuICB9XG59XG5cbmZ1bmN0aW9uIGVhY2goYSwgZikge1xuICBmb3IodmFyIGkgaW4gYSlcbiAgICBmKGFbaV0sIGkpXG59XG5cbi8vIHRoZSBsZWFzdCBJIGNhbiBkbyBpcyBtYWtlIGVycm9yIG1lc3NhZ2VzIGZvciB0aGUgcmVzdCBvZiB0aGUgbm9kZS5qcy9jcnlwdG8gYXBpLlxuZWFjaChbJ2NyZWF0ZUNyZWRlbnRpYWxzJ1xuLCAnY3JlYXRlQ2lwaGVyJ1xuLCAnY3JlYXRlQ2lwaGVyaXYnXG4sICdjcmVhdGVEZWNpcGhlcidcbiwgJ2NyZWF0ZURlY2lwaGVyaXYnXG4sICdjcmVhdGVTaWduJ1xuLCAnY3JlYXRlVmVyaWZ5J1xuLCAnY3JlYXRlRGlmZmllSGVsbG1hbidcbiwgJ3Bia2RmMiddLCBmdW5jdGlvbiAobmFtZSkge1xuICBleHBvcnRzW25hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgIGVycm9yKCdzb3JyeSwnLCBuYW1lLCAnaXMgbm90IGltcGxlbWVudGVkIHlldCcpXG4gIH1cbn0pXG4iLCIvKlxyXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFJTQSBEYXRhIFNlY3VyaXR5LCBJbmMuIE1ENSBNZXNzYWdlXHJcbiAqIERpZ2VzdCBBbGdvcml0aG0sIGFzIGRlZmluZWQgaW4gUkZDIDEzMjEuXHJcbiAqIFZlcnNpb24gMi4xIENvcHlyaWdodCAoQykgUGF1bCBKb2huc3RvbiAxOTk5IC0gMjAwMi5cclxuICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxyXG4gKiBEaXN0cmlidXRlZCB1bmRlciB0aGUgQlNEIExpY2Vuc2VcclxuICogU2VlIGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDUgZm9yIG1vcmUgaW5mby5cclxuICovXHJcblxyXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xyXG5cclxuLypcclxuICogUGVyZm9ybSBhIHNpbXBsZSBzZWxmLXRlc3QgdG8gc2VlIGlmIHRoZSBWTSBpcyB3b3JraW5nXHJcbiAqL1xyXG5mdW5jdGlvbiBtZDVfdm1fdGVzdCgpXHJcbntcclxuICByZXR1cm4gaGV4X21kNShcImFiY1wiKSA9PSBcIjkwMDE1MDk4M2NkMjRmYjBkNjk2M2Y3ZDI4ZTE3ZjcyXCI7XHJcbn1cclxuXHJcbi8qXHJcbiAqIENhbGN1bGF0ZSB0aGUgTUQ1IG9mIGFuIGFycmF5IG9mIGxpdHRsZS1lbmRpYW4gd29yZHMsIGFuZCBhIGJpdCBsZW5ndGhcclxuICovXHJcbmZ1bmN0aW9uIGNvcmVfbWQ1KHgsIGxlbilcclxue1xyXG4gIC8qIGFwcGVuZCBwYWRkaW5nICovXHJcbiAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoKGxlbikgJSAzMik7XHJcbiAgeFsoKChsZW4gKyA2NCkgPj4+IDkpIDw8IDQpICsgMTRdID0gbGVuO1xyXG5cclxuICB2YXIgYSA9ICAxNzMyNTg0MTkzO1xyXG4gIHZhciBiID0gLTI3MTczMzg3OTtcclxuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xyXG4gIHZhciBkID0gIDI3MTczMzg3ODtcclxuXHJcbiAgZm9yKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KVxyXG4gIHtcclxuICAgIHZhciBvbGRhID0gYTtcclxuICAgIHZhciBvbGRiID0gYjtcclxuICAgIHZhciBvbGRjID0gYztcclxuICAgIHZhciBvbGRkID0gZDtcclxuXHJcbiAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSsgMF0sIDcgLCAtNjgwODc2OTM2KTtcclxuICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpKyAxXSwgMTIsIC0zODk1NjQ1ODYpO1xyXG4gICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2krIDJdLCAxNywgIDYwNjEwNTgxOSk7XHJcbiAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSsgM10sIDIyLCAtMTA0NDUyNTMzMCk7XHJcbiAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSsgNF0sIDcgLCAtMTc2NDE4ODk3KTtcclxuICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpKyA1XSwgMTIsICAxMjAwMDgwNDI2KTtcclxuICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpKyA2XSwgMTcsIC0xNDczMjMxMzQxKTtcclxuICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpKyA3XSwgMjIsIC00NTcwNTk4Myk7XHJcbiAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSsgOF0sIDcgLCAgMTc3MDAzNTQxNik7XHJcbiAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSsgOV0sIDEyLCAtMTk1ODQxNDQxNyk7XHJcbiAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSsxMF0sIDE3LCAtNDIwNjMpO1xyXG4gICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2krMTFdLCAyMiwgLTE5OTA0MDQxNjIpO1xyXG4gICAgYSA9IG1kNV9mZihhLCBiLCBjLCBkLCB4W2krMTJdLCA3ICwgIDE4MDQ2MDM2ODIpO1xyXG4gICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2krMTNdLCAxMiwgLTQwMzQxMTAxKTtcclxuICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpKzE0XSwgMTcsIC0xNTAyMDAyMjkwKTtcclxuICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpKzE1XSwgMjIsICAxMjM2NTM1MzI5KTtcclxuXHJcbiAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSsgMV0sIDUgLCAtMTY1Nzk2NTEwKTtcclxuICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpKyA2XSwgOSAsIC0xMDY5NTAxNjMyKTtcclxuICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpKzExXSwgMTQsICA2NDM3MTc3MTMpO1xyXG4gICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2krIDBdLCAyMCwgLTM3Mzg5NzMwMik7XHJcbiAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSsgNV0sIDUgLCAtNzAxNTU4NjkxKTtcclxuICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpKzEwXSwgOSAsICAzODAxNjA4Myk7XHJcbiAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSsxNV0sIDE0LCAtNjYwNDc4MzM1KTtcclxuICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpKyA0XSwgMjAsIC00MDU1Mzc4NDgpO1xyXG4gICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2krIDldLCA1ICwgIDU2ODQ0NjQzOCk7XHJcbiAgICBkID0gbWQ1X2dnKGQsIGEsIGIsIGMsIHhbaSsxNF0sIDkgLCAtMTAxOTgwMzY5MCk7XHJcbiAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSsgM10sIDE0LCAtMTg3MzYzOTYxKTtcclxuICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpKyA4XSwgMjAsICAxMTYzNTMxNTAxKTtcclxuICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpKzEzXSwgNSAsIC0xNDQ0NjgxNDY3KTtcclxuICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpKyAyXSwgOSAsIC01MTQwMzc4NCk7XHJcbiAgICBjID0gbWQ1X2dnKGMsIGQsIGEsIGIsIHhbaSsgN10sIDE0LCAgMTczNTMyODQ3Myk7XHJcbiAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSsxMl0sIDIwLCAtMTkyNjYwNzczNCk7XHJcblxyXG4gICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2krIDVdLCA0ICwgLTM3ODU1OCk7XHJcbiAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSsgOF0sIDExLCAtMjAyMjU3NDQ2Myk7XHJcbiAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSsxMV0sIDE2LCAgMTgzOTAzMDU2Mik7XHJcbiAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSsxNF0sIDIzLCAtMzUzMDk1NTYpO1xyXG4gICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2krIDFdLCA0ICwgLTE1MzA5OTIwNjApO1xyXG4gICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2krIDRdLCAxMSwgIDEyNzI4OTMzNTMpO1xyXG4gICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2krIDddLCAxNiwgLTE1NTQ5NzYzMik7XHJcbiAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSsxMF0sIDIzLCAtMTA5NDczMDY0MCk7XHJcbiAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSsxM10sIDQgLCAgNjgxMjc5MTc0KTtcclxuICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpKyAwXSwgMTEsIC0zNTg1MzcyMjIpO1xyXG4gICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2krIDNdLCAxNiwgLTcyMjUyMTk3OSk7XHJcbiAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSsgNl0sIDIzLCAgNzYwMjkxODkpO1xyXG4gICAgYSA9IG1kNV9oaChhLCBiLCBjLCBkLCB4W2krIDldLCA0ICwgLTY0MDM2NDQ4Nyk7XHJcbiAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSsxMl0sIDExLCAtNDIxODE1ODM1KTtcclxuICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpKzE1XSwgMTYsICA1MzA3NDI1MjApO1xyXG4gICAgYiA9IG1kNV9oaChiLCBjLCBkLCBhLCB4W2krIDJdLCAyMywgLTk5NTMzODY1MSk7XHJcblxyXG4gICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2krIDBdLCA2ICwgLTE5ODYzMDg0NCk7XHJcbiAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSsgN10sIDEwLCAgMTEyNjg5MTQxNSk7XHJcbiAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSsxNF0sIDE1LCAtMTQxNjM1NDkwNSk7XHJcbiAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSsgNV0sIDIxLCAtNTc0MzQwNTUpO1xyXG4gICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2krMTJdLCA2ICwgIDE3MDA0ODU1NzEpO1xyXG4gICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2krIDNdLCAxMCwgLTE4OTQ5ODY2MDYpO1xyXG4gICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2krMTBdLCAxNSwgLTEwNTE1MjMpO1xyXG4gICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2krIDFdLCAyMSwgLTIwNTQ5MjI3OTkpO1xyXG4gICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2krIDhdLCA2ICwgIDE4NzMzMTMzNTkpO1xyXG4gICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2krMTVdLCAxMCwgLTMwNjExNzQ0KTtcclxuICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpKyA2XSwgMTUsIC0xNTYwMTk4MzgwKTtcclxuICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpKzEzXSwgMjEsICAxMzA5MTUxNjQ5KTtcclxuICAgIGEgPSBtZDVfaWkoYSwgYiwgYywgZCwgeFtpKyA0XSwgNiAsIC0xNDU1MjMwNzApO1xyXG4gICAgZCA9IG1kNV9paShkLCBhLCBiLCBjLCB4W2krMTFdLCAxMCwgLTExMjAyMTAzNzkpO1xyXG4gICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2krIDJdLCAxNSwgIDcxODc4NzI1OSk7XHJcbiAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSsgOV0sIDIxLCAtMzQzNDg1NTUxKTtcclxuXHJcbiAgICBhID0gc2FmZV9hZGQoYSwgb2xkYSk7XHJcbiAgICBiID0gc2FmZV9hZGQoYiwgb2xkYik7XHJcbiAgICBjID0gc2FmZV9hZGQoYywgb2xkYyk7XHJcbiAgICBkID0gc2FmZV9hZGQoZCwgb2xkZCk7XHJcbiAgfVxyXG4gIHJldHVybiBBcnJheShhLCBiLCBjLCBkKTtcclxuXHJcbn1cclxuXHJcbi8qXHJcbiAqIFRoZXNlIGZ1bmN0aW9ucyBpbXBsZW1lbnQgdGhlIGZvdXIgYmFzaWMgb3BlcmF0aW9ucyB0aGUgYWxnb3JpdGhtIHVzZXMuXHJcbiAqL1xyXG5mdW5jdGlvbiBtZDVfY21uKHEsIGEsIGIsIHgsIHMsIHQpXHJcbntcclxuICByZXR1cm4gc2FmZV9hZGQoYml0X3JvbChzYWZlX2FkZChzYWZlX2FkZChhLCBxKSwgc2FmZV9hZGQoeCwgdCkpLCBzKSxiKTtcclxufVxyXG5mdW5jdGlvbiBtZDVfZmYoYSwgYiwgYywgZCwgeCwgcywgdClcclxue1xyXG4gIHJldHVybiBtZDVfY21uKChiICYgYykgfCAoKH5iKSAmIGQpLCBhLCBiLCB4LCBzLCB0KTtcclxufVxyXG5mdW5jdGlvbiBtZDVfZ2coYSwgYiwgYywgZCwgeCwgcywgdClcclxue1xyXG4gIHJldHVybiBtZDVfY21uKChiICYgZCkgfCAoYyAmICh+ZCkpLCBhLCBiLCB4LCBzLCB0KTtcclxufVxyXG5mdW5jdGlvbiBtZDVfaGgoYSwgYiwgYywgZCwgeCwgcywgdClcclxue1xyXG4gIHJldHVybiBtZDVfY21uKGIgXiBjIF4gZCwgYSwgYiwgeCwgcywgdCk7XHJcbn1cclxuZnVuY3Rpb24gbWQ1X2lpKGEsIGIsIGMsIGQsIHgsIHMsIHQpXHJcbntcclxuICByZXR1cm4gbWQ1X2NtbihjIF4gKGIgfCAofmQpKSwgYSwgYiwgeCwgcywgdCk7XHJcbn1cclxuXHJcbi8qXHJcbiAqIEFkZCBpbnRlZ2Vycywgd3JhcHBpbmcgYXQgMl4zMi4gVGhpcyB1c2VzIDE2LWJpdCBvcGVyYXRpb25zIGludGVybmFsbHlcclxuICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cclxuICovXHJcbmZ1bmN0aW9uIHNhZmVfYWRkKHgsIHkpXHJcbntcclxuICB2YXIgbHN3ID0gKHggJiAweEZGRkYpICsgKHkgJiAweEZGRkYpO1xyXG4gIHZhciBtc3cgPSAoeCA+PiAxNikgKyAoeSA+PiAxNikgKyAobHN3ID4+IDE2KTtcclxuICByZXR1cm4gKG1zdyA8PCAxNikgfCAobHN3ICYgMHhGRkZGKTtcclxufVxyXG5cclxuLypcclxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxyXG4gKi9cclxuZnVuY3Rpb24gYml0X3JvbChudW0sIGNudClcclxue1xyXG4gIHJldHVybiAobnVtIDw8IGNudCkgfCAobnVtID4+PiAoMzIgLSBjbnQpKTtcclxufVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZDUoYnVmKSB7XHJcbiAgcmV0dXJuIGhlbHBlcnMuaGFzaChidWYsIGNvcmVfbWQ1LCAxNik7XHJcbn07XHJcbiIsIi8vIE9yaWdpbmFsIGNvZGUgYWRhcHRlZCBmcm9tIFJvYmVydCBLaWVmZmVyLlxuLy8gZGV0YWlscyBhdCBodHRwczovL2dpdGh1Yi5jb20vYnJvb2ZhL25vZGUtdXVpZFxuKGZ1bmN0aW9uKCkge1xuICB2YXIgX2dsb2JhbCA9IHRoaXM7XG5cbiAgdmFyIG1hdGhSTkcsIHdoYXR3Z1JORztcblxuICAvLyBOT1RFOiBNYXRoLnJhbmRvbSgpIGRvZXMgbm90IGd1YXJhbnRlZSBcImNyeXB0b2dyYXBoaWMgcXVhbGl0eVwiXG4gIG1hdGhSTkcgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgdmFyIGJ5dGVzID0gbmV3IEFycmF5KHNpemUpO1xuICAgIHZhciByO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIHI7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgIGlmICgoaSAmIDB4MDMpID09IDApIHIgPSBNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDA7XG4gICAgICBieXRlc1tpXSA9IHIgPj4+ICgoaSAmIDB4MDMpIDw8IDMpICYgMHhmZjtcbiAgICB9XG5cbiAgICByZXR1cm4gYnl0ZXM7XG4gIH1cblxuICBpZiAoX2dsb2JhbC5jcnlwdG8gJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xuICAgIHZhciBfcm5kcyA9IG5ldyBVaW50MzJBcnJheSg0KTtcbiAgICB3aGF0d2dSTkcgPSBmdW5jdGlvbihzaXplKSB7XG4gICAgICB2YXIgYnl0ZXMgPSBuZXcgQXJyYXkoc2l6ZSk7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKF9ybmRzKTtcblxuICAgICAgZm9yICh2YXIgYyA9IDAgOyBjIDwgc2l6ZTsgYysrKSB7XG4gICAgICAgIGJ5dGVzW2NdID0gX3JuZHNbYyA+PiAyXSA+Pj4gKChjICYgMHgwMykgKiA4KSAmIDB4ZmY7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnl0ZXM7XG4gICAgfVxuICB9XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSB3aGF0d2dSTkcgfHwgbWF0aFJORztcblxufSgpKVxuIiwiLypcbiAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2VjdXJlIEhhc2ggQWxnb3JpdGhtLCBTSEEtMSwgYXMgZGVmaW5lZFxuICogaW4gRklQUyBQVUIgMTgwLTFcbiAqIFZlcnNpb24gMi4xYSBDb3B5cmlnaHQgUGF1bCBKb2huc3RvbiAyMDAwIC0gMjAwMi5cbiAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxuICogU2VlIGh0dHA6Ly9wYWpob21lLm9yZy51ay9jcnlwdC9tZDUgZm9yIGRldGFpbHMuXG4gKi9cblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxuLypcbiAqIFBlcmZvcm0gYSBzaW1wbGUgc2VsZi10ZXN0IHRvIHNlZSBpZiB0aGUgVk0gaXMgd29ya2luZ1xuICovXG5mdW5jdGlvbiBzaGExX3ZtX3Rlc3QoKVxue1xuICByZXR1cm4gaGV4X3NoYTEoXCJhYmNcIikgPT0gXCJhOTk5M2UzNjQ3MDY4MTZhYmEzZTI1NzE3ODUwYzI2YzljZDBkODlkXCI7XG59XG5cbi8qXG4gKiBDYWxjdWxhdGUgdGhlIFNIQS0xIG9mIGFuIGFycmF5IG9mIGJpZy1lbmRpYW4gd29yZHMsIGFuZCBhIGJpdCBsZW5ndGhcbiAqL1xuZnVuY3Rpb24gY29yZV9zaGExKHgsIGxlbilcbntcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgeFtsZW4gPj4gNV0gfD0gMHg4MCA8PCAoMjQgLSBsZW4gJSAzMik7XG4gIHhbKChsZW4gKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGxlbjtcblxuICB2YXIgdyA9IEFycmF5KDgwKTtcbiAgdmFyIGEgPSAgMTczMjU4NDE5MztcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xuICB2YXIgYyA9IC0xNzMyNTg0MTk0O1xuICB2YXIgZCA9ICAyNzE3MzM4Nzg7XG4gIHZhciBlID0gLTEwMDk1ODk3NzY7XG5cbiAgZm9yKHZhciBpID0gMDsgaSA8IHgubGVuZ3RoOyBpICs9IDE2KVxuICB7XG4gICAgdmFyIG9sZGEgPSBhO1xuICAgIHZhciBvbGRiID0gYjtcbiAgICB2YXIgb2xkYyA9IGM7XG4gICAgdmFyIG9sZGQgPSBkO1xuICAgIHZhciBvbGRlID0gZTtcblxuICAgIGZvcih2YXIgaiA9IDA7IGogPCA4MDsgaisrKVxuICAgIHtcbiAgICAgIGlmKGogPCAxNikgd1tqXSA9IHhbaSArIGpdO1xuICAgICAgZWxzZSB3W2pdID0gcm9sKHdbai0zXSBeIHdbai04XSBeIHdbai0xNF0gXiB3W2otMTZdLCAxKTtcbiAgICAgIHZhciB0ID0gc2FmZV9hZGQoc2FmZV9hZGQocm9sKGEsIDUpLCBzaGExX2Z0KGosIGIsIGMsIGQpKSxcbiAgICAgICAgICAgICAgICAgICAgICAgc2FmZV9hZGQoc2FmZV9hZGQoZSwgd1tqXSksIHNoYTFfa3QoaikpKTtcbiAgICAgIGUgPSBkO1xuICAgICAgZCA9IGM7XG4gICAgICBjID0gcm9sKGIsIDMwKTtcbiAgICAgIGIgPSBhO1xuICAgICAgYSA9IHQ7XG4gICAgfVxuXG4gICAgYSA9IHNhZmVfYWRkKGEsIG9sZGEpO1xuICAgIGIgPSBzYWZlX2FkZChiLCBvbGRiKTtcbiAgICBjID0gc2FmZV9hZGQoYywgb2xkYyk7XG4gICAgZCA9IHNhZmVfYWRkKGQsIG9sZGQpO1xuICAgIGUgPSBzYWZlX2FkZChlLCBvbGRlKTtcbiAgfVxuICByZXR1cm4gQXJyYXkoYSwgYiwgYywgZCwgZSk7XG5cbn1cblxuLypcbiAqIFBlcmZvcm0gdGhlIGFwcHJvcHJpYXRlIHRyaXBsZXQgY29tYmluYXRpb24gZnVuY3Rpb24gZm9yIHRoZSBjdXJyZW50XG4gKiBpdGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gc2hhMV9mdCh0LCBiLCBjLCBkKVxue1xuICBpZih0IDwgMjApIHJldHVybiAoYiAmIGMpIHwgKCh+YikgJiBkKTtcbiAgaWYodCA8IDQwKSByZXR1cm4gYiBeIGMgXiBkO1xuICBpZih0IDwgNjApIHJldHVybiAoYiAmIGMpIHwgKGIgJiBkKSB8IChjICYgZCk7XG4gIHJldHVybiBiIF4gYyBeIGQ7XG59XG5cbi8qXG4gKiBEZXRlcm1pbmUgdGhlIGFwcHJvcHJpYXRlIGFkZGl0aXZlIGNvbnN0YW50IGZvciB0aGUgY3VycmVudCBpdGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gc2hhMV9rdCh0KVxue1xuICByZXR1cm4gKHQgPCAyMCkgPyAgMTUxODUwMDI0OSA6ICh0IDwgNDApID8gIDE4NTk3NzUzOTMgOlxuICAgICAgICAgKHQgPCA2MCkgPyAtMTg5NDAwNzU4OCA6IC04OTk0OTc1MTQ7XG59XG5cbi8qXG4gKiBBZGQgaW50ZWdlcnMsIHdyYXBwaW5nIGF0IDJeMzIuIFRoaXMgdXNlcyAxNi1iaXQgb3BlcmF0aW9ucyBpbnRlcm5hbGx5XG4gKiB0byB3b3JrIGFyb3VuZCBidWdzIGluIHNvbWUgSlMgaW50ZXJwcmV0ZXJzLlxuICovXG5mdW5jdGlvbiBzYWZlX2FkZCh4LCB5KVxue1xuICB2YXIgbHN3ID0gKHggJiAweEZGRkYpICsgKHkgJiAweEZGRkYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xufVxuXG4vKlxuICogQml0d2lzZSByb3RhdGUgYSAzMi1iaXQgbnVtYmVyIHRvIHRoZSBsZWZ0LlxuICovXG5mdW5jdGlvbiByb2wobnVtLCBjbnQpXG57XG4gIHJldHVybiAobnVtIDw8IGNudCkgfCAobnVtID4+PiAoMzIgLSBjbnQpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGExKGJ1Zikge1xuICByZXR1cm4gaGVscGVycy5oYXNoKGJ1ZiwgY29yZV9zaGExLCAyMCwgdHJ1ZSk7XG59O1xuIiwiXG4vKipcbiAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgU2VjdXJlIEhhc2ggQWxnb3JpdGhtLCBTSEEtMjU2LCBhcyBkZWZpbmVkXG4gKiBpbiBGSVBTIDE4MC0yXG4gKiBWZXJzaW9uIDIuMi1iZXRhIENvcHlyaWdodCBBbmdlbCBNYXJpbiwgUGF1bCBKb2huc3RvbiAyMDAwIC0gMjAwOS5cbiAqIE90aGVyIGNvbnRyaWJ1dG9yczogR3JlZyBIb2x0LCBBbmRyZXcgS2VwZXJ0LCBZZG5hciwgTG9zdGluZXRcbiAqXG4gKi9cblxudmFyIGhlbHBlcnMgPSByZXF1aXJlKCcuL2hlbHBlcnMnKTtcblxudmFyIHNhZmVfYWRkID0gZnVuY3Rpb24oeCwgeSkge1xuICB2YXIgbHN3ID0gKHggJiAweEZGRkYpICsgKHkgJiAweEZGRkYpO1xuICB2YXIgbXN3ID0gKHggPj4gMTYpICsgKHkgPj4gMTYpICsgKGxzdyA+PiAxNik7XG4gIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xufTtcblxudmFyIFMgPSBmdW5jdGlvbihYLCBuKSB7XG4gIHJldHVybiAoWCA+Pj4gbikgfCAoWCA8PCAoMzIgLSBuKSk7XG59O1xuXG52YXIgUiA9IGZ1bmN0aW9uKFgsIG4pIHtcbiAgcmV0dXJuIChYID4+PiBuKTtcbn07XG5cbnZhciBDaCA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgcmV0dXJuICgoeCAmIHkpIF4gKCh+eCkgJiB6KSk7XG59O1xuXG52YXIgTWFqID0gZnVuY3Rpb24oeCwgeSwgeikge1xuICByZXR1cm4gKCh4ICYgeSkgXiAoeCAmIHopIF4gKHkgJiB6KSk7XG59O1xuXG52YXIgU2lnbWEwMjU2ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKFMoeCwgMikgXiBTKHgsIDEzKSBeIFMoeCwgMjIpKTtcbn07XG5cbnZhciBTaWdtYTEyNTYgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoUyh4LCA2KSBeIFMoeCwgMTEpIF4gUyh4LCAyNSkpO1xufTtcblxudmFyIEdhbW1hMDI1NiA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChTKHgsIDcpIF4gUyh4LCAxOCkgXiBSKHgsIDMpKTtcbn07XG5cbnZhciBHYW1tYTEyNTYgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoUyh4LCAxNykgXiBTKHgsIDE5KSBeIFIoeCwgMTApKTtcbn07XG5cbnZhciBjb3JlX3NoYTI1NiA9IGZ1bmN0aW9uKG0sIGwpIHtcbiAgdmFyIEsgPSBuZXcgQXJyYXkoMHg0MjhBMkY5OCwweDcxMzc0NDkxLDB4QjVDMEZCQ0YsMHhFOUI1REJBNSwweDM5NTZDMjVCLDB4NTlGMTExRjEsMHg5MjNGODJBNCwweEFCMUM1RUQ1LDB4RDgwN0FBOTgsMHgxMjgzNUIwMSwweDI0MzE4NUJFLDB4NTUwQzdEQzMsMHg3MkJFNUQ3NCwweDgwREVCMUZFLDB4OUJEQzA2QTcsMHhDMTlCRjE3NCwweEU0OUI2OUMxLDB4RUZCRTQ3ODYsMHhGQzE5REM2LDB4MjQwQ0ExQ0MsMHgyREU5MkM2RiwweDRBNzQ4NEFBLDB4NUNCMEE5REMsMHg3NkY5ODhEQSwweDk4M0U1MTUyLDB4QTgzMUM2NkQsMHhCMDAzMjdDOCwweEJGNTk3RkM3LDB4QzZFMDBCRjMsMHhENUE3OTE0NywweDZDQTYzNTEsMHgxNDI5Mjk2NywweDI3QjcwQTg1LDB4MkUxQjIxMzgsMHg0RDJDNkRGQywweDUzMzgwRDEzLDB4NjUwQTczNTQsMHg3NjZBMEFCQiwweDgxQzJDOTJFLDB4OTI3MjJDODUsMHhBMkJGRThBMSwweEE4MUE2NjRCLDB4QzI0QjhCNzAsMHhDNzZDNTFBMywweEQxOTJFODE5LDB4RDY5OTA2MjQsMHhGNDBFMzU4NSwweDEwNkFBMDcwLDB4MTlBNEMxMTYsMHgxRTM3NkMwOCwweDI3NDg3NzRDLDB4MzRCMEJDQjUsMHgzOTFDMENCMywweDRFRDhBQTRBLDB4NUI5Q0NBNEYsMHg2ODJFNkZGMywweDc0OEY4MkVFLDB4NzhBNTYzNkYsMHg4NEM4NzgxNCwweDhDQzcwMjA4LDB4OTBCRUZGRkEsMHhBNDUwNkNFQiwweEJFRjlBM0Y3LDB4QzY3MTc4RjIpO1xuICB2YXIgSEFTSCA9IG5ldyBBcnJheSgweDZBMDlFNjY3LCAweEJCNjdBRTg1LCAweDNDNkVGMzcyLCAweEE1NEZGNTNBLCAweDUxMEU1MjdGLCAweDlCMDU2ODhDLCAweDFGODNEOUFCLCAweDVCRTBDRDE5KTtcbiAgICB2YXIgVyA9IG5ldyBBcnJheSg2NCk7XG4gICAgdmFyIGEsIGIsIGMsIGQsIGUsIGYsIGcsIGgsIGksIGo7XG4gICAgdmFyIFQxLCBUMjtcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cbiAgbVtsID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbCAlIDMyKTtcbiAgbVsoKGwgKyA2NCA+PiA5KSA8PCA0KSArIDE1XSA9IGw7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbS5sZW5ndGg7IGkgKz0gMTYpIHtcbiAgICBhID0gSEFTSFswXTsgYiA9IEhBU0hbMV07IGMgPSBIQVNIWzJdOyBkID0gSEFTSFszXTsgZSA9IEhBU0hbNF07IGYgPSBIQVNIWzVdOyBnID0gSEFTSFs2XTsgaCA9IEhBU0hbN107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCA2NDsgaisrKSB7XG4gICAgICBpZiAoaiA8IDE2KSB7XG4gICAgICAgIFdbal0gPSBtW2ogKyBpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIFdbal0gPSBzYWZlX2FkZChzYWZlX2FkZChzYWZlX2FkZChHYW1tYTEyNTYoV1tqIC0gMl0pLCBXW2ogLSA3XSksIEdhbW1hMDI1NihXW2ogLSAxNV0pKSwgV1tqIC0gMTZdKTtcbiAgICAgIH1cbiAgICAgIFQxID0gc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoaCwgU2lnbWExMjU2KGUpKSwgQ2goZSwgZiwgZykpLCBLW2pdKSwgV1tqXSk7XG4gICAgICBUMiA9IHNhZmVfYWRkKFNpZ21hMDI1NihhKSwgTWFqKGEsIGIsIGMpKTtcbiAgICAgIGggPSBnOyBnID0gZjsgZiA9IGU7IGUgPSBzYWZlX2FkZChkLCBUMSk7IGQgPSBjOyBjID0gYjsgYiA9IGE7IGEgPSBzYWZlX2FkZChUMSwgVDIpO1xuICAgIH1cbiAgICBIQVNIWzBdID0gc2FmZV9hZGQoYSwgSEFTSFswXSk7IEhBU0hbMV0gPSBzYWZlX2FkZChiLCBIQVNIWzFdKTsgSEFTSFsyXSA9IHNhZmVfYWRkKGMsIEhBU0hbMl0pOyBIQVNIWzNdID0gc2FmZV9hZGQoZCwgSEFTSFszXSk7XG4gICAgSEFTSFs0XSA9IHNhZmVfYWRkKGUsIEhBU0hbNF0pOyBIQVNIWzVdID0gc2FmZV9hZGQoZiwgSEFTSFs1XSk7IEhBU0hbNl0gPSBzYWZlX2FkZChnLCBIQVNIWzZdKTsgSEFTSFs3XSA9IHNhZmVfYWRkKGgsIEhBU0hbN10pO1xuICB9XG4gIHJldHVybiBIQVNIO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzaGEyNTYoYnVmKSB7XG4gIHJldHVybiBoZWxwZXJzLmhhc2goYnVmLCBjb3JlX3NoYTI1NiwgMzIsIHRydWUpO1xufTtcbiIsbnVsbCwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB2YXIgcXVldWUgPSBbXTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIGlmIChldi5zb3VyY2UgPT09IHdpbmRvdyAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufVxuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCIoZnVuY3Rpb24gKHNpbm9uQ2hhaSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gTW9kdWxlIHN5c3RlbXMgbWFnaWMgZGFuY2UuXG5cbiAgICBpZiAodHlwZW9mIHJlcXVpcmUgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgIC8vIE5vZGVKU1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHNpbm9uQ2hhaTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRFxuICAgICAgICBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNpbm9uQ2hhaTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gT3RoZXIgZW52aXJvbm1lbnQgKHVzdWFsbHkgPHNjcmlwdD4gdGFnKTogcGx1ZyBpbiB0byBnbG9iYWwgY2hhaSBpbnN0YW5jZSBkaXJlY3RseS5cbiAgICAgICAgY2hhaS51c2Uoc2lub25DaGFpKTtcbiAgICB9XG59KGZ1bmN0aW9uIHNpbm9uQ2hhaShjaGFpLCB1dGlscykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4gICAgZnVuY3Rpb24gaXNTcHkocHV0YXRpdmVTcHkpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwdXRhdGl2ZVNweSA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICAgICB0eXBlb2YgcHV0YXRpdmVTcHkuZ2V0Q2FsbCA9PT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICAgICB0eXBlb2YgcHV0YXRpdmVTcHkuY2FsbGVkV2l0aEV4YWN0bHkgPT09IFwiZnVuY3Rpb25cIjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc0NhbGwocHV0YXRpdmVDYWxsKSB7XG4gICAgICAgIHJldHVybiBwdXRhdGl2ZUNhbGwgJiYgaXNTcHkocHV0YXRpdmVDYWxsLnByb3h5KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc3NlcnRDYW5Xb3JrV2l0aChhc3NlcnRpb24pIHtcbiAgICAgICAgaWYgKCFpc1NweShhc3NlcnRpb24uX29iaikgJiYgIWlzQ2FsbChhc3NlcnRpb24uX29iaikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IodXRpbHMuaW5zcGVjdChhc3NlcnRpb24uX29iaikgKyBcIiBpcyBub3QgYSBzcHkgb3IgYSBjYWxsIHRvIGEgc3B5IVwiKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldE1lc3NhZ2VzKHNweSwgYWN0aW9uLCBub25OZWdhdGVkU3VmZml4LCBhbHdheXMsIGFyZ3MpIHtcbiAgICAgICAgdmFyIHZlcmJQaHJhc2UgPSBhbHdheXMgPyBcImFsd2F5cyBoYXZlIFwiIDogXCJoYXZlIFwiO1xuICAgICAgICBub25OZWdhdGVkU3VmZml4ID0gbm9uTmVnYXRlZFN1ZmZpeCB8fCBcIlwiO1xuICAgICAgICBpZiAoaXNTcHkoc3B5LnByb3h5KSkge1xuICAgICAgICAgICAgc3B5ID0gc3B5LnByb3h5O1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcHJpbnRmQXJyYXkoYXJyYXkpIHtcbiAgICAgICAgICAgIHJldHVybiBzcHkucHJpbnRmLmFwcGx5KHNweSwgYXJyYXkpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGFmZmlybWF0aXZlOiBwcmludGZBcnJheShbXCJleHBlY3RlZCAlbiB0byBcIiArIHZlcmJQaHJhc2UgKyBhY3Rpb24gKyBub25OZWdhdGVkU3VmZml4XS5jb25jYXQoYXJncykpLFxuICAgICAgICAgICAgbmVnYXRpdmU6IHByaW50ZkFycmF5KFtcImV4cGVjdGVkICVuIHRvIG5vdCBcIiArIHZlcmJQaHJhc2UgKyBhY3Rpb25dLmNvbmNhdChhcmdzKSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaW5vblByb3BlcnR5KG5hbWUsIGFjdGlvbiwgbm9uTmVnYXRlZFN1ZmZpeCkge1xuICAgICAgICB1dGlscy5hZGRQcm9wZXJ0eShjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUsIG5hbWUsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFzc2VydENhbldvcmtXaXRoKHRoaXMpO1xuXG4gICAgICAgICAgICB2YXIgbWVzc2FnZXMgPSBnZXRNZXNzYWdlcyh0aGlzLl9vYmosIGFjdGlvbiwgbm9uTmVnYXRlZFN1ZmZpeCwgZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5hc3NlcnQodGhpcy5fb2JqW25hbWVdLCBtZXNzYWdlcy5hZmZpcm1hdGl2ZSwgbWVzc2FnZXMubmVnYXRpdmUpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVTaW5vbk1ldGhvZEhhbmRsZXIoc2lub25OYW1lLCBhY3Rpb24sIG5vbk5lZ2F0ZWRTdWZmaXgpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGFzc2VydENhbldvcmtXaXRoKHRoaXMpO1xuXG4gICAgICAgICAgICB2YXIgYWx3YXlzU2lub25NZXRob2QgPSBcImFsd2F5c1wiICsgc2lub25OYW1lWzBdLnRvVXBwZXJDYXNlKCkgKyBzaW5vbk5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgdmFyIHNob3VsZEJlQWx3YXlzID0gdXRpbHMuZmxhZyh0aGlzLCBcImFsd2F5c1wiKSAmJiB0eXBlb2YgdGhpcy5fb2JqW2Fsd2F5c1Npbm9uTWV0aG9kXSA9PT0gXCJmdW5jdGlvblwiO1xuICAgICAgICAgICAgdmFyIHNpbm9uTWV0aG9kID0gc2hvdWxkQmVBbHdheXMgPyBhbHdheXNTaW5vbk1ldGhvZCA6IHNpbm9uTmFtZTtcblxuICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gZ2V0TWVzc2FnZXModGhpcy5fb2JqLCBhY3Rpb24sIG5vbk5lZ2F0ZWRTdWZmaXgsIHNob3VsZEJlQWx3YXlzLCBzbGljZS5jYWxsKGFyZ3VtZW50cykpO1xuICAgICAgICAgICAgdGhpcy5hc3NlcnQodGhpcy5fb2JqW3Npbm9uTWV0aG9kXS5hcHBseSh0aGlzLl9vYmosIGFyZ3VtZW50cyksIG1lc3NhZ2VzLmFmZmlybWF0aXZlLCBtZXNzYWdlcy5uZWdhdGl2ZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2lub25NZXRob2RBc1Byb3BlcnR5KG5hbWUsIGFjdGlvbiwgbm9uTmVnYXRlZFN1ZmZpeCkge1xuICAgICAgICB2YXIgaGFuZGxlciA9IGNyZWF0ZVNpbm9uTWV0aG9kSGFuZGxlcihuYW1lLCBhY3Rpb24sIG5vbk5lZ2F0ZWRTdWZmaXgpO1xuICAgICAgICB1dGlscy5hZGRQcm9wZXJ0eShjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUsIG5hbWUsIGhhbmRsZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4Y2VwdGlvbmFsU2lub25NZXRob2QoY2hhaU5hbWUsIHNpbm9uTmFtZSwgYWN0aW9uLCBub25OZWdhdGVkU3VmZml4KSB7XG4gICAgICAgIHZhciBoYW5kbGVyID0gY3JlYXRlU2lub25NZXRob2RIYW5kbGVyKHNpbm9uTmFtZSwgYWN0aW9uLCBub25OZWdhdGVkU3VmZml4KTtcbiAgICAgICAgdXRpbHMuYWRkTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgY2hhaU5hbWUsIGhhbmRsZXIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNpbm9uTWV0aG9kKG5hbWUsIGFjdGlvbiwgbm9uTmVnYXRlZFN1ZmZpeCkge1xuICAgICAgICBleGNlcHRpb25hbFNpbm9uTWV0aG9kKG5hbWUsIG5hbWUsIGFjdGlvbiwgbm9uTmVnYXRlZFN1ZmZpeCk7XG4gICAgfVxuXG4gICAgdXRpbHMuYWRkUHJvcGVydHkoY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLCBcImFsd2F5c1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHV0aWxzLmZsYWcodGhpcywgXCJhbHdheXNcIiwgdHJ1ZSk7XG4gICAgfSk7XG5cbiAgICBzaW5vblByb3BlcnR5KFwiY2FsbGVkXCIsIFwiYmVlbiBjYWxsZWRcIiwgXCIgYXQgbGVhc3Qgb25jZSwgYnV0IGl0IHdhcyBuZXZlciBjYWxsZWRcIik7XG4gICAgc2lub25Qcm9wZXJ0eShcImNhbGxlZE9uY2VcIiwgXCJiZWVuIGNhbGxlZCBleGFjdGx5IG9uY2VcIiwgXCIsIGJ1dCBpdCB3YXMgY2FsbGVkICVjJUNcIik7XG4gICAgc2lub25Qcm9wZXJ0eShcImNhbGxlZFR3aWNlXCIsIFwiYmVlbiBjYWxsZWQgZXhhY3RseSB0d2ljZVwiLCBcIiwgYnV0IGl0IHdhcyBjYWxsZWQgJWMlQ1wiKTtcbiAgICBzaW5vblByb3BlcnR5KFwiY2FsbGVkVGhyaWNlXCIsIFwiYmVlbiBjYWxsZWQgZXhhY3RseSB0aHJpY2VcIiwgXCIsIGJ1dCBpdCB3YXMgY2FsbGVkICVjJUNcIik7XG4gICAgc2lub25NZXRob2RBc1Byb3BlcnR5KFwiY2FsbGVkV2l0aE5ld1wiLCBcImJlZW4gY2FsbGVkIHdpdGggbmV3XCIpO1xuICAgIHNpbm9uTWV0aG9kKFwiY2FsbGVkQmVmb3JlXCIsIFwiYmVlbiBjYWxsZWQgYmVmb3JlICUxXCIpO1xuICAgIHNpbm9uTWV0aG9kKFwiY2FsbGVkQWZ0ZXJcIiwgXCJiZWVuIGNhbGxlZCBhZnRlciAlMVwiKTtcbiAgICBzaW5vbk1ldGhvZChcImNhbGxlZE9uXCIsIFwiYmVlbiBjYWxsZWQgd2l0aCAlMSBhcyB0aGlzXCIsIFwiLCBidXQgaXQgd2FzIGNhbGxlZCB3aXRoICV0IGluc3RlYWRcIik7XG4gICAgc2lub25NZXRob2QoXCJjYWxsZWRXaXRoXCIsIFwiYmVlbiBjYWxsZWQgd2l0aCBhcmd1bWVudHMgJSpcIiwgXCIlQ1wiKTtcbiAgICBzaW5vbk1ldGhvZChcImNhbGxlZFdpdGhFeGFjdGx5XCIsIFwiYmVlbiBjYWxsZWQgd2l0aCBleGFjdCBhcmd1bWVudHMgJSpcIiwgXCIlQ1wiKTtcbiAgICBzaW5vbk1ldGhvZChcImNhbGxlZFdpdGhNYXRjaFwiLCBcImJlZW4gY2FsbGVkIHdpdGggYXJndW1lbnRzIG1hdGNoaW5nICUqXCIsIFwiJUNcIik7XG4gICAgc2lub25NZXRob2QoXCJyZXR1cm5lZFwiLCBcInJldHVybmVkICUxXCIpO1xuICAgIGV4Y2VwdGlvbmFsU2lub25NZXRob2QoXCJ0aHJvd25cIiwgXCJ0aHJld1wiLCBcInRocm93biAlMVwiKTtcbn0pKTtcbiIsIi8qanNsaW50IGVxZXFlcTogZmFsc2UsIG9uZXZhcjogZmFsc2UsIGZvcmluOiB0cnVlLCBub21lbjogZmFsc2UsIHJlZ2V4cDogZmFsc2UsIHBsdXNwbHVzOiBmYWxzZSovXG4vKmdsb2JhbCBtb2R1bGUsIHJlcXVpcmUsIF9fZGlybmFtZSwgZG9jdW1lbnQqL1xuLyoqXG4gKiBTaW5vbiBjb3JlIHV0aWxpdGllcy4gRm9yIGludGVybmFsIHVzZSBvbmx5LlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0aWFuIEpvaGFuc2VuIChjaHJpc3RpYW5AY2pvaGFuc2VuLm5vKVxuICogQGxpY2Vuc2UgQlNEXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgQ2hyaXN0aWFuIEpvaGFuc2VuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG52YXIgc2lub24gPSAoZnVuY3Rpb24gKGJ1c3Rlcikge1xuICAgIHZhciBkaXYgPSB0eXBlb2YgZG9jdW1lbnQgIT0gXCJ1bmRlZmluZWRcIiAmJiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHZhciBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gICAgZnVuY3Rpb24gaXNET01Ob2RlKG9iaikge1xuICAgICAgICB2YXIgc3VjY2VzcyA9IGZhbHNlO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBvYmouYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgICAgIHN1Y2Nlc3MgPSBkaXYucGFyZW50Tm9kZSA9PSBvYmo7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgb2JqLnJlbW92ZUNoaWxkKGRpdik7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGZhaWxlZCwgbm90IG11Y2ggd2UgY2FuIGRvIGFib3V0IHRoYXRcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzdWNjZXNzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRWxlbWVudChvYmopIHtcbiAgICAgICAgcmV0dXJuIGRpdiAmJiBvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxICYmIGlzRE9NTm9kZShvYmopO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzRnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgfHwgISEob2JqICYmIG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY2FsbCAmJiBvYmouYXBwbHkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1pcnJvclByb3BlcnRpZXModGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgIGlmICghaGFzT3duLmNhbGwodGFyZ2V0LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IHNvdXJjZVtwcm9wXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzUmVzdG9yYWJsZSAob2JqKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIG9iai5yZXN0b3JlID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLnJlc3RvcmUuc2lub247XG4gICAgfVxuXG4gICAgdmFyIHNpbm9uID0ge1xuICAgICAgICB3cmFwTWV0aG9kOiBmdW5jdGlvbiB3cmFwTWV0aG9kKG9iamVjdCwgcHJvcGVydHksIG1ldGhvZCkge1xuICAgICAgICAgICAgaWYgKCFvYmplY3QpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU2hvdWxkIHdyYXAgcHJvcGVydHkgb2Ygb2JqZWN0XCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTWV0aG9kIHdyYXBwZXIgc2hvdWxkIGJlIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgd3JhcHBlZE1ldGhvZCA9IG9iamVjdFtwcm9wZXJ0eV07XG5cbiAgICAgICAgICAgIGlmICghaXNGdW5jdGlvbih3cmFwcGVkTWV0aG9kKSkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBdHRlbXB0ZWQgdG8gd3JhcCBcIiArICh0eXBlb2Ygd3JhcHBlZE1ldGhvZCkgKyBcIiBwcm9wZXJ0eSBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eSArIFwiIGFzIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlZE1ldGhvZC5yZXN0b3JlICYmIHdyYXBwZWRNZXRob2QucmVzdG9yZS5zaW5vbikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBdHRlbXB0ZWQgdG8gd3JhcCBcIiArIHByb3BlcnR5ICsgXCIgd2hpY2ggaXMgYWxyZWFkeSB3cmFwcGVkXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAod3JhcHBlZE1ldGhvZC5jYWxsZWRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmVyYiA9ICEhd3JhcHBlZE1ldGhvZC5yZXR1cm5zID8gXCJzdHViYmVkXCIgOiBcInNwaWVkIG9uXCI7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkF0dGVtcHRlZCB0byB3cmFwIFwiICsgcHJvcGVydHkgKyBcIiB3aGljaCBpcyBhbHJlYWR5IFwiICsgdmVyYik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElFIDggZG9lcyBub3Qgc3VwcG9ydCBoYXNPd25Qcm9wZXJ0eSBvbiB0aGUgd2luZG93IG9iamVjdC5cbiAgICAgICAgICAgIHZhciBvd25lZCA9IGhhc093bi5jYWxsKG9iamVjdCwgcHJvcGVydHkpO1xuICAgICAgICAgICAgb2JqZWN0W3Byb3BlcnR5XSA9IG1ldGhvZDtcbiAgICAgICAgICAgIG1ldGhvZC5kaXNwbGF5TmFtZSA9IHByb3BlcnR5O1xuXG4gICAgICAgICAgICBtZXRob2QucmVzdG9yZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAvLyBGb3IgcHJvdG90eXBlIHByb3BlcnRpZXMgdHJ5IHRvIHJlc2V0IGJ5IGRlbGV0ZSBmaXJzdC5cbiAgICAgICAgICAgICAgICAvLyBJZiB0aGlzIGZhaWxzIChleDogbG9jYWxTdG9yYWdlIG9uIG1vYmlsZSBzYWZhcmkpIHRoZW4gZm9yY2UgYSByZXNldFxuICAgICAgICAgICAgICAgIC8vIHZpYSBkaXJlY3QgYXNzaWdubWVudC5cbiAgICAgICAgICAgICAgICBpZiAoIW93bmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBvYmplY3RbcHJvcGVydHldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2JqZWN0W3Byb3BlcnR5XSA9PT0gbWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgICAgIG9iamVjdFtwcm9wZXJ0eV0gPSB3cmFwcGVkTWV0aG9kO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG1ldGhvZC5yZXN0b3JlLnNpbm9uID0gdHJ1ZTtcbiAgICAgICAgICAgIG1pcnJvclByb3BlcnRpZXMobWV0aG9kLCB3cmFwcGVkTWV0aG9kKTtcblxuICAgICAgICAgICAgcmV0dXJuIG1ldGhvZDtcbiAgICAgICAgfSxcblxuICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxLCBsID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldFtwcm9wXSA9IGFyZ3VtZW50c1tpXVtwcm9wXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vIERPTlQgRU5VTSBidWcsIG9ubHkgY2FyZSBhYm91dCB0b1N0cmluZ1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJndW1lbnRzW2ldLmhhc093blByb3BlcnR5KFwidG9TdHJpbmdcIikgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3VtZW50c1tpXS50b1N0cmluZyAhPSB0YXJnZXQudG9TdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhcmdldC50b1N0cmluZyA9IGFyZ3VtZW50c1tpXS50b1N0cmluZztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShwcm90bykge1xuICAgICAgICAgICAgdmFyIEYgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgIEYucHJvdG90eXBlID0gcHJvdG87XG4gICAgICAgICAgICByZXR1cm4gbmV3IEYoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZWVwRXF1YWw6IGZ1bmN0aW9uIGRlZXBFcXVhbChhLCBiKSB7XG4gICAgICAgICAgICBpZiAoc2lub24ubWF0Y2ggJiYgc2lub24ubWF0Y2guaXNNYXRjaGVyKGEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEudGVzdChiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgYSAhPSBcIm9iamVjdFwiIHx8IHR5cGVvZiBiICE9IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGlzRWxlbWVudChhKSB8fCBpc0VsZW1lbnQoYikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYSA9PT0gYjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChhID09PSBudWxsICYmIGIgIT09IG51bGwpIHx8IChhICE9PSBudWxsICYmIGIgPT09IG51bGwpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYVN0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKTtcbiAgICAgICAgICAgIGlmIChhU3RyaW5nICE9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChiKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFTdHJpbmcgPT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhLmxlbmd0aDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWRlZXBFcXVhbChhW2ldLCBiW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChhU3RyaW5nID09IFwiW29iamVjdCBEYXRlXVwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGEudmFsdWVPZigpID09PSBiLnZhbHVlT2YoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHByb3AsIGFMZW5ndGggPSAwLCBiTGVuZ3RoID0gMDtcblxuICAgICAgICAgICAgZm9yIChwcm9wIGluIGEpIHtcbiAgICAgICAgICAgICAgICBhTGVuZ3RoICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWRlZXBFcXVhbChhW3Byb3BdLCBiW3Byb3BdKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHByb3AgaW4gYikge1xuICAgICAgICAgICAgICAgIGJMZW5ndGggKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGFMZW5ndGggPT0gYkxlbmd0aDtcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmdW5jKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IGZ1bmMuZGlzcGxheU5hbWUgfHwgZnVuYy5uYW1lO1xuXG4gICAgICAgICAgICAvLyBVc2UgZnVuY3Rpb24gZGVjb21wb3NpdGlvbiBhcyBhIGxhc3QgcmVzb3J0IHRvIGdldCBmdW5jdGlvblxuICAgICAgICAgICAgLy8gbmFtZS4gRG9lcyBub3QgcmVseSBvbiBmdW5jdGlvbiBkZWNvbXBvc2l0aW9uIHRvIHdvcmsgLSBpZiBpdFxuICAgICAgICAgICAgLy8gZG9lc24ndCBkZWJ1Z2dpbmcgd2lsbCBiZSBzbGlnaHRseSBsZXNzIGluZm9ybWF0aXZlXG4gICAgICAgICAgICAvLyAoaS5lLiB0b1N0cmluZyB3aWxsIHNheSAnc3B5JyByYXRoZXIgdGhhbiAnbXlGdW5jJykuXG4gICAgICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IGZ1bmMudG9TdHJpbmcoKS5tYXRjaCgvZnVuY3Rpb24gKFteXFxzXFwoXSspLyk7XG4gICAgICAgICAgICAgICAgbmFtZSA9IG1hdGNoZXMgJiYgbWF0Y2hlc1sxXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb25Ub1N0cmluZzogZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRDYWxsICYmIHRoaXMuY2FsbENvdW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIHRoaXNWYWx1ZSwgcHJvcCwgaSA9IHRoaXMuY2FsbENvdW50O1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzVmFsdWUgPSB0aGlzLmdldENhbGwoaSkudGhpc1ZhbHVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAocHJvcCBpbiB0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzVmFsdWVbcHJvcF0gPT09IHRoaXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcHJvcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGlzcGxheU5hbWUgfHwgXCJzaW5vbiBmYWtlXCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q29uZmlnOiBmdW5jdGlvbiAoY3VzdG9tKSB7XG4gICAgICAgICAgICB2YXIgY29uZmlnID0ge307XG4gICAgICAgICAgICBjdXN0b20gPSBjdXN0b20gfHwge307XG4gICAgICAgICAgICB2YXIgZGVmYXVsdHMgPSBzaW5vbi5kZWZhdWx0Q29uZmlnO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBwcm9wIGluIGRlZmF1bHRzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRlZmF1bHRzLmhhc093blByb3BlcnR5KHByb3ApKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZ1twcm9wXSA9IGN1c3RvbS5oYXNPd25Qcm9wZXJ0eShwcm9wKSA/IGN1c3RvbVtwcm9wXSA6IGRlZmF1bHRzW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICAgICAgfSxcblxuICAgICAgICBmb3JtYXQ6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiICsgdmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRlZmF1bHRDb25maWc6IHtcbiAgICAgICAgICAgIGluamVjdEludG9UaGlzOiB0cnVlLFxuICAgICAgICAgICAgaW5qZWN0SW50bzogbnVsbCxcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IFtcInNweVwiLCBcInN0dWJcIiwgXCJtb2NrXCIsIFwiY2xvY2tcIiwgXCJzZXJ2ZXJcIiwgXCJyZXF1ZXN0c1wiXSxcbiAgICAgICAgICAgIHVzZUZha2VUaW1lcnM6IHRydWUsXG4gICAgICAgICAgICB1c2VGYWtlU2VydmVyOiB0cnVlXG4gICAgICAgIH0sXG5cbiAgICAgICAgdGltZXNJbldvcmRzOiBmdW5jdGlvbiB0aW1lc0luV29yZHMoY291bnQpIHtcbiAgICAgICAgICAgIHJldHVybiBjb3VudCA9PSAxICYmIFwib25jZVwiIHx8XG4gICAgICAgICAgICAgICAgY291bnQgPT0gMiAmJiBcInR3aWNlXCIgfHxcbiAgICAgICAgICAgICAgICBjb3VudCA9PSAzICYmIFwidGhyaWNlXCIgfHxcbiAgICAgICAgICAgICAgICAoY291bnQgfHwgMCkgKyBcIiB0aW1lc1wiO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxlZEluT3JkZXI6IGZ1bmN0aW9uIChzcGllcykge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSBzcGllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNwaWVzW2kgLSAxXS5jYWxsZWRCZWZvcmUoc3BpZXNbaV0pIHx8ICFzcGllc1tpXS5jYWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb3JkZXJCeUZpcnN0Q2FsbDogZnVuY3Rpb24gKHNwaWVzKSB7XG4gICAgICAgICAgICByZXR1cm4gc3BpZXMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIC8vIHV1aWQsIHdvbid0IGV2ZXIgYmUgZXF1YWxcbiAgICAgICAgICAgICAgICB2YXIgYUNhbGwgPSBhLmdldENhbGwoMCk7XG4gICAgICAgICAgICAgICAgdmFyIGJDYWxsID0gYi5nZXRDYWxsKDApO1xuICAgICAgICAgICAgICAgIHZhciBhSWQgPSBhQ2FsbCAmJiBhQ2FsbC5jYWxsSWQgfHwgLTE7XG4gICAgICAgICAgICAgICAgdmFyIGJJZCA9IGJDYWxsICYmIGJDYWxsLmNhbGxJZCB8fCAtMTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBhSWQgPCBiSWQgPyAtMSA6IDE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBsb2c6IGZ1bmN0aW9uICgpIHt9LFxuXG4gICAgICAgIGxvZ0Vycm9yOiBmdW5jdGlvbiAobGFiZWwsIGVycikge1xuICAgICAgICAgICAgdmFyIG1zZyA9IGxhYmVsICsgXCIgdGhyZXcgZXhjZXB0aW9uOiBcIlxuICAgICAgICAgICAgc2lub24ubG9nKG1zZyArIFwiW1wiICsgZXJyLm5hbWUgKyBcIl0gXCIgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICBpZiAoZXJyLnN0YWNrKSB7IHNpbm9uLmxvZyhlcnIuc3RhY2spOyB9XG5cbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGVyci5tZXNzYWdlID0gbXNnICsgZXJyLm1lc3NhZ2U7XG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdHlwZU9mOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIm51bGxcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJ1bmRlZmluZWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICAgICAgICAgICAgcmV0dXJuIHN0cmluZy5zdWJzdHJpbmcoOCwgc3RyaW5nLmxlbmd0aCAtIDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlU3R1Ykluc3RhbmNlOiBmdW5jdGlvbiAoY29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc3RydWN0b3IgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUaGUgY29uc3RydWN0b3Igc2hvdWxkIGJlIGEgZnVuY3Rpb24uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHNpbm9uLnN0dWIoc2lub24uY3JlYXRlKGNvbnN0cnVjdG9yLnByb3RvdHlwZSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChvYmplY3QgIT09IG51bGwgJiYgdHlwZW9mIG9iamVjdCA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gb2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1Jlc3RvcmFibGUob2JqZWN0W3Byb3BdKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W3Byb3BdLnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGlzUmVzdG9yYWJsZShvYmplY3QpKSB7XG4gICAgICAgICAgICAgICAgb2JqZWN0LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgaXNOb2RlID0gdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIjtcblxuICAgIGlmIChpc05vZGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJ1c3RlciA9IHsgZm9ybWF0OiByZXF1aXJlKFwiYnVzdGVyLWZvcm1hdFwiKSB9O1xuICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHNpbm9uO1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5zcHkgPSByZXF1aXJlKFwiLi9zaW5vbi9zcHlcIik7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzLnN0dWIgPSByZXF1aXJlKFwiLi9zaW5vbi9zdHViXCIpO1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5tb2NrID0gcmVxdWlyZShcIi4vc2lub24vbW9ja1wiKTtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMuY29sbGVjdGlvbiA9IHJlcXVpcmUoXCIuL3Npbm9uL2NvbGxlY3Rpb25cIik7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzLmFzc2VydCA9IHJlcXVpcmUoXCIuL3Npbm9uL2Fzc2VydFwiKTtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMuc2FuZGJveCA9IHJlcXVpcmUoXCIuL3Npbm9uL3NhbmRib3hcIik7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzLnRlc3QgPSByZXF1aXJlKFwiLi9zaW5vbi90ZXN0XCIpO1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy50ZXN0Q2FzZSA9IHJlcXVpcmUoXCIuL3Npbm9uL3Rlc3RfY2FzZVwiKTtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMuYXNzZXJ0ID0gcmVxdWlyZShcIi4vc2lub24vYXNzZXJ0XCIpO1xuICAgICAgICBtb2R1bGUuZXhwb3J0cy5tYXRjaCA9IHJlcXVpcmUoXCIuL3Npbm9uL21hdGNoXCIpO1xuICAgIH1cblxuICAgIGlmIChidXN0ZXIpIHtcbiAgICAgICAgdmFyIGZvcm1hdHRlciA9IHNpbm9uLmNyZWF0ZShidXN0ZXIuZm9ybWF0KTtcbiAgICAgICAgZm9ybWF0dGVyLnF1b3RlU3RyaW5ncyA9IGZhbHNlO1xuICAgICAgICBzaW5vbi5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0dGVyLmFzY2lpLmFwcGx5KGZvcm1hdHRlciwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKGlzTm9kZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdmFyIHV0aWwgPSByZXF1aXJlKFwidXRpbFwiKTtcbiAgICAgICAgICAgIHNpbm9uLmZvcm1hdCA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIiAmJiB2YWx1ZS50b1N0cmluZyA9PT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZyA/IHV0aWwuaW5zcGVjdCh2YWx1ZSkgOiB2YWx1ZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIC8qIE5vZGUsIGJ1dCBubyB1dGlsIG1vZHVsZSAtIHdvdWxkIGJlIHZlcnkgb2xkLCBidXQgYmV0dGVyIHNhZmUgdGhhblxuICAgICAgICAgICAgIHNvcnJ5ICovXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2lub247XG59KHR5cGVvZiBidXN0ZXIgPT0gXCJvYmplY3RcIiAmJiBidXN0ZXIpKTtcbiIsInZhciBnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qKlxuICogQGRlcGVuZCAuLi9zaW5vbi5qc1xuICogQGRlcGVuZCBzdHViLmpzXG4gKi9cbi8qanNsaW50IGVxZXFlcTogZmFsc2UsIG9uZXZhcjogZmFsc2UsIG5vbWVuOiBmYWxzZSwgcGx1c3BsdXM6IGZhbHNlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgc2lub24qL1xuLyoqXG4gKiBBc3NlcnRpb25zIG1hdGNoaW5nIHRoZSB0ZXN0IHNweSByZXRyaWV2YWwgaW50ZXJmYWNlLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0aWFuIEpvaGFuc2VuIChjaHJpc3RpYW5AY2pvaGFuc2VuLm5vKVxuICogQGxpY2Vuc2UgQlNEXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgQ2hyaXN0aWFuIEpvaGFuc2VuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKHNpbm9uLCBnbG9iYWwpIHtcbiAgICB2YXIgY29tbW9uSlNNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiO1xuICAgIHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbiAgICB2YXIgYXNzZXJ0O1xuXG4gICAgaWYgKCFzaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgICAgICBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNpbm9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2ZXJpZnlJc1N0dWIoKSB7XG4gICAgICAgIHZhciBtZXRob2Q7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBtZXRob2QgPSBhcmd1bWVudHNbaV07XG5cbiAgICAgICAgICAgIGlmICghbWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmZhaWwoXCJmYWtlIGlzIG5vdCBhIHNweVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmZhaWwobWV0aG9kICsgXCIgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWV0aG9kLmdldENhbGwgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LmZhaWwobWV0aG9kICsgXCIgaXMgbm90IHN0dWJiZWRcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmYWlsQXNzZXJ0aW9uKG9iamVjdCwgbXNnKSB7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBnbG9iYWw7XG4gICAgICAgIHZhciBmYWlsTWV0aG9kID0gb2JqZWN0LmZhaWwgfHwgYXNzZXJ0LmZhaWw7XG4gICAgICAgIGZhaWxNZXRob2QuY2FsbChvYmplY3QsIG1zZyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWlycm9yUHJvcEFzQXNzZXJ0aW9uKG5hbWUsIG1ldGhvZCwgbWVzc2FnZSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gbWV0aG9kO1xuICAgICAgICAgICAgbWV0aG9kID0gbmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFzc2VydFtuYW1lXSA9IGZ1bmN0aW9uIChmYWtlKSB7XG4gICAgICAgICAgICB2ZXJpZnlJc1N0dWIoZmFrZSk7XG5cbiAgICAgICAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgdmFyIGZhaWxlZCA9IGZhbHNlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIG1ldGhvZCA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBmYWlsZWQgPSAhbWV0aG9kKGZha2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmYWlsZWQgPSB0eXBlb2YgZmFrZVttZXRob2RdID09IFwiZnVuY3Rpb25cIiA/XG4gICAgICAgICAgICAgICAgICAgICFmYWtlW21ldGhvZF0uYXBwbHkoZmFrZSwgYXJncykgOiAhZmFrZVttZXRob2RdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgZmFpbEFzc2VydGlvbih0aGlzLCBmYWtlLnByaW50Zi5hcHBseShmYWtlLCBbbWVzc2FnZV0uY29uY2F0KGFyZ3MpKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydC5wYXNzKG5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGV4cG9zZWROYW1lKHByZWZpeCwgcHJvcCkge1xuICAgICAgICByZXR1cm4gIXByZWZpeCB8fCAvXmZhaWwvLnRlc3QocHJvcCkgPyBwcm9wIDpcbiAgICAgICAgICAgIHByZWZpeCArIHByb3Auc2xpY2UoMCwgMSkudG9VcHBlckNhc2UoKSArIHByb3Auc2xpY2UoMSk7XG4gICAgfTtcblxuICAgIGFzc2VydCA9IHtcbiAgICAgICAgZmFpbEV4Y2VwdGlvbjogXCJBc3NlcnRFcnJvclwiLFxuXG4gICAgICAgIGZhaWw6IGZ1bmN0aW9uIGZhaWwobWVzc2FnZSkge1xuICAgICAgICAgICAgdmFyIGVycm9yID0gbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgZXJyb3IubmFtZSA9IHRoaXMuZmFpbEV4Y2VwdGlvbiB8fCBhc3NlcnQuZmFpbEV4Y2VwdGlvbjtcblxuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcGFzczogZnVuY3Rpb24gcGFzcyhhc3NlcnRpb24pIHt9LFxuXG4gICAgICAgIGNhbGxPcmRlcjogZnVuY3Rpb24gYXNzZXJ0Q2FsbE9yZGVyKCkge1xuICAgICAgICAgICAgdmVyaWZ5SXNTdHViLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB2YXIgZXhwZWN0ZWQgPSBcIlwiLCBhY3R1YWwgPSBcIlwiO1xuXG4gICAgICAgICAgICBpZiAoIXNpbm9uLmNhbGxlZEluT3JkZXIoYXJndW1lbnRzKSkge1xuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cGVjdGVkID0gW10uam9pbi5jYWxsKGFyZ3VtZW50cywgXCIsIFwiKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNhbGxzID0gc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IGNhbGxzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgd2hpbGUgKGkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2FsbHNbLS1pXS5jYWxsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxscy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYWN0dWFsID0gc2lub24ub3JkZXJCeUZpcnN0Q2FsbChjYWxscykuam9pbihcIiwgXCIpO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhpcyBmYWlscywgd2UnbGwganVzdCBmYWxsIGJhY2sgdG8gdGhlIGJsYW5rIHN0cmluZ1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZhaWxBc3NlcnRpb24odGhpcywgXCJleHBlY3RlZCBcIiArIGV4cGVjdGVkICsgXCIgdG8gYmUgXCIgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJjYWxsZWQgaW4gb3JkZXIgYnV0IHdlcmUgY2FsbGVkIGFzIFwiICsgYWN0dWFsKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0LnBhc3MoXCJjYWxsT3JkZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbENvdW50OiBmdW5jdGlvbiBhc3NlcnRDYWxsQ291bnQobWV0aG9kLCBjb3VudCkge1xuICAgICAgICAgICAgdmVyaWZ5SXNTdHViKG1ldGhvZCk7XG5cbiAgICAgICAgICAgIGlmIChtZXRob2QuY2FsbENvdW50ICE9IGNvdW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1zZyA9IFwiZXhwZWN0ZWQgJW4gdG8gYmUgY2FsbGVkIFwiICsgc2lub24udGltZXNJbldvcmRzKGNvdW50KSArXG4gICAgICAgICAgICAgICAgICAgIFwiIGJ1dCB3YXMgY2FsbGVkICVjJUNcIjtcbiAgICAgICAgICAgICAgICBmYWlsQXNzZXJ0aW9uKHRoaXMsIG1ldGhvZC5wcmludGYobXNnKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGFzc2VydC5wYXNzKFwiY2FsbENvdW50XCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGV4cG9zZTogZnVuY3Rpb24gZXhwb3NlKHRhcmdldCwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwidGFyZ2V0IGlzIG51bGwgb3IgdW5kZWZpbmVkXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICB2YXIgcHJlZml4ID0gdHlwZW9mIG8ucHJlZml4ID09IFwidW5kZWZpbmVkXCIgJiYgXCJhc3NlcnRcIiB8fCBvLnByZWZpeDtcbiAgICAgICAgICAgIHZhciBpbmNsdWRlRmFpbCA9IHR5cGVvZiBvLmluY2x1ZGVGYWlsID09IFwidW5kZWZpbmVkXCIgfHwgISFvLmluY2x1ZGVGYWlsO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBtZXRob2QgaW4gdGhpcykge1xuICAgICAgICAgICAgICAgIGlmIChtZXRob2QgIT0gXCJleHBvcnRcIiAmJiAoaW5jbHVkZUZhaWwgfHwgIS9eKGZhaWwpLy50ZXN0KG1ldGhvZCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldFtleHBvc2VkTmFtZShwcmVmaXgsIG1ldGhvZCldID0gdGhpc1ttZXRob2RdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBtaXJyb3JQcm9wQXNBc3NlcnRpb24oXCJjYWxsZWRcIiwgXCJleHBlY3RlZCAlbiB0byBoYXZlIGJlZW4gY2FsbGVkIGF0IGxlYXN0IG9uY2UgYnV0IHdhcyBuZXZlciBjYWxsZWRcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwibm90Q2FsbGVkXCIsIGZ1bmN0aW9uIChzcHkpIHsgcmV0dXJuICFzcHkuY2FsbGVkOyB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImV4cGVjdGVkICVuIHRvIG5vdCBoYXZlIGJlZW4gY2FsbGVkIGJ1dCB3YXMgY2FsbGVkICVjJUNcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiY2FsbGVkT25jZVwiLCBcImV4cGVjdGVkICVuIHRvIGJlIGNhbGxlZCBvbmNlIGJ1dCB3YXMgY2FsbGVkICVjJUNcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiY2FsbGVkVHdpY2VcIiwgXCJleHBlY3RlZCAlbiB0byBiZSBjYWxsZWQgdHdpY2UgYnV0IHdhcyBjYWxsZWQgJWMlQ1wiKTtcbiAgICBtaXJyb3JQcm9wQXNBc3NlcnRpb24oXCJjYWxsZWRUaHJpY2VcIiwgXCJleHBlY3RlZCAlbiB0byBiZSBjYWxsZWQgdGhyaWNlIGJ1dCB3YXMgY2FsbGVkICVjJUNcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiY2FsbGVkT25cIiwgXCJleHBlY3RlZCAlbiB0byBiZSBjYWxsZWQgd2l0aCAlMSBhcyB0aGlzIGJ1dCB3YXMgY2FsbGVkIHdpdGggJXRcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiYWx3YXlzQ2FsbGVkT25cIiwgXCJleHBlY3RlZCAlbiB0byBhbHdheXMgYmUgY2FsbGVkIHdpdGggJTEgYXMgdGhpcyBidXQgd2FzIGNhbGxlZCB3aXRoICV0XCIpO1xuICAgIG1pcnJvclByb3BBc0Fzc2VydGlvbihcImNhbGxlZFdpdGhOZXdcIiwgXCJleHBlY3RlZCAlbiB0byBiZSBjYWxsZWQgd2l0aCBuZXdcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiYWx3YXlzQ2FsbGVkV2l0aE5ld1wiLCBcImV4cGVjdGVkICVuIHRvIGFsd2F5cyBiZSBjYWxsZWQgd2l0aCBuZXdcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiY2FsbGVkV2l0aFwiLCBcImV4cGVjdGVkICVuIHRvIGJlIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyAlKiVDXCIpO1xuICAgIG1pcnJvclByb3BBc0Fzc2VydGlvbihcImNhbGxlZFdpdGhNYXRjaFwiLCBcImV4cGVjdGVkICVuIHRvIGJlIGNhbGxlZCB3aXRoIG1hdGNoICUqJUNcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiYWx3YXlzQ2FsbGVkV2l0aFwiLCBcImV4cGVjdGVkICVuIHRvIGFsd2F5cyBiZSBjYWxsZWQgd2l0aCBhcmd1bWVudHMgJSolQ1wiKTtcbiAgICBtaXJyb3JQcm9wQXNBc3NlcnRpb24oXCJhbHdheXNDYWxsZWRXaXRoTWF0Y2hcIiwgXCJleHBlY3RlZCAlbiB0byBhbHdheXMgYmUgY2FsbGVkIHdpdGggbWF0Y2ggJSolQ1wiKTtcbiAgICBtaXJyb3JQcm9wQXNBc3NlcnRpb24oXCJjYWxsZWRXaXRoRXhhY3RseVwiLCBcImV4cGVjdGVkICVuIHRvIGJlIGNhbGxlZCB3aXRoIGV4YWN0IGFyZ3VtZW50cyAlKiVDXCIpO1xuICAgIG1pcnJvclByb3BBc0Fzc2VydGlvbihcImFsd2F5c0NhbGxlZFdpdGhFeGFjdGx5XCIsIFwiZXhwZWN0ZWQgJW4gdG8gYWx3YXlzIGJlIGNhbGxlZCB3aXRoIGV4YWN0IGFyZ3VtZW50cyAlKiVDXCIpO1xuICAgIG1pcnJvclByb3BBc0Fzc2VydGlvbihcIm5ldmVyQ2FsbGVkV2l0aFwiLCBcImV4cGVjdGVkICVuIHRvIG5ldmVyIGJlIGNhbGxlZCB3aXRoIGFyZ3VtZW50cyAlKiVDXCIpO1xuICAgIG1pcnJvclByb3BBc0Fzc2VydGlvbihcIm5ldmVyQ2FsbGVkV2l0aE1hdGNoXCIsIFwiZXhwZWN0ZWQgJW4gdG8gbmV2ZXIgYmUgY2FsbGVkIHdpdGggbWF0Y2ggJSolQ1wiKTtcbiAgICBtaXJyb3JQcm9wQXNBc3NlcnRpb24oXCJ0aHJld1wiLCBcIiVuIGRpZCBub3QgdGhyb3cgZXhjZXB0aW9uJUNcIik7XG4gICAgbWlycm9yUHJvcEFzQXNzZXJ0aW9uKFwiYWx3YXlzVGhyZXdcIiwgXCIlbiBkaWQgbm90IGFsd2F5cyB0aHJvdyBleGNlcHRpb24lQ1wiKTtcblxuICAgIGlmIChjb21tb25KU01vZHVsZSkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzc2VydDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaW5vbi5hc3NlcnQgPSBhc3NlcnQ7XG4gICAgfVxufSh0eXBlb2Ygc2lub24gPT0gXCJvYmplY3RcIiAmJiBzaW5vbiB8fCBudWxsLCB0eXBlb2Ygd2luZG93ICE9IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiAodHlwZW9mIHNlbGYgIT0gXCJ1bmRlZmluZWRcIikgPyBzZWxmIDogZ2xvYmFsKSk7XG4iLCIvKipcbiAqIEBkZXBlbmQgLi4vc2lub24uanNcbiAqIEBkZXBlbmQgc3R1Yi5qc1xuICogQGRlcGVuZCBtb2NrLmpzXG4gKi9cbi8qanNsaW50IGVxZXFlcTogZmFsc2UsIG9uZXZhcjogZmFsc2UsIGZvcmluOiB0cnVlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgc2lub24qL1xuLyoqXG4gKiBDb2xsZWN0aW9ucyBvZiBzdHVicywgc3BpZXMgYW5kIG1vY2tzLlxuICpcbiAqIEBhdXRob3IgQ2hyaXN0aWFuIEpvaGFuc2VuIChjaHJpc3RpYW5AY2pvaGFuc2VuLm5vKVxuICogQGxpY2Vuc2UgQlNEXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgQ2hyaXN0aWFuIEpvaGFuc2VuXG4gKi9cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKHNpbm9uKSB7XG4gICAgdmFyIGNvbW1vbkpTTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIjtcbiAgICB2YXIgcHVzaCA9IFtdLnB1c2g7XG4gICAgdmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICAgIGlmICghc2lub24gJiYgY29tbW9uSlNNb2R1bGUpIHtcbiAgICAgICAgc2lub24gPSByZXF1aXJlKFwiLi4vc2lub25cIik7XG4gICAgfVxuXG4gICAgaWYgKCFzaW5vbikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0RmFrZXMoZmFrZUNvbGxlY3Rpb24pIHtcbiAgICAgICAgaWYgKCFmYWtlQ29sbGVjdGlvbi5mYWtlcykge1xuICAgICAgICAgICAgZmFrZUNvbGxlY3Rpb24uZmFrZXMgPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWtlQ29sbGVjdGlvbi5mYWtlcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlYWNoKGZha2VDb2xsZWN0aW9uLCBtZXRob2QpIHtcbiAgICAgICAgdmFyIGZha2VzID0gZ2V0RmFrZXMoZmFrZUNvbGxlY3Rpb24pO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZmFrZXMubGVuZ3RoOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZha2VzW2ldW21ldGhvZF0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgZmFrZXNbaV1bbWV0aG9kXSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29tcGFjdChmYWtlQ29sbGVjdGlvbikge1xuICAgICAgICB2YXIgZmFrZXMgPSBnZXRGYWtlcyhmYWtlQ29sbGVjdGlvbik7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBmYWtlcy5sZW5ndGgpIHtcbiAgICAgICAgICBmYWtlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgY29sbGVjdGlvbiA9IHtcbiAgICAgICAgdmVyaWZ5OiBmdW5jdGlvbiByZXNvbHZlKCkge1xuICAgICAgICAgICAgZWFjaCh0aGlzLCBcInZlcmlmeVwiKTtcbiAgICAgICAgfSxcblxuICAgICAgICByZXN0b3JlOiBmdW5jdGlvbiByZXN0b3JlKCkge1xuICAgICAgICAgICAgZWFjaCh0aGlzLCBcInJlc3RvcmVcIik7XG4gICAgICAgICAgICBjb21wYWN0KHRoaXMpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHZlcmlmeUFuZFJlc3RvcmU6IGZ1bmN0aW9uIHZlcmlmeUFuZFJlc3RvcmUoKSB7XG4gICAgICAgICAgICB2YXIgZXhjZXB0aW9uO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHRoaXMudmVyaWZ5KCk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXhjZXB0aW9uID0gZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5yZXN0b3JlKCk7XG5cbiAgICAgICAgICAgIGlmIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRkOiBmdW5jdGlvbiBhZGQoZmFrZSkge1xuICAgICAgICAgICAgcHVzaC5jYWxsKGdldEZha2VzKHRoaXMpLCBmYWtlKTtcbiAgICAgICAgICAgIHJldHVybiBmYWtlO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNweTogZnVuY3Rpb24gc3B5KCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHNpbm9uLnNweS5hcHBseShzaW5vbiwgYXJndW1lbnRzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3R1YjogZnVuY3Rpb24gc3R1YihvYmplY3QsIHByb3BlcnR5LCB2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWdpbmFsID0gb2JqZWN0W3Byb3BlcnR5XTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3JpZ2luYWwgIT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBzdHViIG5vbi1leGlzdGVudCBvd24gcHJvcGVydHkgXCIgKyBwcm9wZXJ0eSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBvYmplY3RbcHJvcGVydHldID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RbcHJvcGVydHldID0gb3JpZ2luYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcHJvcGVydHkgJiYgISFvYmplY3QgJiYgdHlwZW9mIG9iamVjdCA9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0dWJiZWRPYmogPSBzaW5vbi5zdHViLmFwcGx5KHNpbm9uLCBhcmd1bWVudHMpO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBzdHViYmVkT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3R1YmJlZE9ialtwcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZChzdHViYmVkT2JqW3Byb3BdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBzdHViYmVkT2JqO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQoc2lub24uc3R1Yi5hcHBseShzaW5vbiwgYXJndW1lbnRzKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW9jazogZnVuY3Rpb24gbW9jaygpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmFkZChzaW5vbi5tb2NrLmFwcGx5KHNpbm9uLCBhcmd1bWVudHMpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpbmplY3Q6IGZ1bmN0aW9uIGluamVjdChvYmopIHtcbiAgICAgICAgICAgIHZhciBjb2wgPSB0aGlzO1xuXG4gICAgICAgICAgICBvYmouc3B5ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2wuc3B5LmFwcGx5KGNvbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIG9iai5zdHViID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2wuc3R1Yi5hcHBseShjb2wsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBvYmoubW9jayA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sLm1vY2suYXBwbHkoY29sLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBpZiAoY29tbW9uSlNNb2R1bGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBjb2xsZWN0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbm9uLmNvbGxlY3Rpb24gPSBjb2xsZWN0aW9uO1xuICAgIH1cbn0odHlwZW9mIHNpbm9uID09IFwib2JqZWN0XCIgJiYgc2lub24gfHwgbnVsbCkpO1xuIiwiLyogQGRlcGVuZCAuLi9zaW5vbi5qcyAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgcGx1c3BsdXM6IGZhbHNlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgc2lub24qL1xuLyoqXG4gKiBNYXRjaCBmdW5jdGlvbnNcbiAqXG4gKiBAYXV0aG9yIE1heGltaWxpYW4gQW50b25pIChtYWlsQG1heGFudG9uaS5kZSlcbiAqIEBsaWNlbnNlIEJTRFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMiBNYXhpbWlsaWFuIEFudG9uaVxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uIChzaW5vbikge1xuICAgIHZhciBjb21tb25KU01vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCI7XG5cbiAgICBpZiAoIXNpbm9uICYmIGNvbW1vbkpTTW9kdWxlKSB7XG4gICAgICAgIHNpbm9uID0gcmVxdWlyZShcIi4uL3Npbm9uXCIpO1xuICAgIH1cblxuICAgIGlmICghc2lub24pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzc2VydFR5cGUodmFsdWUsIHR5cGUsIG5hbWUpIHtcbiAgICAgICAgdmFyIGFjdHVhbCA9IHNpbm9uLnR5cGVPZih2YWx1ZSk7XG4gICAgICAgIGlmIChhY3R1YWwgIT09IHR5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJFeHBlY3RlZCB0eXBlIG9mIFwiICsgbmFtZSArIFwiIHRvIGJlIFwiICtcbiAgICAgICAgICAgICAgICB0eXBlICsgXCIsIGJ1dCB3YXMgXCIgKyBhY3R1YWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFyIG1hdGNoZXIgPSB7XG4gICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5tZXNzYWdlO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGlzTWF0Y2hlcihvYmplY3QpIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoZXIuaXNQcm90b3R5cGVPZihvYmplY3QpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG1hdGNoT2JqZWN0KGV4cGVjdGF0aW9uLCBhY3R1YWwpIHtcbiAgICAgICAgaWYgKGFjdHVhbCA9PT0gbnVsbCB8fCBhY3R1YWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGtleSBpbiBleHBlY3RhdGlvbikge1xuICAgICAgICAgICAgaWYgKGV4cGVjdGF0aW9uLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwID0gZXhwZWN0YXRpb25ba2V5XTtcbiAgICAgICAgICAgICAgICB2YXIgYWN0ID0gYWN0dWFsW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoLmlzTWF0Y2hlcihleHApKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZXhwLnRlc3QoYWN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzaW5vbi50eXBlT2YoZXhwKSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIW1hdGNoT2JqZWN0KGV4cCwgYWN0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghc2lub24uZGVlcEVxdWFsKGV4cCwgYWN0KSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIG1hdGNoZXIub3IgPSBmdW5jdGlvbiAobTIpIHtcbiAgICAgICAgaWYgKCFpc01hdGNoZXIobTIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTWF0Y2hlciBleHBlY3RlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbTEgPSB0aGlzO1xuICAgICAgICB2YXIgb3IgPSBzaW5vbi5jcmVhdGUobWF0Y2hlcik7XG4gICAgICAgIG9yLnRlc3QgPSBmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgICAgICByZXR1cm4gbTEudGVzdChhY3R1YWwpIHx8IG0yLnRlc3QoYWN0dWFsKTtcbiAgICAgICAgfTtcbiAgICAgICAgb3IubWVzc2FnZSA9IG0xLm1lc3NhZ2UgKyBcIi5vcihcIiArIG0yLm1lc3NhZ2UgKyBcIilcIjtcbiAgICAgICAgcmV0dXJuIG9yO1xuICAgIH07XG5cbiAgICBtYXRjaGVyLmFuZCA9IGZ1bmN0aW9uIChtMikge1xuICAgICAgICBpZiAoIWlzTWF0Y2hlcihtMikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNYXRjaGVyIGV4cGVjdGVkXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtMSA9IHRoaXM7XG4gICAgICAgIHZhciBhbmQgPSBzaW5vbi5jcmVhdGUobWF0Y2hlcik7XG4gICAgICAgIGFuZC50ZXN0ID0gZnVuY3Rpb24gKGFjdHVhbCkge1xuICAgICAgICAgICAgcmV0dXJuIG0xLnRlc3QoYWN0dWFsKSAmJiBtMi50ZXN0KGFjdHVhbCk7XG4gICAgICAgIH07XG4gICAgICAgIGFuZC5tZXNzYWdlID0gbTEubWVzc2FnZSArIFwiLmFuZChcIiArIG0yLm1lc3NhZ2UgKyBcIilcIjtcbiAgICAgICAgcmV0dXJuIGFuZDtcbiAgICB9O1xuXG4gICAgdmFyIG1hdGNoID0gZnVuY3Rpb24gKGV4cGVjdGF0aW9uLCBtZXNzYWdlKSB7XG4gICAgICAgIHZhciBtID0gc2lub24uY3JlYXRlKG1hdGNoZXIpO1xuICAgICAgICB2YXIgdHlwZSA9IHNpbm9uLnR5cGVPZihleHBlY3RhdGlvbik7XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICBjYXNlIFwib2JqZWN0XCI6XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4cGVjdGF0aW9uLnRlc3QgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIG0udGVzdCA9IGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLnRlc3QoYWN0dWFsKSA9PT0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIG0ubWVzc2FnZSA9IFwibWF0Y2goXCIgKyBzaW5vbi5mdW5jdGlvbk5hbWUoZXhwZWN0YXRpb24udGVzdCkgKyBcIilcIjtcbiAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzdHIgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHBlY3RhdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChleHBlY3RhdGlvbi5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0ci5wdXNoKGtleSArIFwiOiBcIiArIGV4cGVjdGF0aW9uW2tleV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG0udGVzdCA9IGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWF0Y2hPYmplY3QoZXhwZWN0YXRpb24sIGFjdHVhbCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbS5tZXNzYWdlID0gXCJtYXRjaChcIiArIHN0ci5qb2luKFwiLCBcIikgKyBcIilcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibnVtYmVyXCI6XG4gICAgICAgICAgICBtLnRlc3QgPSBmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uID09IGFjdHVhbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICAgICAgbS50ZXN0ID0gZnVuY3Rpb24gKGFjdHVhbCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYWN0dWFsICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdHVhbC5pbmRleE9mKGV4cGVjdGF0aW9uKSAhPT0gLTE7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgbS5tZXNzYWdlID0gXCJtYXRjaChcXFwiXCIgKyBleHBlY3RhdGlvbiArIFwiXFxcIilcIjtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicmVnZXhwXCI6XG4gICAgICAgICAgICBtLnRlc3QgPSBmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhY3R1YWwgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb24udGVzdChhY3R1YWwpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZnVuY3Rpb25cIjpcbiAgICAgICAgICAgIG0udGVzdCA9IGV4cGVjdGF0aW9uO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBtLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtLm1lc3NhZ2UgPSBcIm1hdGNoKFwiICsgc2lub24uZnVuY3Rpb25OYW1lKGV4cGVjdGF0aW9uKSArIFwiKVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBtLnRlc3QgPSBmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzaW5vbi5kZWVwRXF1YWwoZXhwZWN0YXRpb24sIGFjdHVhbCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGlmICghbS5tZXNzYWdlKSB7XG4gICAgICAgICAgICBtLm1lc3NhZ2UgPSBcIm1hdGNoKFwiICsgZXhwZWN0YXRpb24gKyBcIilcIjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbTtcbiAgICB9O1xuXG4gICAgbWF0Y2guaXNNYXRjaGVyID0gaXNNYXRjaGVyO1xuXG4gICAgbWF0Y2guYW55ID0gbWF0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LCBcImFueVwiKTtcblxuICAgIG1hdGNoLmRlZmluZWQgPSBtYXRjaChmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgIHJldHVybiBhY3R1YWwgIT09IG51bGwgJiYgYWN0dWFsICE9PSB1bmRlZmluZWQ7XG4gICAgfSwgXCJkZWZpbmVkXCIpO1xuXG4gICAgbWF0Y2gudHJ1dGh5ID0gbWF0Y2goZnVuY3Rpb24gKGFjdHVhbCkge1xuICAgICAgICByZXR1cm4gISFhY3R1YWw7XG4gICAgfSwgXCJ0cnV0aHlcIik7XG5cbiAgICBtYXRjaC5mYWxzeSA9IG1hdGNoKGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgcmV0dXJuICFhY3R1YWw7XG4gICAgfSwgXCJmYWxzeVwiKTtcblxuICAgIG1hdGNoLnNhbWUgPSBmdW5jdGlvbiAoZXhwZWN0YXRpb24pIHtcbiAgICAgICAgcmV0dXJuIG1hdGNoKGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBleHBlY3RhdGlvbiA9PT0gYWN0dWFsO1xuICAgICAgICB9LCBcInNhbWUoXCIgKyBleHBlY3RhdGlvbiArIFwiKVwiKTtcbiAgICB9O1xuXG4gICAgbWF0Y2gudHlwZU9mID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgYXNzZXJ0VHlwZSh0eXBlLCBcInN0cmluZ1wiLCBcInR5cGVcIik7XG4gICAgICAgIHJldHVybiBtYXRjaChmdW5jdGlvbiAoYWN0dWFsKSB7XG4gICAgICAgICAgICByZXR1cm4gc2lub24udHlwZU9mKGFjdHVhbCkgPT09IHR5cGU7XG4gICAgICAgIH0sIFwidHlwZU9mKFxcXCJcIiArIHR5cGUgKyBcIlxcXCIpXCIpO1xuICAgIH07XG5cbiAgICBtYXRjaC5pbnN0YW5jZU9mID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgYXNzZXJ0VHlwZSh0eXBlLCBcImZ1bmN0aW9uXCIsIFwidHlwZVwiKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoKGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBhY3R1YWwgaW5zdGFuY2VvZiB0eXBlO1xuICAgICAgICB9LCBcImluc3RhbmNlT2YoXCIgKyBzaW5vbi5mdW5jdGlvbk5hbWUodHlwZSkgKyBcIilcIik7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGNyZWF0ZVByb3BlcnR5TWF0Y2hlcihwcm9wZXJ0eVRlc3QsIG1lc3NhZ2VQcmVmaXgpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICAgICAgICAgIGFzc2VydFR5cGUocHJvcGVydHksIFwic3RyaW5nXCIsIFwicHJvcGVydHlcIik7XG4gICAgICAgICAgICB2YXIgb25seVByb3BlcnR5ID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gbWVzc2FnZVByZWZpeCArIFwiKFxcXCJcIiArIHByb3BlcnR5ICsgXCJcXFwiXCI7XG4gICAgICAgICAgICBpZiAoIW9ubHlQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2UgKz0gXCIsIFwiICsgdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtZXNzYWdlICs9IFwiKVwiO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoKGZ1bmN0aW9uIChhY3R1YWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoYWN0dWFsID09PSB1bmRlZmluZWQgfHwgYWN0dWFsID09PSBudWxsIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAhcHJvcGVydHlUZXN0KGFjdHVhbCwgcHJvcGVydHkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9ubHlQcm9wZXJ0eSB8fCBzaW5vbi5kZWVwRXF1YWwodmFsdWUsIGFjdHVhbFtwcm9wZXJ0eV0pO1xuICAgICAgICAgICAgfSwgbWVzc2FnZSk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgbWF0Y2guaGFzID0gY3JlYXRlUHJvcGVydHlNYXRjaGVyKGZ1bmN0aW9uIChhY3R1YWwsIHByb3BlcnR5KSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0dWFsID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHkgaW4gYWN0dWFsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3R1YWxbcHJvcGVydHldICE9PSB1bmRlZmluZWQ7XG4gICAgfSwgXCJoYXNcIik7XG5cbiAgICBtYXRjaC5oYXNPd24gPSBjcmVhdGVQcm9wZXJ0eU1hdGNoZXIoZnVuY3Rpb24gKGFjdHVhbCwgcHJvcGVydHkpIHtcbiAgICAgICAgcmV0dXJuIGFjdHVhbC5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eSk7XG4gICAgfSwgXCJoYXNPd25cIik7XG5cbiAgICBtYXRjaC5ib29sID0gbWF0Y2gudHlwZU9mKFwiYm9vbGVhblwiKTtcbiAgICBtYXRjaC5udW1iZXIgPSBtYXRjaC50eXBlT2YoXCJudW1iZXJcIik7XG4gICAgbWF0Y2guc3RyaW5nID0gbWF0Y2gudHlwZU9mKFwic3RyaW5nXCIpO1xuICAgIG1hdGNoLm9iamVjdCA9IG1hdGNoLnR5cGVPZihcIm9iamVjdFwiKTtcbiAgICBtYXRjaC5mdW5jID0gbWF0Y2gudHlwZU9mKFwiZnVuY3Rpb25cIik7XG4gICAgbWF0Y2guYXJyYXkgPSBtYXRjaC50eXBlT2YoXCJhcnJheVwiKTtcbiAgICBtYXRjaC5yZWdleHAgPSBtYXRjaC50eXBlT2YoXCJyZWdleHBcIik7XG4gICAgbWF0Y2guZGF0ZSA9IG1hdGNoLnR5cGVPZihcImRhdGVcIik7XG5cbiAgICBpZiAoY29tbW9uSlNNb2R1bGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBtYXRjaDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaW5vbi5tYXRjaCA9IG1hdGNoO1xuICAgIH1cbn0odHlwZW9mIHNpbm9uID09IFwib2JqZWN0XCIgJiYgc2lub24gfHwgbnVsbCkpO1xuIiwiLyoqXG4gKiBAZGVwZW5kIC4uL3Npbm9uLmpzXG4gKiBAZGVwZW5kIHN0dWIuanNcbiAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgbm9tZW46IGZhbHNlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgc2lub24qL1xuLyoqXG4gKiBNb2NrIGZ1bmN0aW9ucy5cbiAqXG4gKiBAYXV0aG9yIENocmlzdGlhbiBKb2hhbnNlbiAoY2hyaXN0aWFuQGNqb2hhbnNlbi5ubylcbiAqIEBsaWNlbnNlIEJTRFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIENocmlzdGlhbiBKb2hhbnNlblxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uIChzaW5vbikge1xuICAgIHZhciBjb21tb25KU01vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCI7XG4gICAgdmFyIHB1c2ggPSBbXS5wdXNoO1xuXG4gICAgaWYgKCFzaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgICAgICBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNpbm9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBtb2NrKG9iamVjdCkge1xuICAgICAgICBpZiAoIW9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIHNpbm9uLmV4cGVjdGF0aW9uLmNyZWF0ZShcIkFub255bW91cyBtb2NrXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1vY2suY3JlYXRlKG9iamVjdCk7XG4gICAgfVxuXG4gICAgc2lub24ubW9jayA9IG1vY2s7XG5cbiAgICBzaW5vbi5leHRlbmQobW9jaywgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZnVuY3Rpb24gZWFjaChjb2xsZWN0aW9uLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKCFjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGNvbGxlY3Rpb24ubGVuZ3RoOyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soY29sbGVjdGlvbltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUob2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm9iamVjdCBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciBtb2NrT2JqZWN0ID0gc2lub24uZXh0ZW5kKHt9LCBtb2NrKTtcbiAgICAgICAgICAgICAgICBtb2NrT2JqZWN0Lm9iamVjdCA9IG9iamVjdDtcbiAgICAgICAgICAgICAgICBkZWxldGUgbW9ja09iamVjdC5jcmVhdGU7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbW9ja09iamVjdDtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGV4cGVjdHM6IGZ1bmN0aW9uIGV4cGVjdHMobWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFtZXRob2QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIm1ldGhvZCBpcyBmYWxzeVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuZXhwZWN0YXRpb25zKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0YXRpb25zID0ge307XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucHJveGllcyA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5leHBlY3RhdGlvbnNbbWV0aG9kXSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdGF0aW9uc1ttZXRob2RdID0gW107XG4gICAgICAgICAgICAgICAgICAgIHZhciBtb2NrT2JqZWN0ID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICBzaW5vbi53cmFwTWV0aG9kKHRoaXMub2JqZWN0LCBtZXRob2QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtb2NrT2JqZWN0Lmludm9rZU1ldGhvZChtZXRob2QsIHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbCh0aGlzLnByb3hpZXMsIG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIGV4cGVjdGF0aW9uID0gc2lub24uZXhwZWN0YXRpb24uY3JlYXRlKG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgcHVzaC5jYWxsKHRoaXMuZXhwZWN0YXRpb25zW21ldGhvZF0sIGV4cGVjdGF0aW9uKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBleHBlY3RhdGlvbjtcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJlc3RvcmU6IGZ1bmN0aW9uIHJlc3RvcmUoKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iamVjdCA9IHRoaXMub2JqZWN0O1xuXG4gICAgICAgICAgICAgICAgZWFjaCh0aGlzLnByb3hpZXMsIGZ1bmN0aW9uIChwcm94eSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtwcm94eV0ucmVzdG9yZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iamVjdFtwcm94eV0ucmVzdG9yZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB2ZXJpZnk6IGZ1bmN0aW9uIHZlcmlmeSgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwZWN0YXRpb25zID0gdGhpcy5leHBlY3RhdGlvbnMgfHwge307XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gW10sIG1ldCA9IFtdO1xuXG4gICAgICAgICAgICAgICAgZWFjaCh0aGlzLnByb3hpZXMsIGZ1bmN0aW9uIChwcm94eSkge1xuICAgICAgICAgICAgICAgICAgICBlYWNoKGV4cGVjdGF0aW9uc1twcm94eV0sIGZ1bmN0aW9uIChleHBlY3RhdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFleHBlY3RhdGlvbi5tZXQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChtZXNzYWdlcywgZXhwZWN0YXRpb24udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChtZXQsIGV4cGVjdGF0aW9uLnRvU3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmVzdG9yZSgpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2lub24uZXhwZWN0YXRpb24uZmFpbChtZXNzYWdlcy5jb25jYXQobWV0KS5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaW5vbi5leHBlY3RhdGlvbi5wYXNzKG1lc3NhZ2VzLmNvbmNhdChtZXQpLmpvaW4oXCJcXG5cIikpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgaW52b2tlTWV0aG9kOiBmdW5jdGlvbiBpbnZva2VNZXRob2QobWV0aG9kLCB0aGlzVmFsdWUsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXhwZWN0YXRpb25zID0gdGhpcy5leHBlY3RhdGlvbnMgJiYgdGhpcy5leHBlY3RhdGlvbnNbbWV0aG9kXTtcbiAgICAgICAgICAgICAgICB2YXIgbGVuZ3RoID0gZXhwZWN0YXRpb25zICYmIGV4cGVjdGF0aW9ucy5sZW5ndGggfHwgMCwgaTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWV4cGVjdGF0aW9uc1tpXS5tZXQoKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0YXRpb25zW2ldLmFsbG93c0NhbGwodGhpc1ZhbHVlLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uc1tpXS5hcHBseSh0aGlzVmFsdWUsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2VzID0gW10sIGF2YWlsYWJsZSwgZXhoYXVzdGVkID0gMDtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXhwZWN0YXRpb25zW2ldLmFsbG93c0NhbGwodGhpc1ZhbHVlLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlID0gYXZhaWxhYmxlIHx8IGV4cGVjdGF0aW9uc1tpXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4aGF1c3RlZCArPSAxO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChtZXNzYWdlcywgXCIgICAgXCIgKyBleHBlY3RhdGlvbnNbaV0udG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGV4aGF1c3RlZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXZhaWxhYmxlLmFwcGx5KHRoaXNWYWx1ZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgbWVzc2FnZXMudW5zaGlmdChcIlVuZXhwZWN0ZWQgY2FsbDogXCIgKyBzaW5vbi5zcHlDYWxsLnRvU3RyaW5nLmNhbGwoe1xuICAgICAgICAgICAgICAgICAgICBwcm94eTogbWV0aG9kLFxuICAgICAgICAgICAgICAgICAgICBhcmdzOiBhcmdzXG4gICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgc2lub24uZXhwZWN0YXRpb24uZmFpbChtZXNzYWdlcy5qb2luKFwiXFxuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KCkpKTtcblxuICAgIHZhciB0aW1lcyA9IHNpbm9uLnRpbWVzSW5Xb3JkcztcblxuICAgIHNpbm9uLmV4cGVjdGF0aW9uID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuICAgICAgICB2YXIgX2ludm9rZSA9IHNpbm9uLnNweS5pbnZva2U7XG5cbiAgICAgICAgZnVuY3Rpb24gY2FsbENvdW50SW5Xb3JkcyhjYWxsQ291bnQpIHtcbiAgICAgICAgICAgIGlmIChjYWxsQ291bnQgPT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIm5ldmVyIGNhbGxlZFwiO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJjYWxsZWQgXCIgKyB0aW1lcyhjYWxsQ291bnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZXhwZWN0ZWRDYWxsQ291bnRJbldvcmRzKGV4cGVjdGF0aW9uKSB7XG4gICAgICAgICAgICB2YXIgbWluID0gZXhwZWN0YXRpb24ubWluQ2FsbHM7XG4gICAgICAgICAgICB2YXIgbWF4ID0gZXhwZWN0YXRpb24ubWF4Q2FsbHM7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWluID09IFwibnVtYmVyXCIgJiYgdHlwZW9mIG1heCA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0ciA9IHRpbWVzKG1pbik7XG5cbiAgICAgICAgICAgICAgICBpZiAobWluICE9IG1heCkge1xuICAgICAgICAgICAgICAgICAgICBzdHIgPSBcImF0IGxlYXN0IFwiICsgc3RyICsgXCIgYW5kIGF0IG1vc3QgXCIgKyB0aW1lcyhtYXgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiBzdHI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgbWluID09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJhdCBsZWFzdCBcIiArIHRpbWVzKG1pbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBcImF0IG1vc3QgXCIgKyB0aW1lcyhtYXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZWRNaW5DYWxscyhleHBlY3RhdGlvbikge1xuICAgICAgICAgICAgdmFyIGhhc01pbkxpbWl0ID0gdHlwZW9mIGV4cGVjdGF0aW9uLm1pbkNhbGxzID09IFwibnVtYmVyXCI7XG4gICAgICAgICAgICByZXR1cm4gIWhhc01pbkxpbWl0IHx8IGV4cGVjdGF0aW9uLmNhbGxDb3VudCA+PSBleHBlY3RhdGlvbi5taW5DYWxscztcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVkTWF4Q2FsbHMoZXhwZWN0YXRpb24pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXhwZWN0YXRpb24ubWF4Q2FsbHMgIT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGV4cGVjdGF0aW9uLmNhbGxDb3VudCA9PSBleHBlY3RhdGlvbi5tYXhDYWxscztcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBtaW5DYWxsczogMSxcbiAgICAgICAgICAgIG1heENhbGxzOiAxLFxuXG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZShtZXRob2ROYW1lKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4cGVjdGF0aW9uID0gc2lub24uZXh0ZW5kKHNpbm9uLnN0dWIuY3JlYXRlKCksIHNpbm9uLmV4cGVjdGF0aW9uKTtcbiAgICAgICAgICAgICAgICBkZWxldGUgZXhwZWN0YXRpb24uY3JlYXRlO1xuICAgICAgICAgICAgICAgIGV4cGVjdGF0aW9uLm1ldGhvZCA9IG1ldGhvZE5hbWU7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZXhwZWN0YXRpb247XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBpbnZva2U6IGZ1bmN0aW9uIGludm9rZShmdW5jLCB0aGlzVmFsdWUsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcmlmeUNhbGxBbGxvd2VkKHRoaXNWYWx1ZSwgYXJncyk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gX2ludm9rZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXRMZWFzdDogZnVuY3Rpb24gYXRMZWFzdChudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bSAhPSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInXCIgKyBudW0gKyBcIicgaXMgbm90IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubGltaXRzU2V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWF4Q2FsbHMgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxpbWl0c1NldCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5taW5DYWxscyA9IG51bTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgYXRNb3N0OiBmdW5jdGlvbiBhdE1vc3QobnVtKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBudW0gIT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ1wiICsgbnVtICsgXCInIGlzIG5vdCBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmxpbWl0c1NldCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1pbkNhbGxzID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saW1pdHNTZXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMubWF4Q2FsbHMgPSBudW07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG5ldmVyOiBmdW5jdGlvbiBuZXZlcigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGFjdGx5KDApO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgb25jZTogZnVuY3Rpb24gb25jZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGFjdGx5KDEpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdHdpY2U6IGZ1bmN0aW9uIHR3aWNlKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4YWN0bHkoMik7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB0aHJpY2U6IGZ1bmN0aW9uIHRocmljZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGFjdGx5KDMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgZXhhY3RseTogZnVuY3Rpb24gZXhhY3RseShudW0pIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG51bSAhPSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInXCIgKyBudW0gKyBcIicgaXMgbm90IGEgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuYXRMZWFzdChudW0pO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmF0TW9zdChudW0pO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgbWV0OiBmdW5jdGlvbiBtZXQoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aGlzLmZhaWxlZCAmJiByZWNlaXZlZE1pbkNhbGxzKHRoaXMpO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdmVyaWZ5Q2FsbEFsbG93ZWQ6IGZ1bmN0aW9uIHZlcmlmeUNhbGxBbGxvd2VkKHRoaXNWYWx1ZSwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChyZWNlaXZlZE1heENhbGxzKHRoaXMpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFpbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2lub24uZXhwZWN0YXRpb24uZmFpbCh0aGlzLm1ldGhvZCArIFwiIGFscmVhZHkgY2FsbGVkIFwiICsgdGltZXModGhpcy5tYXhDYWxscykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChcImV4cGVjdGVkVGhpc1wiIGluIHRoaXMgJiYgdGhpcy5leHBlY3RlZFRoaXMgIT09IHRoaXNWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBzaW5vbi5leHBlY3RhdGlvbi5mYWlsKHRoaXMubWV0aG9kICsgXCIgY2FsbGVkIHdpdGggXCIgKyB0aGlzVmFsdWUgKyBcIiBhcyB0aGlzVmFsdWUsIGV4cGVjdGVkIFwiICtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0ZWRUaGlzKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIShcImV4cGVjdGVkQXJndW1lbnRzXCIgaW4gdGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghYXJncykge1xuICAgICAgICAgICAgICAgICAgICBzaW5vbi5leHBlY3RhdGlvbi5mYWlsKHRoaXMubWV0aG9kICsgXCIgcmVjZWl2ZWQgbm8gYXJndW1lbnRzLCBleHBlY3RlZCBcIiArXG4gICAgICAgICAgICAgICAgICAgICAgICBzaW5vbi5mb3JtYXQodGhpcy5leHBlY3RlZEFyZ3VtZW50cykpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8IHRoaXMuZXhwZWN0ZWRBcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpbm9uLmV4cGVjdGF0aW9uLmZhaWwodGhpcy5tZXRob2QgKyBcIiByZWNlaXZlZCB0b28gZmV3IGFyZ3VtZW50cyAoXCIgKyBzaW5vbi5mb3JtYXQoYXJncykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIpLCBleHBlY3RlZCBcIiArIHNpbm9uLmZvcm1hdCh0aGlzLmV4cGVjdGVkQXJndW1lbnRzKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhwZWN0c0V4YWN0QXJnQ291bnQgJiZcbiAgICAgICAgICAgICAgICAgICAgYXJncy5sZW5ndGggIT0gdGhpcy5leHBlY3RlZEFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2lub24uZXhwZWN0YXRpb24uZmFpbCh0aGlzLm1ldGhvZCArIFwiIHJlY2VpdmVkIHRvbyBtYW55IGFyZ3VtZW50cyAoXCIgKyBzaW5vbi5mb3JtYXQoYXJncykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgXCIpLCBleHBlY3RlZCBcIiArIHNpbm9uLmZvcm1hdCh0aGlzLmV4cGVjdGVkQXJndW1lbnRzKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSB0aGlzLmV4cGVjdGVkQXJndW1lbnRzLmxlbmd0aDsgaSA8IGw7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXNpbm9uLmRlZXBFcXVhbCh0aGlzLmV4cGVjdGVkQXJndW1lbnRzW2ldLCBhcmdzW2ldKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2lub24uZXhwZWN0YXRpb24uZmFpbCh0aGlzLm1ldGhvZCArIFwiIHJlY2VpdmVkIHdyb25nIGFyZ3VtZW50cyBcIiArIHNpbm9uLmZvcm1hdChhcmdzKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCIsIGV4cGVjdGVkIFwiICsgc2lub24uZm9ybWF0KHRoaXMuZXhwZWN0ZWRBcmd1bWVudHMpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGFsbG93c0NhbGw6IGZ1bmN0aW9uIGFsbG93c0NhbGwodGhpc1ZhbHVlLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWV0KCkgJiYgcmVjZWl2ZWRNYXhDYWxscyh0aGlzKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKFwiZXhwZWN0ZWRUaGlzXCIgaW4gdGhpcyAmJiB0aGlzLmV4cGVjdGVkVGhpcyAhPT0gdGhpc1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoIShcImV4cGVjdGVkQXJndW1lbnRzXCIgaW4gdGhpcykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYXJncyA9IGFyZ3MgfHwgW107XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPCB0aGlzLmV4cGVjdGVkQXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZXhwZWN0c0V4YWN0QXJnQ291bnQgJiZcbiAgICAgICAgICAgICAgICAgICAgYXJncy5sZW5ndGggIT0gdGhpcy5leHBlY3RlZEFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5leHBlY3RlZEFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzaW5vbi5kZWVwRXF1YWwodGhpcy5leHBlY3RlZEFyZ3VtZW50c1tpXSwgYXJnc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgd2l0aEFyZ3M6IGZ1bmN0aW9uIHdpdGhBcmdzKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhwZWN0ZWRBcmd1bWVudHMgPSBzbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB3aXRoRXhhY3RBcmdzOiBmdW5jdGlvbiB3aXRoRXhhY3RBcmdzKCkge1xuICAgICAgICAgICAgICAgIHRoaXMud2l0aEFyZ3MuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdHNFeGFjdEFyZ0NvdW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIG9uOiBmdW5jdGlvbiBvbih0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4cGVjdGVkVGhpcyA9IHRoaXNWYWx1ZTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHRvU3RyaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSAodGhpcy5leHBlY3RlZEFyZ3VtZW50cyB8fCBbXSkuc2xpY2UoKTtcblxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5leHBlY3RzRXhhY3RBcmdDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBwdXNoLmNhbGwoYXJncywgXCJbLi4uXVwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgY2FsbFN0ciA9IHNpbm9uLnNweUNhbGwudG9TdHJpbmcuY2FsbCh7XG4gICAgICAgICAgICAgICAgICAgIHByb3h5OiB0aGlzLm1ldGhvZCB8fCBcImFub255bW91cyBtb2NrIGV4cGVjdGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgIGFyZ3M6IGFyZ3NcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gY2FsbFN0ci5yZXBsYWNlKFwiLCBbLi4uXCIsIFwiWywgLi4uXCIpICsgXCIgXCIgK1xuICAgICAgICAgICAgICAgICAgICBleHBlY3RlZENhbGxDb3VudEluV29yZHModGhpcyk7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tZXQoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJFeHBlY3RhdGlvbiBtZXQ6IFwiICsgbWVzc2FnZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gXCJFeHBlY3RlZCBcIiArIG1lc3NhZ2UgKyBcIiAoXCIgK1xuICAgICAgICAgICAgICAgICAgICBjYWxsQ291bnRJbldvcmRzKHRoaXMuY2FsbENvdW50KSArIFwiKVwiO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgdmVyaWZ5OiBmdW5jdGlvbiB2ZXJpZnkoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm1ldCgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNpbm9uLmV4cGVjdGF0aW9uLmZhaWwodGhpcy50b1N0cmluZygpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzaW5vbi5leHBlY3RhdGlvbi5wYXNzKHRoaXMudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICBwYXNzOiBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgICAgICAgIHNpbm9uLmFzc2VydC5wYXNzKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZhaWw6IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGV4Y2VwdGlvbiA9IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICBleGNlcHRpb24ubmFtZSA9IFwiRXhwZWN0YXRpb25FcnJvclwiO1xuXG4gICAgICAgICAgICAgICAgdGhyb3cgZXhjZXB0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0oKSk7XG5cbiAgICBpZiAoY29tbW9uSlNNb2R1bGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBtb2NrO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbm9uLm1vY2sgPSBtb2NrO1xuICAgIH1cbn0odHlwZW9mIHNpbm9uID09IFwib2JqZWN0XCIgJiYgc2lub24gfHwgbnVsbCkpO1xuIiwiLyoqXG4gKiBAZGVwZW5kIC4uL3Npbm9uLmpzXG4gKiBAZGVwZW5kIGNvbGxlY3Rpb24uanNcbiAqIEBkZXBlbmQgdXRpbC9mYWtlX3RpbWVycy5qc1xuICogQGRlcGVuZCB1dGlsL2Zha2Vfc2VydmVyX3dpdGhfY2xvY2suanNcbiAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgcGx1c3BsdXM6IGZhbHNlKi9cbi8qZ2xvYmFsIHJlcXVpcmUsIG1vZHVsZSovXG4vKipcbiAqIE1hbmFnZXMgZmFrZSBjb2xsZWN0aW9ucyBhcyB3ZWxsIGFzIGZha2UgdXRpbGl0aWVzIHN1Y2ggYXMgU2lub24nc1xuICogdGltZXJzIGFuZCBmYWtlIFhIUiBpbXBsZW1lbnRhdGlvbiBpbiBvbmUgY29udmVuaWVudCBvYmplY3QuXG4gKlxuICogQGF1dGhvciBDaHJpc3RpYW4gSm9oYW5zZW4gKGNocmlzdGlhbkBjam9oYW5zZW4ubm8pXG4gKiBAbGljZW5zZSBCU0RcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBDaHJpc3RpYW4gSm9oYW5zZW5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmlmICh0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgdmFyIHNpbm9uID0gcmVxdWlyZShcIi4uL3Npbm9uXCIpO1xuICAgIHNpbm9uLmV4dGVuZChzaW5vbiwgcmVxdWlyZShcIi4vdXRpbC9mYWtlX3RpbWVyc1wiKSk7XG59XG5cbihmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHB1c2ggPSBbXS5wdXNoO1xuXG4gICAgZnVuY3Rpb24gZXhwb3NlVmFsdWUoc2FuZGJveCwgY29uZmlnLCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjb25maWcuaW5qZWN0SW50bykge1xuICAgICAgICAgICAgY29uZmlnLmluamVjdEludG9ba2V5XSA9IHZhbHVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHVzaC5jYWxsKHNhbmRib3guYXJncywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJlcGFyZVNhbmRib3hGcm9tQ29uZmlnKGNvbmZpZykge1xuICAgICAgICB2YXIgc2FuZGJveCA9IHNpbm9uLmNyZWF0ZShzaW5vbi5zYW5kYm94KTtcblxuICAgICAgICBpZiAoY29uZmlnLnVzZUZha2VTZXJ2ZXIpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY29uZmlnLnVzZUZha2VTZXJ2ZXIgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgIHNhbmRib3guc2VydmVyUHJvdG90eXBlID0gY29uZmlnLnVzZUZha2VTZXJ2ZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNhbmRib3gudXNlRmFrZVNlcnZlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbmZpZy51c2VGYWtlVGltZXJzKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNvbmZpZy51c2VGYWtlVGltZXJzID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICBzYW5kYm94LnVzZUZha2VUaW1lcnMuYXBwbHkoc2FuZGJveCwgY29uZmlnLnVzZUZha2VUaW1lcnMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYW5kYm94LnVzZUZha2VUaW1lcnMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzYW5kYm94O1xuICAgIH1cblxuICAgIHNpbm9uLnNhbmRib3ggPSBzaW5vbi5leHRlbmQoc2lub24uY3JlYXRlKHNpbm9uLmNvbGxlY3Rpb24pLCB7XG4gICAgICAgIHVzZUZha2VUaW1lcnM6IGZ1bmN0aW9uIHVzZUZha2VUaW1lcnMoKSB7XG4gICAgICAgICAgICB0aGlzLmNsb2NrID0gc2lub24udXNlRmFrZVRpbWVycy5hcHBseShzaW5vbiwgYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkKHRoaXMuY2xvY2spO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlcnZlclByb3RvdHlwZTogc2lub24uZmFrZVNlcnZlcixcblxuICAgICAgICB1c2VGYWtlU2VydmVyOiBmdW5jdGlvbiB1c2VGYWtlU2VydmVyKCkge1xuICAgICAgICAgICAgdmFyIHByb3RvID0gdGhpcy5zZXJ2ZXJQcm90b3R5cGUgfHwgc2lub24uZmFrZVNlcnZlcjtcblxuICAgICAgICAgICAgaWYgKCFwcm90byB8fCAhcHJvdG8uY3JlYXRlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2VydmVyID0gcHJvdG8uY3JlYXRlKCk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5hZGQodGhpcy5zZXJ2ZXIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGluamVjdDogZnVuY3Rpb24gKG9iaikge1xuICAgICAgICAgICAgc2lub24uY29sbGVjdGlvbi5pbmplY3QuY2FsbCh0aGlzLCBvYmopO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5jbG9jaykge1xuICAgICAgICAgICAgICAgIG9iai5jbG9jayA9IHRoaXMuY2xvY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgICAgIG9iai5zZXJ2ZXIgPSB0aGlzLnNlcnZlcjtcbiAgICAgICAgICAgICAgICBvYmoucmVxdWVzdHMgPSB0aGlzLnNlcnZlci5yZXF1ZXN0cztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfSxcblxuICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICAgICAgICAgIGlmICghY29uZmlnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNpbm9uLmNyZWF0ZShzaW5vbi5zYW5kYm94KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHNhbmRib3ggPSBwcmVwYXJlU2FuZGJveEZyb21Db25maWcoY29uZmlnKTtcbiAgICAgICAgICAgIHNhbmRib3guYXJncyA9IHNhbmRib3guYXJncyB8fCBbXTtcbiAgICAgICAgICAgIHZhciBwcm9wLCB2YWx1ZSwgZXhwb3NlZCA9IHNhbmRib3guaW5qZWN0KHt9KTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjb25maWcucHJvcGVydGllcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcCA9IGNvbmZpZy5wcm9wZXJ0aWVzW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGV4cG9zZWRbcHJvcF0gfHwgcHJvcCA9PSBcInNhbmRib3hcIiAmJiBzYW5kYm94O1xuICAgICAgICAgICAgICAgICAgICBleHBvc2VWYWx1ZShzYW5kYm94LCBjb25maWcsIHByb3AsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4cG9zZVZhbHVlKHNhbmRib3gsIGNvbmZpZywgXCJzYW5kYm94XCIsIHZhbHVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHNhbmRib3g7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHNpbm9uLnNhbmRib3gudXNlRmFrZVhNTEh0dHBSZXF1ZXN0ID0gc2lub24uc2FuZGJveC51c2VGYWtlU2VydmVyO1xuXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBzaW5vbi5zYW5kYm94O1xuICAgIH1cbn0oKSk7XG4iLCIvKipcbiAgKiBAZGVwZW5kIC4uL3Npbm9uLmpzXG4gICogQGRlcGVuZCBtYXRjaC5qc1xuICAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgcGx1c3BsdXM6IGZhbHNlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgc2lub24qL1xuLyoqXG4gICogU3B5IGNhbGxzXG4gICpcbiAgKiBAYXV0aG9yIENocmlzdGlhbiBKb2hhbnNlbiAoY2hyaXN0aWFuQGNqb2hhbnNlbi5ubylcbiAgKiBAYXV0aG9yIE1heGltaWxpYW4gQW50b25pIChtYWlsQG1heGFudG9uaS5kZSlcbiAgKiBAbGljZW5zZSBCU0RcbiAgKlxuICAqIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIENocmlzdGlhbiBKb2hhbnNlblxuICAqIENvcHlyaWdodCAoYykgMjAxMyBNYXhpbWlsaWFuIEFudG9uaVxuICAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBjb21tb25KU01vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCI7XG5cbmlmICghdGhpcy5zaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgIHZhciBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbn1cblxuKGZ1bmN0aW9uIChzaW5vbikge1xuICAgIGZ1bmN0aW9uIHRocm93WWllbGRFcnJvcihwcm94eSwgdGV4dCwgYXJncykge1xuICAgICAgICB2YXIgbXNnID0gc2lub24uZnVuY3Rpb25OYW1lKHByb3h5KSArIHRleHQ7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgbXNnICs9IFwiIFJlY2VpdmVkIFtcIiArIHNsaWNlLmNhbGwoYXJncykuam9pbihcIiwgXCIpICsgXCJdXCI7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1zZyk7XG4gICAgfVxuXG4gICAgdmFyIHNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4gICAgdmFyIGNhbGxQcm90byA9IHtcbiAgICAgICAgY2FsbGVkT246IGZ1bmN0aW9uIGNhbGxlZE9uKHRoaXNWYWx1ZSkge1xuICAgICAgICAgICAgaWYgKHNpbm9uLm1hdGNoICYmIHNpbm9uLm1hdGNoLmlzTWF0Y2hlcih0aGlzVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNWYWx1ZS50ZXN0KHRoaXMudGhpc1ZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRoaXNWYWx1ZSA9PT0gdGhpc1ZhbHVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxlZFdpdGg6IGZ1bmN0aW9uIGNhbGxlZFdpdGgoKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNpbm9uLmRlZXBFcXVhbChhcmd1bWVudHNbaV0sIHRoaXMuYXJnc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbGVkV2l0aE1hdGNoOiBmdW5jdGlvbiBjYWxsZWRXaXRoTWF0Y2goKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYWN0dWFsID0gdGhpcy5hcmdzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBleHBlY3RhdGlvbiA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgICAgICBpZiAoIXNpbm9uLm1hdGNoIHx8ICFzaW5vbi5tYXRjaChleHBlY3RhdGlvbikudGVzdChhY3R1YWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsZWRXaXRoRXhhY3RseTogZnVuY3Rpb24gY2FsbGVkV2l0aEV4YWN0bHkoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PSB0aGlzLmFyZ3MubGVuZ3RoICYmXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsZWRXaXRoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm90Q2FsbGVkV2l0aDogZnVuY3Rpb24gbm90Q2FsbGVkV2l0aCgpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGhpcy5jYWxsZWRXaXRoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm90Q2FsbGVkV2l0aE1hdGNoOiBmdW5jdGlvbiBub3RDYWxsZWRXaXRoTWF0Y2goKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRoaXMuY2FsbGVkV2l0aE1hdGNoLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmV0dXJuZWQ6IGZ1bmN0aW9uIHJldHVybmVkKHZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc2lub24uZGVlcEVxdWFsKHZhbHVlLCB0aGlzLnJldHVyblZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0aHJldzogZnVuY3Rpb24gdGhyZXcoZXJyb3IpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXJyb3IgPT09IFwidW5kZWZpbmVkXCIgfHwgIXRoaXMuZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5leGNlcHRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmV4Y2VwdGlvbiA9PT0gZXJyb3IgfHwgdGhpcy5leGNlcHRpb24ubmFtZSA9PT0gZXJyb3I7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbGVkV2l0aE5ldzogZnVuY3Rpb24gY2FsbGVkV2l0aE5ldyh0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRoaXNWYWx1ZSBpbnN0YW5jZW9mIHRoaXMucHJveHk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbGVkQmVmb3JlOiBmdW5jdGlvbiAob3RoZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNhbGxJZCA8IG90aGVyLmNhbGxJZDtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsZWRBZnRlcjogZnVuY3Rpb24gKG90aGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsSWQgPiBvdGhlci5jYWxsSWQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2FsbEFyZzogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgdGhpcy5hcmdzW3Bvc10oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsQXJnT246IGZ1bmN0aW9uIChwb3MsIHRoaXNWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5hcmdzW3Bvc10uYXBwbHkodGhpc1ZhbHVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsQXJnV2l0aDogZnVuY3Rpb24gKHBvcykge1xuICAgICAgICAgICAgdGhpcy5jYWxsQXJnT25XaXRoLmFwcGx5KHRoaXMsIFtwb3MsIG51bGxdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsQXJnT25XaXRoOiBmdW5jdGlvbiAocG9zLCB0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgICAgICAgICAgdGhpcy5hcmdzW3Bvc10uYXBwbHkodGhpc1ZhbHVlLCBhcmdzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBcInlpZWxkXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMueWllbGRPbi5hcHBseSh0aGlzLCBbbnVsbF0uY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHlpZWxkT246IGZ1bmN0aW9uICh0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gdGhpcy5hcmdzO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmdzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1tpXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbaV0uYXBwbHkodGhpc1ZhbHVlLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhyb3dZaWVsZEVycm9yKHRoaXMucHJveHksIFwiIGNhbm5vdCB5aWVsZCBzaW5jZSBubyBjYWxsYmFjayB3YXMgcGFzc2VkLlwiLCBhcmdzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB5aWVsZFRvOiBmdW5jdGlvbiAocHJvcCkge1xuICAgICAgICAgICAgdGhpcy55aWVsZFRvT24uYXBwbHkodGhpcywgW3Byb3AsIG51bGxdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpKTtcbiAgICAgICAgfSxcblxuICAgICAgICB5aWVsZFRvT246IGZ1bmN0aW9uIChwcm9wLCB0aGlzVmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gdGhpcy5hcmdzO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmdzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzW2ldICYmIHR5cGVvZiBhcmdzW2ldW3Byb3BdID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJnc1tpXVtwcm9wXS5hcHBseSh0aGlzVmFsdWUsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aHJvd1lpZWxkRXJyb3IodGhpcy5wcm94eSwgXCIgY2Fubm90IHlpZWxkIHRvICdcIiArIHByb3AgK1xuICAgICAgICAgICAgICAgIFwiJyBzaW5jZSBubyBjYWxsYmFjayB3YXMgcGFzc2VkLlwiLCBhcmdzKTtcbiAgICAgICAgfSxcblxuICAgICAgICB0b1N0cmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGNhbGxTdHIgPSB0aGlzLnByb3h5LnRvU3RyaW5nKCkgKyBcIihcIjtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5hcmdzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChzaW5vbi5mb3JtYXQodGhpcy5hcmdzW2ldKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNhbGxTdHIgPSBjYWxsU3RyICsgYXJncy5qb2luKFwiLCBcIikgKyBcIilcIjtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJldHVyblZhbHVlICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBjYWxsU3RyICs9IFwiID0+IFwiICsgc2lub24uZm9ybWF0KHRoaXMucmV0dXJuVmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5leGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICBjYWxsU3RyICs9IFwiICFcIiArIHRoaXMuZXhjZXB0aW9uLm5hbWU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5leGNlcHRpb24ubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsU3RyICs9IFwiKFwiICsgdGhpcy5leGNlcHRpb24ubWVzc2FnZSArIFwiKVwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNhbGxTdHI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgY2FsbFByb3RvLmludm9rZUNhbGxiYWNrID0gY2FsbFByb3RvLnlpZWxkO1xuXG4gICAgZnVuY3Rpb24gY3JlYXRlU3B5Q2FsbChzcHksIHRoaXNWYWx1ZSwgYXJncywgcmV0dXJuVmFsdWUsIGV4Y2VwdGlvbiwgaWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpZCAhPT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbGwgaWQgaXMgbm90IGEgbnVtYmVyXCIpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBwcm94eUNhbGwgPSBzaW5vbi5jcmVhdGUoY2FsbFByb3RvKTtcbiAgICAgICAgcHJveHlDYWxsLnByb3h5ID0gc3B5O1xuICAgICAgICBwcm94eUNhbGwudGhpc1ZhbHVlID0gdGhpc1ZhbHVlO1xuICAgICAgICBwcm94eUNhbGwuYXJncyA9IGFyZ3M7XG4gICAgICAgIHByb3h5Q2FsbC5yZXR1cm5WYWx1ZSA9IHJldHVyblZhbHVlO1xuICAgICAgICBwcm94eUNhbGwuZXhjZXB0aW9uID0gZXhjZXB0aW9uO1xuICAgICAgICBwcm94eUNhbGwuY2FsbElkID0gaWQ7XG5cbiAgICAgICAgcmV0dXJuIHByb3h5Q2FsbDtcbiAgICB9O1xuICAgIGNyZWF0ZVNweUNhbGwudG9TdHJpbmcgPSBjYWxsUHJvdG8udG9TdHJpbmc7IC8vIHVzZWQgYnkgbW9ja3NcblxuICAgIHNpbm9uLnNweUNhbGwgPSBjcmVhdGVTcHlDYWxsO1xufSh0eXBlb2Ygc2lub24gPT0gXCJvYmplY3RcIiAmJiBzaW5vbiB8fCBudWxsKSk7XG5cbi8qKlxuICAqIEBkZXBlbmQgLi4vc2lub24uanNcbiAgKi9cbi8qanNsaW50IGVxZXFlcTogZmFsc2UsIG9uZXZhcjogZmFsc2UsIHBsdXNwbHVzOiBmYWxzZSovXG4vKmdsb2JhbCBtb2R1bGUsIHJlcXVpcmUsIHNpbm9uKi9cbi8qKlxuICAqIFNweSBmdW5jdGlvbnNcbiAgKlxuICAqIEBhdXRob3IgQ2hyaXN0aWFuIEpvaGFuc2VuIChjaHJpc3RpYW5AY2pvaGFuc2VuLm5vKVxuICAqIEBsaWNlbnNlIEJTRFxuICAqXG4gICogQ29weXJpZ2h0IChjKSAyMDEwLTIwMTMgQ2hyaXN0aWFuIEpvaGFuc2VuXG4gICovXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uIChzaW5vbikge1xuICAgIHZhciBjb21tb25KU01vZHVsZSA9IHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCI7XG4gICAgdmFyIHB1c2ggPSBBcnJheS5wcm90b3R5cGUucHVzaDtcbiAgICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG4gICAgdmFyIGNhbGxJZCA9IDA7XG5cbiAgICBmdW5jdGlvbiBzcHkob2JqZWN0LCBwcm9wZXJ0eSkge1xuICAgICAgICBpZiAoIXByb3BlcnR5ICYmIHR5cGVvZiBvYmplY3QgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gc3B5LmNyZWF0ZShvYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFvYmplY3QgJiYgIXByb3BlcnR5KSB7XG4gICAgICAgICAgICByZXR1cm4gc3B5LmNyZWF0ZShmdW5jdGlvbiAoKSB7IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG1ldGhvZCA9IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgICAgIHJldHVybiBzaW5vbi53cmFwTWV0aG9kKG9iamVjdCwgcHJvcGVydHksIHNweS5jcmVhdGUobWV0aG9kKSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbWF0Y2hpbmdGYWtlKGZha2VzLCBhcmdzLCBzdHJpY3QpIHtcbiAgICAgICAgaWYgKCFmYWtlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFsZW4gPSBhcmdzLmxlbmd0aDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZha2VzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgaWYgKGZha2VzW2ldLm1hdGNoZXMoYXJncywgc3RyaWN0KSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWtlc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGluY3JlbWVudENhbGxDb3VudCgpIHtcbiAgICAgICAgdGhpcy5jYWxsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmNhbGxDb3VudCArPSAxO1xuICAgICAgICB0aGlzLm5vdENhbGxlZCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNhbGxlZE9uY2UgPSB0aGlzLmNhbGxDb3VudCA9PSAxO1xuICAgICAgICB0aGlzLmNhbGxlZFR3aWNlID0gdGhpcy5jYWxsQ291bnQgPT0gMjtcbiAgICAgICAgdGhpcy5jYWxsZWRUaHJpY2UgPSB0aGlzLmNhbGxDb3VudCA9PSAzO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZUNhbGxQcm9wZXJ0aWVzKCkge1xuICAgICAgICB0aGlzLmZpcnN0Q2FsbCA9IHRoaXMuZ2V0Q2FsbCgwKTtcbiAgICAgICAgdGhpcy5zZWNvbmRDYWxsID0gdGhpcy5nZXRDYWxsKDEpO1xuICAgICAgICB0aGlzLnRoaXJkQ2FsbCA9IHRoaXMuZ2V0Q2FsbCgyKTtcbiAgICAgICAgdGhpcy5sYXN0Q2FsbCA9IHRoaXMuZ2V0Q2FsbCh0aGlzLmNhbGxDb3VudCAtIDEpO1xuICAgIH1cblxuICAgIHZhciB2YXJzID0gXCJhLGIsYyxkLGUsZixnLGgsaSxqLGssbFwiO1xuICAgIGZ1bmN0aW9uIGNyZWF0ZVByb3h5KGZ1bmMpIHtcbiAgICAgICAgLy8gUmV0YWluIHRoZSBmdW5jdGlvbiBsZW5ndGg6XG4gICAgICAgIHZhciBwO1xuICAgICAgICBpZiAoZnVuYy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGV2YWwoXCJwID0gKGZ1bmN0aW9uIHByb3h5KFwiICsgdmFycy5zdWJzdHJpbmcoMCwgZnVuYy5sZW5ndGggKiAyIC0gMSkgK1xuICAgICAgICAgICAgICAgIFwiKSB7IHJldHVybiBwLmludm9rZShmdW5jLCB0aGlzLCBzbGljZS5jYWxsKGFyZ3VtZW50cykpOyB9KTtcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwID0gZnVuY3Rpb24gcHJveHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHAuaW52b2tlKGZ1bmMsIHRoaXMsIHNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIHZhciB1dWlkID0gMDtcblxuICAgIC8vIFB1YmxpYyBBUElcbiAgICB2YXIgc3B5QXBpID0ge1xuICAgICAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMubm90Q2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY2FsbGVkT25jZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jYWxsZWRUd2ljZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5jYWxsZWRUaHJpY2UgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuY2FsbENvdW50ID0gMDtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RDYWxsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc2Vjb25kQ2FsbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnRoaXJkQ2FsbCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLmxhc3RDYWxsID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuYXJncyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5yZXR1cm5WYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMudGhpc1ZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgdGhpcy5leGNlcHRpb25zID0gW107XG4gICAgICAgICAgICB0aGlzLmNhbGxJZHMgPSBbXTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZha2VzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZha2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmFrZXNbaV0ucmVzZXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUoZnVuYykge1xuICAgICAgICAgICAgdmFyIG5hbWU7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICBmdW5jID0gZnVuY3Rpb24gKCkgeyB9O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuYW1lID0gc2lub24uZnVuY3Rpb25OYW1lKGZ1bmMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcHJveHkgPSBjcmVhdGVQcm94eShmdW5jKTtcblxuICAgICAgICAgICAgc2lub24uZXh0ZW5kKHByb3h5LCBzcHkpO1xuICAgICAgICAgICAgZGVsZXRlIHByb3h5LmNyZWF0ZTtcbiAgICAgICAgICAgIHNpbm9uLmV4dGVuZChwcm94eSwgZnVuYyk7XG5cbiAgICAgICAgICAgIHByb3h5LnJlc2V0KCk7XG4gICAgICAgICAgICBwcm94eS5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgICAgIHByb3h5LmRpc3BsYXlOYW1lID0gbmFtZSB8fCBcInNweVwiO1xuICAgICAgICAgICAgcHJveHkudG9TdHJpbmcgPSBzaW5vbi5mdW5jdGlvblRvU3RyaW5nO1xuICAgICAgICAgICAgcHJveHkuX2NyZWF0ZSA9IHNpbm9uLnNweS5jcmVhdGU7XG4gICAgICAgICAgICBwcm94eS5pZCA9IFwic3B5I1wiICsgdXVpZCsrO1xuXG4gICAgICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaW52b2tlOiBmdW5jdGlvbiBpbnZva2UoZnVuYywgdGhpc1ZhbHVlLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgbWF0Y2hpbmcgPSBtYXRjaGluZ0Zha2UodGhpcy5mYWtlcywgYXJncyk7XG4gICAgICAgICAgICB2YXIgZXhjZXB0aW9uLCByZXR1cm5WYWx1ZTtcblxuICAgICAgICAgICAgaW5jcmVtZW50Q2FsbENvdW50LmNhbGwodGhpcyk7XG4gICAgICAgICAgICBwdXNoLmNhbGwodGhpcy50aGlzVmFsdWVzLCB0aGlzVmFsdWUpO1xuICAgICAgICAgICAgcHVzaC5jYWxsKHRoaXMuYXJncywgYXJncyk7XG4gICAgICAgICAgICBwdXNoLmNhbGwodGhpcy5jYWxsSWRzLCBjYWxsSWQrKyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoaW5nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblZhbHVlID0gbWF0Y2hpbmcuaW52b2tlKGZ1bmMsIHRoaXNWYWx1ZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuVmFsdWUgPSAodGhpcy5mdW5jIHx8IGZ1bmMpLmFwcGx5KHRoaXNWYWx1ZSwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHB1c2guY2FsbCh0aGlzLnJldHVyblZhbHVlcywgdW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICBleGNlcHRpb24gPSBlO1xuICAgICAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIHB1c2guY2FsbCh0aGlzLmV4Y2VwdGlvbnMsIGV4Y2VwdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHB1c2guY2FsbCh0aGlzLnJldHVyblZhbHVlcywgcmV0dXJuVmFsdWUpO1xuXG4gICAgICAgICAgICBjcmVhdGVDYWxsUHJvcGVydGllcy5jYWxsKHRoaXMpO1xuXG4gICAgICAgICAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0Q2FsbDogZnVuY3Rpb24gZ2V0Q2FsbChpKSB7XG4gICAgICAgICAgICBpZiAoaSA8IDAgfHwgaSA+PSB0aGlzLmNhbGxDb3VudCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc2lub24uc3B5Q2FsbCh0aGlzLCB0aGlzLnRoaXNWYWx1ZXNbaV0sIHRoaXMuYXJnc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmV0dXJuVmFsdWVzW2ldLCB0aGlzLmV4Y2VwdGlvbnNbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxJZHNbaV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxlZEJlZm9yZTogZnVuY3Rpb24gY2FsbGVkQmVmb3JlKHNweUZuKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXNweUZuLmNhbGxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsSWRzWzBdIDwgc3B5Rm4uY2FsbElkc1tzcHlGbi5jYWxsSWRzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNhbGxlZEFmdGVyOiBmdW5jdGlvbiBjYWxsZWRBZnRlcihzcHlGbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmNhbGxlZCB8fCAhc3B5Rm4uY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jYWxsSWRzW3RoaXMuY2FsbENvdW50IC0gMV0gPiBzcHlGbi5jYWxsSWRzW3NweUZuLmNhbGxDb3VudCAtIDFdO1xuICAgICAgICB9LFxuXG4gICAgICAgIHdpdGhBcmdzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuZmFrZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF0Y2ggPSBtYXRjaGluZ0Zha2UodGhpcy5mYWtlcywgYXJncywgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mYWtlcyA9IFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb3JpZ2luYWwgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGZha2UgPSB0aGlzLl9jcmVhdGUoKTtcbiAgICAgICAgICAgIGZha2UubWF0Y2hpbmdBZ3VtZW50cyA9IGFyZ3M7XG4gICAgICAgICAgICBwdXNoLmNhbGwodGhpcy5mYWtlcywgZmFrZSk7XG5cbiAgICAgICAgICAgIGZha2Uud2l0aEFyZ3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yaWdpbmFsLndpdGhBcmdzLmFwcGx5KG9yaWdpbmFsLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoZmFrZS5tYXRjaGVzKHRoaXMuYXJnc1tpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5jcmVtZW50Q2FsbENvdW50LmNhbGwoZmFrZSk7XG4gICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChmYWtlLnRoaXNWYWx1ZXMsIHRoaXMudGhpc1ZhbHVlc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChmYWtlLmFyZ3MsIHRoaXMuYXJnc1tpXSk7XG4gICAgICAgICAgICAgICAgICAgIHB1c2guY2FsbChmYWtlLnJldHVyblZhbHVlcywgdGhpcy5yZXR1cm5WYWx1ZXNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBwdXNoLmNhbGwoZmFrZS5leGNlcHRpb25zLCB0aGlzLmV4Y2VwdGlvbnNbaV0pO1xuICAgICAgICAgICAgICAgICAgICBwdXNoLmNhbGwoZmFrZS5jYWxsSWRzLCB0aGlzLmNhbGxJZHNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNyZWF0ZUNhbGxQcm9wZXJ0aWVzLmNhbGwoZmFrZSk7XG5cbiAgICAgICAgICAgIHJldHVybiBmYWtlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1hdGNoZXM6IGZ1bmN0aW9uIChhcmdzLCBzdHJpY3QpIHtcbiAgICAgICAgICAgIHZhciBtYXJncyA9IHRoaXMubWF0Y2hpbmdBZ3VtZW50cztcblxuICAgICAgICAgICAgaWYgKG1hcmdzLmxlbmd0aCA8PSBhcmdzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgIHNpbm9uLmRlZXBFcXVhbChtYXJncywgYXJncy5zbGljZSgwLCBtYXJncy5sZW5ndGgpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAhc3RyaWN0IHx8IG1hcmdzLmxlbmd0aCA9PSBhcmdzLmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBwcmludGY6IGZ1bmN0aW9uIChmb3JtYXQpIHtcbiAgICAgICAgICAgIHZhciBzcHkgPSB0aGlzO1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICB2YXIgZm9ybWF0dGVyO1xuXG4gICAgICAgICAgICByZXR1cm4gKGZvcm1hdCB8fCBcIlwiKS5yZXBsYWNlKC8lKC4pL2csIGZ1bmN0aW9uIChtYXRjaCwgc3BlY2lmeWVyKSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVyID0gc3B5QXBpLmZvcm1hdHRlcnNbc3BlY2lmeWVyXTtcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZm9ybWF0dGVyID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZm9ybWF0dGVyLmNhbGwobnVsbCwgc3B5LCBhcmdzKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFpc05hTihwYXJzZUludChzcGVjaWZ5ZXIpLCAxMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNpbm9uLmZvcm1hdChhcmdzW3NwZWNpZnllciAtIDFdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gXCIlXCIgKyBzcGVjaWZ5ZXI7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBkZWxlZ2F0ZVRvQ2FsbHMobWV0aG9kLCBtYXRjaEFueSwgYWN0dWFsLCBub3RDYWxsZWQpIHtcbiAgICAgICAgc3B5QXBpW21ldGhvZF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuY2FsbGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vdENhbGxlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbm90Q2FsbGVkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIGN1cnJlbnRDYWxsO1xuICAgICAgICAgICAgdmFyIG1hdGNoZXMgPSAwO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuY2FsbENvdW50OyBpIDwgbDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudENhbGwgPSB0aGlzLmdldENhbGwoaSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudENhbGxbYWN0dWFsIHx8IG1ldGhvZF0uYXBwbHkoY3VycmVudENhbGwsIGFyZ3VtZW50cykpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hlcyArPSAxO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaEFueSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBtYXRjaGVzID09PSB0aGlzLmNhbGxDb3VudDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJjYWxsZWRPblwiLCB0cnVlKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJhbHdheXNDYWxsZWRPblwiLCBmYWxzZSwgXCJjYWxsZWRPblwiKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJjYWxsZWRXaXRoXCIsIHRydWUpO1xuICAgIGRlbGVnYXRlVG9DYWxscyhcImNhbGxlZFdpdGhNYXRjaFwiLCB0cnVlKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJhbHdheXNDYWxsZWRXaXRoXCIsIGZhbHNlLCBcImNhbGxlZFdpdGhcIik7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiYWx3YXlzQ2FsbGVkV2l0aE1hdGNoXCIsIGZhbHNlLCBcImNhbGxlZFdpdGhNYXRjaFwiKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJjYWxsZWRXaXRoRXhhY3RseVwiLCB0cnVlKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJhbHdheXNDYWxsZWRXaXRoRXhhY3RseVwiLCBmYWxzZSwgXCJjYWxsZWRXaXRoRXhhY3RseVwiKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJuZXZlckNhbGxlZFdpdGhcIiwgZmFsc2UsIFwibm90Q2FsbGVkV2l0aFwiLFxuICAgICAgICBmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9KTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJuZXZlckNhbGxlZFdpdGhNYXRjaFwiLCBmYWxzZSwgXCJub3RDYWxsZWRXaXRoTWF0Y2hcIixcbiAgICAgICAgZnVuY3Rpb24gKCkgeyByZXR1cm4gdHJ1ZTsgfSk7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwidGhyZXdcIiwgdHJ1ZSk7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiYWx3YXlzVGhyZXdcIiwgZmFsc2UsIFwidGhyZXdcIik7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwicmV0dXJuZWRcIiwgdHJ1ZSk7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiYWx3YXlzUmV0dXJuZWRcIiwgZmFsc2UsIFwicmV0dXJuZWRcIik7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiY2FsbGVkV2l0aE5ld1wiLCB0cnVlKTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJhbHdheXNDYWxsZWRXaXRoTmV3XCIsIGZhbHNlLCBcImNhbGxlZFdpdGhOZXdcIik7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiY2FsbEFyZ1wiLCBmYWxzZSwgXCJjYWxsQXJnV2l0aFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnRvU3RyaW5nKCkgKyBcIiBjYW5ub3QgY2FsbCBhcmcgc2luY2UgaXQgd2FzIG5vdCB5ZXQgaW52b2tlZC5cIik7XG4gICAgfSk7XG4gICAgc3B5QXBpLmNhbGxBcmdXaXRoID0gc3B5QXBpLmNhbGxBcmc7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwiY2FsbEFyZ09uXCIsIGZhbHNlLCBcImNhbGxBcmdPbldpdGhcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpICsgXCIgY2Fubm90IGNhbGwgYXJnIHNpbmNlIGl0IHdhcyBub3QgeWV0IGludm9rZWQuXCIpO1xuICAgIH0pO1xuICAgIHNweUFwaS5jYWxsQXJnT25XaXRoID0gc3B5QXBpLmNhbGxBcmdPbjtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJ5aWVsZFwiLCBmYWxzZSwgXCJ5aWVsZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnRvU3RyaW5nKCkgKyBcIiBjYW5ub3QgeWllbGQgc2luY2UgaXQgd2FzIG5vdCB5ZXQgaW52b2tlZC5cIik7XG4gICAgfSk7XG4gICAgLy8gXCJpbnZva2VDYWxsYmFja1wiIGlzIGFuIGFsaWFzIGZvciBcInlpZWxkXCIgc2luY2UgXCJ5aWVsZFwiIGlzIGludmFsaWQgaW4gc3RyaWN0IG1vZGUuXG4gICAgc3B5QXBpLmludm9rZUNhbGxiYWNrID0gc3B5QXBpLnlpZWxkO1xuICAgIGRlbGVnYXRlVG9DYWxscyhcInlpZWxkT25cIiwgZmFsc2UsIFwieWllbGRPblwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcih0aGlzLnRvU3RyaW5nKCkgKyBcIiBjYW5ub3QgeWllbGQgc2luY2UgaXQgd2FzIG5vdCB5ZXQgaW52b2tlZC5cIik7XG4gICAgfSk7XG4gICAgZGVsZWdhdGVUb0NhbGxzKFwieWllbGRUb1wiLCBmYWxzZSwgXCJ5aWVsZFRvXCIsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpICsgXCIgY2Fubm90IHlpZWxkIHRvICdcIiArIHByb3BlcnR5ICtcbiAgICAgICAgICAgIFwiJyBzaW5jZSBpdCB3YXMgbm90IHlldCBpbnZva2VkLlwiKTtcbiAgICB9KTtcbiAgICBkZWxlZ2F0ZVRvQ2FsbHMoXCJ5aWVsZFRvT25cIiwgZmFsc2UsIFwieWllbGRUb09uXCIsIGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IodGhpcy50b1N0cmluZygpICsgXCIgY2Fubm90IHlpZWxkIHRvICdcIiArIHByb3BlcnR5ICtcbiAgICAgICAgICAgIFwiJyBzaW5jZSBpdCB3YXMgbm90IHlldCBpbnZva2VkLlwiKTtcbiAgICB9KTtcblxuICAgIHNweUFwaS5mb3JtYXR0ZXJzID0ge1xuICAgICAgICBcImNcIjogZnVuY3Rpb24gKHNweSkge1xuICAgICAgICAgICAgcmV0dXJuIHNpbm9uLnRpbWVzSW5Xb3JkcyhzcHkuY2FsbENvdW50KTtcbiAgICAgICAgfSxcblxuICAgICAgICBcIm5cIjogZnVuY3Rpb24gKHNweSkge1xuICAgICAgICAgICAgcmV0dXJuIHNweS50b1N0cmluZygpO1xuICAgICAgICB9LFxuXG4gICAgICAgIFwiQ1wiOiBmdW5jdGlvbiAoc3B5KSB7XG4gICAgICAgICAgICB2YXIgY2FsbHMgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBzcHkuY2FsbENvdW50OyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0cmluZ2lmaWVkQ2FsbCA9IFwiICAgIFwiICsgc3B5LmdldENhbGwoaSkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBpZiAoL1xcbi8udGVzdChjYWxsc1tpIC0gMV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0cmluZ2lmaWVkQ2FsbCA9IFwiXFxuXCIgKyBzdHJpbmdpZmllZENhbGw7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHB1c2guY2FsbChjYWxscywgc3RyaW5naWZpZWRDYWxsKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNhbGxzLmxlbmd0aCA+IDAgPyBcIlxcblwiICsgY2FsbHMuam9pbihcIlxcblwiKSA6IFwiXCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgXCJ0XCI6IGZ1bmN0aW9uIChzcHkpIHtcbiAgICAgICAgICAgIHZhciBvYmplY3RzID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3B5LmNhbGxDb3VudDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIHB1c2guY2FsbChvYmplY3RzLCBzaW5vbi5mb3JtYXQoc3B5LnRoaXNWYWx1ZXNbaV0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9iamVjdHMuam9pbihcIiwgXCIpO1xuICAgICAgICB9LFxuXG4gICAgICAgIFwiKlwiOiBmdW5jdGlvbiAoc3B5LCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZm9ybWF0dGVkID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJncy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICBwdXNoLmNhbGwoZm9ybWF0dGVkLCBzaW5vbi5mb3JtYXQoYXJnc1tpXSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0dGVkLmpvaW4oXCIsIFwiKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzaW5vbi5leHRlbmQoc3B5LCBzcHlBcGkpO1xuXG4gICAgc3B5LnNweUNhbGwgPSBzaW5vbi5zcHlDYWxsO1xuXG4gICAgaWYgKGNvbW1vbkpTTW9kdWxlKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gc3B5O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbm9uLnNweSA9IHNweTtcbiAgICB9XG59KHR5cGVvZiBzaW5vbiA9PSBcIm9iamVjdFwiICYmIHNpbm9uIHx8IG51bGwpKTtcbiIsInZhciBwcm9jZXNzPXJlcXVpcmUoXCJfX2Jyb3dzZXJpZnlfcHJvY2Vzc1wiKTsvKipcbiAqIEBkZXBlbmQgLi4vc2lub24uanNcbiAqIEBkZXBlbmQgc3B5LmpzXG4gKi9cbi8qanNsaW50IGVxZXFlcTogZmFsc2UsIG9uZXZhcjogZmFsc2UqL1xuLypnbG9iYWwgbW9kdWxlLCByZXF1aXJlLCBzaW5vbiovXG4vKipcbiAqIFN0dWIgZnVuY3Rpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RpYW4gSm9oYW5zZW4gKGNocmlzdGlhbkBjam9oYW5zZW4ubm8pXG4gKiBAbGljZW5zZSBCU0RcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBDaHJpc3RpYW4gSm9oYW5zZW5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoc2lub24pIHtcbiAgICB2YXIgY29tbW9uSlNNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiO1xuXG4gICAgaWYgKCFzaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgICAgICBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNpbm9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzdHViKG9iamVjdCwgcHJvcGVydHksIGZ1bmMpIHtcbiAgICAgICAgaWYgKCEhZnVuYyAmJiB0eXBlb2YgZnVuYyAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDdXN0b20gc3R1YiBzaG91bGQgYmUgZnVuY3Rpb25cIik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd3JhcHBlcjtcblxuICAgICAgICBpZiAoZnVuYykge1xuICAgICAgICAgICAgd3JhcHBlciA9IHNpbm9uLnNweSAmJiBzaW5vbi5zcHkuY3JlYXRlID8gc2lub24uc3B5LmNyZWF0ZShmdW5jKSA6IGZ1bmM7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3cmFwcGVyID0gc3R1Yi5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghb2JqZWN0ICYmICFwcm9wZXJ0eSkge1xuICAgICAgICAgICAgcmV0dXJuIHNpbm9uLnN0dWIuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXByb3BlcnR5ICYmICEhb2JqZWN0ICYmIHR5cGVvZiBvYmplY3QgPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9iamVjdFtwcm9wXSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0dWIob2JqZWN0LCBwcm9wKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gc2lub24ud3JhcE1ldGhvZChvYmplY3QsIHByb3BlcnR5LCB3cmFwcGVyKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDaGFuZ2luZ1ZhbHVlKHN0dWIsIHByb3BlcnR5KSB7XG4gICAgICAgIHZhciBpbmRleCA9IHN0dWIuY2FsbENvdW50IC0gMTtcbiAgICAgICAgdmFyIHZhbHVlcyA9IHN0dWJbcHJvcGVydHldO1xuICAgICAgICB2YXIgcHJvcCA9IGluZGV4IGluIHZhbHVlcyA/IHZhbHVlc1tpbmRleF0gOiB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdO1xuICAgICAgICBzdHViW3Byb3BlcnR5ICsgXCJMYXN0XCJdID0gcHJvcDtcblxuICAgICAgICByZXR1cm4gcHJvcDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRDYWxsYmFjayhzdHViLCBhcmdzKSB7XG4gICAgICAgIHZhciBjYWxsQXJnQXQgPSBnZXRDaGFuZ2luZ1ZhbHVlKHN0dWIsIFwiY2FsbEFyZ0F0c1wiKTtcblxuICAgICAgICBpZiAoY2FsbEFyZ0F0IDwgMCkge1xuICAgICAgICAgICAgdmFyIGNhbGxBcmdQcm9wID0gZ2V0Q2hhbmdpbmdWYWx1ZShzdHViLCBcImNhbGxBcmdQcm9wc1wiKTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmdzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmICghY2FsbEFyZ1Byb3AgJiYgdHlwZW9mIGFyZ3NbaV0gPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmdzW2ldO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChjYWxsQXJnUHJvcCAmJiBhcmdzW2ldICYmXG4gICAgICAgICAgICAgICAgICAgIHR5cGVvZiBhcmdzW2ldW2NhbGxBcmdQcm9wXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3NbaV1bY2FsbEFyZ1Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJnc1tjYWxsQXJnQXRdO1xuICAgIH1cblxuICAgIHZhciBqb2luID0gQXJyYXkucHJvdG90eXBlLmpvaW47XG5cbiAgICBmdW5jdGlvbiBnZXRDYWxsYmFja0Vycm9yKHN0dWIsIGZ1bmMsIGFyZ3MpIHtcbiAgICAgICAgaWYgKHN0dWIuY2FsbEFyZ0F0c0xhc3QgPCAwKSB7XG4gICAgICAgICAgICB2YXIgbXNnO1xuXG4gICAgICAgICAgICBpZiAoc3R1Yi5jYWxsQXJnUHJvcHNMYXN0KSB7XG4gICAgICAgICAgICAgICAgbXNnID0gc2lub24uZnVuY3Rpb25OYW1lKHN0dWIpICtcbiAgICAgICAgICAgICAgICAgICAgXCIgZXhwZWN0ZWQgdG8geWllbGQgdG8gJ1wiICsgc3R1Yi5jYWxsQXJnUHJvcHNMYXN0ICtcbiAgICAgICAgICAgICAgICAgICAgXCInLCBidXQgbm8gb2JqZWN0IHdpdGggc3VjaCBhIHByb3BlcnR5IHdhcyBwYXNzZWQuXCJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbXNnID0gc2lub24uZnVuY3Rpb25OYW1lKHN0dWIpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIiBleHBlY3RlZCB0byB5aWVsZCwgYnV0IG5vIGNhbGxiYWNrIHdhcyBwYXNzZWQuXCJcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIG1zZyArPSBcIiBSZWNlaXZlZCBbXCIgKyBqb2luLmNhbGwoYXJncywgXCIsIFwiKSArIFwiXVwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gbXNnO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFwiYXJndW1lbnQgYXQgaW5kZXggXCIgKyBzdHViLmNhbGxBcmdBdHNMYXN0ICsgXCIgaXMgbm90IGEgZnVuY3Rpb246IFwiICsgZnVuYztcbiAgICB9XG5cbiAgICB2YXIgbmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHByb2Nlc3MubmV4dFRpY2sgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgcmV0dXJuIHByb2Nlc3MubmV4dFRpY2s7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gc2V0SW1tZWRpYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoY2FsbGJhY2ssIDApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBmdW5jdGlvbiBjYWxsQ2FsbGJhY2soc3R1YiwgYXJncykge1xuICAgICAgICBpZiAoc3R1Yi5jYWxsQXJnQXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHZhciBmdW5jID0gZ2V0Q2FsbGJhY2soc3R1YiwgYXJncyk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGdldENhbGxiYWNrRXJyb3Ioc3R1YiwgZnVuYywgYXJncykpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tBcmd1bWVudHMgPSBnZXRDaGFuZ2luZ1ZhbHVlKHN0dWIsIFwiY2FsbGJhY2tBcmd1bWVudHNcIik7XG4gICAgICAgICAgICB2YXIgY2FsbGJhY2tDb250ZXh0ID0gZ2V0Q2hhbmdpbmdWYWx1ZShzdHViLCBcImNhbGxiYWNrQ29udGV4dHNcIik7XG5cbiAgICAgICAgICAgIGlmIChzdHViLmNhbGxiYWNrQXN5bmMpIHtcbiAgICAgICAgICAgICAgICBuZXh0VGljayhmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuYy5hcHBseShjYWxsYmFja0NvbnRleHQsIGNhbGxiYWNrQXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZnVuYy5hcHBseShjYWxsYmFja0NvbnRleHQsIGNhbGxiYWNrQXJndW1lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHZhciB1dWlkID0gMDtcblxuICAgIHNpbm9uLmV4dGVuZChzdHViLCAoZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UsIHByb3RvO1xuXG4gICAgICAgIGZ1bmN0aW9uIHRocm93c0V4Y2VwdGlvbihlcnJvciwgbWVzc2FnZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5leGNlcHRpb24gPSBuZXcgRXJyb3IobWVzc2FnZSB8fCBcIlwiKTtcbiAgICAgICAgICAgICAgICB0aGlzLmV4Y2VwdGlvbi5uYW1lID0gZXJyb3I7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFlcnJvcikge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhjZXB0aW9uID0gbmV3IEVycm9yKFwiRXJyb3JcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZXhjZXB0aW9uID0gZXJyb3I7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJvdG8gPSB7XG4gICAgICAgICAgICBjcmVhdGU6IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZnVuY3Rpb25TdHViID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhmdW5jdGlvblN0dWIsIGFyZ3VtZW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGZ1bmN0aW9uU3R1Yi5leGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGZ1bmN0aW9uU3R1Yi5leGNlcHRpb247XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZ1bmN0aW9uU3R1Yi5yZXR1cm5BcmdBdCA9PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZ3VtZW50c1tmdW5jdGlvblN0dWIucmV0dXJuQXJnQXRdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZ1bmN0aW9uU3R1Yi5yZXR1cm5UaGlzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25TdHViLnJldHVyblZhbHVlO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvblN0dWIuaWQgPSBcInN0dWIjXCIgKyB1dWlkKys7XG4gICAgICAgICAgICAgICAgdmFyIG9yaWcgPSBmdW5jdGlvblN0dWI7XG4gICAgICAgICAgICAgICAgZnVuY3Rpb25TdHViID0gc2lub24uc3B5LmNyZWF0ZShmdW5jdGlvblN0dWIpO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uU3R1Yi5mdW5jID0gb3JpZztcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uU3R1Yi5jYWxsQXJnQXRzID0gW107XG4gICAgICAgICAgICAgICAgZnVuY3Rpb25TdHViLmNhbGxiYWNrQXJndW1lbnRzID0gW107XG4gICAgICAgICAgICAgICAgZnVuY3Rpb25TdHViLmNhbGxiYWNrQ29udGV4dHMgPSBbXTtcbiAgICAgICAgICAgICAgICBmdW5jdGlvblN0dWIuY2FsbEFyZ1Byb3BzID0gW107XG5cbiAgICAgICAgICAgICAgICBzaW5vbi5leHRlbmQoZnVuY3Rpb25TdHViLCBzdHViKTtcbiAgICAgICAgICAgICAgICBmdW5jdGlvblN0dWIuX2NyZWF0ZSA9IHNpbm9uLnN0dWIuY3JlYXRlO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uU3R1Yi5kaXNwbGF5TmFtZSA9IFwic3R1YlwiO1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uU3R1Yi50b1N0cmluZyA9IHNpbm9uLmZ1bmN0aW9uVG9TdHJpbmc7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb25TdHViO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgcmVzZXRCZWhhdmlvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnQXRzID0gW107XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0FyZ3VtZW50cyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tDb250ZXh0cyA9IFtdO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ1Byb3BzID0gW107XG5cbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5yZXR1cm5WYWx1ZTtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy5yZXR1cm5BcmdBdDtcbiAgICAgICAgICAgICAgICB0aGlzLnJldHVyblRoaXMgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZha2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLmZha2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZha2VzW2ldLnJlc2V0QmVoYXZpb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJldHVybnM6IGZ1bmN0aW9uIHJldHVybnModmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJldHVyblZhbHVlID0gdmFsdWU7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHJldHVybnNBcmc6IGZ1bmN0aW9uIHJldHVybnNBcmcocG9zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBwb3MgIT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJndW1lbnQgaW5kZXggaXMgbm90IG51bWJlclwiKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnJldHVybkFyZ0F0ID0gcG9zO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICByZXR1cm5zVGhpczogZnVuY3Rpb24gcmV0dXJuc1RoaXMoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXR1cm5UaGlzID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgXCJ0aHJvd3NcIjogdGhyb3dzRXhjZXB0aW9uLFxuICAgICAgICAgICAgdGhyb3dzRXhjZXB0aW9uOiB0aHJvd3NFeGNlcHRpb24sXG5cbiAgICAgICAgICAgIGNhbGxzQXJnOiBmdW5jdGlvbiBjYWxsc0FyZyhwb3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBvcyAhPSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhcmd1bWVudCBpbmRleCBpcyBub3QgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ0F0cy5wdXNoKHBvcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0FyZ3VtZW50cy5wdXNoKFtdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQ29udGV4dHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ1Byb3BzLnB1c2godW5kZWZpbmVkKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY2FsbHNBcmdPbjogZnVuY3Rpb24gY2FsbHNBcmdPbihwb3MsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBvcyAhPSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhcmd1bWVudCBpbmRleCBpcyBub3QgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQgIT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJndW1lbnQgY29udGV4dCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ0F0cy5wdXNoKHBvcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0FyZ3VtZW50cy5wdXNoKFtdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQ29udGV4dHMucHVzaChjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxBcmdQcm9wcy5wdXNoKHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIGNhbGxzQXJnV2l0aDogZnVuY3Rpb24gY2FsbHNBcmdXaXRoKHBvcykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcG9zICE9IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcImFyZ3VtZW50IGluZGV4IGlzIG5vdCBudW1iZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnQXRzLnB1c2gocG9zKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQXJndW1lbnRzLnB1c2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQ29udGV4dHMucHVzaCh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ1Byb3BzLnB1c2godW5kZWZpbmVkKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgY2FsbHNBcmdPbldpdGg6IGZ1bmN0aW9uIGNhbGxzQXJnV2l0aChwb3MsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHBvcyAhPSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhcmd1bWVudCBpbmRleCBpcyBub3QgbnVtYmVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQgIT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJndW1lbnQgY29udGV4dCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ0F0cy5wdXNoKHBvcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0FyZ3VtZW50cy5wdXNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0NvbnRleHRzLnB1c2goY29udGV4dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnUHJvcHMucHVzaCh1bmRlZmluZWQpO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgICAgICB5aWVsZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxBcmdBdHMucHVzaCgtMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0FyZ3VtZW50cy5wdXNoKHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFja0NvbnRleHRzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxBcmdQcm9wcy5wdXNoKHVuZGVmaW5lZCk7XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgIHlpZWxkc09uOiBmdW5jdGlvbiAoY29udGV4dCkge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29udGV4dCAhPSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJhcmd1bWVudCBjb250ZXh0IGlzIG5vdCBhbiBvYmplY3RcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnQXRzLnB1c2goLTEpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tBcmd1bWVudHMucHVzaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tDb250ZXh0cy5wdXNoKGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ1Byb3BzLnB1c2godW5kZWZpbmVkKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgeWllbGRzVG86IGZ1bmN0aW9uIChwcm9wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnQXRzLnB1c2goLTEpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tBcmd1bWVudHMucHVzaChzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tDb250ZXh0cy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsQXJnUHJvcHMucHVzaChwcm9wKTtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgeWllbGRzVG9PbjogZnVuY3Rpb24gKHByb3AsIGNvbnRleHQpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnRleHQgIT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJndW1lbnQgY29udGV4dCBpcyBub3QgYW4gb2JqZWN0XCIpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbEFyZ0F0cy5wdXNoKC0xKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQXJndW1lbnRzLnB1c2goc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrQ29udGV4dHMucHVzaChjb250ZXh0KTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxBcmdQcm9wcy5wdXNoKHByb3ApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gY3JlYXRlIGFzeW5jaHJvbm91cyB2ZXJzaW9ucyBvZiBjYWxsc0FyZyogYW5kIHlpZWxkcyogbWV0aG9kc1xuICAgICAgICBmb3IgKHZhciBtZXRob2QgaW4gcHJvdG8pIHtcbiAgICAgICAgICAgIC8vIG5lZWQgdG8gYXZvaWQgY3JlYXRpbmcgYW5vdGhlcmFzeW5jIHZlcnNpb25zIG9mIHRoZSBuZXdseSBhZGRlZCBhc3luYyBtZXRob2RzXG4gICAgICAgICAgICBpZiAocHJvdG8uaGFzT3duUHJvcGVydHkobWV0aG9kKSAmJlxuICAgICAgICAgICAgICAgIG1ldGhvZC5tYXRjaCgvXihjYWxsc0FyZ3x5aWVsZHN8dGhlbllpZWxkcyQpLykgJiZcbiAgICAgICAgICAgICAgICAhbWV0aG9kLm1hdGNoKC9Bc3luYy8pKSB7XG4gICAgICAgICAgICAgICAgcHJvdG9bbWV0aG9kICsgJ0FzeW5jJ10gPSAoZnVuY3Rpb24gKHN5bmNGbk5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tBc3luYyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1tzeW5jRm5OYW1lXS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pKG1ldGhvZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcHJvdG87XG5cbiAgICB9KCkpKTtcblxuICAgIGlmIChjb21tb25KU01vZHVsZSkge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IHN0dWI7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2lub24uc3R1YiA9IHN0dWI7XG4gICAgfVxufSh0eXBlb2Ygc2lub24gPT0gXCJvYmplY3RcIiAmJiBzaW5vbiB8fCBudWxsKSk7XG4iLCIvKipcbiAqIEBkZXBlbmQgLi4vc2lub24uanNcbiAqIEBkZXBlbmQgc3R1Yi5qc1xuICogQGRlcGVuZCBtb2NrLmpzXG4gKiBAZGVwZW5kIHNhbmRib3guanNcbiAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgZm9yaW46IHRydWUsIHBsdXNwbHVzOiBmYWxzZSovXG4vKmdsb2JhbCBtb2R1bGUsIHJlcXVpcmUsIHNpbm9uKi9cbi8qKlxuICogVGVzdCBmdW5jdGlvbiwgc2FuZGJveGVzIGZha2VzXG4gKlxuICogQGF1dGhvciBDaHJpc3RpYW4gSm9oYW5zZW4gKGNocmlzdGlhbkBjam9oYW5zZW4ubm8pXG4gKiBAbGljZW5zZSBCU0RcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBDaHJpc3RpYW4gSm9oYW5zZW5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoc2lub24pIHtcbiAgICB2YXIgY29tbW9uSlNNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiO1xuXG4gICAgaWYgKCFzaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgICAgICBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNpbm9uKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB0ZXN0KGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIGNhbGxiYWNrO1xuXG4gICAgICAgIGlmICh0eXBlICE9IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcInNpbm9uLnRlc3QgbmVlZHMgdG8gd3JhcCBhIHRlc3QgZnVuY3Rpb24sIGdvdCBcIiArIHR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjb25maWcgPSBzaW5vbi5nZXRDb25maWcoc2lub24uY29uZmlnKTtcbiAgICAgICAgICAgIGNvbmZpZy5pbmplY3RJbnRvID0gY29uZmlnLmluamVjdEludG9UaGlzICYmIHRoaXMgfHwgY29uZmlnLmluamVjdEludG87XG4gICAgICAgICAgICB2YXIgc2FuZGJveCA9IHNpbm9uLnNhbmRib3guY3JlYXRlKGNvbmZpZyk7XG4gICAgICAgICAgICB2YXIgZXhjZXB0aW9uLCByZXN1bHQ7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykuY29uY2F0KHNhbmRib3guYXJncyk7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gY2FsbGJhY2suYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgZXhjZXB0aW9uID0gZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBleGNlcHRpb24gIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgICAgICAgICBzYW5kYm94LnJlc3RvcmUoKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYW5kYm94LnZlcmlmeUFuZFJlc3RvcmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB0ZXN0LmNvbmZpZyA9IHtcbiAgICAgICAgaW5qZWN0SW50b1RoaXM6IHRydWUsXG4gICAgICAgIGluamVjdEludG86IG51bGwsXG4gICAgICAgIHByb3BlcnRpZXM6IFtcInNweVwiLCBcInN0dWJcIiwgXCJtb2NrXCIsIFwiY2xvY2tcIiwgXCJzZXJ2ZXJcIiwgXCJyZXF1ZXN0c1wiXSxcbiAgICAgICAgdXNlRmFrZVRpbWVyczogdHJ1ZSxcbiAgICAgICAgdXNlRmFrZVNlcnZlcjogdHJ1ZVxuICAgIH07XG5cbiAgICBpZiAoY29tbW9uSlNNb2R1bGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSB0ZXN0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbm9uLnRlc3QgPSB0ZXN0O1xuICAgIH1cbn0odHlwZW9mIHNpbm9uID09IFwib2JqZWN0XCIgJiYgc2lub24gfHwgbnVsbCkpO1xuIiwiLyoqXG4gKiBAZGVwZW5kIC4uL3Npbm9uLmpzXG4gKiBAZGVwZW5kIHRlc3QuanNcbiAqL1xuLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgZXFlcWVxOiBmYWxzZSovXG4vKmdsb2JhbCBtb2R1bGUsIHJlcXVpcmUsIHNpbm9uKi9cbi8qKlxuICogVGVzdCBjYXNlLCBzYW5kYm94ZXMgYWxsIHRlc3QgZnVuY3Rpb25zXG4gKlxuICogQGF1dGhvciBDaHJpc3RpYW4gSm9oYW5zZW4gKGNocmlzdGlhbkBjam9oYW5zZW4ubm8pXG4gKiBAbGljZW5zZSBCU0RcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTAtMjAxMyBDaHJpc3RpYW4gSm9oYW5zZW5cbiAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoc2lub24pIHtcbiAgICB2YXIgY29tbW9uSlNNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiO1xuXG4gICAgaWYgKCFzaW5vbiAmJiBjb21tb25KU01vZHVsZSkge1xuICAgICAgICBzaW5vbiA9IHJlcXVpcmUoXCIuLi9zaW5vblwiKTtcbiAgICB9XG5cbiAgICBpZiAoIXNpbm9uIHx8ICFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdGVUZXN0KHByb3BlcnR5LCBzZXRVcCwgdGVhckRvd24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzZXRVcCkge1xuICAgICAgICAgICAgICAgIHNldFVwLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBleGNlcHRpb24sIHJlc3VsdDtcblxuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBwcm9wZXJ0eS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGV4Y2VwdGlvbiA9IGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0ZWFyRG93bikge1xuICAgICAgICAgICAgICAgIHRlYXJEb3duLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdGVzdENhc2UodGVzdHMsIHByZWZpeCkge1xuICAgICAgICAvKmpzbDppZ25vcmUqL1xuICAgICAgICBpZiAoIXRlc3RzIHx8IHR5cGVvZiB0ZXN0cyAhPSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwic2lub24udGVzdENhc2UgbmVlZHMgYW4gb2JqZWN0IHdpdGggdGVzdCBmdW5jdGlvbnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgLypqc2w6ZW5kKi9cblxuICAgICAgICBwcmVmaXggPSBwcmVmaXggfHwgXCJ0ZXN0XCI7XG4gICAgICAgIHZhciByUHJlZml4ID0gbmV3IFJlZ0V4cChcIl5cIiArIHByZWZpeCk7XG4gICAgICAgIHZhciBtZXRob2RzID0ge30sIHRlc3ROYW1lLCBwcm9wZXJ0eSwgbWV0aG9kO1xuICAgICAgICB2YXIgc2V0VXAgPSB0ZXN0cy5zZXRVcDtcbiAgICAgICAgdmFyIHRlYXJEb3duID0gdGVzdHMudGVhckRvd247XG5cbiAgICAgICAgZm9yICh0ZXN0TmFtZSBpbiB0ZXN0cykge1xuICAgICAgICAgICAgaWYgKHRlc3RzLmhhc093blByb3BlcnR5KHRlc3ROYW1lKSkge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5ID0gdGVzdHNbdGVzdE5hbWVdO1xuXG4gICAgICAgICAgICAgICAgaWYgKC9eKHNldFVwfHRlYXJEb3duKSQvLnRlc3QodGVzdE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT0gXCJmdW5jdGlvblwiICYmIHJQcmVmaXgudGVzdCh0ZXN0TmFtZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gcHJvcGVydHk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHNldFVwIHx8IHRlYXJEb3duKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2QgPSBjcmVhdGVUZXN0KHByb3BlcnR5LCBzZXRVcCwgdGVhckRvd24pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1t0ZXN0TmFtZV0gPSBzaW5vbi50ZXN0KG1ldGhvZCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kc1t0ZXN0TmFtZV0gPSB0ZXN0c1t0ZXN0TmFtZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG1ldGhvZHM7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1vbkpTTW9kdWxlKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gdGVzdENhc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2lub24udGVzdENhc2UgPSB0ZXN0Q2FzZTtcbiAgICB9XG59KHR5cGVvZiBzaW5vbiA9PSBcIm9iamVjdFwiICYmIHNpbm9uIHx8IG51bGwpKTtcbiIsInZhciBnbG9iYWw9dHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9Oy8qanNsaW50IGVxZXFlcTogZmFsc2UsIHBsdXNwbHVzOiBmYWxzZSwgZXZpbDogdHJ1ZSwgb25ldmFyOiBmYWxzZSwgYnJvd3NlcjogdHJ1ZSwgZm9yaW46IGZhbHNlKi9cbi8qZ2xvYmFsIG1vZHVsZSwgcmVxdWlyZSwgd2luZG93Ki9cbi8qKlxuICogRmFrZSB0aW1lciBBUElcbiAqIHNldFRpbWVvdXRcbiAqIHNldEludGVydmFsXG4gKiBjbGVhclRpbWVvdXRcbiAqIGNsZWFySW50ZXJ2YWxcbiAqIHRpY2tcbiAqIHJlc2V0XG4gKiBEYXRlXG4gKlxuICogSW5zcGlyZWQgYnkganNVbml0TW9ja1RpbWVPdXQgZnJvbSBKc1VuaXRcbiAqXG4gKiBAYXV0aG9yIENocmlzdGlhbiBKb2hhbnNlbiAoY2hyaXN0aWFuQGNqb2hhbnNlbi5ubylcbiAqIEBsaWNlbnNlIEJTRFxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIENocmlzdGlhbiBKb2hhbnNlblxuICovXG5cInVzZSBzdHJpY3RcIjtcblxuaWYgKHR5cGVvZiBzaW5vbiA9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgdmFyIHNpbm9uID0ge307XG59XG5cbihmdW5jdGlvbiAoZ2xvYmFsKSB7XG4gICAgdmFyIGlkID0gMTtcblxuICAgIGZ1bmN0aW9uIGFkZFRpbWVyKGFyZ3MsIHJlY3VycmluZykge1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkZ1bmN0aW9uIHJlcXVpcmVzIGF0IGxlYXN0IDEgcGFyYW1ldGVyXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRvSWQgPSBpZCsrO1xuICAgICAgICB2YXIgZGVsYXkgPSBhcmdzWzFdIHx8IDA7XG5cbiAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXRzKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXRzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnRpbWVvdXRzW3RvSWRdID0ge1xuICAgICAgICAgICAgaWQ6IHRvSWQsXG4gICAgICAgICAgICBmdW5jOiBhcmdzWzBdLFxuICAgICAgICAgICAgY2FsbEF0OiB0aGlzLm5vdyArIGRlbGF5LFxuICAgICAgICAgICAgaW52b2tlQXJnczogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywgMilcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAocmVjdXJyaW5nID09PSB0cnVlKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXRzW3RvSWRdLmludGVydmFsID0gZGVsYXk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdG9JZDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYXJzZVRpbWUoc3RyKSB7XG4gICAgICAgIGlmICghc3RyKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzdHJpbmdzID0gc3RyLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgdmFyIGwgPSBzdHJpbmdzLmxlbmd0aCwgaSA9IGw7XG4gICAgICAgIHZhciBtcyA9IDAsIHBhcnNlZDtcblxuICAgICAgICBpZiAobCA+IDMgfHwgIS9eKFxcZFxcZDopezAsMn1cXGRcXGQ/JC8udGVzdChzdHIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0aWNrIG9ubHkgdW5kZXJzdGFuZHMgbnVtYmVycyBhbmQgJ2g6bTpzJ1wiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZ3NbaV0sIDEwKTtcblxuICAgICAgICAgICAgaWYgKHBhcnNlZCA+PSA2MCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgdGltZSBcIiArIHN0cik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1zICs9IHBhcnNlZCAqIE1hdGgucG93KDYwLCAobCAtIGkgLSAxKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbXMgKiAxMDAwO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNyZWF0ZU9iamVjdChvYmplY3QpIHtcbiAgICAgICAgdmFyIG5ld09iamVjdDtcblxuICAgICAgICBpZiAoT2JqZWN0LmNyZWF0ZSkge1xuICAgICAgICAgICAgbmV3T2JqZWN0ID0gT2JqZWN0LmNyZWF0ZShvYmplY3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIEYgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICAgICAgICAgIEYucHJvdG90eXBlID0gb2JqZWN0O1xuICAgICAgICAgICAgbmV3T2JqZWN0ID0gbmV3IEYoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG5ld09iamVjdC5EYXRlLmNsb2NrID0gbmV3T2JqZWN0O1xuICAgICAgICByZXR1cm4gbmV3T2JqZWN0O1xuICAgIH1cblxuICAgIHNpbm9uLmNsb2NrID0ge1xuICAgICAgICBub3c6IDAsXG5cbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiBjcmVhdGUobm93KSB7XG4gICAgICAgICAgICB2YXIgY2xvY2sgPSBjcmVhdGVPYmplY3QodGhpcyk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygbm93ID09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICBjbG9jay5ub3cgPSBub3c7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghIW5vdyAmJiB0eXBlb2Ygbm93ID09IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwibm93IHNob3VsZCBiZSBtaWxsaXNlY29uZHMgc2luY2UgVU5JWCBlcG9jaFwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGNsb2NrO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uIHNldFRpbWVvdXQoY2FsbGJhY2ssIHRpbWVvdXQpIHtcbiAgICAgICAgICAgIHJldHVybiBhZGRUaW1lci5jYWxsKHRoaXMsIGFyZ3VtZW50cywgZmFsc2UpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyVGltZW91dDogZnVuY3Rpb24gY2xlYXJUaW1lb3V0KHRpbWVySWQpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy50aW1lb3V0cykge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZW91dHMgPSBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRpbWVySWQgaW4gdGhpcy50aW1lb3V0cykge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRpbWVvdXRzW3RpbWVySWRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldEludGVydmFsOiBmdW5jdGlvbiBzZXRJbnRlcnZhbChjYWxsYmFjaywgdGltZW91dCkge1xuICAgICAgICAgICAgcmV0dXJuIGFkZFRpbWVyLmNhbGwodGhpcywgYXJndW1lbnRzLCB0cnVlKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjbGVhckludGVydmFsOiBmdW5jdGlvbiBjbGVhckludGVydmFsKHRpbWVySWQpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHRpY2s6IGZ1bmN0aW9uIHRpY2sobXMpIHtcbiAgICAgICAgICAgIG1zID0gdHlwZW9mIG1zID09IFwibnVtYmVyXCIgPyBtcyA6IHBhcnNlVGltZShtcyk7XG4gICAgICAgICAgICB2YXIgdGlja0Zyb20gPSB0aGlzLm5vdywgdGlja1RvID0gdGhpcy5ub3cgKyBtcywgcHJldmlvdXMgPSB0aGlzLm5vdztcbiAgICAgICAgICAgIHZhciB0aW1lciA9IHRoaXMuZmlyc3RUaW1lckluUmFuZ2UodGlja0Zyb20sIHRpY2tUbyk7XG5cbiAgICAgICAgICAgIHZhciBmaXJzdEV4Y2VwdGlvbjtcbiAgICAgICAgICAgIHdoaWxlICh0aW1lciAmJiB0aWNrRnJvbSA8PSB0aWNrVG8pIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0c1t0aW1lci5pZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgdGlja0Zyb20gPSB0aGlzLm5vdyA9IHRpbWVyLmNhbGxBdDtcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxUaW1lcih0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICBmaXJzdEV4Y2VwdGlvbiA9IGZpcnN0RXhjZXB0aW9uIHx8IGU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aW1lciA9IHRoaXMuZmlyc3RUaW1lckluUmFuZ2UocHJldmlvdXMsIHRpY2tUbyk7XG4gICAgICAgICAgICAgICAgcHJldmlvdXMgPSB0aWNrRnJvbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5ub3cgPSB0aWNrVG87XG5cbiAgICAgICAgICAgIGlmIChmaXJzdEV4Y2VwdGlvbikge1xuICAgICAgICAgICAgICB0aHJvdyBmaXJzdEV4Y2VwdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMubm93O1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpcnN0VGltZXJJblJhbmdlOiBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgICAgICAgICAgIHZhciB0aW1lciwgc21hbGxlc3QsIG9yaWdpbmFsVGltZXI7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGlkIGluIHRoaXMudGltZW91dHMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lb3V0cy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZW91dHNbaWRdLmNhbGxBdCA8IGZyb20gfHwgdGhpcy50aW1lb3V0c1tpZF0uY2FsbEF0ID4gdG8pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzbWFsbGVzdCB8fCB0aGlzLnRpbWVvdXRzW2lkXS5jYWxsQXQgPCBzbWFsbGVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3JpZ2luYWxUaW1lciA9IHRoaXMudGltZW91dHNbaWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgc21hbGxlc3QgPSB0aGlzLnRpbWVvdXRzW2lkXS5jYWxsQXQ7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpbWVyID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZ1bmM6IHRoaXMudGltZW91dHNbaWRdLmZ1bmMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbEF0OiB0aGlzLnRpbWVvdXRzW2lkXS5jYWxsQXQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW50ZXJ2YWw6IHRoaXMudGltZW91dHNbaWRdLmludGVydmFsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlkOiB0aGlzLnRpbWVvdXRzW2lkXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnZva2VBcmdzOiB0aGlzLnRpbWVvdXRzW2lkXS5pbnZva2VBcmdzXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdGltZXIgfHwgbnVsbDtcbiAgICAgICAgfSxcblxuICAgICAgICBjYWxsVGltZXI6IGZ1bmN0aW9uICh0aW1lcikge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aW1lci5pbnRlcnZhbCA9PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0c1t0aW1lci5pZF0uY2FsbEF0ICs9IHRpbWVyLmludGVydmFsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgdGhpcy50aW1lb3V0c1t0aW1lci5pZF07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aW1lci5mdW5jID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICB0aW1lci5mdW5jLmFwcGx5KG51bGwsIHRpbWVyLmludm9rZUFyZ3MpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGV2YWwodGltZXIuZnVuYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICB2YXIgZXhjZXB0aW9uID0gZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLnRpbWVvdXRzW3RpbWVyLmlkXSkge1xuICAgICAgICAgICAgICAgIGlmIChleGNlcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgIHRocm93IGV4Y2VwdGlvbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICByZXNldDogZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWVvdXRzID0ge307XG4gICAgICAgIH0sXG5cbiAgICAgICAgRGF0ZTogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBOYXRpdmVEYXRlID0gRGF0ZTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gQ2xvY2tEYXRlKHllYXIsIG1vbnRoLCBkYXRlLCBob3VyLCBtaW51dGUsIHNlY29uZCwgbXMpIHtcbiAgICAgICAgICAgICAgICAvLyBEZWZlbnNpdmUgYW5kIHZlcmJvc2UgdG8gYXZvaWQgcG90ZW50aWFsIGhhcm0gaW4gcGFzc2luZ1xuICAgICAgICAgICAgICAgIC8vIGV4cGxpY2l0IHVuZGVmaW5lZCB3aGVuIHVzZXIgZG9lcyBub3QgcGFzcyBhcmd1bWVudFxuICAgICAgICAgICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKENsb2NrRGF0ZS5jbG9jay5ub3cpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKHllYXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKHllYXIsIG1vbnRoKTtcbiAgICAgICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuZXcgTmF0aXZlRGF0ZSh5ZWFyLCBtb250aCwgZGF0ZSk7XG4gICAgICAgICAgICAgICAgY2FzZSA0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IE5hdGl2ZURhdGUoeWVhciwgbW9udGgsIGRhdGUsIGhvdXIpO1xuICAgICAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKHllYXIsIG1vbnRoLCBkYXRlLCBob3VyLCBtaW51dGUpO1xuICAgICAgICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKHllYXIsIG1vbnRoLCBkYXRlLCBob3VyLCBtaW51dGUsIHNlY29uZCk7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBOYXRpdmVEYXRlKHllYXIsIG1vbnRoLCBkYXRlLCBob3VyLCBtaW51dGUsIHNlY29uZCwgbXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG1pcnJvckRhdGVQcm9wZXJ0aWVzKENsb2NrRGF0ZSwgTmF0aXZlRGF0ZSk7XG4gICAgICAgIH0oKSlcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gbWlycm9yRGF0ZVByb3BlcnRpZXModGFyZ2V0LCBzb3VyY2UpIHtcbiAgICAgICAgaWYgKHNvdXJjZS5ub3cpIHtcbiAgICAgICAgICAgIHRhcmdldC5ub3cgPSBmdW5jdGlvbiBub3coKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5jbG9jay5ub3c7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRhcmdldC5ub3c7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc291cmNlLnRvU291cmNlKSB7XG4gICAgICAgICAgICB0YXJnZXQudG9Tb3VyY2UgPSBmdW5jdGlvbiB0b1NvdXJjZSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc291cmNlLnRvU291cmNlKCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVsZXRlIHRhcmdldC50b1NvdXJjZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldC50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZS50b1N0cmluZygpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRhcmdldC5wcm90b3R5cGUgPSBzb3VyY2UucHJvdG90eXBlO1xuICAgICAgICB0YXJnZXQucGFyc2UgPSBzb3VyY2UucGFyc2U7XG4gICAgICAgIHRhcmdldC5VVEMgPSBzb3VyY2UuVVRDO1xuICAgICAgICB0YXJnZXQucHJvdG90eXBlLnRvVVRDU3RyaW5nID0gc291cmNlLnByb3RvdHlwZS50b1VUQ1N0cmluZztcbiAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICB9XG5cbiAgICB2YXIgbWV0aG9kcyA9IFtcIkRhdGVcIiwgXCJzZXRUaW1lb3V0XCIsIFwic2V0SW50ZXJ2YWxcIixcbiAgICAgICAgICAgICAgICAgICBcImNsZWFyVGltZW91dFwiLCBcImNsZWFySW50ZXJ2YWxcIl07XG5cbiAgICBmdW5jdGlvbiByZXN0b3JlKCkge1xuICAgICAgICB2YXIgbWV0aG9kO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gdGhpcy5tZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgbWV0aG9kID0gdGhpcy5tZXRob2RzW2ldO1xuICAgICAgICAgICAgaWYgKGdsb2JhbFttZXRob2RdLmhhZE93blByb3BlcnR5KSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsW21ldGhvZF0gPSB0aGlzW1wiX1wiICsgbWV0aG9kXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGdsb2JhbFttZXRob2RdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gUHJldmVudCBtdWx0aXBsZSBleGVjdXRpb25zIHdoaWNoIHdpbGwgY29tcGxldGVseSByZW1vdmUgdGhlc2UgcHJvcHNcbiAgICAgICAgdGhpcy5tZXRob2RzID0gW107XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc3R1Ykdsb2JhbChtZXRob2QsIGNsb2NrKSB7XG4gICAgICAgIGNsb2NrW21ldGhvZF0uaGFkT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoZ2xvYmFsLCBtZXRob2QpO1xuICAgICAgICBjbG9ja1tcIl9cIiArIG1ldGhvZF0gPSBnbG9iYWxbbWV0aG9kXTtcblxuICAgICAgICBpZiAobWV0aG9kID09IFwiRGF0ZVwiKSB7XG4gICAgICAgICAgICB2YXIgZGF0ZSA9IG1pcnJvckRhdGVQcm9wZXJ0aWVzKGNsb2NrW21ldGhvZF0sIGdsb2JhbFttZXRob2RdKTtcbiAgICAgICAgICAgIGdsb2JhbFttZXRob2RdID0gZGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGdsb2JhbFttZXRob2RdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjbG9ja1ttZXRob2RdLmFwcGx5KGNsb2NrLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBjbG9ja1ttZXRob2RdKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNsb2NrW21ldGhvZF0uaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsW21ldGhvZF1bcHJvcF0gPSBjbG9ja1ttZXRob2RdW3Byb3BdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGdsb2JhbFttZXRob2RdLmNsb2NrID0gY2xvY2s7XG4gICAgfVxuXG4gICAgc2lub24udXNlRmFrZVRpbWVycyA9IGZ1bmN0aW9uIHVzZUZha2VUaW1lcnMobm93KSB7XG4gICAgICAgIHZhciBjbG9jayA9IHNpbm9uLmNsb2NrLmNyZWF0ZShub3cpO1xuICAgICAgICBjbG9jay5yZXN0b3JlID0gcmVzdG9yZTtcbiAgICAgICAgY2xvY2subWV0aG9kcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGVvZiBub3cgPT0gXCJudW1iZXJcIiA/IDEgOiAwKTtcblxuICAgICAgICBpZiAoY2xvY2subWV0aG9kcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNsb2NrLm1ldGhvZHMgPSBtZXRob2RzO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjbG9jay5tZXRob2RzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgc3R1Ykdsb2JhbChjbG9jay5tZXRob2RzW2ldLCBjbG9jayk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY2xvY2s7XG4gICAgfTtcbn0odHlwZW9mIGdsb2JhbCAhPSBcInVuZGVmaW5lZFwiICYmIHR5cGVvZiBnbG9iYWwgIT09IFwiZnVuY3Rpb25cIiA/IGdsb2JhbCA6IHRoaXMpKTtcblxuc2lub24udGltZXJzID0ge1xuICAgIHNldFRpbWVvdXQ6IHNldFRpbWVvdXQsXG4gICAgY2xlYXJUaW1lb3V0OiBjbGVhclRpbWVvdXQsXG4gICAgc2V0SW50ZXJ2YWw6IHNldEludGVydmFsLFxuICAgIGNsZWFySW50ZXJ2YWw6IGNsZWFySW50ZXJ2YWwsXG4gICAgRGF0ZTogRGF0ZVxufTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IHNpbm9uO1xufVxuIiwidmFyIGdsb2JhbD10eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge307aWYgKHR5cGVvZiBidXN0ZXIgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICB2YXIgYnVzdGVyID0ge307XG59XG5cbmlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBidXN0ZXIgPSByZXF1aXJlKFwiYnVzdGVyLWNvcmVcIik7XG59XG5cbmJ1c3Rlci5mb3JtYXQgPSBidXN0ZXIuZm9ybWF0IHx8IHt9O1xuYnVzdGVyLmZvcm1hdC5leGNsdWRlQ29uc3RydWN0b3JzID0gW1wiT2JqZWN0XCIsIC9eLiQvXTtcbmJ1c3Rlci5mb3JtYXQucXVvdGVTdHJpbmdzID0gdHJ1ZTtcblxuYnVzdGVyLmZvcm1hdC5hc2NpaSA9IChmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICAgIHZhciBzcGVjaWFsT2JqZWN0cyA9IFtdO1xuICAgIGlmICh0eXBlb2YgZ2xvYmFsICE9IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgICAgc3BlY2lhbE9iamVjdHMucHVzaCh7IG9iajogZ2xvYmFsLCB2YWx1ZTogXCJbb2JqZWN0IGdsb2JhbF1cIiB9KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgIHNwZWNpYWxPYmplY3RzLnB1c2goeyBvYmo6IGRvY3VtZW50LCB2YWx1ZTogXCJbb2JqZWN0IEhUTUxEb2N1bWVudF1cIiB9KTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICBzcGVjaWFsT2JqZWN0cy5wdXNoKHsgb2JqOiB3aW5kb3csIHZhbHVlOiBcIltvYmplY3QgV2luZG93XVwiIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGtleXMob2JqZWN0KSB7XG4gICAgICAgIHZhciBrID0gT2JqZWN0LmtleXMgJiYgT2JqZWN0LmtleXMob2JqZWN0KSB8fCBbXTtcblxuICAgICAgICBpZiAoay5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwob2JqZWN0LCBwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBrLnB1c2gocHJvcCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGsuc29ydCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGlzQ2lyY3VsYXIob2JqZWN0LCBvYmplY3RzKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ICE9IFwib2JqZWN0XCIpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gb2JqZWN0cy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgIGlmIChvYmplY3RzW2ldID09PSBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc2NpaShvYmplY3QsIHByb2Nlc3NlZCwgaW5kZW50KSB7XG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIHZhciBxdW90ZSA9IHR5cGVvZiB0aGlzLnF1b3RlU3RyaW5ncyAhPSBcImJvb2xlYW5cIiB8fCB0aGlzLnF1b3RlU3RyaW5ncztcbiAgICAgICAgICAgIHJldHVybiBwcm9jZXNzZWQgfHwgcXVvdGUgPyAnXCInICsgb2JqZWN0ICsgJ1wiJyA6IG9iamVjdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Ygb2JqZWN0ID09IFwiZnVuY3Rpb25cIiAmJiAhKG9iamVjdCBpbnN0YW5jZW9mIFJlZ0V4cCkpIHtcbiAgICAgICAgICAgIHJldHVybiBhc2NpaS5mdW5jKG9iamVjdCk7XG4gICAgICAgIH1cblxuICAgICAgICBwcm9jZXNzZWQgPSBwcm9jZXNzZWQgfHwgW107XG5cbiAgICAgICAgaWYgKGlzQ2lyY3VsYXIob2JqZWN0LCBwcm9jZXNzZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJbQ2lyY3VsYXJdXCI7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICAgICAgICByZXR1cm4gYXNjaWkuYXJyYXkuY2FsbCh0aGlzLCBvYmplY3QsIHByb2Nlc3NlZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIW9iamVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCIgKyBvYmplY3Q7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYnVzdGVyLmlzRWxlbWVudChvYmplY3QpKSB7XG4gICAgICAgICAgICByZXR1cm4gYXNjaWkuZWxlbWVudChvYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBvYmplY3QudG9TdHJpbmcgPT0gXCJmdW5jdGlvblwiICYmXG4gICAgICAgICAgICBvYmplY3QudG9TdHJpbmcgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiBvYmplY3QudG9TdHJpbmcoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gc3BlY2lhbE9iamVjdHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAob2JqZWN0ID09PSBzcGVjaWFsT2JqZWN0c1tpXS5vYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3BlY2lhbE9iamVjdHNbaV0udmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXNjaWkub2JqZWN0LmNhbGwodGhpcywgb2JqZWN0LCBwcm9jZXNzZWQsIGluZGVudCk7XG4gICAgfVxuXG4gICAgYXNjaWkuZnVuYyA9IGZ1bmN0aW9uIChmdW5jKSB7XG4gICAgICAgIHJldHVybiBcImZ1bmN0aW9uIFwiICsgYnVzdGVyLmZ1bmN0aW9uTmFtZShmdW5jKSArIFwiKCkge31cIjtcbiAgICB9O1xuXG4gICAgYXNjaWkuYXJyYXkgPSBmdW5jdGlvbiAoYXJyYXksIHByb2Nlc3NlZCkge1xuICAgICAgICBwcm9jZXNzZWQgPSBwcm9jZXNzZWQgfHwgW107XG4gICAgICAgIHByb2Nlc3NlZC5wdXNoKGFycmF5KTtcbiAgICAgICAgdmFyIHBpZWNlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyYXkubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBwaWVjZXMucHVzaChhc2NpaS5jYWxsKHRoaXMsIGFycmF5W2ldLCBwcm9jZXNzZWQpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBcIltcIiArIHBpZWNlcy5qb2luKFwiLCBcIikgKyBcIl1cIjtcbiAgICB9O1xuXG4gICAgYXNjaWkub2JqZWN0ID0gZnVuY3Rpb24gKG9iamVjdCwgcHJvY2Vzc2VkLCBpbmRlbnQpIHtcbiAgICAgICAgcHJvY2Vzc2VkID0gcHJvY2Vzc2VkIHx8IFtdO1xuICAgICAgICBwcm9jZXNzZWQucHVzaChvYmplY3QpO1xuICAgICAgICBpbmRlbnQgPSBpbmRlbnQgfHwgMDtcbiAgICAgICAgdmFyIHBpZWNlcyA9IFtdLCBwcm9wZXJ0aWVzID0ga2V5cyhvYmplY3QpLCBwcm9wLCBzdHIsIG9iajtcbiAgICAgICAgdmFyIGlzID0gXCJcIjtcbiAgICAgICAgdmFyIGxlbmd0aCA9IDM7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBpbmRlbnQ7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgIGlzICs9IFwiIFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHByb3BlcnRpZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBwcm9wID0gcHJvcGVydGllc1tpXTtcbiAgICAgICAgICAgIG9iaiA9IG9iamVjdFtwcm9wXTtcblxuICAgICAgICAgICAgaWYgKGlzQ2lyY3VsYXIob2JqLCBwcm9jZXNzZWQpKSB7XG4gICAgICAgICAgICAgICAgc3RyID0gXCJbQ2lyY3VsYXJdXCI7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0ciA9IGFzY2lpLmNhbGwodGhpcywgb2JqLCBwcm9jZXNzZWQsIGluZGVudCArIDIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdHIgPSAoL1xccy8udGVzdChwcm9wKSA/ICdcIicgKyBwcm9wICsgJ1wiJyA6IHByb3ApICsgXCI6IFwiICsgc3RyO1xuICAgICAgICAgICAgbGVuZ3RoICs9IHN0ci5sZW5ndGg7XG4gICAgICAgICAgICBwaWVjZXMucHVzaChzdHIpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbnMgPSBhc2NpaS5jb25zdHJ1Y3Rvck5hbWUuY2FsbCh0aGlzLCBvYmplY3QpO1xuICAgICAgICB2YXIgcHJlZml4ID0gY29ucyA/IFwiW1wiICsgY29ucyArIFwiXSBcIiA6IFwiXCJcblxuICAgICAgICByZXR1cm4gKGxlbmd0aCArIGluZGVudCkgPiA4MCA/XG4gICAgICAgICAgICBwcmVmaXggKyBcIntcXG4gIFwiICsgaXMgKyBwaWVjZXMuam9pbihcIixcXG4gIFwiICsgaXMpICsgXCJcXG5cIiArIGlzICsgXCJ9XCIgOlxuICAgICAgICAgICAgcHJlZml4ICsgXCJ7IFwiICsgcGllY2VzLmpvaW4oXCIsIFwiKSArIFwiIH1cIjtcbiAgICB9O1xuXG4gICAgYXNjaWkuZWxlbWVudCA9IGZ1bmN0aW9uIChlbGVtZW50KSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIHZhciBhdHRycyA9IGVsZW1lbnQuYXR0cmlidXRlcywgYXR0cmlidXRlLCBwYWlycyA9IFtdLCBhdHRyTmFtZTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGF0dHJzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgYXR0cmlidXRlID0gYXR0cnMuaXRlbShpKTtcbiAgICAgICAgICAgIGF0dHJOYW1lID0gYXR0cmlidXRlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZShcImh0bWw6XCIsIFwiXCIpO1xuXG4gICAgICAgICAgICBpZiAoYXR0ck5hbWUgPT0gXCJjb250ZW50ZWRpdGFibGVcIiAmJiBhdHRyaWJ1dGUubm9kZVZhbHVlID09IFwiaW5oZXJpdFwiKSB7XG4gICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghIWF0dHJpYnV0ZS5ub2RlVmFsdWUpIHtcbiAgICAgICAgICAgICAgICBwYWlycy5wdXNoKGF0dHJOYW1lICsgXCI9XFxcIlwiICsgYXR0cmlidXRlLm5vZGVWYWx1ZSArIFwiXFxcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBmb3JtYXR0ZWQgPSBcIjxcIiArIHRhZ05hbWUgKyAocGFpcnMubGVuZ3RoID4gMCA/IFwiIFwiIDogXCJcIik7XG4gICAgICAgIHZhciBjb250ZW50ID0gZWxlbWVudC5pbm5lckhUTUw7XG5cbiAgICAgICAgaWYgKGNvbnRlbnQubGVuZ3RoID4gMjApIHtcbiAgICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnN1YnN0cigwLCAyMCkgKyBcIlsuLi5dXCI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzID0gZm9ybWF0dGVkICsgcGFpcnMuam9pbihcIiBcIikgKyBcIj5cIiArIGNvbnRlbnQgKyBcIjwvXCIgKyB0YWdOYW1lICsgXCI+XCI7XG5cbiAgICAgICAgcmV0dXJuIHJlcy5yZXBsYWNlKC8gY29udGVudEVkaXRhYmxlPVwiaW5oZXJpdFwiLywgXCJcIik7XG4gICAgfTtcblxuICAgIGFzY2lpLmNvbnN0cnVjdG9yTmFtZSA9IGZ1bmN0aW9uIChvYmplY3QpIHtcbiAgICAgICAgdmFyIG5hbWUgPSBidXN0ZXIuZnVuY3Rpb25OYW1lKG9iamVjdCAmJiBvYmplY3QuY29uc3RydWN0b3IpO1xuICAgICAgICB2YXIgZXhjbHVkZXMgPSB0aGlzLmV4Y2x1ZGVDb25zdHJ1Y3RvcnMgfHwgYnVzdGVyLmZvcm1hdC5leGNsdWRlQ29uc3RydWN0b3JzIHx8IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZXhjbHVkZXMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4Y2x1ZGVzW2ldID09IFwic3RyaW5nXCIgJiYgZXhjbHVkZXNbaV0gPT0gbmFtZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChleGNsdWRlc1tpXS50ZXN0ICYmIGV4Y2x1ZGVzW2ldLnRlc3QobmFtZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH07XG5cbiAgICByZXR1cm4gYXNjaWk7XG59KCkpO1xuXG5pZiAodHlwZW9mIG1vZHVsZSAhPSBcInVuZGVmaW5lZFwiKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBidXN0ZXIuZm9ybWF0O1xufVxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpO3ZhciBidXN0ZXIgPSAoZnVuY3Rpb24gKHNldFRpbWVvdXQsIEIpIHtcbiAgICB2YXIgaXNOb2RlID0gdHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBtb2R1bGUgPT0gXCJvYmplY3RcIjtcbiAgICB2YXIgZGl2ID0gdHlwZW9mIGRvY3VtZW50ICE9IFwidW5kZWZpbmVkXCIgJiYgZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB2YXIgRiA9IGZ1bmN0aW9uICgpIHt9O1xuXG4gICAgdmFyIGJ1c3RlciA9IHtcbiAgICAgICAgYmluZDogZnVuY3Rpb24gYmluZChvYmosIG1ldGhPclByb3ApIHtcbiAgICAgICAgICAgIHZhciBtZXRob2QgPSB0eXBlb2YgbWV0aE9yUHJvcCA9PSBcInN0cmluZ1wiID8gb2JqW21ldGhPclByb3BdIDogbWV0aE9yUHJvcDtcbiAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGFsbEFyZ3MgPSBhcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KG9iaiwgYWxsQXJncyk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcnRpYWw6IGZ1bmN0aW9uIHBhcnRpYWwoZm4pIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncy5jb25jYXQoW10uc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuXG4gICAgICAgIGNyZWF0ZTogZnVuY3Rpb24gY3JlYXRlKG9iamVjdCkge1xuICAgICAgICAgICAgRi5wcm90b3R5cGUgPSBvYmplY3Q7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEYoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBleHRlbmQ6IGZ1bmN0aW9uIGV4dGVuZCh0YXJnZXQpIHtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7IHJldHVybjsgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDEsIGwgPSBhcmd1bWVudHMubGVuZ3RoLCBwcm9wOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChwcm9wIGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgICAgICAgICAgICAgICB0YXJnZXRbcHJvcF0gPSBhcmd1bWVudHNbaV1bcHJvcF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldDtcbiAgICAgICAgfSxcblxuICAgICAgICBuZXh0VGljazogZnVuY3Rpb24gbmV4dFRpY2soY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPSBcInVuZGVmaW5lZFwiICYmIHByb2Nlc3MubmV4dFRpY2spIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJvY2Vzcy5uZXh0VGljayhjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAwKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbk5hbWU6IGZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmdW5jKSB7XG4gICAgICAgICAgICBpZiAoIWZ1bmMpIHJldHVybiBcIlwiO1xuICAgICAgICAgICAgaWYgKGZ1bmMuZGlzcGxheU5hbWUpIHJldHVybiBmdW5jLmRpc3BsYXlOYW1lO1xuICAgICAgICAgICAgaWYgKGZ1bmMubmFtZSkgcmV0dXJuIGZ1bmMubmFtZTtcbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gZnVuYy50b1N0cmluZygpLm1hdGNoKC9mdW5jdGlvblxccysoW15cXChdKykvbSk7XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlcyAmJiBtYXRjaGVzWzFdIHx8IFwiXCI7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNOb2RlOiBmdW5jdGlvbiBpc05vZGUob2JqKSB7XG4gICAgICAgICAgICBpZiAoIWRpdikgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBvYmouYXBwZW5kQ2hpbGQoZGl2KTtcbiAgICAgICAgICAgICAgICBvYmoucmVtb3ZlQ2hpbGQoZGl2KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0VsZW1lbnQ6IGZ1bmN0aW9uIGlzRWxlbWVudChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxICYmIGJ1c3Rlci5pc05vZGUob2JqKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0FycmF5OiBmdW5jdGlvbiBpc0FycmF5KGFycikge1xuICAgICAgICAgICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09IFwiW29iamVjdCBBcnJheV1cIjtcbiAgICAgICAgfSxcblxuICAgICAgICBmbGF0dGVuOiBmdW5jdGlvbiBmbGF0dGVuKGFycikge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdLCBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyci5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KGJ1c3Rlci5pc0FycmF5KGFycltpXSkgPyBmbGF0dGVuKGFycltpXSkgOiBhcnJbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcblxuICAgICAgICBlYWNoOiBmdW5jdGlvbiBlYWNoKGFyciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGFycltpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgbWFwOiBmdW5jdGlvbiBtYXAoYXJyLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYXJyLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdHMucHVzaChjYWxsYmFjayhhcnJbaV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICB9LFxuXG4gICAgICAgIHBhcmFsbGVsOiBmdW5jdGlvbiBwYXJhbGxlbChmbnMsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiBjYihlcnIsIHJlcykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzKTtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChmbnMubGVuZ3RoID09IDApIHsgcmV0dXJuIGNiKG51bGwsIFtdKTsgfVxuICAgICAgICAgICAgdmFyIHJlbWFpbmluZyA9IGZucy5sZW5ndGgsIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZ1bmN0aW9uIG1ha2VEb25lKG51bSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBkb25lKGVyciwgcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHsgcmV0dXJuIGNiKGVycik7IH1cbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1tudW1dID0gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICBpZiAoLS1yZW1haW5pbmcgPT0gMCkgeyBjYihudWxsLCByZXN1bHRzKTsgfVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZucy5sZW5ndGg7IGkgPCBsOyArK2kpIHtcbiAgICAgICAgICAgICAgICBmbnNbaV0obWFrZURvbmUoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNlcmllczogZnVuY3Rpb24gc2VyaWVzKGZucywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGNiKGVyciwgcmVzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZW1haW5pbmcgPSBmbnMuc2xpY2UoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgICAgICBmdW5jdGlvbiBjYWxsTmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nLmxlbmd0aCA9PSAwKSByZXR1cm4gY2IobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICAgICAgdmFyIHByb21pc2UgPSByZW1haW5pbmcuc2hpZnQoKShuZXh0KTtcbiAgICAgICAgICAgICAgICBpZiAocHJvbWlzZSAmJiB0eXBlb2YgcHJvbWlzZS50aGVuID09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBwcm9taXNlLnRoZW4oYnVzdGVyLnBhcnRpYWwobmV4dCwgbnVsbCksIG5leHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyLCByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSByZXR1cm4gY2IoZXJyKTtcbiAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2gocmVzdWx0KTtcbiAgICAgICAgICAgICAgICBjYWxsTmV4dCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FsbE5leHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb3VudGRvd246IGZ1bmN0aW9uIGNvdW50ZG93bihudW0sIGRvbmUpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKC0tbnVtID09IDApIGRvbmUoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSBcIm9iamVjdFwiICYmXG4gICAgICAgIHR5cGVvZiByZXF1aXJlID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgICB2YXIgY3J5cHRvID0gcmVxdWlyZShcImNyeXB0b1wiKTtcbiAgICAgICAgdmFyIHBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcblxuICAgICAgICBidXN0ZXIudG1wRmlsZSA9IGZ1bmN0aW9uIChmaWxlTmFtZSkge1xuICAgICAgICAgICAgdmFyIGhhc2hlZCA9IGNyeXB0by5jcmVhdGVIYXNoKFwic2hhMVwiKTtcbiAgICAgICAgICAgIGhhc2hlZC51cGRhdGUoZmlsZU5hbWUpO1xuICAgICAgICAgICAgdmFyIHRtcGZpbGVOYW1lID0gaGFzaGVkLmRpZ2VzdChcImhleFwiKTtcblxuICAgICAgICAgICAgaWYgKHByb2Nlc3MucGxhdGZvcm0gPT0gXCJ3aW4zMlwiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihwcm9jZXNzLmVudltcIlRFTVBcIl0sIHRtcGZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGguam9pbihcIi90bXBcIiwgdG1wZmlsZU5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChBcnJheS5wcm90b3R5cGUuc29tZSkge1xuICAgICAgICBidXN0ZXIuc29tZSA9IGZ1bmN0aW9uIChhcnIsIGZuLCB0aGlzcCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5zb21lKGZuLCB0aGlzcCk7XG4gICAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4vSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvQXJyYXkvc29tZVxuICAgICAgICBidXN0ZXIuc29tZSA9IGZ1bmN0aW9uIChhcnIsIGZ1biwgdGhpc3ApIHtcbiAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgaWYgKGFyciA9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoKTsgfVxuICAgICAgICAgICAgYXJyID0gT2JqZWN0KGFycik7XG4gICAgICAgICAgICB2YXIgbGVuID0gYXJyLmxlbmd0aCA+Pj4gMDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZnVuICE9PSBcImZ1bmN0aW9uXCIpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcigpOyB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJyLmhhc093blByb3BlcnR5KGkpICYmIGZ1bi5jYWxsKHRoaXNwLCBhcnJbaV0sIGksIGFycikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LnByb3RvdHlwZS5maWx0ZXIpIHtcbiAgICAgICAgYnVzdGVyLmZpbHRlciA9IGZ1bmN0aW9uIChhcnIsIGZuLCB0aGlzcCkge1xuICAgICAgICAgICAgcmV0dXJuIGFyci5maWx0ZXIoZm4sIHRoaXNwKTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9maWx0ZXJcbiAgICAgICAgYnVzdGVyLmZpbHRlciA9IGZ1bmN0aW9uIChmbiwgdGhpc3ApIHtcbiAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgaWYgKHRoaXMgPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCk7IH1cblxuICAgICAgICAgICAgdmFyIHQgPSBPYmplY3QodGhpcyk7XG4gICAgICAgICAgICB2YXIgbGVuID0gdC5sZW5ndGggPj4+IDA7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZuICE9IFwiZnVuY3Rpb25cIikgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCk7IH1cblxuICAgICAgICAgICAgdmFyIHJlcyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgICAgICAgIGlmIChpIGluIHQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IHRbaV07IC8vIGluIGNhc2UgZnVuIG11dGF0ZXMgdGhpc1xuICAgICAgICAgICAgICAgICAgICBpZiAoZm4uY2FsbCh0aGlzcCwgdmFsLCBpLCB0KSkgeyByZXMucHVzaCh2YWwpOyB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gcmVzO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChpc05vZGUpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBidXN0ZXI7XG4gICAgICAgIGJ1c3Rlci5ldmVudEVtaXR0ZXIgPSByZXF1aXJlKFwiLi9idXN0ZXItZXZlbnQtZW1pdHRlclwiKTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGJ1c3RlciwgXCJkZWZpbmVWZXJzaW9uR2V0dGVyXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXF1aXJlKFwiLi9kZWZpbmUtdmVyc2lvbi1nZXR0ZXJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBidXN0ZXIuZXh0ZW5kKEIgfHwge30sIGJ1c3Rlcik7XG59KHNldFRpbWVvdXQsIGJ1c3RlcikpO1xuIiwiLypqc2xpbnQgZXFlcWVxOiBmYWxzZSwgb25ldmFyOiBmYWxzZSwgcGx1c3BsdXM6IGZhbHNlKi9cbi8qZ2xvYmFsIGJ1c3RlciwgcmVxdWlyZSwgbW9kdWxlKi9cbmlmICh0eXBlb2YgcmVxdWlyZSA9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIG1vZHVsZSA9PSBcIm9iamVjdFwiKSB7XG4gICAgdmFyIGJ1c3RlciA9IHJlcXVpcmUoXCIuL2J1c3Rlci1jb3JlXCIpO1xufVxuXG4oZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIGV2ZW50TGlzdGVuZXJzKGV2ZW50RW1pdHRlciwgZXZlbnQpIHtcbiAgICAgICAgaWYgKCFldmVudEVtaXR0ZXIubGlzdGVuZXJzKSB7XG4gICAgICAgICAgICBldmVudEVtaXR0ZXIubGlzdGVuZXJzID0ge307XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWV2ZW50RW1pdHRlci5saXN0ZW5lcnNbZXZlbnRdKSB7XG4gICAgICAgICAgICBldmVudEVtaXR0ZXIubGlzdGVuZXJzW2V2ZW50XSA9IFtdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50RW1pdHRlci5saXN0ZW5lcnNbZXZlbnRdO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHRocm93TGF0ZXIoZXZlbnQsIGVycm9yKSB7XG4gICAgICAgIGJ1c3Rlci5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBlcnJvci5tZXNzYWdlID0gZXZlbnQgKyBcIiBsaXN0ZW5lciB0aHJldyBlcnJvcjogXCIgKyBlcnJvci5tZXNzYWdlO1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZFN1cGVydmlzb3IoZW1pdHRlciwgbGlzdGVuZXIsIHRoaXNPYmplY3QpIHtcbiAgICAgICAgaWYgKCFlbWl0dGVyLnN1cGVydmlzb3JzKSB7IGVtaXR0ZXIuc3VwZXJ2aXNvcnMgPSBbXTsgfVxuICAgICAgICBlbWl0dGVyLnN1cGVydmlzb3JzLnB1c2goe1xuICAgICAgICAgICAgbGlzdGVuZXI6IGxpc3RlbmVyLFxuICAgICAgICAgICAgdGhpc09iamVjdDogdGhpc09iamVjdFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub3RpZnlMaXN0ZW5lcihlbWl0dGVyLCBldmVudCwgbGlzdGVuZXIsIGFyZ3MpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyLmFwcGx5KGxpc3RlbmVyLnRoaXNPYmplY3QgfHwgZW1pdHRlciwgYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHRocm93TGF0ZXIoZXZlbnQsIGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYnVzdGVyLmV2ZW50RW1pdHRlciA9IHtcbiAgICAgICAgY3JlYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVzdGVyLmNyZWF0ZSh0aGlzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGRMaXN0ZW5lcjogZnVuY3Rpb24gYWRkTGlzdGVuZXIoZXZlbnQsIGxpc3RlbmVyLCB0aGlzT2JqZWN0KSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWRkU3VwZXJ2aXNvcih0aGlzLCBldmVudCwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTGlzdGVuZXIgaXMgbm90IGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZXZlbnRMaXN0ZW5lcnModGhpcywgZXZlbnQpLnB1c2goe1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyOiBsaXN0ZW5lcixcbiAgICAgICAgICAgICAgICB0aGlzT2JqZWN0OiB0aGlzT2JqZWN0XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbmNlOiBmdW5jdGlvbiBvbmNlKGV2ZW50LCBsaXN0ZW5lciwgdGhpc09iamVjdCkge1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihldmVudCwgbGlzdGVuZXIpO1xuXG4gICAgICAgICAgICB2YXIgd3JhcHBlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcihldmVudCwgd3JhcHBlZCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihldmVudCwgd3JhcHBlZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzTGlzdGVuZXI6IGZ1bmN0aW9uIGhhc0xpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lciwgdGhpc09iamVjdCkge1xuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IGV2ZW50TGlzdGVuZXJzKHRoaXMsIGV2ZW50KTtcblxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGxpc3RlbmVyc1tpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIgJiZcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzW2ldLnRoaXNPYmplY3QgPT09IHRoaXNPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgcmVtb3ZlTGlzdGVuZXI6IGZ1bmN0aW9uIChldmVudCwgbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSBldmVudExpc3RlbmVycyh0aGlzLCBldmVudCk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIGlmIChsaXN0ZW5lcnNbaV0ubGlzdGVuZXIgPT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBlbWl0OiBmdW5jdGlvbiBlbWl0KGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gZXZlbnRMaXN0ZW5lcnModGhpcywgZXZlbnQpLnNsaWNlKCk7XG4gICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVyKHRoaXMsIGV2ZW50LCBsaXN0ZW5lcnNbaV0sIGFyZ3MpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsaXN0ZW5lcnMgPSB0aGlzLnN1cGVydmlzb3JzIHx8IFtdO1xuICAgICAgICAgICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmb3IgKGkgPSAwLCBsID0gbGlzdGVuZXJzLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgICAgICAgICAgICAgIG5vdGlmeUxpc3RlbmVyKHRoaXMsIGV2ZW50LCBsaXN0ZW5lcnNbaV0sIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uIChvYmplY3QsIGV2ZW50cykge1xuICAgICAgICAgICAgdmFyIG1ldGhvZDtcblxuICAgICAgICAgICAgaWYgKCFldmVudHMpIHtcbiAgICAgICAgICAgICAgICBmb3IgKG1ldGhvZCBpbiBvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iamVjdC5oYXNPd25Qcm9wZXJ0eShtZXRob2QpICYmIHR5cGVvZiBvYmplY3RbbWV0aG9kXSA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIobWV0aG9kLCBvYmplY3RbbWV0aG9kXSwgb2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGV2ZW50cyA9PSBcInN0cmluZ1wiIHx8XG4gICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChldmVudHMpID09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICAgICAgICAgIGV2ZW50cyA9IHR5cGVvZiBldmVudHMgPT0gXCJzdHJpbmdcIiA/IFtldmVudHNdIDogZXZlbnRzO1xuXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBldmVudHMubGVuZ3RoOyBpIDwgbDsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoZXZlbnRzW2ldLCBvYmplY3RbZXZlbnRzW2ldXSwgb2JqZWN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gZXZlbnRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudHMuaGFzT3duUHJvcGVydHkocHJvcCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZCA9IGV2ZW50c1twcm9wXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBtZXRob2QgPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2J1c3Rlci5mdW5jdGlvbk5hbWUobWV0aG9kKSB8fCBwcm9wXSA9IG1ldGhvZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kID0gb2JqZWN0W2V2ZW50c1twcm9wXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIocHJvcCwgbWV0aG9kLCBvYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gb2JqZWN0O1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGJ1c3Rlci5ldmVudEVtaXR0ZXIub24gPSBidXN0ZXIuZXZlbnRFbWl0dGVyLmFkZExpc3RlbmVyO1xufSgpKTtcblxuaWYgKHR5cGVvZiBtb2R1bGUgIT0gXCJ1bmRlZmluZWRcIikge1xuICAgIG1vZHVsZS5leHBvcnRzID0gYnVzdGVyLmV2ZW50RW1pdHRlcjtcbn1cbiIsInZhciBwYXRoID0gcmVxdWlyZShcInBhdGhcIik7XG52YXIgZnMgPSByZXF1aXJlKFwiZnNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lVmVyc2lvbkdldHRlcihtb2QsIGRpcm5hbWUpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobW9kLCBcIlZFUlNJT05cIiwge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52ZXJzaW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBrZ0pTT04gPSBwYXRoLnJlc29sdmUoZGlybmFtZSwgXCIuLlwiLCBcInBhY2thZ2UuanNvblwiKTtcbiAgICAgICAgICAgICAgICB2YXIgcGtnID0gSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGtnSlNPTiwgXCJ1dGY4XCIpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnZlcnNpb24gPSBwa2cudmVyc2lvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMudmVyc2lvbjtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLypcbiAqIFVzZWQgYnkgdGVzdC9qc29uX2hhbC5qc1xuICovXG5cbnZhciBlbWJlZGRlZE9yZGVycyA9IFt7XG4gICdfbGlua3MnOiB7XG4gICAgJ3NlbGYnOiB7ICdocmVmJzogJy9vcmRlcnMvMTIzJyB9LFxuICAgICdlYTpiYXNrZXQnOiB7ICdocmVmJzogJy9iYXNrZXRzLzk4NycgfSxcbiAgICAnZWE6Y3VzdG9tZXInOiB7ICdocmVmJzogJy9jdXN0b21lcnMvNjU0JyB9XG4gIH0sXG4gICd0b3RhbCc6IDMwLjAwLFxuICAnY3VycmVuY3knOiAnVVNEJyxcbiAgJ3N0YXR1cyc6ICdzaGlwcGVkJ1xufSwge1xuICAnX2xpbmtzJzoge1xuICAgICdzZWxmJzogeyAnaHJlZic6ICcvb3JkZXJzLzEyNCcgfSxcbiAgICAnZWE6YmFza2V0JzogeyAnaHJlZic6ICcvYmFza2V0cy8zMjEnIH0sXG4gICAgJ2VhOmN1c3RvbWVyJzogeyAnaHJlZic6ICcvY3VzdG9tZXJzLzQyJyB9XG4gIH0sXG4gICd0b3RhbCc6IDIwLjAwLFxuICAnY3VycmVuY3knOiAnVVNEJyxcbiAgJ3N0YXR1cyc6ICdwcm9jZXNzaW5nJ1xufV1cblxudmFyIGVtYmVkZGVkV2l0aG91dFNlbGZMaW5rID0ge1xuICAnX2xpbmtzJzoge1xuICB9LFxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgcm9vdDoge1xuICAgICdfbGlua3MnOiB7XG4gICAgICAnc2VsZic6IHsgJ2hyZWYnOiAnLycgfSxcbiAgICAgICdjdXJpZXMnOiBbeyAnbmFtZSc6ICdlYScsICdocmVmJzogJ2h0dHA6Ly9leGFtcGxlLmNvbS9kb2NzL3JlbHMve3JlbH0nLFxuICAgICAgICAgICd0ZW1wbGF0ZWQnOiB0cnVlIH1dLFxuICAgICAgJ2VhOm9yZGVycyc6IHsgJ2hyZWYnOiAnL29yZGVycycgfVxuICAgIH1cbiAgfSxcblxuICBlbWJlZGRlZE9yZGVyczogZW1iZWRkZWRPcmRlcnMsXG5cbiAgb3JkZXJzOiB7XG4gICAgJ19saW5rcyc6IHtcbiAgICAgICdzZWxmJzogeyAnaHJlZic6ICcvb3JkZXJzJyB9LFxuICAgICAgJ2N1cmllcyc6IFt7ICduYW1lJzogJ2VhJywgJ2hyZWYnOiAnaHR0cDovL2V4YW1wbGUuY29tL2RvY3MvcmVscy97cmVsfScsXG4gICAgICAgICAgJ3RlbXBsYXRlZCc6IHRydWUgfV0sXG4gICAgICAnbmV4dCc6IHsgJ2hyZWYnOiAnL29yZGVycz9wYWdlPTInIH0sXG4gICAgICAnZWE6ZmluZCc6IHsgJ2hyZWYnOiAnL29yZGVyc3svaWR9JywgJ3RlbXBsYXRlZCc6IHRydWUgfSxcbiAgICAgICdlYTphZG1pbic6IFt7XG4gICAgICAgICdocmVmJzogJy9hZG1pbnMvMicsXG4gICAgICAgICd0aXRsZSc6ICdGcmVkJ1xuICAgICAgfSwge1xuICAgICAgICAnaHJlZic6ICcvYWRtaW5zLzUnLFxuICAgICAgICAndGl0bGUnOiAnS2F0ZScsXG4gICAgICAgICduYW1lJzogJ2Jvc3MnXG4gICAgICB9LCB7XG4gICAgICAgICduYW1lJzogJ25vLWhyZWYnXG4gICAgICB9XVxuICAgIH0sXG4gICAgJ2N1cnJlbnRseVByb2Nlc3NpbmcnOiAxNCxcbiAgICAnc2hpcHBlZFRvZGF5JzogMjAsXG4gICAgJ19lbWJlZGRlZCc6IHtcbiAgICAgICdlYTpvcmRlcic6IGVtYmVkZGVkT3JkZXJzXG4gICAgfVxuICB9LFxuXG4gIGFkbWluMjoge1xuICAgICdfbGlua3MnOiB7XG4gICAgICAnc2VsZic6IHsgJ2hyZWYnOiAnL2FkbWlucy8yJyB9XG4gICAgfSxcbiAgICAnbmFtZSc6ICdGcmVkJ1xuICB9LFxuICBhZG1pbjU6IHtcbiAgICAnX2xpbmtzJzoge1xuICAgICAgJ3NlbGYnOiB7ICdocmVmJzogJy9hZG1pbnMvNScgfVxuICAgIH0sXG4gICAgJ25hbWUnOiAnS2F0ZSdcbiAgfSxcblxuICBiYXNrZXQ6IHtcbiAgICBiYXNrZXQ6ICdlbXB0eSdcbiAgfSxcbiAgYmFza2V0MToge1xuICAgICdfbGlua3MnOiB7XG4gICAgICAnc2VsZic6IHsgJ2hyZWYnOiAnL2Jhc2tldHMvOTg3JyB9XG4gICAgfSxcbiAgICAnbXVjaCc6ICdpdGVtcydcbiAgfSxcbiAgYmFza2V0Mzoge1xuICAgICdfbGlua3MnOiB7XG4gICAgICAnc2VsZic6IHsgJ2hyZWYnOiAnL2Jhc2tldHMvMzIxJyB9XG4gICAgfSxcbiAgICAnd293JzogJ3N1Y2ggcHJpY2VzJ1xuICB9LFxuXG4gIHNpbmdsZU9yZGVyOiB7XG4gICAgJ19saW5rcyc6IHtcbiAgICAgICdzZWxmJzogeyAnaHJlZic6ICcvb3JkZXJzLzEzJyB9LFxuICAgICAgJ2N1cmllcyc6IFt7ICduYW1lJzogJ2VhJywgJ2hyZWYnOiAnaHR0cDovL2V4YW1wbGUuY29tL2RvY3MvcmVscy97cmVsfScsXG4gICAgICAgICAgJ3RlbXBsYXRlZCc6IHRydWUgfV0sXG4gICAgICAnZWE6Y3VzdG9tZXInOiB7ICdocmVmJzogJy9jdXN0b21lcnMvNDcxMScgfSxcbiAgICAgICdlYTpiYXNrZXQnOiB7ICdocmVmJzogJy9iYXNrZXRzLzQ3MTInIH1cbiAgICB9LFxuICAgICd0b3RhbCc6IDMwLjAwLFxuICAgICdjdXJyZW5jeSc6ICdVU0QnLFxuICAgICdzdGF0dXMnOiAnc2hpcHBlZCdcbiAgfSxcblxuICBlbWJlZGRlZFdpdGhvdXRTZWxmTGluazogZW1iZWRkZWRXaXRob3V0U2VsZkxpbmssXG5cbiAgY3VzdG9tZXI6IHtcbiAgICAnX2xpbmtzJzoge1xuICAgICAgJ3NlbGYnOiB7ICdocmVmJzogJy9jdXN0b21lci80NzExJyB9LFxuICAgICAgJ2N1cmllcyc6IFt7ICduYW1lJzogJ2VhJywgJ2hyZWYnOiAnaHR0cDovL2V4YW1wbGUuY29tL2RvY3MvcmVscy97cmVsfScsXG4gICAgICAgICAgJ3RlbXBsYXRlZCc6IHRydWUgfV1cbiAgICB9LFxuICAgICdmaXJzdF9uYW1lJzogJ0hhbGZyZWQnLFxuICAgICdsYXN0X25hbWUnOiAnSGFsZnJlZHNvbicsXG4gICAgJ19lbWJlZGRlZCc6IHtcbiAgICAgICdlYTpub19zZWxmX2xpbmsnOiBlbWJlZGRlZFdpdGhvdXRTZWxmTGlua1xuICAgIH1cbiAgfVxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgdHJhdmVyc29uID0gcmVxdWlyZSgnLi4vdHJhdmVyc29uJylcbnZhciBtb2NrUmVzcG9uc2UgPSByZXF1aXJlKCcuL3V0aWwvbW9ja19yZXNwb25zZScpXG52YXIgd2FpdEZvciA9IHJlcXVpcmUoJy4vdXRpbC93YWl0X2ZvcicpXG52YXIgY2hhaSA9IHJlcXVpcmUoJ2NoYWknKVxudmFyIHNpbm9uID0gcmVxdWlyZSgnc2lub24nKVxudmFyIHNpbm9uQ2hhaSA9IHJlcXVpcmUoJ3Npbm9uLWNoYWknKVxuXG52YXIgYXNzZXJ0ID0gY2hhaS5hc3NlcnRcbnZhciBleHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS51c2Uoc2lub25DaGFpKVxuXG5kZXNjcmliZSgnZ2V0UmVzb3VyY2UgZm9yIEpTT04nLCBmdW5jdGlvbigpIHtcblxuICB2YXIgZ2V0XG4gIHZhciBjYWxsYmFja1xuICB2YXIgcm9vdFVyaSA9ICdodHRwOi8vYXBpLmlvJ1xuICB2YXIgY2xpZW50ID0gdHJhdmVyc29uLmpzb24uZnJvbShyb290VXJpKVxuICB2YXIgYXBpXG5cbiAgdmFyIHJlc3VsdCA9IG1vY2tSZXNwb25zZSh7IGZvbzogJ2JhcicgfSlcblxuICBiZWZvcmVFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGFwaSA9IGNsaWVudC5uZXdSZXF1ZXN0KClcbiAgICBnZXQgPSBzaW5vbi5zdHViKClcbiAgICBhcGkud2Fsa2VyLnJlcXVlc3QgPSB7IGdldDogZ2V0IH1cbiAgICBjYWxsYmFjayA9IHNpbm9uLnNweSgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3dpdGggaXRzIGJhc2ljIGZlYXR1cmVzJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJvb3RTdGVwID0ge1xuICAgICAgdXJpOiByb290VXJpXG4gICAgfVxuICAgIHZhciByb290UmVzcG9uc2UgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICAgaXJyZWxldmFudDogeyBzdHVmZjogJ3RvIGJlIGlnbm9yZWQnIH0sXG4gICAgICBsaW5rOiByb290VXJpICsgJy9saW5rL3RvL3RoaW5nJyxcbiAgICAgIG1vcmU6IHsgc3R1ZmY6IHsgdGhhdDogJ3dlIGRvIG5vdCBjYXJlIGFib3V0JyB9IH1cbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBhY2Nlc3MgdGhlIHJvb3QgVVJJJywgZnVuY3Rpb24oKSB7XG4gICAgICBhcGkuZm9sbG93KCkuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICBleHBlY3QoZ2V0KS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChyb290VXJpLCBzaW5vbi5tYXRjaC5mdW5jKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCB0aGUgcm9vdCBkb2MnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBnZXQuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgcm9vdFJlc3BvbnNlKVxuICAgICAgYXBpLmZvbGxvdygpLmdldFJlc291cmNlKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCByb290UmVzcG9uc2UuZG9jKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBjYWxsYmFjayB3aXRoIGVycicsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3Rlc3QgZXJyb3InKVxuICAgICAgZ2V0LmNhbGxzQXJnV2l0aEFzeW5jKDEsIGVycilcbiAgICAgIGFwaS5mb2xsb3coKS5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgoZXJyKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IGEgc2luZ2xlIGVsZW1lbnQgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGdldC53aXRoQXJncyhyb290VXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyhcbiAgICAgICAgICAxLCBudWxsLCByb290UmVzcG9uc2UpXG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSArICcvbGluay90by90aGluZycsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgcmVzdWx0KVxuICAgICAgYXBpLmZvbGxvdygnbGluaycpLmdldFJlc291cmNlKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCByZXN1bHQuZG9jKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IGEgc2luZ2xlIGVsZW1lbnQgcGF0aCBhcyBhcnJheScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGdldC53aXRoQXJncyhyb290VXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyhcbiAgICAgICAgICAxLCBudWxsLCByb290UmVzcG9uc2UpXG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSArICcvbGluay90by90aGluZycsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgcmVzdWx0KVxuICAgICAgYXBpLmZvbGxvdyhbJ2xpbmsnXSkuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHJlc3VsdC5kb2MpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyIGlmIGxpbmsgaXMgbm90IGZvdW5kJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIHJvb3RSZXNwb25zZSlcbiAgICAgIGFwaS5mb2xsb3coJ25vbi1leGlzdGluZy1saW5rJykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBhc3NlcnQoY2FsbGJhY2suY2FsbGVkT25jZSlcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKHNpbm9uLm1hdGNoLlxuICAgICAgICAgICAgICBpbnN0YW5jZU9mKEVycm9yKSlcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2suYXJnc1swXVswXS5tZXNzYWdlKS50by5jb250YWluKCdDb3VsZCBub3QgZmluZCAnICtcbiAgICAgICAgICAgICAgJ3Byb3BlcnR5IG5vbi1leGlzdGluZy1saW5rJylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgaW5zaWRlIHJlY3Vyc2lvbicsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3Rlc3QgZXJyb3InKVxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIG1vY2tSZXNwb25zZSh7IGZpcnN0TGluazogcm9vdFVyaSArICcvZmlyc3QnIH0pKVxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmkgKyAnL2ZpcnN0Jywgc2lub24ubWF0Y2guZnVuYykuXG4gICAgICAgICAgY2FsbHNBcmdXaXRoQXN5bmMoMSwgZXJyKVxuICAgICAgYXBpLmZvbGxvdygnZmlyc3RMaW5rJykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3dpdGggSlNPTlBhdGgnLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciB1cmkgPSByb290VXJpICsgJy9wYXRoL3RvL3Jlc291cmNlJ1xuICAgIHZhciByb290UmVzcG9uc2UgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICAgZGVlcGx5OiB7IG5lc3RlZDogeyBsaW5rOiB1cmkgfSB9XG4gICAgfSlcblxuICAgIHZhciByZXN1bHQgPSBtb2NrUmVzcG9uc2UoeyB0aGU6ICdyZXN1bHQnIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyB0byBhIGxpbmsgdmlhIEpTT05QYXRoIGV4cHJlc3Npb24nLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoXG4gICAgICAgICAgMSwgbnVsbCwgcm9vdFJlc3BvbnNlKVxuICAgICAgZ2V0LndpdGhBcmdzKHVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgICByZXN1bHQpXG4gICAgICBhcGkuZm9sbG93KCckLmRlZXBseS5uZXN0ZWQubGluaycpLmdldFJlc291cmNlKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCByZXN1bHQuZG9jKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgY2FsbCBjYWxsYmFjayB3aXRoIGVyciBpZiBKU09OUGF0aCBoYXMgbm8gbWF0Y2gnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoXG4gICAgICAgICAgMSwgbnVsbCwgcm9vdFJlc3BvbnNlKVxuICAgICAgYXBpLmZvbGxvdygnJC5kZWVwbHkubmVzdGVkLmJsaW5rJykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKHNpbm9uLm1hdGNoLlxuICAgICAgICAgICAgICBpbnN0YW5jZU9mKEVycm9yKSlcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2suYXJnc1swXVswXS5tZXNzYWdlKS50by5jb250YWluKCdKU09OUGF0aCAnICtcbiAgICAgICAgICAgICAgJ2V4cHJlc3Npb24gJC5kZWVwbHkubmVzdGVkLmJsaW5rIHJldHVybmVkIG5vIG1hdGNoJylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgaWYgSlNPTlBhdGggaGFzIG11bHRpcGxlIG1hdGNoZXMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgcm9vdFJlc3BvbnNlTXVsdGkgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICAgICBhcnI6IFsgeyBmb286ICdiYXInIH0sIHsgZm9vOiAnYmF6JyB9IF1cbiAgICAgIH0pXG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoXG4gICAgICAgICAgMSwgbnVsbCwgcm9vdFJlc3BvbnNlTXVsdGkpXG4gICAgICBhcGkuZm9sbG93KCckLmFyclsqXS5mb28nKS5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgoc2lub24ubWF0Y2guXG4gICAgICAgICAgICAgIGluc3RhbmNlT2YoRXJyb3IpKVxuICAgICAgICAgIGV4cGVjdChjYWxsYmFjay5hcmdzWzBdWzBdLm1lc3NhZ2UpLnRvLmNvbnRhaW4oJ0pTT05QYXRoICcgK1xuICAgICAgICAgICAgICAnZXhwcmVzc2lvbiAkLmFyclsqXS5mb28gcmV0dXJuZWQgbW9yZSB0aGFuIG9uZSBtYXRjaCcpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCd3aXRoIFVSSSB0ZW1wbGF0aW5nJywgZnVuY3Rpb24oKSB7XG5cbiAgICBpdCgnc2hvdWxkIGV2YWx1YXRlIFVSSSB0ZW1wbGF0ZXMnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgcm9vdFJlc3BvbnNlVXJpVGVtcGxhdGUgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICAgICBmaXJzdFRlbXBsYXRlOiByb290VXJpICsgJy91c2Vycy97dXNlcn0vdGhpbmdzey90aGluZ30nXG4gICAgICB9KVxuICAgICAgdmFyIG5leHQgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICAgICBzZWNvbmRUZW1wbGF0ZTogcm9vdFVyaSArICcvYW5vdGhlci97aWR9J1xuICAgICAgfSlcblxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIHJvb3RSZXNwb25zZVVyaVRlbXBsYXRlKVxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmkgKyAnL3VzZXJzL2Jhc3RpMTMwMi90aGluZ3MvNDcxMScsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgbmV4dClcbiAgICAgIGdldC53aXRoQXJncyhyb290VXJpICsgJy9hbm90aGVyLzQyJyxcbiAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYygxLCBudWxsLCByZXN1bHQpXG4gICAgICBhcGkuZm9sbG93KCdmaXJzdFRlbXBsYXRlJywgJ3NlY29uZFRlbXBsYXRlJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHt1c2VyOiAnYmFzdGkxMzAyJywgdGhpbmc6IDQ3MTEsIGlkOiA0Mn0pXG4gICAgICAgICAuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHJlc3VsdC5kb2MpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBldmFsdWF0ZSBVUkkgdGVtcGxhdGVzIGZvciB0aGUgc3RhcnQgVVJJJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIHJvb3RVcmlUZW1wbGF0ZSA9IG1vY2tSZXNwb25zZShcbiAgICAgICAgeyB3ZTogJ2NhbiBoYXogdXNlIHVyaSB0ZW1wbGF0ZXMgZm9yIHJvb3QgZG9jLCB5byEnIH0pXG4gICAgICB2YXIgc3RhcnRVcmlUZW1wbGF0ZSA9IHJvb3RVcmkgKyAnL3twYXJhbX0vd2hhdGV2ZXInXG4gICAgICB2YXIgc3RhcnRVcmkgPSByb290VXJpICsgJy9zdWJzdGl0dXRlZC93aGF0ZXZlcidcbiAgICAgIHZhciBhcGkgPSB0cmF2ZXJzb25cbiAgICAgICAgICAuanNvblxuICAgICAgICAgIC5mcm9tKHN0YXJ0VXJpVGVtcGxhdGUpXG4gICAgICAgICAgLm5ld1JlcXVlc3QoKVxuICAgICAgZ2V0ID0gc2lub24uc3R1YigpXG4gICAgICBhcGkud2Fsa2VyLnJlcXVlc3QgPSB7IGdldDogZ2V0IH1cbiAgICAgIGdldC53aXRoQXJncyhzdGFydFVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoXG4gICAgICAgICAgMSwgbnVsbCwgcm9vdFVyaVRlbXBsYXRlKVxuXG4gICAgICBhcGkuZm9sbG93KClcbiAgICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7cGFyYW06ICdzdWJzdGl0dXRlZCd9KVxuICAgICAgICAgIC5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgcm9vdFVyaVRlbXBsYXRlLmRvYylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGV2YWx1YXRlIFVSSSB0ZW1wbGF0ZXMgd2l0aCBhcnJheSBvZiB0ZW1wbGF0ZSBwYXJhbXMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgcm9vdFVyaVRlbXBsYXRlID0gbW9ja1Jlc3BvbnNlKHtcbiAgICAgICAgZmlyc3RUZW1wbGF0ZTogcm9vdFVyaSArICcvdXNlcnMve3VzZXJ9L3RoaW5nc3svdGhpbmd9J1xuICAgICAgfSlcbiAgICAgIHZhciBuZXh0ID0gbW9ja1Jlc3BvbnNlKHtcbiAgICAgICAgc2Vjb25kVGVtcGxhdGU6IHJvb3RVcmkgKyAnL2Fub3RoZXJfdXNlci97dXNlcn0nXG4gICAgICB9KVxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIHJvb3RVcmlUZW1wbGF0ZSlcbiAgICAgIGdldC53aXRoQXJncyhyb290VXJpICsgJy91c2Vycy9iYXN0aTEzMDIvdGhpbmdzLzQ3MTEnLFxuICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDEsIG51bGwsIG5leHQpXG4gICAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSArICcvYW5vdGhlcl91c2VyL3NvbWVvbmVfZWxzZScsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgcmVzdWx0KVxuICAgICAgYXBpLmZvbGxvdygnZmlyc3RUZW1wbGF0ZScsICdzZWNvbmRUZW1wbGF0ZScpXG4gICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKFtudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7dXNlcjogJ2Jhc3RpMTMwMicsIHRoaW5nOiA0NzExfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge3VzZXI6ICdzb21lb25lX2Vsc2UnfV0pXG4gICAgICAgIC5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgcmVzdWx0LmRvYylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2luIGFsbCBpdHMgZ2xvcnknLCBmdW5jdGlvbigpIHtcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IGEgbXVsdGkgZWxlbWVudCBwYXRoJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIHBhdGgxID0gcm9vdFVyaSArICcvcGF0aCdcbiAgICAgIHZhciB0ZW1wbGF0ZTIgPSByb290VXJpICsgJy9wYXRoL3RvL3Jlc291cmNley9wYXJhbX0nXG4gICAgICB2YXIgcGF0aDIgPSByb290VXJpICsgJy9wYXRoL3RvL3Jlc291cmNlL2dpem1vJ1xuICAgICAgdmFyIHBhdGgzID0gcm9vdFVyaSArICcvcGF0aC90by9hbm90aGVyL3Jlc291cmNlJ1xuICAgICAgdmFyIHBhdGg0ID0gcm9vdFVyaSArICcvcGF0aC90by90aGUvbGFzdC9yZXNvdXJjZSdcblxuICAgICAgdmFyIHJvb3QgPSBtb2NrUmVzcG9uc2UoeyBsaW5rMTogcGF0aDEgfSlcbiAgICAgIHZhciByZXNwb25zZTIgPSBtb2NrUmVzcG9uc2UoeyBsaW5rMjogdGVtcGxhdGUyIH0pXG4gICAgICB2YXIgcmVzcG9uc2UzID0gbW9ja1Jlc3BvbnNlKHtcbiAgICAgICAgbmVzdGVkOiB7XG4gICAgICAgICAgYXJyYXk6IFtcbiAgICAgICAgICAgIHsgZm9vOiAnYmFyJyB9LFxuICAgICAgICAgICAgeyBsaW5rOiBwYXRoMyB9LFxuICAgICAgICAgICAgeyBiYXI6ICdiYXonIH1cbiAgICAgICAgICBdXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICB2YXIgcmVzcG9uc2U0ID0gbW9ja1Jlc3BvbnNlKHsgbGluazQ6IHBhdGg0IH0pXG5cbiAgICAgIGdldC53aXRoQXJncyhyb290VXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyhcbiAgICAgICAgICAxLCBudWxsLCByb290KVxuICAgICAgZ2V0LndpdGhBcmdzKHBhdGgxLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyhcbiAgICAgICAgICAxLCBudWxsLCByZXNwb25zZTIpXG4gICAgICBnZXQud2l0aEFyZ3MocGF0aDIsIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIHJlc3BvbnNlMylcbiAgICAgIGdldC53aXRoQXJncyhwYXRoMywgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoXG4gICAgICAgICAgMSwgbnVsbCwgcmVzcG9uc2U0KVxuICAgICAgZ2V0LndpdGhBcmdzKHBhdGg0LCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyhcbiAgICAgICAgICAxLCBudWxsLCByZXN1bHQpXG4gICAgICBhcGkuZm9sbG93KFsnbGluazEnLCAnbGluazInLCAnJFtuZXN0ZWRdW2FycmF5XVsxXS5saW5rJywgJ2xpbms0J10pXG4gICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IHBhcmFtOiAnZ2l6bW8nIH0pXG4gICAgICAgICAuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHJlc3VsdC5kb2MpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuICB9KVxufSlcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyYXZlcnNvbiA9IHJlcXVpcmUoJy4uL3RyYXZlcnNvbicpXG52YXIgaGFsRG9jcyA9IHJlcXVpcmUoJy4vaGFsX2RvY3MuanMnKVxudmFyIG1vY2tSZXNwb25zZSA9ICByZXF1aXJlKCcuL3V0aWwvbW9ja19yZXNwb25zZScpXG52YXIgd2FpdEZvciA9IHJlcXVpcmUoJy4vdXRpbC93YWl0X2ZvcicpXG52YXIgY2hhaSA9IHJlcXVpcmUoJ2NoYWknKVxudmFyIHNpbm9uID0gcmVxdWlyZSgnc2lub24nKVxudmFyIHNpbm9uQ2hhaSA9IHJlcXVpcmUoJ3Npbm9uLWNoYWknKVxuXG52YXIgYXNzZXJ0ID0gY2hhaS5hc3NlcnRcbnZhciBleHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS51c2Uoc2lub25DaGFpKVxuXG5kZXNjcmliZSgnVGhlIEpTT04tSEFMIHdhbGtlclxcJ3MnLCBmdW5jdGlvbigpIHtcblxuICB2YXIgcm9vdFVyaSA9ICdodHRwOi8vYXBpLmlvJ1xuICB2YXIgcm9vdERvYyA9IGhhbERvY3Mucm9vdFxuICB2YXIgb3JkZXJzVXJpID0gcm9vdFVyaSArICcvb3JkZXJzJ1xuICB2YXIgZW1iZWRkZWRPcmRlckRvY3MgPSBoYWxEb2NzLmVtYmVkZGVkT3JkZXJzXG4gIHZhciBvcmRlcnNEb2MgPSBoYWxEb2NzLm9yZGVyc1xuICB2YXIgYWRtaW4yVXJpID0gcm9vdFVyaSArICcvYWRtaW5zLzInXG4gIHZhciBhZG1pbjJEb2MgPSBoYWxEb2NzLmFkbWluMlxuICB2YXIgYWRtaW41VXJpID0gcm9vdFVyaSArICcvYWRtaW5zLzUnXG4gIHZhciBhZG1pbjVEb2MgPSBoYWxEb2NzLmFkbWluNVxuICB2YXIgYmFza2V0RG9jID0gaGFsRG9jcy5iYXNrZXRcbiAgdmFyIGJhc2tldDFVcmkgPSByb290VXJpICsgJy9iYXNrZXRzLzk4NydcbiAgdmFyIGJhc2tldDFEb2MgPSBoYWxEb2NzLmJhc2tldDFcbiAgdmFyIGJhc2tldDJVcmkgPSByb290VXJpICsgJy9iYXNrZXRzLzMyMSdcbiAgdmFyIGJhc2tldDJEb2MgPSBoYWxEb2NzLmJhc2tldDJcbiAgdmFyIHNpbmdsZU9yZGVyVXJpID0gb3JkZXJzVXJpICsgJy8xMydcbiAgdmFyIHNpbmdsZU9yZGVyRG9jID0gaGFsRG9jcy5zaW5nbGVPcmRlclxuICB2YXIgZW1iZWRkZWRXaXRob3V0U2VsZkxpbmsgPSBoYWxEb2NzLmVtYmVkZGVkV2l0aG91dFNlbGZMaW5rXG4gIHZhciBjdXN0b21lclVyaSA9IHJvb3RVcmkgKyAnL2N1c3RvbWVycy80NzExJ1xuICB2YXIgY3VzdG9tZXJEb2MgPSBoYWxEb2NzLmN1c3RvbWVyXG5cbiAgdmFyIHJvb3RSZXNwb25zZSA9IG1vY2tSZXNwb25zZShyb290RG9jKVxuICB2YXIgb3JkZXJzUmVzcG9uc2UgPSBtb2NrUmVzcG9uc2Uob3JkZXJzRG9jKVxuICB2YXIgYWRtaW4yUmVzcG9uc2UgPSBtb2NrUmVzcG9uc2UoYWRtaW4yRG9jKVxuICB2YXIgYWRtaW41UmVzcG9uc2UgPSBtb2NrUmVzcG9uc2UoYWRtaW41RG9jKVxuICB2YXIgYmFza2V0MVJlc3BvbnNlID0gbW9ja1Jlc3BvbnNlKGJhc2tldDFEb2MpXG4gIHZhciBiYXNrZXQyUmVzcG9uc2UgPSBtb2NrUmVzcG9uc2UoYmFza2V0MkRvYylcbiAgdmFyIHNpbmdsZU9yZGVyUmVzcG9uc2UgPSBtb2NrUmVzcG9uc2Uoc2luZ2xlT3JkZXJEb2MpXG4gIHZhciBlbWJlZGRlZE9yZGVyc1Jlc3BvbnNlID0gbW9ja1Jlc3BvbnNlKGVtYmVkZGVkT3JkZXJEb2NzKVxuICB2YXIgZW1iZWRkZWRPcmRlclJlc3BvbnNlcyA9IFtcbiAgICBtb2NrUmVzcG9uc2UoZW1iZWRkZWRPcmRlckRvY3NbMF0pLFxuICAgIG1vY2tSZXNwb25zZShlbWJlZGRlZE9yZGVyRG9jc1sxXSlcbiAgXVxuICB2YXIgY3VzdG9tZXJSZXNwb25zZSA9IG1vY2tSZXNwb25zZShjdXN0b21lckRvYylcbiAgdmFyIGJhc2tldFJlc3BvbnNlID0gbW9ja1Jlc3BvbnNlKGJhc2tldERvYylcblxuICB2YXIgdXBkYXRlUmVzcG9uc2UgPSBtb2NrUmVzcG9uc2UoeyByZXN1bHQ6ICdzdWNjZXNzJyB9LCAyMDApXG4gIHZhciBwYXlsb2FkID0ge1xuICAgIHNvbWU6ICdzdHVmZicsXG4gICAgZGF0YTogNDcxMVxuICB9XG5cbiAgdmFyIGdldFxuICB2YXIgZXhlY3V0ZVJlcXVlc3RcblxuICB2YXIgY2FsbGJhY2tcbiAgdmFyIGNsaWVudCA9IHRyYXZlcnNvbi5qc29uSGFsLmZyb20ocm9vdFVyaSlcbiAgdmFyIGFwaVxuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXBpID0gY2xpZW50Lm5ld1JlcXVlc3QoKVxuICAgIGdldCA9IHNpbm9uLnN0dWIoKVxuICAgIGFwaS53YWxrZXIucmVxdWVzdCA9IHsgZ2V0OiBnZXQgfVxuICAgIGdldC53aXRoQXJncyhyb290VXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYygxLCBudWxsLFxuICAgICAgICByb290UmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKG9yZGVyc1VyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgb3JkZXJzUmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKGFkbWluMlVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgYWRtaW4yUmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKGFkbWluNVVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgYWRtaW41UmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKGJhc2tldDFVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDEsIG51bGwsXG4gICAgICAgIGJhc2tldDFSZXNwb25zZSlcbiAgICBnZXQud2l0aEFyZ3MoYmFza2V0MlVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgYmFza2V0MlJlc3BvbnNlKVxuICAgIGdldC53aXRoQXJncyhzaW5nbGVPcmRlclVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSxcbiAgICAgICAgbnVsbCwgc2luZ2xlT3JkZXJSZXNwb25zZSlcbiAgICBnZXQud2l0aEFyZ3Mocm9vdFVyaSArICcvYmFza2V0cy85ODcnLCBzaW5vbi5tYXRjaC5mdW5jKS5cbiAgICAgICAgY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCwgYmFza2V0UmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKGN1c3RvbWVyVXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYygxLFxuICAgICAgICBudWxsLCBjdXN0b21lclJlc3BvbnNlKVxuICAgIGNhbGxiYWNrID0gc2lub24uc3B5KClcbiAgICBleGVjdXRlUmVxdWVzdCA9IHNpbm9uLnN0dWIoYXBpLmZpbmFsQWN0aW9uLmNvbnN0cnVjdG9yLnByb3RvdHlwZSxcbiAgICAgICAgJ2V4ZWN1dGVSZXF1ZXN0JylcbiAgfSlcblxuICBhZnRlckVhY2goZnVuY3Rpb24oKSB7XG4gICAgYXBpLmZpbmFsQWN0aW9uLmNvbnN0cnVjdG9yLnByb3RvdHlwZS5leGVjdXRlUmVxdWVzdC5yZXN0b3JlKClcbiAgfSlcblxuICBkZXNjcmliZSgnZ2V0IG1ldGhvZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgYSBzaW5nbGUgbGluaycsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycpLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgb3JkZXJzUmVzcG9uc2UpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgbXVsdGlwbGUgbGlua3MnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6ZmluZCcsICdlYTpjdXN0b21lcicpXG4gICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IGlkOiAxMyB9KVxuICAgICAgICAgLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgY3VzdG9tZXJSZXNwb25zZSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBmaXJzdCBsaW5rIGZyb20gYSBsaW5rIGFycmF5IGF1dG9tYXRpY2FsbHknLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6YWRtaW4nKVxuICAgICAgICAgLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgYWRtaW4yUmVzcG9uc2UpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgYSBsaW5rIHNwZWNpZmllZCBieSBpbmRleCBmcm9tIGEgbGluayBhcnJheScsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTphZG1pblsxXScpXG4gICAgICAgICAuZ2V0KGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCBhZG1pbjVSZXNwb25zZSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBhIGxpbmsgc3BlY2lmaWVkIGJ5IHRpdGxlIGZyb20gYSBsaW5rIGFycmF5JyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOmFkbWluW3RpdGxlOkthdGVdJylcbiAgICAgICAgIC5nZXQoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIGFkbWluNVJlc3BvbnNlKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IGEgbGluayBzcGVjaWZpZWQgYnkgbmFtZSBmcm9tIGEgbGluayBhcnJheScsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTphZG1pbltuYW1lOmJvc3NdJylcbiAgICAgICAgIC5nZXQoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIGFkbWluNVJlc3BvbnNlKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgZmFpbCBpZiB0aGVyZSBpcyBubyBsaW5rIHdpdGggdGhlIHNwZWNpZmllZCBzZWNvbmRhcnkga2V5JyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOmFkbWluW25hbWU6bm90LWV4aXN0aW5nXScpXG4gICAgICAgICAuZ2V0KGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGVyciA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzBdXG4gICAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50by5jb250YWluKCdidXQgdGhlcmUgaXMgbm8gc3VjaCBsaW5rJylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZhaWwgaWYgdGhlIGxpbmsgc3BlY2lmaWVkIGJ5IHNlY29uZGFyeSBrZXkgaGFzIG5vIGhyZWYnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6YWRtaW5bbmFtZTpuby1ocmVmXScpXG4gICAgICAgICAuZ2V0KGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGVyciA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzBdXG4gICAgICAgICAgZXhwZWN0KGVyci5tZXNzYWdlKS50by5jb250YWluKCdidXQgdGhpcyBsaW5rIGhhZCBubyBocmVmIGF0dHJpYnV0ZS4nKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgcGFzcyBmaXJzdCBlbWJlZGRlZCBkb2N1bWVudCBmcm9tIHRoZSBhcnJheSBpbnRvIHRoZSBjYWxsYmFjayAnICtcbiAgICAgICAgJyBhdXRvbWF0aWNhbGx5JywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOm9yZGVyJylcbiAgICAgICAgIC5nZXQoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXJyb3IgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1swXVxuICAgICAgICAgIGV4cGVjdChlcnJvcikudG8ubm90LmV4aXN0XG4gICAgICAgICAgdmFyIHJlc3BvbnNlID0gY2FsbGJhY2suZmlyc3RDYWxsLmFyZ3NbMV1cbiAgICAgICAgICBleHBlY3QocmVzcG9uc2UpLnRvLmV4aXN0XG4gICAgICAgICAgZXhwZWN0KHJlc3BvbnNlLmJvZHkpLnRvLmVxdWFsKGVtYmVkZGVkT3JkZXJSZXNwb25zZXNbMF0uYm9keSlcbiAgICAgICAgICBleHBlY3QocmVzcG9uc2Uuc3RhdHVzQ29kZSkudG8uZXF1YWwoMjAwKVxuICAgICAgICAgIGV4cGVjdChyZXNwb25zZS5yZW1hcmspLnRvLmV4aXN0XG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBwYXNzIHNpbmdsZSBlbGVtZW50IG9mIGFuIGVtYmVkZGVkIGRvY3VtZW50IGludG8gdGhlICcgK1xuICAgICAgICAnY2FsbGJhY2snLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6b3JkZXJbMV0nKVxuICAgICAgICAgLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBlcnJvciA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzBdXG4gICAgICAgICAgZXhwZWN0KGVycm9yKS50by5ub3QuZXhpc3RcbiAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1sxXVxuICAgICAgICAgIGV4cGVjdChyZXNwb25zZSkudG8uZXhpc3RcbiAgICAgICAgICBleHBlY3QocmVzcG9uc2UuYm9keSkudG8uZXF1YWwoZW1iZWRkZWRPcmRlclJlc3BvbnNlc1sxXS5ib2R5KVxuICAgICAgICAgIGV4cGVjdChyZXNwb25zZS5zdGF0dXNDb2RlKS50by5lcXVhbCgyMDApXG4gICAgICAgICAgZXhwZWN0KHJlc3BvbnNlLnJlbWFyaykudG8uZXhpc3RcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBmaXJzdCBlbWJlZGRlZCByZXNvdXJjZSBmcm9tIGFuIGFycmF5IGF1dG9tYXRpY2FsbHknLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6b3JkZXInLCAnZWE6YmFza2V0JylcbiAgICAgICAgIC5nZXQoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIGJhc2tldDFSZXNwb25zZSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBzcGVjaWZpZWQgZW1iZWRkZWQgcmVzb3VyY2UgZnJvbSBhbiBhcnJheScsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpvcmRlclsxXScsICdlYTpiYXNrZXQnKVxuICAgICAgICAgLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgYmFza2V0MlJlc3BvbnNlKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcbiAgfSlcblxuICBkZXNjcmliZSgnZ2V0UmVzb3VyY2UgbWV0aG9kJywgZnVuY3Rpb24oKSB7XG5cbiAgICBpdCgnc2hvdWxkIHJldHVybiB0aGUgcmVzb3VyY2UnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6ZmluZCcsICdlYTpjdXN0b21lcicpXG4gICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IGlkOiAxMyB9KVxuICAgICAgICAgLmdldFJlc291cmNlKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCBjdXN0b21lckRvYylcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIHBhc3MgYW4gZW1iZWRkZWQgZG9jdW1lbnQgaW50byB0aGUgY2FsbGJhY2snLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6b3JkZXInKVxuICAgICAgICAgLmdldFJlc291cmNlKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCBlbWJlZGRlZE9yZGVyRG9jc1swXSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldFVyaSBtZXRob2QnLCBmdW5jdGlvbigpIHtcblxuICAgIGl0KCdzaG91bGQgcmV0dXJuIHRoZSBsYXN0IFVSSScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpmaW5kJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IDEzIH0pXG4gICAgICAgICAuZ2V0VXJpKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCBzaW5nbGVPcmRlclVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICAvLyBub3Qgc3VyZSB3aGF0IHRvIGRvIGluIHRoaXMgY2FzZVxuICAgIGl0KCdyZXR1cm5zIHRoZSBzZWxmLVVSSSBvZiBhbiBlbWJlZGRlZCBkb2N1bWVudCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpvcmRlcicpXG4gICAgICAgICAuZ2V0VXJpKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCBvcmRlcnNVcmkgKyAnLzEyMycpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3lpZWxkcyBhbiBlcnJvciBpZiB0aGUgbGFzdCBVUkkgaXMgYWN0dWFsbHkgYW4gZW1iZWRkZWQgJyArXG4gICAgICAgICAgICAgICAnIHJlc291cmNlIGJ1dCBoYXMgbm8gc2VsZi1VUkknLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6ZmluZCcsICdlYTpjdXN0b21lcicsICdlYTpub19zZWxmX2xpbmsnKVxuICAgICAgICAgLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoeyBpZDogMTMgfSlcbiAgICAgICAgIC5nZXRVcmkoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgZXJyb3IgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1swXVxuICAgICAgICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50by5jb250YWluKCdZb3UgcmVxdWVzdGVkIGFuIFVSSSBidXQgdGhlICcgK1xuICAgICAgICAgICAgICAnbGFzdCByZXNvdXJjZSBpcyBhbiBlbWJlZGRlZCByZXNvdXJjZSBhbmQgaGFzIG5vIFVSSSBvZiBpdHMgJyArXG4gICAgICAgICAgICAgICdvd24gKHRoYXQgaXMsIGl0IGhhcyBubyBsaW5rIHdpdGggcmVsPVxcXCJzZWxmXFxcIicpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3Bvc3QgbWV0aG9kJywgZnVuY3Rpb24oKSB7XG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBtdWx0aXBsZSBsaW5rcyBhbmQgcG9zdCB0byB0aGUgbGFzdCBVUkknLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhjdXN0b21lclVyaSwgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsXG4gICAgICAgICAgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoNCwgbnVsbCwgdXBkYXRlUmVzcG9uc2UsXG4gICAgICAgICAgY3VzdG9tZXJVcmkpXG4gICAgICBhcGkuZm9sbG93KCdlYTpvcmRlcnMnLCAnZWE6ZmluZCcsICdlYTpjdXN0b21lcicpXG4gICAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7IGlkOiAxMyB9KVxuICAgICAgICAgLnBvc3QocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoZXhlY3V0ZVJlcXVlc3QpLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGN1c3RvbWVyVXJpLFxuICAgICAgICAgICAgICBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYylcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHVwZGF0ZVJlc3BvbnNlLFxuICAgICAgICAgICAgICBjdXN0b21lclVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgd2hlbiBwb3N0IGZhaWxzJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcigndGVzdCBlcnJvcicpXG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhjdXN0b21lclVyaSwgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsXG4gICAgICAgICAgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoNCwgZXJyKVxuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOmZpbmQnLCAnZWE6Y3VzdG9tZXInKVxuICAgICAgICAgLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoeyBpZDogMTMgfSlcbiAgICAgICAgIC5wb3N0KHBheWxvYWQsIGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChlcnIpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuICB9KVxuXG4gIGRlc2NyaWJlKCdwdXQgbWV0aG9kJywgZnVuY3Rpb24oKSB7XG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyBtdWx0aXBsZSBsaW5rcyBhbmQgcHV0IHRvIHRoZSBsYXN0IFVSSScsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGV4ZWN1dGVSZXF1ZXN0LndpdGhBcmdzKGN1c3RvbWVyVXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYyxcbiAgICAgICAgICBwYXlsb2FkLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBudWxsLCB1cGRhdGVSZXNwb25zZSxcbiAgICAgICAgICBjdXN0b21lclVyaSlcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpmaW5kJywgJ2VhOmN1c3RvbWVyJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IDEzIH0pXG4gICAgICAgICAucHV0KHBheWxvYWQsIGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGV4ZWN1dGVSZXF1ZXN0KS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChjdXN0b21lclVyaSxcbiAgICAgICAgICAgICAgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsIHBheWxvYWQsIHNpbm9uLm1hdGNoLmZ1bmMpXG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCB1cGRhdGVSZXNwb25zZSxcbiAgICAgICAgICAgICAgY3VzdG9tZXJVcmkpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyIHdoZW4gcHV0IGZhaWxzJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcigndGVzdCBlcnJvcicpXG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhjdXN0b21lclVyaSwgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsXG4gICAgICAgICAgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoNCwgZXJyKVxuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOmZpbmQnLCAnZWE6Y3VzdG9tZXInKVxuICAgICAgICAgLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoeyBpZDogMTMgfSlcbiAgICAgICAgIC5wdXQocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3BhdGNoIG1ldGhvZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgbXVsdGlwbGUgbGlua3MgYW5kIHBhdGNoIHRoZSBsYXN0IFVSSScsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGV4ZWN1dGVSZXF1ZXN0LndpdGhBcmdzKGN1c3RvbWVyVXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYyxcbiAgICAgICAgICBwYXlsb2FkLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBudWxsLCB1cGRhdGVSZXNwb25zZSxcbiAgICAgICAgICBjdXN0b21lclVyaSlcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpmaW5kJywgJ2VhOmN1c3RvbWVyJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IDEzIH0pXG4gICAgICAgICAucGF0Y2gocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoZXhlY3V0ZVJlcXVlc3QpLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGN1c3RvbWVyVXJpLFxuICAgICAgICAgICAgICBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYylcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHVwZGF0ZVJlc3BvbnNlLFxuICAgICAgICAgICAgICBjdXN0b21lclVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgd2hlbiBwYXRjaCBmYWlscycsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3Rlc3QgZXJyb3InKVxuICAgICAgZXhlY3V0ZVJlcXVlc3Qud2l0aEFyZ3MoY3VzdG9tZXJVcmksIGFwaS5yZXF1ZXN0LCBzaW5vbi5tYXRjaC5mdW5jLFxuICAgICAgICAgIHBheWxvYWQsIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDQsIGVycilcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpmaW5kJywgJ2VhOmN1c3RvbWVyJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IDEzIH0pXG4gICAgICAgICAucGF0Y2gocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2RlbGV0ZSBtZXRob2QnLCBmdW5jdGlvbigpIHtcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IG11bHRpcGxlIGxpbmtzIGFuZCBkZWxldGUgdGhlIGxhc3QgVVJJJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgZXhlY3V0ZVJlcXVlc3Qud2l0aEFyZ3MoY3VzdG9tZXJVcmksIGFwaS5yZXF1ZXN0LCBzaW5vbi5tYXRjaC5mdW5jLCBudWxsLFxuICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDQsIG51bGwsIHVwZGF0ZVJlc3BvbnNlLFxuICAgICAgICAgIGN1c3RvbWVyVXJpKVxuICAgICAgYXBpLmZvbGxvdygnZWE6b3JkZXJzJywgJ2VhOmZpbmQnLCAnZWE6Y3VzdG9tZXInKVxuICAgICAgICAgLndpdGhUZW1wbGF0ZVBhcmFtZXRlcnMoeyBpZDogMTMgfSlcbiAgICAgICAgIC5kZWwoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoZXhlY3V0ZVJlcXVlc3QpLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGN1c3RvbWVyVXJpLFxuICAgICAgICAgICAgICBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgbnVsbCwgc2lub24ubWF0Y2guZnVuYylcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHVwZGF0ZVJlc3BvbnNlLFxuICAgICAgICAgICAgICBjdXN0b21lclVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgd2hlbiBkZWxldGluZyBmYWlscycsXG4gICAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ3Rlc3QgZXJyb3InKVxuICAgICAgZXhlY3V0ZVJlcXVlc3Qud2l0aEFyZ3MoY3VzdG9tZXJVcmksIGFwaS5yZXF1ZXN0LCBzaW5vbi5tYXRjaC5mdW5jLCBudWxsLFxuICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDQsIGVycilcbiAgICAgIGFwaS5mb2xsb3coJ2VhOm9yZGVycycsICdlYTpmaW5kJywgJ2VhOmN1c3RvbWVyJylcbiAgICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgaWQ6IDEzIH0pXG4gICAgICAgICAuZGVsKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChlcnIpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuICB9KVxufSlcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIHRyYXZlcnNvbiA9IHJlcXVpcmUoJy4uL3RyYXZlcnNvbicpXG52YXIgbW9ja1Jlc3BvbnNlID0gIHJlcXVpcmUoJy4vdXRpbC9tb2NrX3Jlc3BvbnNlJylcbnZhciB3YWl0Rm9yID0gcmVxdWlyZSgnLi91dGlsL3dhaXRfZm9yJylcbnZhciBjaGFpID0gcmVxdWlyZSgnY2hhaScpXG52YXIgc2lub24gPSByZXF1aXJlKCdzaW5vbicpXG52YXIgc2lub25DaGFpID0gcmVxdWlyZSgnc2lub24tY2hhaScpXG5cbnZhciBhc3NlcnQgPSBjaGFpLmFzc2VydFxudmFyIGV4cGVjdCA9IGNoYWkuZXhwZWN0XG5jaGFpLnVzZShzaW5vbkNoYWkpXG5cbi8qXG4gKiBUZXN0cyBmb3IgYWxsIG9mIEpzb24gV2Fsa2VyJ3MgcmVxdWVzdCBtZXRob2RzIGV4Y2VwdCBnZXRSZXNvdXJjZSwgd2hpY2ggaXNcbiAqIHRlc3RlZCBleHRlbnNpdmVseSBpbiBqc29uX2dldF9yZXNvdXJjZS5qcy4gVGhpcyB0ZXN0IHN1aXRlIGNvbnRhaW5zIHRlc3RzXG4gKiBmb3IgZ2V0LCBwb3N0LCBwdXQsIGRlbGV0ZSBhbmQgcGF0Y2guIEVhY2ggaHR0cCBtZXRob2QgdmVyYiBoYXMgaXQncyBvd25cbiAqIGRlc2NyaWJlLXNlY3Rpb24uIFNpbmNlIG1vc3Qgb2YgdGhlIGNvZGUgcGF0aCBpcyB0aGUgc2FtZSBmb3IgZ2V0UmVzb3VyY2VcbiAqIGFuZCBnZXQsIHBvc3QsIC4uLiwgdGhlcmUgYXJlIGp1c3QgYSBmZXcgYmFzaWMgdGVzdHMgaGVyZSBmb3IgZWFjaCB2ZXJiLlxuICogVGhlIGdldFJlc291cmNlIHRlc3RzIGFyZSBtb3JlIGNvbXByZWhlbnNpdmUuXG4gKi9cbmRlc2NyaWJlKCdUaGUgSlNPTiBjbGllbnRcXCdzJywgZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGdldFxuICB2YXIgZXhlY3V0ZVJlcXVlc3RcblxuICB2YXIgY2FsbGJhY2tcbiAgdmFyIHJvb3RVcmkgPSAnaHR0cDovL2FwaS5pbydcbiAgdmFyIGNsaWVudCA9IHRyYXZlcnNvbi5qc29uLmZyb20ocm9vdFVyaSlcbiAgdmFyIGFwaVxuXG4gIHZhciBnZXRVcmkgPSByb290VXJpICsgJy9saW5rL3RvL3Jlc291cmNlJ1xuICB2YXIgcG9zdFVyaSA9IHJvb3RVcmkgKyAnL3Bvc3Qvc29tZXRoaW5nL2hlcmUnXG4gIHZhciBwdXRVcmkgPSByb290VXJpICsgJy9wdXQvc29tZXRoaW5nL2hlcmUnXG4gIHZhciBwYXRjaFVyaSA9IHJvb3RVcmkgKyAnL3BhdGNoL21lJ1xuICB2YXIgZGVsZXRlVXJpID0gcm9vdFVyaSArICcvZGVsZXRlL21lJ1xuICB2YXIgdGVtcGxhdGVVcmkgPSByb290VXJpICsgJy90ZW1wbGF0ZS97cGFyYW19J1xuXG4gIHZhciByb290UmVzcG9uc2UgPSBtb2NrUmVzcG9uc2Uoe1xuICAgICdnZXRfbGluayc6IGdldFVyaSxcbiAgICAncG9zdF9saW5rJzogcG9zdFVyaSxcbiAgICAncHV0X2xpbmsnOiBwdXRVcmksXG4gICAgJ3BhdGNoX2xpbmsnOiBwYXRjaFVyaSxcbiAgICAnZGVsZXRlX2xpbmsnOiBkZWxldGVVcmksXG4gICAgJ3RlbXBsYXRlX2xpbmsnOiB0ZW1wbGF0ZVVyaVxuICB9KVxuXG4gIHZhciByZXN1bHQgPSBtb2NrUmVzcG9uc2UoeyByZXN1bHQ6ICdzdWNjZXNzJyB9KVxuXG4gIHZhciBwYXlsb2FkID0ge1xuICAgIHNvbWU6ICdzdHVmZicsXG4gICAgZGF0YTogNDcxMVxuICB9XG5cbiAgYmVmb3JlRWFjaChmdW5jdGlvbigpIHtcbiAgICBhcGkgPSBjbGllbnQubmV3UmVxdWVzdCgpXG4gICAgZ2V0ID0gc2lub24uc3R1YigpXG4gICAgYXBpLndhbGtlci5yZXF1ZXN0ID0geyBnZXQ6IGdldCB9XG4gICAgY2FsbGJhY2sgPSBzaW5vbi5zcHkoKVxuXG4gICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAxLCBudWxsLCByb290UmVzcG9uc2UpXG4gICAgZ2V0LndpdGhBcmdzKGdldFVyaSwgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoMSwgbnVsbCxcbiAgICAgICAgcmVzdWx0KVxuICAgIGdldC53aXRoQXJncyhwb3N0VXJpLCBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYygxLFxuICAgICAgICBuZXcgRXJyb3IoJ0dFVCBpcyBub3QgaW1wbGVtZW50ZWQgZm9yIHRoaXMgVVJJLCBwbGVhc2UgUE9TVCAnICtcbiAgICAgICAgJ3NvbWV0aGluZycpKVxuXG4gICAgZXhlY3V0ZVJlcXVlc3QgPSBzaW5vbi5zdHViKGFwaS5maW5hbEFjdGlvbi5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsXG4gICAgICAgICdleGVjdXRlUmVxdWVzdCcpXG4gIH0pXG5cbiAgYWZ0ZXJFYWNoKGZ1bmN0aW9uKCkge1xuICAgIGFwaS5maW5hbEFjdGlvbi5jb25zdHJ1Y3Rvci5wcm90b3R5cGUuZXhlY3V0ZVJlcXVlc3QucmVzdG9yZSgpXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2dldCBtZXRob2QnLCBmdW5jdGlvbigpIHtcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IHRoZSBsaW5rcycsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgIGFwaS5mb2xsb3coJ2dldF9saW5rJykuZ2V0KGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCByZXN1bHQpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcigndGVzdCBlcnJvcicpXG4gICAgICAvLyBEZWZhdWx0IHN0dWJiaW5nIGZyb20gYmVmb3JlRWFjaCBpcyBub3Qgd2hhdCB3ZSB3YW50IGhlcmUuXG4gICAgICAvLyBJTU8sIGdldC5yZXNldCgpIHNob3VsZCBiZSBlbm91Z2gsIGJ1dCBpc250P1xuICAgICAgZ2V0ID0gc2lub24uc3R1YigpXG4gICAgICBhcGkud2Fsa2VyLnJlcXVlc3QgPSB7IGdldDogZ2V0IH1cbiAgICAgIGdldC5jYWxsc0FyZ1dpdGhBc3luYygxLCBlcnIpXG4gICAgICBhcGkuZm9sbG93KCkuZ2V0KGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChlcnIpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyIHdoZW4gd2Fsa2luZyBhbG9uZyB0aGUgbGlua3MgZmFpbHMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCd0ZXN0IGVycm9yJylcbiAgICAgIC8vIERlZmF1bHQgc3R1YmJpbmcgZnJvbSBiZWZvcmVFYWNoIGlzIG5vdCB3aGF0IHdlIHdhbnQgaGVyZS5cbiAgICAgIC8vIElNTywgZ2V0LnJlc2V0KCkgc2hvdWxkIGJlIGVub3VnaCwgYnV0IGlzbnQ/XG4gICAgICBnZXQgPSBzaW5vbi5zdHViKClcbiAgICAgIGFwaS53YWxrZXIucmVxdWVzdCA9IHsgZ2V0OiBnZXQgfVxuICAgICAgZ2V0LndpdGhBcmdzKHJvb3RVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKFxuICAgICAgICAgIDEsIG51bGwsIHJvb3RSZXNwb25zZSlcbiAgICAgIGdldC53aXRoQXJncyhnZXRVcmksIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDEsIGVycilcbiAgICAgIGFwaS5mb2xsb3coJ2dldF9saW5rJywgJ2Fub3RoZXJfbGluaycpLmdldChjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgoZXJyKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICB9KVxuXG4gIGRlc2NyaWJlKCdnZXRVcmkgbWV0aG9kJywgZnVuY3Rpb24oKSB7XG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgdGhlIGxpbmtzIGFuZCB5aWVsZCB0aGUgbGFzdCBVUkknLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICBhcGkuZm9sbG93KCdnZXRfbGluaycpLmdldFVyaShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgZ2V0VXJpKVxuICAgICAgICAgIGV4cGVjdChnZXQuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcblxuICAgIGl0KCdzaG91bGQgeWllbGQgcmVzb2x2ZWQgVVJJIGlmIGxhc3QgVVJJIGlzIGEgVVJJIHRlbXBsYXRlJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgYXBpLmZvbGxvdygndGVtcGxhdGVfbGluaycpXG4gICAgICAgIC53aXRoVGVtcGxhdGVQYXJhbWV0ZXJzKHsgcGFyYW06ICdzdWJzdGl0dXRlZCcgfSlcbiAgICAgICAgLmdldFVyaShjYWxsYmFjaylcbiAgICAgIHdhaXRGb3IoXG4gICAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCxcbiAgICAgICAgICAgICAgcm9vdFVyaSArICcvdGVtcGxhdGUvc3Vic3RpdHV0ZWQnKVxuICAgICAgICAgIGV4cGVjdChnZXQuY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICAgIGRvbmUoKVxuICAgICAgICB9XG4gICAgICApXG4gICAgfSlcbiAgfSlcblxuXG4gIGRlc2NyaWJlKCdwb3N0IG1ldGhvZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlc3VsdCA9IG1vY2tSZXNwb25zZSh7IHJlc3VsdDogJ3N1Y2Nlc3MnIH0sIDIwMSlcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IHRoZSBsaW5rcyBhbmQgcG9zdCB0byB0aGUgbGFzdCBVUkknLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhwb3N0VXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCxcbiAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBudWxsLCByZXN1bHQsIHBvc3RVcmkpXG4gICAgICBhcGkuZm9sbG93KCdwb3N0X2xpbmsnKS5wb3N0KHBheWxvYWQsIGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGV4ZWN1dGVSZXF1ZXN0KS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChwb3N0VXJpLCBhcGkucmVxdWVzdCxcbiAgICAgICAgICAgICAgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYylcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHJlc3VsdCwgcG9zdFVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgd2hlbiBwb3N0IGZhaWxzJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcigndGVzdCBlcnJvcicpXG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhwb3N0VXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCxcbiAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBlcnIpXG4gICAgICBhcGkuZm9sbG93KCdwb3N0X2xpbmsnKS5wb3N0KHBheWxvYWQsIGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChlcnIpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3B1dCBtZXRob2QnLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciByZXN1bHQgPSBtb2NrUmVzcG9uc2UoeyByZXN1bHQ6ICdzdWNjZXNzJyB9LCAyMDApXG5cbiAgICBpdCgnc2hvdWxkIGZvbGxvdyB0aGUgbGlua3MgYW5kIHB1dCB0byB0aGUgbGFzdCBVUkknLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICBleGVjdXRlUmVxdWVzdC53aXRoQXJncyhwdXRVcmksIGFwaS5yZXF1ZXN0LCBzaW5vbi5tYXRjaC5mdW5jLCBwYXlsb2FkLFxuICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDQsIG51bGwsIHJlc3VsdCwgcHV0VXJpKVxuICAgICAgYXBpLmZvbGxvdygncHV0X2xpbmsnKS5wdXQocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoZXhlY3V0ZVJlcXVlc3QpLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKHB1dFVyaSwgYXBpLnJlcXVlc3QsXG4gICAgICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMsIHBheWxvYWQsIHNpbm9uLm1hdGNoLmZ1bmMpXG4gICAgICAgICAgZXhwZWN0KGNhbGxiYWNrKS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChudWxsLCByZXN1bHQsIHB1dFVyaSlcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG5cbiAgICBpdCgnc2hvdWxkIGNhbGwgY2FsbGJhY2sgd2l0aCBlcnIgd2hlbiBwdXQgZmFpbHMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCd0ZXN0IGVycm9yJylcbiAgICAgIGV4ZWN1dGVSZXF1ZXN0LndpdGhBcmdzKHB1dFVyaSwgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsIHBheWxvYWQsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoNCwgZXJyKVxuICAgICAgYXBpLmZvbGxvdygncHV0X2xpbmsnKS5wdXQocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ3BhdGNoIG1ldGhvZCcsIGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIHJlc3VsdCA9IG1vY2tSZXNwb25zZSh7IHJlc3VsdDogJ3N1Y2Nlc3MnIH0sIDIwMClcblxuICAgIGl0KCdzaG91bGQgZm9sbG93IHRoZSBsaW5rcyBhbmQgcGF0Y2ggdGhlIGxhc3QgVVJJJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgZXhlY3V0ZVJlcXVlc3Qud2l0aEFyZ3MocGF0Y2hVcmksIGFwaS5yZXF1ZXN0LCBzaW5vbi5tYXRjaC5mdW5jLCBwYXlsb2FkLFxuICAgICAgICAgIHNpbm9uLm1hdGNoLmZ1bmMpLmNhbGxzQXJnV2l0aEFzeW5jKDQsIG51bGwsIHJlc3VsdCwgcGF0Y2hVcmkpXG4gICAgICBhcGkuZm9sbG93KCdwYXRjaF9saW5rJykucGF0Y2gocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoZXhlY3V0ZVJlcXVlc3QpLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKHBhdGNoVXJpLCBhcGkucmVxdWVzdCxcbiAgICAgICAgICAgICAgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCwgc2lub24ubWF0Y2guZnVuYylcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKG51bGwsIHJlc3VsdCwgcGF0Y2hVcmkpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyIHdoZW4gcGF0Y2ggZmFpbHMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCd0ZXN0IGVycm9yJylcbiAgICAgIGV4ZWN1dGVSZXF1ZXN0LndpdGhBcmdzKHBhdGNoVXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgcGF5bG9hZCxcbiAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBlcnIsIG51bGwpXG4gICAgICBhcGkuZm9sbG93KCdwYXRjaF9saW5rJykucGF0Y2gocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG5cbiAgZGVzY3JpYmUoJ2RlbCBtZXRob2QnLCBmdW5jdGlvbigpIHtcblxuICAgIHZhciByZXN1bHQgPSBtb2NrUmVzcG9uc2UobnVsbCwgMjA0KVxuXG4gICAgaXQoJ3Nob3VsZCBmb2xsb3cgdGhlIGxpbmtzIGFuZCBkZWxldGUgdGhlIGxhc3QgVVJJJyxcbiAgICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgZXhlY3V0ZVJlcXVlc3Qud2l0aEFyZ3MoZGVsZXRlVXJpLCBhcGkucmVxdWVzdCwgc2lub24ubWF0Y2guZnVuYywgbnVsbCxcbiAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jKS5jYWxsc0FyZ1dpdGhBc3luYyg0LCBudWxsLCByZXN1bHQsIGRlbGV0ZVVyaSlcbiAgICAgIGFwaS5mb2xsb3coJ2RlbGV0ZV9saW5rJykuZGVsKGNhbGxiYWNrKVxuICAgICAgd2FpdEZvcihcbiAgICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZXhwZWN0KGV4ZWN1dGVSZXF1ZXN0KS50by5oYXZlLmJlZW4uY2FsbGVkV2l0aChkZWxldGVVcmksIGFwaS5yZXF1ZXN0LFxuICAgICAgICAgICAgICBzaW5vbi5tYXRjaC5mdW5jLCBudWxsLCBzaW5vbi5tYXRjaC5mdW5jKVxuICAgICAgICAgIGV4cGVjdChjYWxsYmFjaykudG8uaGF2ZS5iZWVuLmNhbGxlZFdpdGgobnVsbCwgcmVzdWx0LCBkZWxldGVVcmkpXG4gICAgICAgICAgZG9uZSgpXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9KVxuXG4gICAgaXQoJ3Nob3VsZCBjYWxsIGNhbGxiYWNrIHdpdGggZXJyIHdoZW4gZGVsZXRpbmcgZmFpbHMnLFxuICAgICAgICBmdW5jdGlvbihkb25lKSB7XG4gICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCd0ZXN0IGVycm9yJylcbiAgICAgIGV4ZWN1dGVSZXF1ZXN0LndpdGhBcmdzKGRlbGV0ZVVyaSwgYXBpLnJlcXVlc3QsIHNpbm9uLm1hdGNoLmZ1bmMsIG51bGwsXG4gICAgICAgICAgc2lub24ubWF0Y2guZnVuYykuY2FsbHNBcmdXaXRoQXN5bmMoNCwgZXJyKVxuICAgICAgYXBpLmZvbGxvdygnZGVsZXRlX2xpbmsnKS5kZWwoY2FsbGJhY2spXG4gICAgICB3YWl0Rm9yKFxuICAgICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBleHBlY3QoY2FsbGJhY2spLnRvLmhhdmUuYmVlbi5jYWxsZWRXaXRoKGVycilcbiAgICAgICAgICBkb25lKClcbiAgICAgICAgfVxuICAgICAgKVxuICAgIH0pXG4gIH0pXG59KVxuIiwidmFyIHByb2Nlc3M9cmVxdWlyZShcIl9fYnJvd3NlcmlmeV9wcm9jZXNzXCIpOyd1c2Ugc3RyaWN0JztcblxudmFyIHRyYXZlcnNvbiA9IHJlcXVpcmUoJy4uL3RyYXZlcnNvbicpXG52YXIgd2FpdEZvciA9IHJlcXVpcmUoJy4vdXRpbC93YWl0X2ZvcicpXG52YXIgY2hhaSA9IHJlcXVpcmUoJ2NoYWknKVxudmFyIHNpbm9uID0gcmVxdWlyZSgnc2lub24nKVxudmFyIHNpbm9uQ2hhaSA9IHJlcXVpcmUoJ3Npbm9uLWNoYWknKVxuXG52YXIgYXNzZXJ0ID0gY2hhaS5hc3NlcnRcbnZhciBleHBlY3QgPSBjaGFpLmV4cGVjdFxuY2hhaS51c2Uoc2lub25DaGFpKVxuXG5kZXNjcmliZSgnVHJhdmVyc29uICh3aGVuIHRlc3RlZCBhZ2FpbnN0IGEgbG9jYWwgc2VydmVyKScsIGZ1bmN0aW9uKCkge1xuXG4gIHZhciBqc29uQXBpXG4gIHZhciBqc29uSGFsQXBpXG4gIHZhciB0ZXN0U2VydmVyXG4gIHZhciBjYWxsYmFja1xuICB2YXIgcm9vdFVyaSA9ICdodHRwOi8vMTI3LjAuMC4xOjI4MDgvJ1xuXG4gIGJlZm9yZShmdW5jdGlvbigpIHtcbiAgICBpZiAoaXNOb2RlSnMoKSkge1xuICAgICAgdGVzdFNlcnZlciA9IHJlcXVpcmUoJy4uL3NlcnZlci9hcHAnKVxuICAgICAgdGVzdFNlcnZlci5zdGFydCgpXG4gICAgfVxuICB9KVxuXG4gIGFmdGVyKGZ1bmN0aW9uKCkge1xuICAgIGlmIChpc05vZGVKcygpICYmIHRlc3RTZXJ2ZXIpIHtcbiAgICAgIHRlc3RTZXJ2ZXIuc3RvcCgpXG4gICAgfVxuICB9KVxuXG4gIGJlZm9yZUVhY2goZnVuY3Rpb24oKSB7XG4gICAganNvbkFwaSA9IHRyYXZlcnNvblxuICAgICAgLmpzb25cbiAgICAgIC5mcm9tKHJvb3RVcmkpXG4gICAgICAubmV3UmVxdWVzdCgpXG4gICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgfVxuICAgIH0pXG4gICAganNvbkhhbEFwaSA9IHRyYXZlcnNvbi5qc29uSGFsXG4gICAgICAuZnJvbShyb290VXJpKVxuICAgICAgLm5ld1JlcXVlc3QoKVxuICAgICAgLndpdGhSZXF1ZXN0T3B0aW9ucyh7XG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdBY2NlcHQnOiAnYXBwbGljYXRpb24vaGFsK2pzb24nLFxuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICB9XG4gICAgfSlcbiAgICBjYWxsYmFjayA9IHNpbm9uLnNweSgpXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBmZXRjaCB0aGUgcm9vdCByZXNwb25zZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpLmZvbGxvdygpLmdldChjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXNwb25zZVdpdGhCb2R5KClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXF1YWwocm9vdFVyaSArICdmaXJzdCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGZldGNoIHRoZSByb290IGRvY3VtZW50JywgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCkuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNoZWNrUmVzdWx0RG9jKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXF1YWwocm9vdFVyaSArICdmaXJzdCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGZvbGxvdyBhIHNpbmdsZSBlbGVtZW50IHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAganNvbkFwaS5mb2xsb3coJ2ZpcnN0JykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNoZWNrUmVzdWx0RG9jKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5maXJzdCkudG8uZXF1YWwoJ2RvY3VtZW50JylcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZm9sbG93IGEgbXVsdGktZWxlbWVudCBwYXRoJywgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCdzZWNvbmQnLCAnZG9jJykuZ2V0KGNhbGxiYWNrKVxuICAgIHdhaXRGb3IoXG4gICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHREb2MgPSBjaGVja1Jlc3BvbnNlV2l0aEJvZHkoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLnNlY29uZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5zZWNvbmQpLnRvLmVxdWFsKCdkb2N1bWVudCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGZvbGxvdyBhIG11bHRpLWVsZW1lbnQgcGF0aCBpbiBoYWwranNvbicsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uSGFsQXBpLmZvbGxvdygnZmlyc3QnLCAnc2Vjb25kJykuZ2V0KGNhbGxiYWNrKVxuICAgIHdhaXRGb3IoXG4gICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHREb2MgPSBjaGVja1Jlc3BvbnNlV2l0aEJvZHkoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLnNlY29uZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5zZWNvbmQpLnRvLmVxdWFsKCdkb2N1bWVudCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGZvbGxvdyBhIG11bHRpLWVsZW1lbnQgcGF0aCBpbiBoYWwranNvbiB1c2luZyBhbiBlbWJlZGRlZCAnICtcbiAgICAgICdyZXNvdXJjZSBhbG9uZyB0aGUgd2F5JywgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25IYWxBcGkuZm9sbG93KCdmaXJzdCcsXG4gICAgICAgICdjb250YWluZWRfcmVzb3VyY2UnLFxuICAgICAgICAnZW1iZWRkZWRfbGlua190b19zZWNvbmQnKVxuICAgICAgLmdldChjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXNwb25zZVdpdGhCb2R5KClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5zZWNvbmQpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2Muc2Vjb25kKS50by5lcXVhbCgnZG9jdW1lbnQnKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBmb2xsb3cgYSBtdWx0aS1lbGVtZW50IHBhdGggaW4gaGFsK2pzb24geWllbGRpbmcgYW4gZW1iZWRkZWQgJyArXG4gICAgICAncmVzb3VyY2UgdG8gdGhlIGNhbGxiYWNrJyxcbiAgICAgIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uSGFsQXBpLmZvbGxvdygnZmlyc3QnLFxuICAgICAgICAnc2Vjb25kJyxcbiAgICAgICAgJ2luc2lkZV9zZWNvbmQnKVxuICAgICAgLmdldChjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXNwb25zZVdpdGhCb2R5KClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5tb3JlKS50by5leGlzdFxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLm1vcmUpLnRvLmVxdWFsKCdkYXRhJylcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZm9sbG93IGEgbXVsdGktZWxlbWVudCBwYXRoIHRvIGEgcmVzb3VyY2UnLCBmdW5jdGlvbihkb25lKSB7XG4gICAganNvbkFwaS5mb2xsb3coJ3NlY29uZCcsICdkb2MnKS5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXN1bHREb2MoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLnNlY29uZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5zZWNvbmQpLnRvLmVxdWFsKCdkb2N1bWVudCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGF1dGhlbnRpY2F0ZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpXG4gICAgICAud2l0aFJlcXVlc3RPcHRpb25zKHtcbiAgICAgICAgYXV0aDoge1xuICAgICAgICAgIHVzZXI6ICd0cmF2ZXJzb24nLFxuICAgICAgICAgIHBhc3M6ICd2ZXJ5c2VjcmV0cGFzc3dvcmQnLFxuICAgICAgICAgIHNlbmRJbW1lZGlhdGVseTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfSkuZm9sbG93KCdhdXRoJylcbiAgICAgIC5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXN1bHREb2MoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLnVzZXIpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MudXNlcikudG8uZXF1YWwoJ2F1dGhlbnRpY2F0ZWQnKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBsZXZlcmFnZSBKU09OUGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpLmZvbGxvdygnJC5qc29ucGF0aC5uZXN0ZWQua2V5JykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNoZWNrUmVzdWx0RG9jKClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy50aGlyZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy50aGlyZCkudG8uZXF1YWwoJ2RvY3VtZW50JylcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgbGV2ZXJhZ2UgVVJJIHRlbXBsYXRlcycsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpLmZvbGxvdygndXJpX3RlbXBsYXRlJylcbiAgICAgICAud2l0aFRlbXBsYXRlUGFyYW1ldGVycyh7cGFyYW06ICdmb29iYXInLCBpZDogMTN9KVxuICAgICAgIC5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXN1bHREb2MoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLnNvbWUpLnRvLmVxdWFsKCdkb2N1bWVudCcpXG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MucGFyYW0pLnRvLmVxdWFsKCdmb29iYXInKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLmlkKS50by5lcXVhbCgnMTMnKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBmYWlsIGdyYWNlZnVsbHkgb24gNDA0IHdpdGggZ2V0KCknLCBmdW5jdGlvbihkb25lKSB7XG4gICAganNvbkFwaS5mb2xsb3coJ2JsaW5kX2FsbGV5JywgJ21vcmUnLCAnbGlua3MnKS5nZXQoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgZXhwZWN0KGNhbGxiYWNrLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgdmFyIGVycm9yID0gY2FsbGJhY2suZmlyc3RDYWxsLmFyZ3NbMF1cbiAgICAgICAgZXhwZWN0KGVycm9yKS50by5leGlzdFxuICAgICAgICBleHBlY3QoZXJyb3IubmFtZSkudG8uZXF1YWwoJ0hUVFBFcnJvcicpXG4gICAgICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50by5lcXVhbCgnSFRUUCBHRVQgZm9yICcgKyByb290VXJpICtcbiAgICAgICAgICAgICdkb2VzL25vdC9leGlzdCcgKyAnIHJlc3VsdGVkIGluIEhUVFAgc3RhdHVzIGNvZGUgNDA0LicpXG4gICAgICAgIGV4cGVjdChlcnJvci51cmkpLnRvLmVxdWFsKHJvb3RVcmkgKyAnZG9lcy9ub3QvZXhpc3QnKVxuICAgICAgICBleHBlY3QoZXJyb3IuaHR0cFN0YXR1cykudG8uZXF1YWwoNDA0KVxuXG4gICAgICAgIHZhciByZXNwb25zZSA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzFdXG4gICAgICAgIGV4cGVjdChyZXNwb25zZSkudG8uZXhpc3RcbiAgICAgICAgdmFyIGJvZHkgPSByZXNwb25zZS5ib2R5XG4gICAgICAgIGV4cGVjdChib2R5KS50by5leGlzdFxuICAgICAgICB2YXIgcmVzdWx0RG9jID0gSlNPTi5wYXJzZShib2R5KVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLm1lc3NhZ2UpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MubWVzc2FnZSkudG8uZXF1YWwoJ3Jlc291cmNlIG5vdCBmb3VuZCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIGp1c3QgZGVsaXZlciB0aGUgbGFzdCByZXNwb25zZSBvZiBnZXQoKSwgZXZlbiB3aGVuIGl0XFwncyA0MDQnLFxuICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCdibGluZF9hbGxleScpLmdldChjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXNwb25zZVdpdGhCb2R5KDQwNClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYykudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5tZXNzYWdlKS50by5leGlzdFxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLm1lc3NhZ2UpLnRvLmVxdWFsKCdyZXNvdXJjZSBub3QgZm91bmQnKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBmYWlsIGdyYWNlZnVsbHkgb24gNDA0IHdpdGggZ2V0UmVzb3VyY2UoKScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpLmZvbGxvdygnYmxpbmRfYWxsZXknKS5nZXRSZXNvdXJjZShjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICBleHBlY3QoY2FsbGJhY2suY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgICAgICB2YXIgZXJyb3IgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1swXVxuICAgICAgICBleHBlY3QoZXJyb3IpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChlcnJvci5uYW1lKS50by5lcXVhbCgnSFRUUEVycm9yJylcbiAgICAgICAgZXhwZWN0KGVycm9yLm1lc3NhZ2UpLnRvLmVxdWFsKCdIVFRQIEdFVCBmb3IgJyArIHJvb3RVcmkgK1xuICAgICAgICAgICAgJ2RvZXMvbm90L2V4aXN0JyArICcgcmVzdWx0ZWQgaW4gSFRUUCBzdGF0dXMgY29kZSA0MDQuJylcbiAgICAgICAgZXhwZWN0KGVycm9yLnVyaSkudG8uZXF1YWwocm9vdFVyaSArICdkb2VzL25vdC9leGlzdCcpXG4gICAgICAgIGV4cGVjdChlcnJvci5odHRwU3RhdHVzKS50by5lcXVhbCg0MDQpXG5cbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzFdXG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MubWVzc2FnZSkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5tZXNzYWdlKS50by5lcXVhbCgncmVzb3VyY2Ugbm90IGZvdW5kJylcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZmFpbCBncmFjZWZ1bGx5IG9uIHN5bnRhY3RpY2FsbHkgaW5jb3JyZWN0IEpTT04nLFxuICAgICAgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCdnYXJiYWdlJykuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgZXhwZWN0KGNhbGxiYWNrLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICAgICAgdmFyIGVycm9yID0gY2FsbGJhY2suZmlyc3RDYWxsLmFyZ3NbMF1cbiAgICAgICAgZXhwZWN0KGVycm9yKS50by5leGlzdFxuICAgICAgICBleHBlY3QoZXJyb3IubmFtZSkudG8uZXF1YWwoJ0pTT05FcnJvcicpXG4gICAgICAgIGV4cGVjdChlcnJvci5tZXNzYWdlKS50by5lcXVhbCgnVGhlIGRvY3VtZW50IGF0ICcgKyByb290VXJpICsgJ2p1bmsnICtcbiAgICAgICAgICAnIGNvdWxkIG5vdCBiZSBwYXJzZWQgYXMgSlNPTjogeyB0aGlzIHdpbGwgOjogbm90IHBhcnNlJylcbiAgICAgICAgZXhwZWN0KGVycm9yLnVyaSkudG8uZXF1YWwocm9vdFVyaSArICdqdW5rJylcbiAgICAgICAgZXhwZWN0KGVycm9yLmJvZHkpLnRvLmVxdWFsKCd7IHRoaXMgd2lsbCA6OiBub3QgcGFyc2UnKVxuXG4gICAgICAgIHZhciByZXN1bHREb2MgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1sxXVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jKS50by5ub3QuZXhpc3RcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgeWllbGQgdGhlIGxhc3QgVVJJJywgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCdzZWNvbmQnLCAnZG9jJykuZ2V0VXJpKGNhbGxiYWNrKVxuICAgIHdhaXRGb3IoXG4gICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIGV4cGVjdChjYWxsYmFjay5jYWxsQ291bnQpLnRvLmVxdWFsKDEpXG4gICAgICAgIHZhciByZXN1bHQgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1sxXVxuICAgICAgICBleHBlY3QocmVzdWx0KS50by5leGlzdFxuICAgICAgICBleHBlY3QocmVzdWx0KS50by5lcXVhbChyb290VXJpICsgJ3NlY29uZC9kb2N1bWVudCcpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBpdCgnc2hvdWxkIHBvc3QnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgdmFyIHBheWxvYWQgPSB7J25ldyc6ICdkb2N1bWVudCd9XG4gICAganNvbkFwaS5mb2xsb3coJ3Bvc3RfbGluaycpLnBvc3QocGF5bG9hZCwgY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNoZWNrUmVzcG9uc2VXaXRoQm9keSgyMDEpXG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MuZG9jdW1lbnQpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MuZG9jdW1lbnQpLnRvLmVxdWFsKCdjcmVhdGVkJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5yZWNlaXZlZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5yZWNlaXZlZCkudG8uZGVlcC5lcXVhbChwYXlsb2FkKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBwdXQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgdmFyIHBheWxvYWQgPSB7J3VwZGF0ZWQnOiAnZG9jdW1lbnQnfVxuICAgIGpzb25BcGkuZm9sbG93KCdwdXRfbGluaycpLnB1dChwYXlsb2FkLCBjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzdWx0RG9jID0gY2hlY2tSZXNwb25zZVdpdGhCb2R5KClcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5kb2N1bWVudCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5kb2N1bWVudCkudG8uZXF1YWwoJ292ZXJ3cml0dGVuJylcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5yZWNlaXZlZCkudG8uZXhpc3RcbiAgICAgICAgZXhwZWN0KHJlc3VsdERvYy5yZWNlaXZlZCkudG8uZGVlcC5lcXVhbChwYXlsb2FkKVxuICAgICAgICBkb25lKClcbiAgICAgIH1cbiAgICApXG4gIH0pXG5cbiAgaXQoJ3Nob3VsZCBwYXRjaCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAvLyBUaGlzIHRlc3Qgd2lsbCBub3Qgd29yayB2aWEgbW9jaGEtcGhhbnRvbWpzIHNpbmNlIFBoYW50b21KUyBjdXJyZW50bHlcbiAgICAvLyBzZW5kcyBhbiBlbXB0eSBib2R5IHdpdGggYSBQQVRDSCByZXF1ZXN0LCBzZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYXJpeWEvcGhhbnRvbWpzL2lzc3Vlcy8xMTM4NFxuICAgIC8vIFNraXAgdGhpcyB0ZXN0IGlmIHdlIGFyZSBydW5uaW5nIGluIG1vY2hhLXBoYW50b21qc1xuICAgIC8vIEFsc28sIGN1cnJlbnRseSBpdCdzIG5vdCBwb3NzaWJsZSB0byBza2lwIGEgdGVzdCBmcm9tIGluc2lkZSB0aGUgdGVzdCxcbiAgICAvLyBzZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvbW9jaGEvaXNzdWVzLzMzMiBhbmRcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdmlzaW9ubWVkaWEvbW9jaGEvcHVsbC85NDZcbiAgICAvLyBzbyB3ZSBqdXN0IG1hcmsgdGhlIHRlc3QgYXMgcGFzc2VkLiBTaWdoLlxuICAgIGlmIChpc1BoYW50b21KcygpKSB7XG4gICAgICBjb25zb2xlLmxvZygnc2tpcHBpbmcgdGVzdCBsb2NhbGhvc3QuanMjXCJzaG91bGQgcGF0Y2hcIiBpbiBQaGFudG9tSlMnKVxuICAgICAgcmV0dXJuIGRvbmUoKVxuICAgIH1cblxuICAgIHZhciBwYXlsb2FkID0geydwYXRjaGVkJzogJ2RvY3VtZW50J31cbiAgICBqc29uQXBpLmZvbGxvdygncGF0Y2hfbGluaycpLnBhdGNoKHBheWxvYWQsIGNhbGxiYWNrKVxuICAgIHdhaXRGb3IoXG4gICAgICBmdW5jdGlvbigpIHsgcmV0dXJuIGNhbGxiYWNrLmNhbGxlZCB9LFxuICAgICAgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXN1bHREb2MgPSBjaGVja1Jlc3BvbnNlV2l0aEJvZHkoKVxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLmRvY3VtZW50KS50by5leGlzdFxuICAgICAgICBleHBlY3QocmVzdWx0RG9jLmRvY3VtZW50KS50by5lcXVhbCgncGF0Y2hlZCcpXG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MucmVjZWl2ZWQpLnRvLmV4aXN0XG4gICAgICAgIGV4cGVjdChyZXN1bHREb2MucmVjZWl2ZWQpLnRvLmRlZXAuZXF1YWwocGF5bG9hZClcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgZGVsZXRlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgIGpzb25BcGkuZm9sbG93KCdkZWxldGVfbGluaycpLmRlbChjYWxsYmFjaylcbiAgICB3YWl0Rm9yKFxuICAgICAgZnVuY3Rpb24oKSB7IHJldHVybiBjYWxsYmFjay5jYWxsZWQgfSxcbiAgICAgIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBjaGVja1Jlc3BvbnNlKDIwNClcbiAgICAgICAgZG9uZSgpXG4gICAgICB9XG4gICAgKVxuICB9KVxuXG4gIGl0KCdzaG91bGQgdXNlIHByb3ZpZGVkIHJlcXVlc3Qgb3B0aW9ucycsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBqc29uQXBpLmZvbGxvdygnZWNoby1oZWFkZXJzJykud2l0aFJlcXVlc3RPcHRpb25zKHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ1gtVHJhdmVyc29uLVRlc3QtSGVhZGVyJzogJ1RyYXZlcnNvbiByb2NrcyEnXG4gICAgICB9XG4gICAgfSkuZ2V0UmVzb3VyY2UoY2FsbGJhY2spXG4gICAgd2FpdEZvcihcbiAgICAgIGZ1bmN0aW9uKCkgeyByZXR1cm4gY2FsbGJhY2suY2FsbGVkIH0sXG4gICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlc3VsdERvYyA9IGNoZWNrUmVzdWx0RG9jKClcbiAgICAgICAgdmFyIHRlc3RSZXNwb25zZUhlYWRlciA9XG4gICAgICAgICAgICByZXN1bHREb2NbJ1gtVHJhdmVyc29uLVRlc3QtSGVhZGVyJ10gfHxcbiAgICAgICAgICAgIHJlc3VsdERvY1sneC10cmF2ZXJzb24tdGVzdC1oZWFkZXInXVxuICAgICAgICBleHBlY3QodGVzdFJlc3BvbnNlSGVhZGVyKS50by5leGlzdFxuICAgICAgICBleHBlY3QodGVzdFJlc3BvbnNlSGVhZGVyKS50by5lcXVhbCgnVHJhdmVyc29uIHJvY2tzIScpXG4gICAgICAgIGRvbmUoKVxuICAgICAgfVxuICAgIClcbiAgfSlcblxuICBmdW5jdGlvbiBpc05vZGVKcygpIHtcbiAgICAvLyBjYW4ndCB1c2Ugc3RyaWN0IGhlcmVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhblxcJ3QgZmlndXJlIG91dCBlbnZpcm9ubWVudC4gJyArXG4gICAgICAgICAgJ1NlZW1zIGl0XFwncyBuZWl0aGVyIE5vZGUuanMgbm9yIGEgYnJvd3Nlci4nKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzUGhhbnRvbUpzKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cubW9jaGFQaGFudG9tSlNcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUmVzcG9uc2VXaXRoQm9keShodHRwU3RhdHVzKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gY2hlY2tSZXNwb25zZShodHRwU3RhdHVzKVxuICAgIHZhciBib2R5ID0gcmVzcG9uc2UuYm9keVxuICAgIGV4cGVjdChib2R5KS50by5leGlzdFxuICAgIHZhciByZXN1bHREb2MgPSBKU09OLnBhcnNlKGJvZHkpXG4gICAgcmV0dXJuIHJlc3VsdERvY1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZXNwb25zZShodHRwU3RhdHVzKSB7XG4gICAgaHR0cFN0YXR1cyA9IGh0dHBTdGF0dXMgfHwgMjAwXG4gICAgZXhwZWN0KGNhbGxiYWNrLmNhbGxDb3VudCkudG8uZXF1YWwoMSlcbiAgICB2YXIgZXJyb3IgPSBjYWxsYmFjay5maXJzdENhbGwuYXJnc1swXVxuICAgIGV4cGVjdChlcnJvcikudG8ubm90LmV4aXN0XG4gICAgdmFyIHJlc3BvbnNlID0gY2FsbGJhY2suZmlyc3RDYWxsLmFyZ3NbMV1cbiAgICBleHBlY3QocmVzcG9uc2UpLnRvLmV4aXN0XG4gICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1c0NvZGUpLnRvLmV4aXN0XG4gICAgZXhwZWN0KHJlc3BvbnNlLnN0YXR1c0NvZGUpLnRvLmVxdWFsKGh0dHBTdGF0dXMpXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1Jlc3VsdERvYygpIHtcbiAgICBleHBlY3QoY2FsbGJhY2suY2FsbENvdW50KS50by5lcXVhbCgxKVxuICAgIHZhciBlcnJvciA9IGNhbGxiYWNrLmZpcnN0Q2FsbC5hcmdzWzBdXG4gICAgZXhwZWN0KGVycm9yKS50by5ub3QuZXhpc3RcbiAgICB2YXIgcmVzdWx0RG9jID0gY2FsbGJhY2suZmlyc3RDYWxsLmFyZ3NbMV1cbiAgICBleHBlY3QocmVzdWx0RG9jKS50by5leGlzdFxuICAgIHJldHVybiByZXN1bHREb2NcbiAgfVxufSlcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtb2NrUmVzcG9uc2UoZG9jLCBodHRwU3RhdHVzKSB7XG4gIHZhciByZXNwb25zZSA9IHt9XG4gIHJlc3BvbnNlLmJvZHkgPSBKU09OLnN0cmluZ2lmeShkb2MpXG4gIHJlc3BvbnNlLnN0YXR1c0NvZGUgPSBodHRwU3RhdHVzIHx8IDIwMFxuICByZXNwb25zZS5kb2MgPSBkb2NcbiAgcmV0dXJuIHJlc3BvbnNlXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGVzdCwgb25TdWNjZXNzLCBwb2xsaW5nKSB7XG4gIHBvbGxpbmcgPSBwb2xsaW5nIHx8IDEwXG4gIHZhciBoYW5kbGUgPSBzZXRJbnRlcnZhbChmdW5jdGlvbigpIHtcbiAgICBpZiAodGVzdCgpKSB7XG4gICAgICBjbGVhckludGVydmFsKGhhbmRsZSlcbiAgICAgIG9uU3VjY2VzcygpXG4gICAgfVxuICB9LCBwb2xsaW5nKVxufVxuIl19
;