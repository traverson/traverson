'use strict';

/*
 * Starts a http server for testing purposes.
 */
var http = require('http')
var log = require('minilog')('test_server');
var url = require('url')

/* jshint -W074 */
function TraversonTestServer() {

  var server
  var port
  var bindAddress

  this.start = function() {
    createServer()
    printWelcomeMessage()
  }

  this.stop = function() {
    server.close(function() {
      log.info('Traverson test server stopped')
    })
  }

  function createServer() {
    function onRequest(request, response) {
      serve(request, response)
    }
    port = 2808
    bindAddress = '127.0.0.1'
    server = http.createServer(onRequest)
    server.listen(port, bindAddress)
  }

  function printWelcomeMessage(startTime) {
    log.info('Traverson test server started')
    log.info('Listening on port: ' + port)
    log.info('Bind address: ' +  bindAddress)
  }


  function serve(request, response) {
    var path = url.parse(request.url).path
    switch (request.method) {
    case 'GET':
      return handleGet(request, response, path)
    case 'POST':
      return handlePost(request, response, path)
    case 'PUT':
      return handlePut(request, response, path)
    case 'PATCH':
      return handlePatch(request, response, path)
    case 'DELETE':
      return handleDelete(request, response, path)
    default:
      return serve501(response, request.method)
    }
  }

  function handleGet(request, response, path) {
    var host = request.headers.host
    var baseUrl = 'http://' + host
    switch (path) {
    case '/':
      return serveRoot(response, baseUrl)
    case '/first':
      return serveFirst(response)
    case '/second':
      return serveSecond(response, baseUrl)
    case '/second/document':
      return serveSecondDoc(response)
    case '/third':
      return serveThird(response)
    case '/junk':
      return serveJunk(response)
    }

    if (path.indexOf('/fixed/') >= 0) {
      return serveForUriTemplate(response, path)
    } else {
      return serve404(response)
    }
  }

  function handlePost(request, response, path) {
    readBody(request, function(err, body) {
      switch (path) {
      case '/postings':
        return servePostings(response, body)
      default:
        return serve404(response)
      }
    })
  }

  function handlePut(request, response, path) {
    readBody(request, function(err, body) {
      switch (path) {
      case '/puttings/42':
        return servePuttings(response, body)
      default:
        return serve404(response)
      }
    })
  }

  function handlePatch(request, response, path) {
    readBody(request, function(err, body) {
      switch (path) {
      case '/patch/me':
        return servePatchMe(response, body)
      default:
        return serve404(response)
      }
    })
  }

  function handleDelete(request, response, path) {
    switch (path) {
    case '/delete/me':
      return serveDeleteMe(response)
    default:
      return serve404(response)
    }
  }

  function readBody(request, callback) {

    var bodyChunks = []

    request.on('data', function(chunk) {
      bodyChunks.push(chunk)
    })

    request.on('end', function() {
      callback(null, bodyChunks.join())
    })
  }

  function serveRoot(response, baseUrl) {
    response.writeHead(200)
    response.write('{\n')
    response.write('  "first": "' + baseUrl + '/first",\n')
    response.write('  "second": "' + baseUrl + '/second",\n')
    response.write('  "jsonpath": {\n')
    response.write('    "nested": { "key": "' + baseUrl + '/third" }\n')
    response.write('  },\n')
    response.write('  "uri_template": "' + baseUrl + '/{param}/fixed{/id}",\n')
    response.write('  "post_link": "' + baseUrl + '/postings",\n')
    response.write('  "put_link": "' + baseUrl + '/puttings/42",\n')
    response.write('  "patch_link": "' + baseUrl + '/patch/me",\n')
    response.write('  "delete_link": "' + baseUrl + '/delete/me",\n')
    response.write('  "blind_alley": "' + baseUrl + '/does/not/exist",\n')
    response.write('  "garbage": "' + baseUrl + '/junk"\n')
    response.write('}')
    response.end()
  }

  function serveFirst(response) {
    response.writeHead(200)
    response.write('{"first": "document"}')
    response.end()
  }

  function serveSecond(response, baseUrl) {
    response.writeHead(200)
    response.write('{')
    response.write('"doc": "' + baseUrl + '/second/document' + '"')
    response.write('}')
    response.end()
  }

  function serveSecondDoc(response) {
    response.writeHead(200)
    response.write('{"second": "document"}')
    response.end()
  }

  function serveThird(response) {
    response.writeHead(200)
    response.write('{"third": "document"}')
    response.end()
  }

  function servePostings(response, body) {
    var parsedBody = JSON.parse(body)
    response.writeHead(201)
    response.write('{' +
      '"document": "created", ' +
      '"received": ' + JSON.stringify(parsedBody) +
    '}')
    response.end()
  }

  function servePuttings(response, body) {
    var parsedBody = JSON.parse(body)
    response.writeHead(200)
    response.write('{' +
      '"document": "updated", ' +
      '"received": ' + JSON.stringify(parsedBody) +
    '}')
    response.end()
  }

  function servePatchMe(response, body) {
    console.log(JSON.stringify(JSON.parse(body)))
    response.writeHead(204)
    response.end()
  }

  function serveDeleteMe(response) {
    response.writeHead(204)
    response.end()
  }

  function serveForUriTemplate(response, path) {
    var tokens = path.split('/')
    response.writeHead(200)
    response.write('{"some": "document", "param": "' + tokens[1] + '", "id": ' +
      tokens[3] + '}')
    response.end()
  }

  function serveJunk(response) {
    // server syntacically incorrect JSON
    response.writeHead(200)
    response.write('{ this will :: not parse')
    response.end()
  }


  function serve404(response) {
    response.writeHead(404)
    response.write('{"message": "document not found"}')
    response.end()
  }

  function serve501(response, verb) {
    response.writeHead(501)
    response.write('{"message": "http method verb ' + verb +
      ' not supported"}')
    response.end()
  }
}

/* jshint +W074 */

module.exports = TraversonTestServer
