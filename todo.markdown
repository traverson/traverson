# TODOs

* Also see refactor.markdown
* JSDoc (DGeni, YUIDoc, JSDuck, Raphael.js' doc package)
* API docs for step objects

# Ideas

This section describes some ideas, that are not yet implemented, but might be included in future versions of Traversion.

## Gather responses

api.gather('some', 'link', 'relations').get(function(err, responses) => yields an array of all responses.
api.gather('some', 'link', 'relations').getResource(function(err, responses) => yields an array of all resources.
api.gather('some', 'tree', ['like', 'structure', ['as', 'nested'], 'arrays']).get => yields nested arrays with the same structure as the input parameter. For this example, at the server side, the link rel structure would look like this:

/-+-some-+-tree-+-like
                |
                +-structure-+-as
                |           |
                |           +-nested
                |
                +-arrays
## Caching

Currently, there is no caching implemented. There will be some sort of caching in future versions. When calling Traverson with the same start URI and the same path array, we would likely end up at the same final URI. The intermediate steps might be cached and not actually fetched from the server every time.

## Customizing Traverson

### Enabling/Disabling Features

There will be some simple on/off toggles for certain parts of Traverson behaviour. For example, it should be possible to
* disable URI templates,
* disable JSONPath,
* disable caching (a feature yet to be implemented in the first place)

## Other Media Types Besides JSON

Traverson could and should support HTML APIs and/or XML APIs, as well as other JSON based hypermedia types. The interface between media type plug-ins and Traverson's core would need to be revamped for that, probably.

## More unsorted ideas

* Testling is dead! Switch to saucelabs or something. Also for traverson-angular.
* clean up test server document and link structure
* Builder#withLastRequestOptions({...}) - use the given options, but only in the last request (the one which get/post/put/getResource control)
* Builder#withFirtRequestOptions({...}) - use the given options, but only in the first request - is there a use case for this?
* Builder#checkHttpStatus(200, 201, ...) - provide http status codes that will be checked only for the last request - needs better name that makes clear that it only relates to the last get()/post()/put()/... call.
* what about accept and content-type headers? API could have some custom
  content type and still be JSON, so we probably can not check that
* cache final links for path
* Customize JsonWalker by overriding methods for fetching, URI template
  resolving, caching, ...
    * Tests
    * Examples in README.md
* support more media types in addition to application/json and application/hal+json:
    * HAL (done)
    * Mason!
    * Collection+JSON
    * JSON+API
    * Siren
    * HTML5 (jsdom, htmlparser2, cheerio, .... )
    * HTML5 + microdata
    * XML media types or XML in general?
    * Atom
    * application/hal+xml? Does anybody use this? There's no RFC for that, but http://stateless.co/hal_specification.html mentions it.

## Browser Build

* !!! The superagent-request shim does not implement the request options object (properties like "auth" etc.), yet these are advertised in the Traverson readme to be used by the `withRequestParameters` method. We need some translation there.
* Polish in-browser example page:
    * make each step during link following visible
    * pretty print code snippets, syntax highlighting, etc.
