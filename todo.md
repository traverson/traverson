TODOs
=====

* Rename path/path array to link array. Path already has a meaning (the part of
  the URL after the host name/port, so we should not use it). In fact the
  correct hypermedia term is link, and this parameter is an array of links.
* More methods:
    * walkTo(startUri, linkArray, [templateParams], [httpMethod], [body], callback)
      Types
        * startUri: String
        * linkArray: Array
        * templateParams: Array
        * httpMethod: String
        * body: Object
        * callback: Function
      Makes GET requests all the way from startUri to the penultimate link in
      linkArray, but the last request uses the given httpMethod and, if present,
      the optional body (a plain object, converted to JSON). The given callback
      is called with the response of the last request.
   * walkToGet(startUri, linkArray, templateParams, callback)
      same as walkTo with httpMethod === 'GET'
   * walkToPost(startUri, linkArray, templateParams, [body], callback)
      same as walkTo with httpMethod === 'POST'
   * walkToPut(startUri, linkArray, templateParams, [body], callback)
      same as walkTo with httpMethod === 'PUT'
   * walkToPatch(startUri, linkArray, templateParams, [body], callback)
      same as walkTo with httpMethod === 'PATCH'
   * walkToDelete(startUri, linkArray, templateParams, callback)
      same as walkTo with httpMethod === 'DELETE'
   * walkToResource(startUri, linkArray, [templateParams], callback)
      Same as current walk method. Equivalent to walktToGet, only that not the
      complete resource but only the parsed JSON (as a JavaScript object) from
      the body is passed into the callback.
      Types:
        * startUri: String
        * linkArray: Array
        * templateParams: Array
        * callback: Function
    * walkToUri(startUri, linkArray, [templateParams], callback)
      Like walkToResource, but does not acces the last URI but instead delivers
      it to the callback, so the client can do with it whatever it wants.. That
      is, it makes one less GET request than walkToResource.
 what about accept and content-type headers? API could have some custom
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
