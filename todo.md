Some Dreamcode
==============

    var traverson = require('traverson')

    var jsonWalker = traverson.json
    var jsonHalWalker = traverson.jsonHal
    var xmlWalker = traverson.xml
    var xmlHalWalker = traverson.xmlHal
    var htmlWalker = traverson.html

    jsonWalker.from('http://api.io')
        .walk('user', 'post')
        .withTemplateParameters({user_id: 'basti1302', post_id: 4711})
        .getResource(callback) // makes get request,
                               // yields response body as JS object

    var myApi = jsonWalker.from('http://api.io')
    myApi.walk('user', 'post')
        .withTemplateParameters({user_id: 'basti1302', post_id: 4711})
        .get(callback) // makes get request,
                       // yields complete response
                       // (status, body, headers, ...)

    myApi.walk('user')
        .withTemplateParameters({user_id: 'basti1302'})
        .getUri(callback) // does not execute last request, delivers URL

    myApi.walk('user')
        .withTemplateParameters({user_id: 'basti1302'})
        .post(body, callback) // same for put, patch

    myApi.walk('user', 'post')
        .withTemplateParameters({user_id: 'basti1302', post_id: 4711})
        .delete(callback)

    myApi.walk('link')
        .accept('application/vnd.custom-api.v3+json')
        .checkHttpStatus(200, 201)
        .post(body, callback)


    /* same is available for the other walkers (xml, hal, html, ...) */

* `from` - returns a new walker with initialised startUri each time
* `walk` - takes a list or an array, each element either a plain property key or a JSONPath expression, returns itself, with link array set
* `withTemplateParameters` - takes an object or an array of objects, returns itself, with template params array set
* `getResource`, `getResponse`, `getUri`, `post`, `put`, `patch`, `patch` - see above
* callback always takes error first, then either document, response, uri, etc
* `post`, `put`, `patch`, `patch` always deliver complete http response in callback
* accept - sets accept header for requests
* checkHttpStatus - sets up a check so that callback is only called with result, if the last request hat one of the given http status, otherwise callback is called with error.

TODOs
=====

* update json_walker.walk doc comment
* better name for RequestBuilder?
* what about accept and content-type headers? API could have some custom
  content type and still be JSON, so we probably can not check that
* cache final links for path
* pass options array to constructor:

    {
      resolveJsonPath: false,
      resolveUriTemplates: false,
      caching: false
    }

* Customize JsonWalker by overriding methods for fetching, URI template
  resolving, caching, ...
    * Tests
    * Examples in README.md
* support more media types in addition to JSON:
    * html (jsdom, htmlparser2, cheerio, .... )
    * xml?
    * hal?
