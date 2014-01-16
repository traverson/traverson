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

Regarding The Browser Build
===========================

* !!! The superagent-request shim does not implement the request options object (properties like "auth" etc.), yet these are advertised in the Traverson readme to be used by the `withRequestParameters` method. We need some translation there.
* !!! PR for JSONPath: shim underscore.isArray to reduce browserified build
* Polish in-browser example page:
    * make each step during link following visible
    * pretty print code snippets, syntax highlighting, etc.
    * Remove jquery and use something smaller

TODOs
=====

* make it configurable if embedded resources or linked resources are to be preferred
* clean up test server document and link structure
* Builder#withLastRequestOptions({...}) - use the given options, but only in the last request (the one which get/post/put/getResource control)
* Builder#withFirtRequestOptions({...}) - use the given options, but only in the first request - is there a use case for this?
* Builder#checkHttpStatus(200, 201, ...) - provide http status codes that will be checked only for the last request - needs better name that makes clear that it only relates to the last get()/post()/put()/... call.
* Should work in browser (maybe via browserify) - see also http://www.2ality.com/2011/11/module-gap.html
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
* support more media types in addition to application/json and application/hal+json:
    * HAL (done)
    * Collection+JSON
    * JSON+API
    * Siren
    * HTML5 (jsdom, htmlparser2, cheerio, .... )
    * HTML5 + microdata
    * XML media types or XML in general?
    * Atom
    * application/hal+xml? Does anybody use this? There's no RFC for that, but http://stateless.co/hal_specification.html ._ mentions it.
    * Including support for all media types would be considerable bloat, maybe some kind of plug-in mechanism could be used...
* Hooks: Set filters/hooks (callbacks) on Builder which get called on each hop and can influence what happens


