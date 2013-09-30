'use strict';

/*
 * Starts a http server for testing purposes.
 */
var http = require('http')
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
      console.log('Traverson test server stopped')
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
    console.log('Traverson test server started')
    console.log('Listening on port: ' + port)
    console.log('Bind address: ' +  bindAddress)
  }


  function serve(request, response) {
    var host = request.headers.host
    var baseUrl = 'http://' + host
    var path = url.parse(request.url).path
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
    }

    if (path.indexOf('/fixed/') >= 0) {
      serveForUriTemplate(response, path)
    } else {
      serve404(response)
    }
  }

  function serveRoot(response, baseUrl) {
    response.writeHead(200)
    response.write('{\n')
    response.write('  "first": "' + baseUrl + '/first",\n')
    response.write('  "second": "' + baseUrl + '/second",\n')
    response.write('  "jsonpath": {\n')
    response.write('    "nested": { "key": "' + baseUrl + '/third" }\n')
    response.write('  },\n')
    response.write('  "uri_template": "' + baseUrl + '/{param}/fixed{/id}"\n')
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

  function serveSecondDoc(response, baseUrl) {
    response.writeHead(200)
    response.write('{"second": "document"}')
    response.end()
  }

  function serveThird(response, baseUrl) {
    response.writeHead(200)
    response.write('{"third": "document"}')
    response.end()
  }

  function serveForUriTemplate(response, path) {
    var tokens = path.split('/')
    response.writeHead(200)
    response.write('{"some": "document", "param": "' + tokens[1] + '", "id": ' +
      tokens[3] + '}')
    response.end()
  }

  function serve404(response) {
    response.writeHead(404)
    response.write('{"message": "document not found"}')
    response.end()
  }
}
/* jshint +W074 */

module.exports = TraversonTestServer
