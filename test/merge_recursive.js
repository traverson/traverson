'use strict';

var mergeRecursive = require('../lib/merge_recursive')
  , chai = require('chai')
  , expect = chai.expect;

describe('mergeRecursive', function() {

  it('should merge two objects with primitive types', function() {
    var o1 = {
      foo: 'bar',
      baz: 1302,
    };
    var o2 = {
      goo: 'gar',
      gaz: 1604,
    };
    var result = mergeRecursive(o1, o2);
    expect(result.foo).to.equal('bar');
    expect(result.baz).to.equal(1302);
    expect(result.goo).to.equal('gar');
    expect(result.gaz).to.equal(1604);
  });

  it('should merge recursive nested objects', function() {
    var o1 = {
      foo: 'bar',
      nested1: {
        baz: 1302,
        deeper: {
          what: 'ever',
        }
      },
      nested2: {
        faz: true,
      }
    };
    var o2 = {
      goo: 'gar',
      nested1: {
        gaz: 1604,
        deeper: {
          more: 'stuff',
        }
      },
      nested3: {
        bla: false,
      }
    };
    var result = mergeRecursive(o1, o2);
    expect(result.foo).to.equal('bar');
    expect(result.nested1.baz).to.equal(1302);
    expect(result.nested1.deeper.what).to.equal('ever');
    expect(result.nested2.faz).to.be.true;
    expect(result.goo).to.equal('gar');
    expect(result.nested1.gaz).to.equal(1604);
    expect(result.nested1.deeper.more).to.equal('stuff');
    expect(result.nested3).to.exist;
    expect(result.nested3.bla).to.exist;
    expect(result.nested3.bla).to.be.false;
  });

  it('should merge with non-existing second parameter', function() {
    var o1 = {
      foo: 'bar',
      baz: 1302,
    };
    var result = mergeRecursive(o1, null);
    expect(result.foo).to.equal('bar');
    expect(result.baz).to.equal(1302);
  });

  it('should merge two non-existing parameters to null', function() {
    var result = mergeRecursive(null, null);
    expect(result).to.not.exist;
  });

});
