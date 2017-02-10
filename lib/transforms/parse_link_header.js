'use strict';

var xtend = require('xtend')
  , minilog = require('minilog')
  , log = minilog('traverson');

var errorModule = require('../errors')
  , errors = errorModule.errors
  , createError = errorModule.createError;

module.exports = {
  parseLinkHeader: parseLinkHeader,
  parse: parse
};

function parseLinkHeader(t) {
  if (!t.step.doc ||
      !t.step.response ||
      !t.step.response.headers ||
      !t.step.response.headers.link) {
    return true;
  }

  try {
    var links = parse(t.step.response.headers.link);
    t.step.doc._linkHeaders = links;
    return true;
  } catch (e) {
    handleError(t, e);
    return false;
  }
}

function handleError(t, e) {
  var error = e;
  log.error('parsing failed');
  log.error(error);
  t.callback(error);
}

function hasRel(x) {
  return x && x.rel;
}

function intoRels (acc, x) {
  function splitRel (rel) {
    acc[rel] = xtend(x, {rel: rel});
  }

  x.rel.split(/\s+/).forEach(splitRel);
  return acc;
}

function createObjects (acc, p) {
  // rel="next" => 1: rel 2: next
  var m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/);
  if (m) acc[m[1]] = m[2];
  return acc;
}

function parseLink(link) {
  try {
    var parts     =  link.split(';')
      , linkUrl   =  parts.shift().replace(/[<>]/g, '');

    var info = parts
      .reduce(createObjects, {});

    info.url = linkUrl;
    return info;
  } catch (e) {
    return null;
  }
}

function parse (linkHeader) {
  if (!linkHeader) return null;

  return linkHeader.split(/,\s*</)
   .map(parseLink)
   .filter(hasRel)
   .reduce(intoRels, {});
}
