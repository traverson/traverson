function baseUrl(req) {
  return req.protocol + '://' + req.host + ':' + global.port;
}

module.exports = {

  root: {
    get: function(req, res) {
      var root = baseUrl(req);
      res.format({

        'application/json': function() {
          res.json({
            'first': root + '/first',
            'second': root + '/second',
            'jsonpath': {
              'nested': { 'key': root + '/third' }
            },
            'auth': root + '/basic/auth',
            'uri_template': root + '/{param}/fixed{/id}',
            'post_link': root + '/postings',
            'put_link': root + '/puttings/42',
            'patch_link': root + '/patch/me',
            'delete_link': root + '/delete/me',
            'blind_alley': root + '/does/not/exist',
            'echo-headers': root + '/echo/headers',
            'echo-query': root + '/echo/query',
            'garbage': root + '/junk'
          });
        },

        'application/hal+json': function() {
          res.json({
            '_links': {
              'self': { 'href': '/' },
              'first': { 'href': '/first' }
            },
            'data': 'much'
          });
        }
      });
    }
  },

  first: {
    get: function(req, res) {
      res.format({

        'application/json': function() {
          res.json({ 'first': 'document' });
        },

        'application/hal+json': function() {
          res.json({
            '_links': {
              'self': { 'href': '/first' },
              'second': { 'href': '/second' }
            },
            '_embedded': {
              'contained_resource': {
                '_links' : {
                  'self': { 'href': '/first/contained' },
                  'embedded_link_to_second': { 'href': '/second' }
                },
                'things': 'a lot of'
              }
            },
            'first': 'document'
          });
        }
      });
    }
  },

  second: {
    get: function(req, res) {
      res.format({
        'application/json': function() {
          var root = baseUrl(req);
          res.json({ 'doc': root + '/second/document' });
        },

        'application/hal+json': function() {
          res.json({
            '_embedded': {
              'inside_second': { 'more': 'data' }
            },
            'second': 'document'
          });
        }
      });
    },

    document: {
      get: function(req, res) {
        res.json({ 'second': 'document' });
      }
    }
  },

  third: {
    get: function(req, res) {
      var root = baseUrl(req);
      res.json({ 'third': 'document' });
    }
  },

  auth: {
    get:  function(req, res) {
      res.json({
        'user': 'authenticated'
      });
    }
  },

  uriTemplate: {
    get: function(req, res) {
      res.json({
        'some': 'document',
        'param': req.params[0],
        'id': req.params[1]
      });
    }
  },

  postings: {
    post: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.status(201).json({
        'document': 'created',
        'received': req.body
      });
    }
  },

  puttings: {
    put: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.json({
        'document': 'overwritten',
        'received': req.body
      });
    }
  },

  patchMe: {
    patch: function(req, res) {
      if (req.body == null) {
        return res.status(400).json({ message: 'bad request - no body?' });
      }
      res.json({
        'document': 'patched',
        'received': req.body
      });
    }
  },

  deleteMe: {
    del: function(req, res) {
      res.status(204).end();
    }
  },

  echoHeaders: {
    get: function(req, res) {
      var echo = {};
      Object.keys(req.headers).forEach(function(key) {
        echo[key] = req.headers[key];
      });
      res.send(echo);
    }
  },

  echoQuery: {
    get: function(req, res) {
      var echo = {};
      Object.keys(req.query).forEach(function(key) {
        echo[key] = req.query[key];
      });
      res.send(echo);
    }
  },

  junk: {
    get: function(req, res) {
      // serve syntacically incorrect JSON
      res.send('{ this will :: not parse');
    }
  },

  '404': function(req, res) {
    res.status(404).send({ 'message': 'resource not found' });
  }
};
