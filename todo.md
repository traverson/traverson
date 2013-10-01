TODOs
=====

* more documentation by example in README.md
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
* support more media types in addition to JSON:
    * html (jsdom, htmlparser2, cheerio, .... )
    * xml?
    * hal?
