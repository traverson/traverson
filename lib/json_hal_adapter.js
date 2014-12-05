'use strict';

var halfred = require('halfred')
  , minilog = require('minilog')
  , _s = require('underscore.string');

var log = minilog('traverson');

function JsonHalAdapter() {}

JsonHalAdapter.prototype.findNextStep = function(doc, key) {
  log.debug('parsing hal');
  var halResource = halfred.parse(doc);

  var parsedKey = parseKey(key);
  resolveCurie(halResource, parsedKey);

  // try _links first
  var step = findLink(halResource, parsedKey);
  if (step) {
    return step;
  }

  // no link found, check for _embedded
  step = findEmbedded(halResource, doc, parsedKey);
  if (step) {
    return step;
  }
  throw new Error('Could not find a link nor an embedded object for ' +
      JSON.stringify(parsedKey) + ' in document:\n' + JSON.stringify(doc));
};

function parseKey(key) {
  var match = key.match(/(.*)\[(.*):(.*)\]/);
  // ea:admin[title:Kate] => access by secondary attribute
  if (match) {
    return {
      key: match[1],
      secondaryKey: match[2],
      secondaryValue: match[3],
      index: null,
      all: false,
    };
  }
  // ea:order[3] => index access into embedded array
  match = key.match(/(.*)\[(\d+)\]/);
  if (match) {
    return {
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: match[2],
      all: false,
    };
  }
  // ea:order[$all] => meta-key, return full array
  match = key.match(/(.*)\[\$all\]/);
  if (match) {
    return {
      key: match[1],
      secondaryKey: null,
      secondaryValue: null,
      index: null,
      all: true,
    };
  }
  // ea:order => simple link relation
  return {
    key: key,
    secondaryKey: null,
    secondaryValue: null,
    index: null,
    all: false,
  };
}

function resolveCurie(halResource, parsedKey) {
  if (halResource.hasCuries()) {
    parsedKey.curie = halResource.reverseResolveCurie(parsedKey.key);
  }
}

function findLink(halResource, parsedKey) {
  var linkArray = halResource.linkArray(parsedKey.key);
  if (!linkArray) {
    linkArray = halResource.linkArray(parsedKey.curie);
  }
  if (!linkArray || linkArray.length === 0) {
    return null;
  }

  var step = findLinkBySecondaryKey(linkArray, parsedKey);
  if (!step) {
    step = findLinkByIndex(linkArray, parsedKey);
  }
  if (!step) {
    step = findLinkWithoutIndex(linkArray, parsedKey);
  }
  return step;
}

function findLinkBySecondaryKey(linkArray, parsedKey) {
  if (parsedKey.secondaryKey &&
      parsedKey.secondaryValue) {

    // client selected a specific link by an explicit secondary key like 'name',
    // so use it or fail
    var i = 0;
    for (; i < linkArray.length; i++) {
      var val = linkArray[i][parsedKey.secondaryKey];
      /* jshint -W116 */
      if (val != null && val == parsedKey.secondaryValue) {
        if (!linkArray[i].href) {
          throw new Error(parsedKey.key + '[' + parsedKey.secondaryKey + ':' +
              parsedKey.secondaryValue +
              '] requested, but this link had no href attribute.');
        }
        log.debug('found hal link: ' + linkArray[i].href);
        return { uri: linkArray[i].href };
      }
      /* jshint +W116 */
    }
    throw new Error(parsedKey.key + '[' + parsedKey.secondaryKey + ':' +
        parsedKey.secondaryValue +
       '] requested, but there is no such link.');
  }
  return null;
}

function findLinkByIndex(linkArray, parsedKey) {
  if (typeof parsedKey.index !== 'undefined' && parsedKey.index !== null) {
    // client specified an explicit array index for this link, so use it or fail
    if (!linkArray[parsedKey.index]) {
      throw new Error(parsedKey.key + '[' + parsedKey.index +
          '] requested, but link array ' + parsedKey.key +
          ' had no element at index ' + parsedKey.index);
    }
    if (!linkArray[parsedKey.index].href) {
      throw new Error(parsedKey.key + '[' + parsedKey.index +
          '] requested, but this link had no href attribute.');
    }
    log.debug('found hal link: ' + linkArray[parsedKey.index].href);
    return { uri: linkArray[parsedKey.index].href };
  }
  return null;
}

function findLinkWithoutIndex(linkArray, parsedKey) {
  // client did not specify an array index for this link, arbitrarily choose
  // the first that has a href attribute
  var link;
  for (var index = 0; index < linkArray.length; index++) {
    if (linkArray[index].href) {
      link = linkArray[index];
      break;
    }
  }
  if (link) {
    if (linkArray.length > 1) {
      log.warn('Found HAL link array with more than one element for ' +
          'key ' + parsedKey.key + ', arbitrarily choosing index ' + index +
          ', because it was the first that had a href attribute.');
    }
    log.debug('found hal link: ' + link.href);
    return { uri: link.href };
  }
  return null;
}


function findEmbedded(halResource, doc, parsedKey) {
  log.debug('checking for embedded: ' + parsedKey.key +
      (parsedKey.index ? parsedKey.index : ''));

  var resourceArray = halResource.embeddedArray(parsedKey.key);
  if (!resourceArray || resourceArray.length === 0) {
    return null;
  }
  log.debug('Found an array of embedded resource for: ' + parsedKey.key);

  var step = findeEmbeddedByIndexOrAll(resourceArray, parsedKey, halResource);
  if (!step) {
    step = findEmbeddedSimple(resourceArray, parsedKey);
  }
  return step;
}

function findeEmbeddedByIndexOrAll(resourceArray, parsedKey, parentResource) {
  if (parsedKey.all) {
    return { doc: parentResource.original()._embedded[parsedKey.key] };
  } else if (parsedKey.index) {
    // client specified an explicit array index, so use it or fail
    if (!resourceArray[parsedKey.index]) {
      throw new Error(parsedKey.key + '[' + parsedKey.index +
          '] requested, but there is no such link. However, there is an ' +
          'embedded resource array named ' + parsedKey.key +
          ' but it does not have an element at index ' + parsedKey.index);
    }
    log.debug('Found an embedded resource for: ' + parsedKey.key + '[' +
        parsedKey.index + ']');
    return { doc: resourceArray[parsedKey.index].original() };
  }
  return null;
}

function findEmbeddedSimple(resourceArray, parsedKey) {
  // client did not specify an array index, arbitrarily choose first
  if (resourceArray.length > 1) {
    log.warn('Found HAL embedded resource array with more than one element ' +
        ' for key ' + parsedKey.key + ', arbitrarily choosing first element.');
  }
  return { doc: resourceArray[0].original() };
}

module.exports = JsonHalAdapter;
