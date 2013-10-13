Docs
====

* Write a more formal API doc in addition to the documentation by example in README.md. Notes:
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

* WalkerBuilder#withLastRequestOptions({...}) - use the given options, but only in the last request (the one which get/post/put/getResource control)
* WalkerBuilder#withFirtRequestOptions({...}) - use the given options, but only in the first request - is there a use case for this?
* WalkerBuilder#checkHttpStatus(200, 201, ...) - provide http status codes that will be checked only for the last request - needs better name that makes clear that it only relates to the last get()/post()/put()/... call.
* headers(...) - adds custom headers to all requests
* accept('application/vnd.custom-api.v3+json') -> adds accept headers to all requests
* Authentication
    * basic auth
    * OAuth
    * ?
* Should work in browser (maybe via browserify)
* application/hal+json:
    * http://stateless.co/hal_specification.html ._ Informal Spec
    * http://tools.ietf.org/html/draft-kelly-json-hal-06 Formal Spec
    * https://github.com/mikekelly/hal_specification/wiki/APIs ._ Public HAL APIs
    * http://haltalk.herokuapp.com/explorer/browser.html#/ (showcase in browser + public API)
    * https://github.com/xcambar/halbert - node hal parser
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
    * xml?
    * html (jsdom, htmlparser2, cheerio, .... )
    * application/hal+xml? Does anybody use this? There's no RFC for that, but http://stateless.co/hal_specification.html ._ mentions it.
