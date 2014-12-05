require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// TODO Replace by a proper lightweight logging module, suited for the browser

var enabled = false;
function Logger(id) {
  if (id == null) {
    id = '';
  }
  this.id = id;
}

Logger.prototype.enable = function() {
  this.enabled = true;
};

Logger.prototype.debug = function(message) {
  if (enabled) {
    console.log(this.id + '/debug: ' + message);
  }
};

Logger.prototype.info = function(message) {
  if (enabled) {
    console.log(this.id + '/info: ' + message);
  }
};

Logger.prototype.warn = function(message) {
  if (enabled) {
    console.log(this.id + '/warn: ' + message);
  }
};

Logger.prototype.error = function(message) {
  if (enabled) {
    console.log(this.id + '/error: ' + message);
  }
};

function minilog(id) {
  return new Logger(id);
}

minilog.enable = function() {
  enabled = true;
};

module.exports = minilog;

},{}],2:[function(require,module,exports){
'use strict';

module.exports = {
  isArray: function(o) {
    if (o == null) {
      return false;
    }
    return Object.prototype.toString.call(o) === '[object Array]';
  }
};

},{}],3:[function(require,module,exports){
'use strict';

var superagent = require('../third-party/superagent');

function Request() {
  this.options = {};
}

Request.prototype.defaults = function(options) {
  var newRequest = new Request();
  newRequest.options = options;
  return newRequest;
};

Request.prototype.get = function(uri, callback) {
  mapRequest(superagent.get(uri), this.options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.post = function(uri, options, callback) {
  mapRequest(superagent.post(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.put = function(uri, options, callback) {
  mapRequest(superagent.put(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.patch = function(uri, options, callback) {
  mapRequest(superagent.patch(uri), this.options, options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

Request.prototype.del = function(uri, options, callback) {
  mapRequest(superagent.del(uri), this.options)
    .end(function(response) {
    callback(null, mapResponse(response));
  });
};

function mapRequest(superagentRequest, options, bodyOptions) {
  mapQuery(superagentRequest, options);
  mapHeaders(superagentRequest, options);
  mapAuth(superagentRequest, options);
  mapBody(superagentRequest, options, bodyOptions);
  return superagentRequest;
}

function mapQuery(superagentRequest, options) {
  var qs = options.qs;
  if (qs != null) {
    superagentRequest = superagentRequest.query(qs);
  }
}

function mapHeaders(superagentRequest, options) {
  var headers = options.headers;
  if (headers != null) {
    superagentRequest = superagentRequest.set(headers);
  }
}

function mapAuth(superagentRequest, options) {
  var auth = options.auth;
  if (auth != null) {
    superagentRequest = superagentRequest.auth(
      auth.user || auth.username,
      auth.pass || auth.password
    );
  }
}

function mapBody(superagentRequest, options, bodyOptions) {
  if (bodyOptions != null) {
    var body = bodyOptions.body;
    if (body != null) {
      superagentRequest = superagentRequest.send(body);
    }
  }
}

// map XHR response object properties to Node.js request lib's response object
// properties
function mapResponse(response) {
  response.body = response.text;
  response.statusCode = response.status;
  return response;
}

module.exports = new Request();

},{"../third-party/superagent":6}],4:[function(require,module,exports){
'use strict';

/*
 * Copied from underscore.string module. Just the functions we need, to reduce
 * the browserified size.
 */

var _s = {
  startsWith: function(str, starts) {
    if (starts === '') return true;
    if (str == null || starts == null) return false;
    str = String(str); starts = String(starts);
    return str.length >= starts.length && str.slice(0, starts.length) === starts;
  },

  endsWith: function(str, ends){
    if (ends === '') return true;
    if (str == null || ends == null) return false;
    str = String(str); ends = String(ends);
    return str.length >= ends.length &&
      str.slice(str.length - ends.length) === ends;
  },

  splice: function(str, i, howmany, substr){
    var arr = _s.chars(str);
    arr.splice(~~i, ~~howmany, substr);
    return arr.join('');
  },

  contains: function(str, needle){
    if (needle === '') return true;
    if (str == null) return false;
    return String(str).indexOf(needle) !== -1;
  },

  chars: function(str) {
    if (str == null) return [];
    return String(str).split('');
  }
};

module.exports = _s;

},{}],5:[function(require,module,exports){
'use strict';

var resolveUrl = require('resolve-url');

exports.resolve = function(from, to) {
  return resolveUrl(from, to);
};

},{"resolve-url":21}],6:[function(require,module,exports){
;(function(){

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("RedVentures-reduce/index.js", function(exports, require, module){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }

  return curr;
};
});
require.register("superagent/lib/client.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? this
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

function getXHR() {
  if (root.XMLHttpRequest
    && ('file:' != root.location.protocol || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
}

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pairs.push(encodeURIComponent(key)
      + '=' + encodeURIComponent(obj[key]));
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(xhr, options) {
  options = options || {};
  this.xhr = xhr;
  this.text = xhr.responseText;
  this.setStatusProperties(xhr.status);
  this.header = this.headers = parseHeader(xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.parseBody(this.text);
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status || 1223 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var msg = 'got ' + this.status + ' response';
  var err = new Error(msg);
  err.status = this.status;
  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.set('X-Requested-With', 'XMLHttpRequest');
  this.on('end', function(){
    var res = new Response(self.xhr);
    if ('HEAD' == method) res.text = null;
    self.callback(null, res);
  });
}

/**
 * Inherit from `Emitter.prototype`.
 */

Request.prototype = new Emitter;
Request.prototype.constructor = Request;

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  if (2 == fn.length) return fn(err, res);
  if (err) return this.emit('error', err);
  fn(res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._data;

  // store callback
  this._callback = fn || noop;

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;
    if (0 == xhr.status) {
      if (self.aborted) return self.timeoutError();
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  if (xhr.upload) {
    xhr.upload.onprogress = function(e){
      e.percent = e.loaded / e.total * 100;
      self.emit('progress', e);
    };
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

});
require.alias("component-emitter/index.js", "superagent/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("RedVentures-reduce/index.js", "superagent/deps/reduce/index.js");
require.alias("RedVentures-reduce/index.js", "reduce/index.js");

require.alias("superagent/lib/client.js", "superagent/index.js");

if (typeof exports == "object") {
  module.exports = require("superagent");
} else if (typeof define == "function" && define.amd) {
  define(function(){ return require("superagent"); });
} else {
  this["superagent"] = require("superagent");
}})();

},{"emitter":14,"indexof":14,"reduce":14,"superagent":14}],7:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , standardRequest = require('request')
  , util = require('util');

var FinalAction = require('./final_action')
  , JsonWalker = require('./json_walker')
  , JsonHalWalker = require('./json_hal_walker')
  , mediaTypes = require('./media_types');

var log = minilog('traverson');

function Builder(mediaType, startUri) {
  this.walker = this.createWalker(mediaType);
  this.walker.startUri = startUri;
  this.walker.request = this.request = standardRequest;
  this.walker.parseJson = JSON.parse;
  this.finalAction = new FinalAction(this.walker);
}

Builder.prototype.createWalker = function(mediaType) {
  switch (mediaType) {
  case mediaTypes.JSON:
    log.debug('creating new JsonWalker');
    return new JsonWalker();
  case mediaTypes.JSON_HAL:
    log.debug('creating new JsonHalWalker');
    return new JsonHalWalker();
  default:
    throw new Error('Unknown or unsupported media type: ' + mediaType);
  }
};

Builder.prototype.follow = function() {
  if (arguments.length === 1 && util.isArray(arguments[0])) {
    this.walker.links = arguments[0];
  } else {
    this.walker.links = Array.prototype.slice.apply(arguments);
  }
  return this;
};

Builder.prototype.walk = Builder.prototype.follow;

Builder.prototype.withTemplateParameters = function(parameters) {
  this.walker.templateParameters = parameters;
  return this;
};

Builder.prototype.withRequestOptions = function(options) {
  this.walker.request = this.request = standardRequest.defaults(options);
  return this;
};

Builder.prototype.withRequestLibrary = function(request) {
  this.walker.request = this.request = request;
  return this;
};

Builder.prototype.parseResponseBodiesWith = function(parser) {
  this.walker.parseJson = parser;
  return this;
};

Builder.prototype.resolveRelative = function() {
  this.walker.resolveRelative = true;
  return this;
};

Builder.prototype.get = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.get(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not yield the full http response to the
 * callback but instead the already parsed JSON as an object.
 */
Builder.prototype.getResource = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getResource(nextStep, callback);
  });
};

/*
 * Special variant of get() that does not execute the last request but instead
 * yields the last URI to the callback.
 */

Builder.prototype.getUri = function(callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) {
      return callback(err, lastStep.response, lastStep.uri);
    }
    self.finalAction.getUri(nextStep, callback);
  });
};

Builder.prototype.post = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.post,
      callback);
};

Builder.prototype.put = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.put,
      callback);
};

Builder.prototype.patch = function(body, callback) {
  this.finalAction.walkAndExecute(body, this.request, this.request.patch,
      callback);
};

Builder.prototype.del = function(callback) {
  this.finalAction.walkAndExecute(null, this.request, this.request.del,
      callback);
};

module.exports = Builder;

},{"./final_action":8,"./json_hal_walker":9,"./json_walker":10,"./media_types":11,"minilog":1,"request":3,"util":2}],8:[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , log = minilog('traverson');

function FinalAction(walker) {
  this.walker = walker;
}

FinalAction.prototype.get = function(nextStep, callback) {
  log.debug('next step: ' + JSON.stringify(nextStep, null, 2));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) { return callback(err, step.response, step.uri); }
    if (!step.response && step.doc) {
      log.debug('faking HTTP response for embedded resource');
      step.response = {
        statusCode: 200,
        body: JSON.stringify(step.doc),
        remark: 'This is not an actual HTTP response. The resource you ' +
          'requested was an embedded resource, so no HTTP request was ' +
          'made to acquire it.'
      };
    }
    callback(null, step.response);
  });
};

FinalAction.prototype.getResource = function(nextStep, callback) {
  // TODO Remove duplication: This duplicates the get/checkHttpStatus/parse
  // sequence from the Walker's walk method.
  var self = this;
  log.debug('next step: ' + JSON.stringify(nextStep));
  this.walker.process(nextStep, function(err, step) {
    log.debug('walker.process returned');
    if (err) { return callback(err, step.response, step.uri); }
    // log.debug('resulting step: ' + JSON.stringify(step, null, 2))

    if (step.doc) {
      // return an embedded doc immediately
      return callback(null, step.doc);
    }

    var resource;
    try {
      self.walker.checkHttpStatus(step);
      resource = self.walker.parse(step);
      return callback(null, resource);
    } catch (e) {
      return callback(e, e.doc);
    }
  });
};

FinalAction.prototype.getUri = function(nextStep, callback) {
  var self = this;
  log.debug('returning uri');
  if (nextStep.uri) {
    return callback(null, nextStep.uri);
  } else if (nextStep.doc &&
    nextStep.doc._links &&
    nextStep.doc._links.self &&
    nextStep.doc._links.self.href) {
    return callback(null, self.walker.startUri +
        nextStep.doc._links.self.href);
  } else {
    return callback(new Error('You requested an URI but the last ' +
        'resource is an embedded resource and has no URI of its own ' +
        '(that is, it has no link with rel=\"self\"'));
  }
};

FinalAction.prototype.walkAndExecute = function(body, request, method,
    callback) {
  var self = this;
  this.walker.walk(function(err, nextStep, lastStep) {
    log.debug('walker.walk returned');
    if (err) { return callback(err, lastStep.response, lastStep.uri); }
    log.debug('executing final request with step: ' +
        JSON.stringify(nextStep));
    self.executeRequest(nextStep.uri, request, method, body, callback);
  });
};

FinalAction.prototype.executeRequest = function(uri, request, method, body,
    callback) {
  var options;
  if (body) {
    options = { body: JSON.stringify(body) };
  } else {
    options = {};
  }
  log.debug('request to ' + uri + ' with options ' + JSON.stringify(options));
  method.call(request, uri, options, function(err, response) {
    log.debug('request to ' + uri + ' succeeded');
    if (err) { return callback(err, response, uri); }
    return callback(null, response, uri);
  });
};

module.exports = FinalAction;

},{"minilog":1}],9:[function(require,module,exports){
'use strict';

var halfred = require('halfred')
  , minilog = require('minilog')
  , _s = require('underscore.string')
  , Walker = require('./walker');

var log = minilog('traverson');

function JsonHalWalker() {}

JsonHalWalker.prototype = new Walker();

JsonHalWalker.prototype.findNextStep = function(doc, key) {
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

module.exports = JsonHalWalker;

},{"./walker":12,"halfred":17,"minilog":1,"underscore.string":4}],10:[function(require,module,exports){
'use strict';

var Walker = require('./walker');

function JsonWalker() {}

JsonWalker.prototype = new Walker();

module.exports = JsonWalker;

},{"./walker":12}],11:[function(require,module,exports){
'use strict';

module.exports = {
  JSON: 'application/json',
  JSON_HAL: 'application/hal+json',
};

},{}],12:[function(require,module,exports){
'use strict';

var jsonpathLib = require('JSONPath')
  , minilog = require('minilog')
  , _s = require('underscore.string')
  , uriTemplate = require('url-template')
  , url = require('url')
  , util = require('util');

/* jshint -W061 */
// wtf jshint? eval can be harmful? But that is not eval, it's JSONPath#eval
var jsonpath = jsonpathLib.eval;
/* jshint +W061 */
var log = minilog('traverson');

function Walker() {}

/*
 * Walks from resource to resource along the path given by the link relations
 * from this.links until it has reached the last URI. On reaching this, it calls
 * the given callback with the last resulting step.
 */
Walker.prototype.walk = function(callback) {

  var self = this;

  var nextStep = {
    uri: this.resolveUriTemplate(this.startUri, this.templateParameters, 0)
  };
  var index = 0;
  var finalStep = nextStep;

  log.debug('starting to follow links');

  function executeNextStep() {
    if (index < self.links.length) {

      // Trigger execution of next step. In most cases that is an HTTP get to
      // the next URI.
      self.process(nextStep, function(err, lastStep) {
        finalStep = lastStep;
        if (err) {
          log.debug('error while processing step ' + JSON.stringify(nextStep));
          log.error(err);
          return callback(err, nextStep, lastStep);
        }
        log.debug('successully processed step');

        // check HTTP status code
        try {
          self.checkHttpStatus(lastStep);
        } catch (e) {
          log.error('unexpected http status code');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // parse JSON from last response
        var doc;
        try {
          doc = self.parse(lastStep);
        } catch (e) {
          log.error('parsing failed');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // extract next link to follow from last response
        var link = self.links[index++];
        log.debug('next link: ' + link);

        try {
          nextStep = self.findNextStep(doc, link);
        } catch (e) {
          log.error('could not find next step');
          log.error(e);
          return callback(e, nextStep, lastStep);
        }

        // URI template has to be resolved before post processing the URL,
        // because we do url.resolve with it (in json_hal) and this would URI-
        // encode curly braces.
        if (nextStep.uri) {
          // next link found in last response, might be a URI template
          nextStep.uri = self.resolveUriTemplate(nextStep.uri,
              self.templateParameters, index);
        }

        // turn relative URI into absolute URI or whatever else is required
        self.postProcessStep(nextStep, lastStep);
        log.debug('next step: ' + JSON.stringify(nextStep, null, 2));

        // follow next link
        executeNextStep();
      });
    } else {
      // link array is exhausted, we are done and return the last response
      // and uri to the callback the client passed into the walk method.
      log.debug('link array exhausted, calling callback');
      return callback(null, nextStep, finalStep);
    }
  }
  executeNextStep();
};

Walker.prototype.process = function(step, callback) {
  log.debug('processing next step: ' + JSON.stringify(step, null, 2));
  if (step.uri) {
    this.get(step, callback);
  } else if (step.doc) {
    // The step already has an attached result document, so all is fine and we
    // can call the callback immediately
    log.debug('document for next step has already been fetched');
    callback(null, step);
  } else {
    throw new Error('Can not process next step: ' + JSON.stringify(step));
  }
};

Walker.prototype.get = function(step, callback) {
  log.debug('request to ' + step.uri);
  this.request.get(step.uri, function(err, response, body) {
    if (body && !response.body) {
      response.body = body;
    }
    log.debug('request.get returned');
    if (err) { return callback(err, step); }
    log.debug('request to ' + step.uri + ' finished (' + response.statusCode +
        ')');
    step.response = response;
    return callback(null, step);
  });
};

Walker.prototype.checkHttpStatus = function(step) {
  if (!step.response && step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return;
  }

  // Only process response if http status was in 200 - 299 range.
  // The request module follows redirects for GET requests all by itself, so
  // we should not have to handle them here. If a 3xx http status get's here
  // something went wrong. 4xx and 5xx of course also indicate an error
  // condition. 1xx should not occur.
  var httpStatus = step.response.statusCode;
  if (httpStatus < 200 || httpStatus >= 300) {
    throw httpError(step.uri, httpStatus, step.response.body);
  }
};

Walker.prototype.parse = function(step) {
  if (step.doc) {
    // Last step probably did not execute a HTTP request but used an embedded
    // document.
    return step.doc;
  }

  try {
    return this.parseJson(step.response.body);
  } catch (e) {
    if (e.name === 'SyntaxError') {
      throw jsonError(step.uri, step.response.body);
    }
    throw e;
  }
};

Walker.prototype.findNextStep = function(doc, link) {
  log.debug('extracting link ' + link + ' from ' + JSON.stringify(doc));
  var uri;
  if (this.testJSONPath(link)) {
    return { uri: this.resolveJSONPath(link, doc) };
  } else if (doc[link]) {
    return { uri : doc[link] };
  } else {
    throw new Error('Could not find property ' + link +
        ' in document:\n' + JSON.stringify(doc));
  }
};

Walker.prototype.postProcessStep = function(nextStep, lastStep) {
  // default behaviour: resolve full/absolute/relative url via url.resolve
  if (nextStep.uri) {
    // TODO FIXME This does not work with https,
    // should be startsWith(/https?:/-ignore-case)
    if (!_s.startsWith(nextStep.uri, 'http://')) {
      if (this.resolveRelative && lastStep && lastStep.uri) {
        if (_s.startsWith(nextStep.uri, '/') &&
          _s.endsWith(lastStep.uri, '/')) {
          nextStep.uri = _s.splice(nextStep.uri, 0, 1);
        }
        nextStep.uri = lastStep.uri + nextStep.uri;
      } else {
        nextStep.uri = url.resolve(this.startUri, nextStep.uri);
      }
    }
  }
};

Walker.prototype.testJSONPath = function(link) {
  return _s.startsWith(link, '$.') || _s.startsWith(link, '$[');
};

Walker.prototype.resolveJSONPath = function(link, doc) {
  var matches = jsonpath(doc, link);
  if (matches.length === 1) {
    var uri = matches[0];
    if (!uri) {
      throw new Error('JSONPath expression ' + link +
        ' was resolved but the result was null, undefined or an empty' +
        ' string in document:\n' + JSON.stringify(doc));
    }
    return uri;
  } else if (matches.length > 1) {
    // ambigious match
    throw new Error('JSONPath expression ' + link +
      ' returned more than one match in document:\n' +
      JSON.stringify(doc));
  } else {
    // no match at all
    throw new Error('JSONPath expression ' + link +
      ' returned no match in document:\n' + JSON.stringify(doc));
  }
};

Walker.prototype.resolveUriTemplate = function(uri, templateParams,
    templateIndex) {
  if (util.isArray(templateParams)) {
    // if template params were given as an array, only use the array element
    // for the current index for URI template resolving.
    templateParams = templateParams[templateIndex];
  }

  if (!templateParams) {
    templateParams = {};
  }

  if (_s.contains(uri, '{')) {
    var template = uriTemplate.parse(uri);
    return template.expand(templateParams);
  } else {
    return uri;
  }
};

function httpError(uri, httpStatus, body) {
  var error = new Error('HTTP GET for ' + uri +
      ' resulted in HTTP status code ' + httpStatus + '.');
  error.name = 'HTTPError';
  error.uri = uri;
  error.httpStatus = httpStatus;
  error.body = body;
  try {
    error.doc = JSON.parse(body);
  } catch (e) {
    // ignore
  }
  return error;
}

function jsonError(uri, body) {
  var error = new Error('The document at ' + uri +
      ' could not be parsed as JSON: ' + body);
  error.name = 'JSONError';
  error.uri = uri;
  error.body = body;
  return error;
}

module.exports = Walker;

},{"JSONPath":13,"minilog":1,"underscore.string":4,"url":5,"url-template":22,"util":2}],13:[function(require,module,exports){
/* JSONPath 0.8.0 - XPath for JSON
 *
 * Copyright (c) 2007 Stefan Goessner (goessner.net)
 * Licensed under the MIT (MIT-LICENSE.txt) licence.
 */

var isNode = false;
(function(exports, require) {

// Keep compatibility with old browsers
if (!Array.isArray) {
  Array.isArray = function(vArg) {
    return Object.prototype.toString.call(vArg) === "[object Array]";
  };
}

// Make sure to know if we are in real node or not (the `require` variable
// could actually be require.js, for example.
var isNode = typeof module !== 'undefined' && !!module.exports;

var vm = isNode ?
    require('vm') : {
      runInNewContext: function(expr, context) { with (context) return eval(expr); }
    };
exports.eval = jsonPath;

var cache = {};

function push(arr, elem) { arr = arr.slice(); arr.push(elem); return arr; }
function unshift(elem, arr) { arr = arr.slice(); arr.unshift(elem); return arr; }

function jsonPath(obj, expr, arg) {
   var P = {
      resultType: arg && arg.resultType || "VALUE",
      flatten: arg && arg.flatten || false,
      wrap: (arg && arg.hasOwnProperty('wrap')) ? arg.wrap : true,
      sandbox: (arg && arg.sandbox) ? arg.sandbox : {},
      normalize: function(expr) {
         if (cache[expr]) return cache[expr];
         var subx = [];
         var normalized = expr.replace(/[\['](\??\(.*?\))[\]']/g, function($0,$1){return "[#"+(subx.push($1)-1)+"]";})
                     .replace(/'?\.'?|\['?/g, ";")
                     .replace(/(;)?(\^+)(;)?/g, function(_, front, ups, back) { return ';' + ups.split('').join(';') + ';'; })
                     .replace(/;;;|;;/g, ";..;")
                     .replace(/;$|'?\]|'$/g, "");
         var exprList = normalized.split(';').map(function(expr) {
            var match = expr.match(/#([0-9]+)/);
            return !match || !match[1] ? expr : subx[match[1]];
         })
         return cache[expr] = exprList;
      },
      asPath: function(path) {
         var x = path, p = "$";
         for (var i=1,n=x.length; i<n; i++)
            p += /^[0-9*]+$/.test(x[i]) ? ("["+x[i]+"]") : ("['"+x[i]+"']");
         return p;
      },
      trace: function(expr, val, path) {
         // no expr to follow? return path and value as the result of this trace branch
         if (!expr.length) return [{path: path, value: val}];

         var loc = expr[0], x = expr.slice(1);
         // the parent sel computation is handled in the frame above using the
         // ancestor object of val
         if (loc === '^') return path.length ? [{path: path.slice(0,-1), expr: x, isParentSelector: true}] : [];

         // we need to gather the return value of recursive trace calls in order to
         // do the parent sel computation.
         var ret = [];
         function addRet(elems) { ret = ret.concat(elems); }

         if (val && val.hasOwnProperty(loc)) // simple case, directly follow property
            addRet(P.trace(x, val[loc], push(path, loc)));
         else if (loc === "*") { // any property
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               addRet(P.trace(unshift(m, x), v, p)); });
         }
         else if (loc === "..") { // all chid properties
            addRet(P.trace(x, val, path));
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (typeof v[m] === "object")
                  addRet(P.trace(unshift("..", x), v[m], push(p, m)));
            });
         }
         else if (loc[0] === '(') { // [(expr)]
            addRet(P.trace(unshift(P.eval(loc, val, path[path.length], path),x), val, path));
         }
         else if (loc.indexOf('?(') === 0) { // [?(expr)]
            P.walk(loc, x, val, path, function(m,l,x,v,p) {
               if (P.eval(l.replace(/^\?\((.*?)\)$/,"$1"),v[m],m, path))
                  addRet(P.trace(unshift(m,x),v,p));
            });
         }
         else if (loc.indexOf(',') > -1) { // [name1,name2,...]
            for (var parts = loc.split(','), i = 0; i < parts.length; i++)
               addRet(P.trace(unshift(parts[i], x), val, path));
         }
         else if (/^(-?[0-9]*):(-?[0-9]*):?([0-9]*)$/.test(loc)) { // [start:end:step]  python slice syntax
            addRet(P.slice(loc, x, val, path));
         }

         // we check the resulting values for parent selections. for parent
         // selections we discard the value object and continue the trace with the
         // current val object
         return ret.reduce(function(all, ea) {
            return all.concat(ea.isParentSelector ? P.trace(ea.expr, val, ea.path) : [ea]);
         }, []);
      },
      walk: function(loc, expr, val, path, f) {
         if (Array.isArray(val))
            for (var i = 0, n = val.length; i < n; i++)
               f(i, loc, expr, val, path);
         else if (typeof val === "object")
            for (var m in val)
               if (val.hasOwnProperty(m))
                  f(m, loc, expr, val, path);
      },
      slice: function(loc, expr, val, path) {
         if (!Array.isArray(val)) return;
         var len = val.length, parts = loc.split(':'),
             start = (parts[0] && parseInt(parts[0])) || 0,
             end = (parts[1] && parseInt(parts[1])) || len,
             step = (parts[2] && parseInt(parts[2])) || 1;
         start = (start < 0) ? Math.max(0,start+len) : Math.min(len,start);
         end   = (end < 0)   ? Math.max(0,end+len)   : Math.min(len,end);
         var ret = [];
         for (var i = start; i < end; i += step)
            ret = ret.concat(P.trace(unshift(i,expr), val, path));
         return ret;
      },
      eval: function(code, _v, _vname, path) {
         if (!$ || !_v) return false;
         if (code.indexOf("@path") > -1) {
            P.sandbox["_path"] = P.asPath(path.concat([_vname]));
            code = code.replace(/@path/g, "_path");
         }
         if (code.indexOf("@") > -1) {
            P.sandbox["_v"] = _v;
            code = code.replace(/@/g, "_v");
         }
         try {
             return vm.runInNewContext(code, P.sandbox);
         }
         catch(e) {
             console.log(e);
             throw new Error("jsonPath: " + e.message + ": " + code);
         }
      }
   };

   var $ = obj;
   var resultType = P.resultType.toLowerCase();
   if (expr && obj && (resultType == "value" || resultType == "path")) {
      var exprList = P.normalize(expr);
      if (exprList[0] === "$" && exprList.length > 1) exprList.shift();
      var result = P.trace(exprList, obj, ["$"]);
      result = result.filter(function(ea) { return ea && !ea.isParentSelector; });
      if (!result.length) return P.wrap ? [] : false;
      if (result.length === 1 && !P.wrap && !Array.isArray(result[0].value)) return result[0][resultType] || false;
      return result.reduce(function(result, ea) {
         var valOrPath = ea[resultType];
         if (resultType === 'path') valOrPath = P.asPath(valOrPath);
         if (P.flatten && Array.isArray(valOrPath)) {
            result = result.concat(valOrPath);
         } else {
            result.push(valOrPath);
         }
         return result;
      }, []);
   }
}
})(typeof exports === 'undefined' ? this['jsonPath'] = {} : exports, typeof require == "undefined" ? null : require);

},{"vm":15}],14:[function(require,module,exports){

},{}],15:[function(require,module,exports){
var indexOf = require('indexof');

var Object_keys = function (obj) {
    if (Object.keys) return Object.keys(obj)
    else {
        var res = [];
        for (var key in obj) res.push(key)
        return res;
    }
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

var defineProp = (function() {
    try {
        Object.defineProperty({}, '_', {});
        return function(obj, name, value) {
            Object.defineProperty(obj, name, {
                writable: true,
                enumerable: false,
                configurable: true,
                value: value
            })
        };
    } catch(e) {
        return function(obj, name, value) {
            obj[name] = value;
        };
    }
}());

var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

function Context() {}
Context.prototype = {};

var Script = exports.Script = function NodeScript (code) {
    if (!(this instanceof Script)) return new Script(code);
    this.code = code;
};

Script.prototype.runInContext = function (context) {
    if (!(context instanceof Context)) {
        throw new TypeError("needs a 'context' argument.");
    }
    
    var iframe = document.createElement('iframe');
    if (!iframe.style) iframe.style = {};
    iframe.style.display = 'none';
    
    document.body.appendChild(iframe);
    
    var win = iframe.contentWindow;
    var wEval = win.eval, wExecScript = win.execScript;

    if (!wEval && wExecScript) {
        // win.eval() magically appears when this is called in IE:
        wExecScript.call(win, 'null');
        wEval = win.eval;
    }
    
    forEach(Object_keys(context), function (key) {
        win[key] = context[key];
    });
    forEach(globals, function (key) {
        if (context[key]) {
            win[key] = context[key];
        }
    });
    
    var winKeys = Object_keys(win);

    var res = wEval.call(win, this.code);
    
    forEach(Object_keys(win), function (key) {
        // Avoid copying circular objects like `top` and `window` by only
        // updating existing context properties or new properties in the `win`
        // that was only introduced after the eval.
        if (key in context || indexOf(winKeys, key) === -1) {
            context[key] = win[key];
        }
    });

    forEach(globals, function (key) {
        if (!(key in context)) {
            defineProp(context, key, win[key]);
        }
    });
    
    document.body.removeChild(iframe);
    
    return res;
};

Script.prototype.runInThisContext = function () {
    return eval(this.code); // maybe...
};

Script.prototype.runInNewContext = function (context) {
    var ctx = Script.createContext(context);
    var res = this.runInContext(ctx);

    forEach(Object_keys(ctx), function (key) {
        context[key] = ctx[key];
    });

    return res;
};

forEach(Object_keys(Script.prototype), function (name) {
    exports[name] = Script[name] = function (code) {
        var s = Script(code);
        return s[name].apply(s, [].slice.call(arguments, 1));
    };
});

exports.createScript = function (code) {
    return exports.Script(code);
};

exports.createContext = Script.createContext = function (context) {
    var copy = new Context();
    if(typeof context === 'object') {
        forEach(Object_keys(context), function (key) {
            copy[key] = context[key];
        });
    }
    return copy;
};

},{"indexof":16}],16:[function(require,module,exports){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
},{}],17:[function(require,module,exports){
var Parser = require('./lib/parser')
  , validationFlag = false;

module.exports = {

  parse: function(unparsed) {
    return new Parser().parse(unparsed, validationFlag);
  },

  enableValidation: function(flag) {
    validationFlag = (flag != null) ? flag : true;
  },

  disableValidation: function() {
    validationFlag = false;
  }
};

},{"./lib/parser":19}],18:[function(require,module,exports){
'use strict';

/*
 * A very naive copy-on-write immutable stack. Since the size of the stack
 * is equal to the depth of the embedded resources for one HAL resource, the bad
 * performance for the copy-on-write approach is probably not a problem at all.
 * Might be replaced by a smarter solution later. Or not. Whatever.
 */
function ImmutableStack() {
  if (arguments.length >= 1) {
    this._array = arguments[0];
  } else {
    this._array = [];
  }
}

ImmutableStack.prototype.array = function() {
  return this._array;
};

ImmutableStack.prototype.isEmpty = function(array) {
  return this._array.length === 0;
};

ImmutableStack.prototype.push = function(element) {
  var array = this._array.slice(0);
  array.push(element);
  return new ImmutableStack(array);
};

ImmutableStack.prototype.pop = function() {
  var array = this._array.slice(0, this._array.length - 1);
  return new ImmutableStack(array);
};

ImmutableStack.prototype.peek = function() {
  if (this.isEmpty()) {
    throw new Error('can\'t peek on empty stack');
  }
  return this._array[this._array.length - 1];
};

module.exports = ImmutableStack;

},{}],19:[function(require,module,exports){
'use strict';

var Resource = require('./resource')
  , Stack = require('./immutable_stack');

var linkSpec = {
  href: { required: true, defaultValue: null },
  templated: { required: false, defaultValue: false },
  type: { required: false, defaultValue: null },
  deprecation: { required: false, defaultValue: null },
  name: { required: false, defaultValue: null },
  profile: { required: false, defaultValue: null },
  title: { required: false, defaultValue: null },
  hreflang: { required: false, defaultValue: null }
};

function Parser() {
}

Parser.prototype.parse = function parse(unparsed, validationFlag) {
  var validation = validationFlag ? [] : null;
  return _parse(unparsed, validation, new Stack());
};

function _parse(unparsed, validation, path) {
  if (unparsed == null) {
    return unparsed;
  }
  var allLinkArrays = parseLinks(unparsed._links, validation,
      path.push('_links'));
  var curies = parseCuries(allLinkArrays);
  var allEmbeddedArrays = parseEmbeddedResourcess(unparsed._embedded,
      validation, path.push('_embedded'));
  var resource = new Resource(allLinkArrays, curies, allEmbeddedArrays,
      validation);
  copyNonHalProperties(unparsed, resource);
  resource._original = unparsed;
  return resource;
}

function parseLinks(links, validation, path) {
  links = parseHalProperty(links, parseLink, validation, path);
  if (links == null || links.self == null) {
    // No links at all? Then it implictly misses the self link which it SHOULD
    // have according to spec
    reportValidationIssue('Resource does not have a self link', validation,
        path);
  }
  return links;
}

function parseCuries(linkArrays) {
  if (linkArrays) {
    return linkArrays.curies;
  } else {
    return [];
  }
}

function parseEmbeddedResourcess(original, parentValidation, path) {
  var embedded = parseHalProperty(original, identity, parentValidation, path);
  if (embedded == null) {
    return embedded;
  }
  Object.keys(embedded).forEach(function(key) {
    embedded[key] = embedded[key].map(function(embeddedElement) {
      var childValidation = parentValidation != null ? [] : null;
      var embeddedResource = _parse(embeddedElement, childValidation,
          path.push(key));
      embeddedResource._original = embeddedElement;
      return embeddedResource;
    });
  });
  return embedded;
}

/*
 * Copy over non-hal properties (everything that is not _links or _embedded)
 * to the parsed resource.
 */
function copyNonHalProperties(unparsed, resource) {
  Object.keys(unparsed).forEach(function(key) {
    if (key !== '_links' && key !== '_embedded') {
      resource[key] = unparsed[key];
    }
  });
}

/*
 * Processes one of the two main hal properties, that is _links or _embedded.
 * Each sub-property is turned into a single element array if it isn't already
 * an array. processingFunction is applied to each array element.
 */
function parseHalProperty(property, processingFunction, validation, path) {
  if (property == null) {
    return property;
  }

  // create a shallow copy of the _links/_embedded object
  var copy = {};

  // normalize each link/each embedded object and put it into our copy
  Object.keys(property).forEach(function(key) {
    copy[key] = arrayfy(key, property[key], processingFunction,
        validation, path);
  });
  return copy;
}

function arrayfy(key, object, fn, validation, path) {
  if (isArray(object)) {
    return object.map(function(element) {
      return fn(key, element, validation, path);
    });
  } else {
    return [fn(key, object, validation, path)];
  }
}


function parseLink(linkKey, link, validation, path) {
  // create a shallow copy of the link object
  var copy = shallowCopy(link);

  // add missing properties mandated by spec and do generic validation
  Object.keys(linkSpec).forEach(function(key) {
    if (copy[key] == null) {
      if (linkSpec[key].required) {
        reportValidationIssue('Link misses required property ' + key + '.',
            validation, path.push(linkKey));
      }
      if (linkSpec[key].defaultValue != null) {
        copy[key] = linkSpec[key].defaultValue;
      }
    }
  });

  // check more inter-property relations mandated by spec
  if (copy.deprecation) {
    log('Warning: Link ' + pathToString(path.push(linkKey)) +
        ' is deprecated, see ' + copy.deprecation);
  }
  if (copy.templated !== true && copy.templated !== false) {
    copy.templated = false;
  }

  if (!validation) {
    return copy;
  }
  if (copy.href && copy.href.indexOf('{') >= 0 && !copy.templated) {
    reportValidationIssue('Link seems to be an URI template ' +
        'but its "templated" property is not set to true.', validation,
        path.push(linkKey));
  }
  return copy;
}

function isArray(o) {
  return Object.prototype.toString.call(o) === '[object Array]';
}

function identity(key, object) {
  return object;
}

function reportValidationIssue(message, validation, path) {
  if (validation) {
    validation.push({
      path: pathToString(path),
      message: message
    });
  }
}

// TODO fix this ad hoc mess - does ie support console.log as of ie9?
function log(message) {
  if (typeof console !== 'undefined' && typeof console.log === 'function') {
    console.log(message);
  }
}

function shallowCopy(source) {
  var copy = {};
  Object.keys(source).forEach(function(key) {
    copy[key] = source[key];
  });
  return copy;
}

function pathToString(path) {
  var s = '$.';
  for (var i = 0; i < path.array().length; i++) {
    s += path.array()[i] + '.';
  }
  s = s.substring(0, s.length - 1);
  return s;
}

module.exports = Parser;

},{"./immutable_stack":18,"./resource":20}],20:[function(require,module,exports){
'use strict';

function Resource(links, curies, embedded, validationIssues) {
  var self = this;
  this._links = links || {};
  this._initCuries(curies);
  this._embedded = embedded || {};
  this._validation = validationIssues || [];
}

Resource.prototype._initCuries = function(curies) {
  this._curiesMap = {};
  if (!curies) {
    this._curies = [];
  } else {
    this._curies = curies;
    for (var i = 0; i < this._curies.length; i++) {
      var curie = this._curies[i];
      this._curiesMap[curie.name] = curie;
    }
  }
  this._preResolveCuries();
};

// TODO resolving of CURIEs should be a package of its own
// TODO resolving templated CURIES should use a small uri template lib, not
// coded here ad hoc

Resource.prototype._preResolveCuries = function() {
  this._resolvedCuriesMap = {};
  for (var i = 0; i < this._curies.length; i++) {
    var curie = this._curies[i];
    if (!curie.name) {
      continue;
    }
    for (var rel in this._links) {
      if (rel !== 'curies') {
        this._preResolveCurie(curie, rel);
      }
    }
  }
};

Resource.prototype._preResolveCurie = function(curie, rel) {
  var link = this._links[rel];
  var prefixAndReference = rel.split(/:(.+)/);
  var candidate = prefixAndReference[0];
  if (curie.name === candidate) {
    if (curie.templated && prefixAndReference.length >= 1) {
      // TODO resolving templated CURIES should use a small uri template
      // lib, not coded here ad hoc
      var href = curie.href.replace(/(.*){(.*)}(.*)/, '$1' +
          prefixAndReference[1] + '$3');
      this._resolvedCuriesMap[href] = rel;
    } else {
      this._resolvedCuriesMap[curie.href] = rel;
    }
  }
};

Resource.prototype.allLinkArrays = function() {
  return this._links;
};

Resource.prototype.linkArray = function(key) {
  return propertyArray(this._links, key);
};

Resource.prototype.link = function(key, index) {
  return elementOfPropertyArray(this._links, key, index);
};

Resource.prototype.hasCuries = function(key) {
  return this._curies.length > 0;
};

Resource.prototype.curieArray = function(key) {
  return this._curies;
};

Resource.prototype.curie = function(name) {
  return this._curiesMap[name];
};

Resource.prototype.reverseResolveCurie = function(fullUrl) {
  return this._resolvedCuriesMap[fullUrl];
};

Resource.prototype.allEmbeddedResourceArrays = function () {
  return this._embedded;
};

Resource.prototype.embeddedResourceArray = function(key) {
  return propertyArray(this._embedded, key);
};

Resource.prototype.embeddedResource = function(key, index) {
  return elementOfPropertyArray(this._embedded, key, index);
};

Resource.prototype.original = function() {
  return this._original;
};

function propertyArray(object, key) {
  return object != null ? object[key] : null;
}

function elementOfPropertyArray(object, key, index) {
  index = index || 0;
  var array = propertyArray(object, key);
  if (array != null && array.length >= 1) {
    return array[index];
  }
  return null;
}

Resource.prototype.validationIssues = function() {
  return this._validation;
};

// alias definitions
Resource.prototype.allLinks = Resource.prototype.allLinkArrays;
Resource.prototype.allEmbeddedArrays =
    Resource.prototype.allEmbeddedResources =
    Resource.prototype.allEmbeddedResourceArrays;
Resource.prototype.embeddedArray = Resource.prototype.embeddedResourceArray;
Resource.prototype.embedded = Resource.prototype.embeddedResource;
Resource.prototype.validation = Resource.prototype.validationIssues;

module.exports = Resource;

},{}],21:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}],22:[function(require,module,exports){
(function (root, factory) {
    if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.urltemplate = factory();
    }
}(this, function () {
  /**
   * @constructor
   */
  function UrlTemplate() {
  }

  /**
   * @private
   * @param {string} str
   * @return {string}
   */
  UrlTemplate.prototype.encodeReserved = function (str) {
    return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
      if (!/%[0-9A-Fa-f]/.test(part)) {
        part = encodeURI(part);
      }
      return part;
    }).join('');
  };

  /**
   * @private
   * @param {string} operator
   * @param {string} value
   * @param {string} key
   * @return {string}
   */
  UrlTemplate.prototype.encodeValue = function (operator, value, key) {
    value = (operator === '+' || operator === '#') ? this.encodeReserved(value) : encodeURIComponent(value);

    if (key) {
      return encodeURIComponent(key) + '=' + value;
    } else {
      return value;
    }
  };

  /**
   * @private
   * @param {*} value
   * @return {boolean}
   */
  UrlTemplate.prototype.isDefined = function (value) {
    return value !== undefined && value !== null;
  };

  /**
   * @private
   * @param {string}
   * @return {boolean}
   */
  UrlTemplate.prototype.isKeyOperator = function (operator) {
    return operator === ';' || operator === '&' || operator === '?';
  };

  /**
   * @private
   * @param {Object} context
   * @param {string} operator
   * @param {string} key
   * @param {string} modifier
   */
  UrlTemplate.prototype.getValues = function (context, operator, key, modifier) {
    var value = context[key],
        result = [];

    if (this.isDefined(value) && value !== '') {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        value = value.toString();

        if (modifier && modifier !== '*') {
          value = value.substring(0, parseInt(modifier, 10));
        }

        result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
      } else {
        if (modifier === '*') {
          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              result.push(this.encodeValue(operator, value, this.isKeyOperator(operator) ? key : null));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                result.push(this.encodeValue(operator, value[k], k));
              }
            }, this);
          }
        } else {
          var tmp = [];

          if (Array.isArray(value)) {
            value.filter(this.isDefined).forEach(function (value) {
              tmp.push(this.encodeValue(operator, value));
            }, this);
          } else {
            Object.keys(value).forEach(function (k) {
              if (this.isDefined(value[k])) {
                tmp.push(encodeURIComponent(k));
                tmp.push(this.encodeValue(operator, value[k].toString()));
              }
            }, this);
          }

          if (this.isKeyOperator(operator)) {
            result.push(encodeURIComponent(key) + '=' + tmp.join(','));
          } else if (tmp.length !== 0) {
            result.push(tmp.join(','));
          }
        }
      }
    } else {
      if (operator === ';') {
        result.push(encodeURIComponent(key));
      } else if (value === '' && (operator === '&' || operator === '?')) {
        result.push(encodeURIComponent(key) + '=');
      } else if (value === '') {
        result.push('');
      }
    }
    return result;
  };

  /**
   * @param {string} template
   * @return {function(Object):string}
   */
  UrlTemplate.prototype.parse = function (template) {
    var that = this;
    var operators = ['+', '#', '.', '/', ';', '?', '&'];

    return {
      expand: function (context) {
        return template.replace(/\{([^\{\}]+)\}|([^\{\}]+)/g, function (_, expression, literal) {
          if (expression) {
            var operator = null,
                values = [];

            if (operators.indexOf(expression.charAt(0)) !== -1) {
              operator = expression.charAt(0);
              expression = expression.substr(1);
            }

            expression.split(/,/g).forEach(function (variable) {
              var tmp = /([^:\*]*)(?::(\d+)|(\*))?/.exec(variable);
              values.push.apply(values, that.getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
            });

            if (operator && operator !== '+') {
              var separator = ',';

              if (operator === '?') {
                separator = '&';
              } else if (operator !== '#') {
                separator = operator;
              }
              return (values.length !== 0 ? operator : '') + values.join(separator);
            } else {
              return values.join(',');
            }
          } else {
            return that.encodeReserved(literal);
          }
        });
      }
    };
  };

  return new UrlTemplate();
}));

},{}],"traverson":[function(require,module,exports){
module.exports=require('BIsrf7');
},{}],"BIsrf7":[function(require,module,exports){
'use strict';

var minilog = require('minilog')
  , mediaTypes = require('./lib/media_types')
  , Builder = require('./lib/builder');

// activate this line to enable logging
// require('minilog').enable();

module.exports = {
  _Builder: Builder,
  json: {
    from: function(uri) {
      return {
        newRequest: function() {
          return new Builder(mediaTypes.JSON, uri);
        }
      };
    }
  },
  jsonHal: {
    from: function(uri) {
      return {
        newRequest: function() {
          return new Builder(mediaTypes.JSON_HAL, uri);
        }
      };
    }
  }
};

},{"./lib/builder":7,"./lib/media_types":11,"minilog":1}]},{},["BIsrf7"])