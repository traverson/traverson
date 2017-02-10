var mergeRecursive = require('./merge_recursive');

module.exports = function parseLinkHeaderValue(linkHeader) {
  if (!linkHeader) {
    return null;
  }
  return linkHeader
    .split(/,\s*</)
    .map(parseLink)
    .filter(hasRel)
    .reduce(intoRels, {});
};

function parseLink(link) {
  try {
    var parts = link.split(';');
    var linkUrl = parts.shift().replace(/[<>]/g, '');
    var info = parts.reduce(createObjects, {});
    info.url = linkUrl;
    return info;
  } catch (e) {
    return null;
  }
}

function createObjects(acc, p) {
  // rel="next" => 1: rel 2: next
  var m = p.match(/\s*(.+)\s*=\s*"?([^"]+)"?/);
  if (m) acc[m[1]] = m[2];
  return acc;
}

function hasRel(linkHeaderValuePart) {
  return linkHeaderValuePart && linkHeaderValuePart.rel;
}

function intoRels(acc, linkHeaderValuePart) {
  function splitRel (rel) {
    acc[rel] = mergeRecursive({ rel: rel }, linkHeaderValuePart);
  }

  linkHeaderValuePart.rel.split(/\s+/).forEach(splitRel);
  return acc;
}
