
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , app = express()
  , json = require('./routes')
  , server;

exports.start = function() {
  // all environments
  app.set('port', process.env.PORT || 2808);
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);

  app.all('*', function(req, res, next) {
    res.header({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'X-Requested-With, Access-Control-Allow-Origin, ' +
        'X-HTTP-Method-Override, Content-Type, Authorization, Accept,' +
        ' X-Traverson-Test-Header',
      'Access-Control-Allow-Methods':
        'HEAD, GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Max-Age': '86400' // 24 hours
    });
    next();
  });

  // serve files from the root folder of the project
  app.use('/static', express.static(path.join(__dirname, '..')));

  // development only
  if ('development' === app.get('env')) {
    app.use(express.errorHandler());
  }

  var auth = express.basicAuth('traverson', 'verysecretpassword');

  app.get('/', json.root.get);
  app.get('/first', json.first.get);
  app.get('/second', json.second.get);
  app.get('/second/document', json.second.document.get);
  app.get('/third', json.third.get);
  app.get('/basic/auth', auth, json.auth.get);
  app.get(/^\/(\w+)\/fixed\/(\w+)?$/, json.uriTemplate.get);
  app.post('/postings', json.postings.post);
  app.put('/puttings/42', json.puttings.put);
  app.patch('/patch/me', json.patchMe.patch);
  app.del('/delete/me', json.deleteMe.del);
  app.get('/junk', json.junk.get);
  app.get('/echo/headers', json.echoHeaders.get);
  app.get('/echo/query', json.echoQuery.get);
  app.get('/does/not/exist', json['404']);

  app.get('/quit', function(req, res) {
    res.status(204).end();
    console.log('Received request to /quit, shutting down.');
    exports.stop();
  });

  global.port = app.get('port');

  server = http.createServer(app);
  server.listen(app.get('port'), function() {
    console.log('Traverson test server listening on port ' + app.get('port'));
  });
};

exports.stop = function() {
  console.log('Stopping Traverson test server.');
  server.close();
};
