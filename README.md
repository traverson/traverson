Traverson
=========

A Hypermedia API/HATEOAS Client for Node.js and the Browser
-----------------------------------------------------------

[![Build Status](https://travis-ci.org/basti1302/traverson.png?branch=master)](https://travis-ci.org/basti1302/traverson)
[![Dependency Status](https://david-dm.org/basti1302/traverson.png)](https://david-dm.org/basti1302/traverson)

[![browser support](http://ci.testling.com/basti1302/traverson.png)](http://ci.testling.com/basti1302/traverson)

[![NPM](https://nodei.co/npm/traverson.png?downloads=true&stars=true)](https://nodei.co/npm/traverson/)


Introduction
------------

Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. Such an API (also sometimes referred to as hypermedia or hypertext-driven API) typically has a root resource/endpoint, which publishes links to other resources. These resources in turn might also have, as part of their metadata, links to related resources. Sometimes you need to follow multiple consecutive links to get to the resource you want. This pattern makes it unnecessary for the client to hardcode all endpoint URIs of the API it uses, which in turn reduces the coupling between the API provider and the API consumer. This makes it easier for the API provider to change the structure of the API without breaking existing client implementations.

To follow a path of links you typically start at one URI (most often the root URI of the API), then look for the link you are interested in, fetch the document from there and repeat this process until you have reached the end of this path.

Traverson does that for you. You just need to tell Traverson where it can find the link to follow in each consecutive document and Traverson will happily execute the hops from document to document for you and when it's done, hand you the final http response or document, the one you really wanted to have in the first place.

Traverson works in Node.js and in the browser. For now, Traverson only supports JSON APIs (including JSON-HAL).

Table of Contents
-----------------

* [Installation](#installation)
    * [Node.js](#nodejs)
    * [Browser](#browser)
* [Documentation by Example](#documentation-by-example)
    * [Following Links](#following-links)
    * [Get Full HTTP Response](#more-control-receive-the-full-http-response)
    * [Pass Links as Array](#pass-a-link-array)
    * [POST, PUT, DELETE and PATCH](#post-put-delete-and-patch)
    * [Error Handling](#error-handling)
    * [JSONPath](#jsonpath)
    * [URI Templates](#uri-templates)
    * [Headers and Authentication](#headers-http-basic-auth-oauth-and-whatnot)
    * [HAL](#hal---hypertext-application-language)
* [Features From the Future](#features-from-the-future)
    * [Caching](#caching)
    * [Customizing Traverson](#customizing-traverson)
        * [Enabling/Disabling Features](#enablingdisabling-features)
    * [Other Media Types](#other-media-types-besides-json)

Installation
------------

### Node.js

    npm install traverson --save

### Browser

Download manually or use [bower](http://bower.io) to install:

    bower install traverson --save

Use one of the following:

* [Minified build with UMD](https://raw.github.com/basti1302/traverson/master/browser/dist/traverson.min.js): This build can be used with an AMD loader like RequireJS or with a script tag (in which case it will register `traverson` in the global scope). **If in doubt, use this build.**
* [Non-minified build with UMD](https://raw.github.com/basti1302/traverson/master/browser/dist/traverson.js): Same as above, just larger :-)
* If your project uses browserify, you don't need to do anything. Just `npm install traverson --save` and `require('traverson')`, then browserify your module as usual - browserify will include Traverson and its dependencies for you and also use the shims defined in Traverson's package.json's `browser` property.
* [Minified require/external build](https://raw.github.com/basti1302/traverson/master/browser/dist/traverson.external.min.js): Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson`. This build could be used if you use browserify but do not want to bundle Traverson with your own browserify build but keep it as a separate file.
* [Non-minified require/external build](https://raw.github.com/basti1302/traverson/master/browser/dist/traverson.external.js): Same as before, just bigger.

File size of browser build:
* Minified: 40 KB
* Unminified: 100 KB

Documentation by Example
------------------------

This section shows how to use Traverson's features with small examples.

### Following Links

The most basic thing you can do with traverson is to let it start at the root URI of an API, follow some links and pass the resource that is found at the end of this journey back to you. Here's how:

    var traverson = require('traverson')
    var api = traverson.json.from('http://api.io')

    api.newRequest()
       .follow('link_to', 'resource')
       .getResource(function(error, document) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log('We have followed the path and reached our destination.')
        console.log(JSON.stringify(document))
      }
    })

Given this call, Traverson first fetches `http://api.io` (because that's what we specified in the from method when creating the `api` object). Let's say the response for this URI is

    http://api.io
    {
      "some": "stuff we do not care about",
      ...
      "link_to": "http://api.io/follow/me"
    }

(To make the examples easier to read, we note the URI corresponding to the document above each document. The URI is of course not part of the JSON response body.)

After receiving the document from the start URI, Traverson starts to follow the links provided via the `follow` method. Since the first link is `link_to`, it looks for a property with this name in the JSON response. In this case, this yields the next URI to access: `http://api.io/follow/me`. Traverson will fetch the document from there now. Let's assume this document looks like to this:

    https://api.io/follow/me
    {
      "more_stuff": "that we ignore",
      ...
      "resource": "http://api.io/follow/me/to/the/stars"
    }

Now, since the next link given to `follow` is `resource`, Traverson will look for the property `resource`. Finding that, Traverson will finally fetch the JSON document from `http://api.io/follow/me/to/the/stars`:

    http://api.io/follow/me/to/the/stars
    {
      "the_resource": "that we really wanted to have",
      "with": "lots of interesting and valuable content",
      ...
    }

Because the list of links given to `follow` is exhausted now (`resource` was the last element), this document will be passed into to the callback you provided when calling the `getResource` method. Coming back to the example from the top, the output would be

    We have followed the path and reached the final resource.
    { "the_document": "that we really wanted to have", "with": "lots of interesting and valuable content", ...  }

#### On Absolute URLs, Absolute URL Paths and Relative URL Paths

Different APIs use different flavours of links in their responses. Traverson can handle the following cases:

* Absolute URLs (URLs that start with the a scheme/protocol, that is http(s)). Those are always used as is to retrieve the next resource representation (except for resolving URI templates).
* Absolute URL paths, that is, URLs that omit the http(s) part and start with a slash (`/`) and ought to be interpreted relative to the host part of the root URL. Example: If the root URL is `https://api.example.com/home` and a link contains `/customers/1302` this will be resolved to `https://api.example.com/customers/1302`. If following a link `/orders` from there, this would be resolved to `https://api.example.com/orders`. This is how most browsers behave and what node's `url.resolve` does, and also what most APIs expect you to do.
* Relative URL paths, that is, URLs that also omit the protocol, start with a slash (like absolute URL paths) but are to be interpreted relative to the current location. If you want this behaviour, you need to call `resolveRelative()` on the `api` object. Example: If the root URL is `https://api.example.com/home` and the first link contains `/customers/1302` this will be resolved to `https://api.example.com/home/customers/1302`. If this has a link `/orders`, this would be resolved to `https://api.example.com/home/customers/1302/orders`. This feature should be rarely needed.

### More Control: Receive the Full HTTP Response

The example above chained the `getResource` method to the `follow` method. For this method, Traverson will parse the JSON from the last HTTP response and pass the resulting JavaScript object to your callback. In certain situations you might want more control and would like to receive the full HTTP response object instead of the body, already parsed to an object. This is what the `get` method is for:

    api.newRequest()
       .follow('link_to', 'resource')
       .get(function(error, response) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log('We have followed the path and reached our destination.')
        console.log('HTTP status code: ' + response.statusCode)
        console.log('Response Body: ' + response.body)
      }
    })

### Pass a Link Array

You can also pass an array of strings to the follow method. Makes no difference.

    api.newRequest()
       .follow('first_link', 'second_link', 'third_link')
       .getResource(callback)

is equivalent to

    api.newRequest()
       .follow(['first_link', 'second_link', 'third_link'])
       .getResource(callback)

If the first argument to `follow` is an array, all remaining arguments will be ignored, though.

### POST, PUT, DELETE and PATCH

So far we only have concerned ourselves with fetching information from a REST API. Of course, Traverson also supports the usual HTTP method verbs to modify data, that is, POST, PUT, DELETE and PATCH. HEAD and OPTIONS are currently not implemented, though.

This looks very similar to using the `get` method:

    api.newRequest()
       .follow('link_to', 'resource')
       .post({'some': 'data'}, function(error, response) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log('POST request sucessful')
        console.log('HTTP status code: ' + response.statusCode)
      }
    })

All methods except `getResource` (that is `get`, `post`, `put`, `del` and `patch` pass the full http response into the provided callback, so the callback's method signature always looks like `function(error, response)`. `post`, `put` and `patch` obviously have a body argument, `del` doesn't. Some more examples, just for completenss' sake:

    api.newRequest()
       .follow('link_to', 'resource')
       .put({'some': 'data'}, function(error, response) {
       ...
    })

    api.newRequest()
       .follow('link_to', 'resource')
       .patch({'some': 'data'}, function(error, response) {
       ...
    })

    api.newRequest()
       .follow('link_to', 'resource')
       .del(function(error, response) {
       ...
    })


### Error Handling

If anything goes wrong during this journey from resource to resource, Traverson will stop and call your callback with the appropriate error as the first parameter. In the examples above, the output would be

    No luck :-)

Reasons for failure could be:
* The start URI, one of the intermediate URIs, or the final URI is not reachable.
* One of the documents can not be parsed as JSON, that is, it is not syntactically well formed.
* One of the intermediate documents does not contain the property given in the path array.
* If JSONPath (see below) is used:
    * One of the JSONPath expressions in the path array does not yield a match for the corresponding document.
    * One of the JSONPath expressions in the path array yields more than one match for the corresponding document.

### JSONPath

Traverson supports [JSONPath](http://goessner.net/articles/JsonPath/) expressions in the path array. This will come in handy if the link you want to follow from a given document is not a direct property of that document. Consider the following example:

    api.newRequest()
       .follow('$.deeply.nested.link')
       .getResource(function(error, document) {
       ...
    })

where the document at the root URI is

    http://api.io
    {
      "deeply": {
        "nested": {
          "link: "http://api.io/congrats/you/have/found/me"
        }
      }
    }

    http://api.io/congrats/you/have/found/me
    {
      "the_document": "we wanted to have"
    }

Upon loading the document from the start URI `http://api.io`, Traverson will recognize that the first (and only) link to `follow` is a JSONPath expression and evaluate it against the given document, which results in the URI `http://api.io/congrats/you/have/found/me`. Of course you can also use path arrays with more than one element with JSONPath and you can freely mix JSONPath expressions with plain vanilla properties.

Any element of the path array that begins with `$.` or `$[` is assumed to be a JSONPath expression, otherwise the element is interpreted as a plain object property.

More information on JSONPath can be found [here](http://goessner.net/articles/JsonPath/). Traverson uses the npm module [JSONPath](https://github.com/s3u/JSONPath) to evaluate JSONPath expressions.

If a JSONPath expressions yields no match or more than one match, an error will be passed to your callback.

### URI Templates

Traverson supports URI templates ([RFC 6570](http://tools.ietf.org/html/rfc6570)). Let's modify our inital example to make use of this feature:

    api.follow('user_thing_lookup')
        .withTemplateParameters({ user_name: 'basti1302', thing_id: 4711 })
        .getResource(function(error, document) {
      ...
    })

Again, Traverson first fetches `http://api.io`. This time, we assume a response with an URI template:

    http://api.io
    {
      "user_thing_lookup": "http://api.io/users/{user_name}/things{/thing_id}"
    }

Traverson recognizes that this is an URI template and resolves the template with the template parameters provided via the `withTemplateParameters` method (`{user_name: "basti1302", thing_id: 4711}` in this case). The resulting URI is `http://api.io/users/basti1302/things/4711`. Traverson now fetches the document from this URI and passes the resulting document into the provided callback.

    http://api.io/users/basti1302/things/4711
    {
      "the_document": "we wanted to have"
    }

To find out if URI templating is necessary, Traverson simply checks if the URI contains the character `{`.

Of course, URI templating also works if the path from the start URI to the final document involves multiple hops.

Let's assume the following call

    api.follow('user_lookup', 'thing_lookup')
        .withTemplateParameters({ user_name: 'basti1302', thing_id: 4711 })
        .getResource(function(error, document) {
      ...
    })

and the following documents, with their corresponding URIs:

    http://api.io
    {
      "user_lookup": "http://api.io/users/{user_name}"
    }

    http://api.io/users/basti1302
    {
      "thing_lookup": "http://api.io/users/basti1302/things/{thing_id}"
    }

    http://api.io/users/basti1302/things/4711
    {
      "the_document": "we wanted to have"
    }

Traverson will resolve the URI templates in the first and second document and finally reach the document at `http://api.io/users/basti1302/things/4711`.

Instead of using a single object to provide the template parameters for each step, you can also provide an array of objects. Each element of the array will only be used for the corresponding step in the path array. This is useful if there are template parameters with identical names which are to be used in different steps.

Let's look at an example

    api.follow('user_lookup', 'things', 'thing_lookup')
        .withTemplateParameters([null, {id: "basti1302"}, null, {id: 4711} ])
        .getResource(function(error, document) {
      ...
    })

and the following documents, with their corresponding URIs:

    http://api.io
    {
      "user_lookup": "http://api.io/users/{id}"
    }

    http://api.io/users/basti1302
    {
      "things": "http://api.io/users/basti1302/things
    }

    http://api.io/users/basti1302/things
    {
      "thing_lookup": "http://api.io/users/basti1302/things{/id}"
    }

    http://api.io/users/basti1302/things/4711:
    {
      "the_document": "we wanted to have"
    }

The first element of the template parameter array (`null`) will actually be used for the start URI (the one you passed to `from` when creating `api`). Thus, if our start URI `http://api.io` would have been a URI template, we could provide template parameters for it. Since the start URI is fixed, we just use `null`. The second element `{id: "basti1302"}` will then be used to resolve `http://api.io/users/{id}` to `http://api.io/users/basti1302`. The next URI is not a template, so the template parameter array contains `null` at this position again. The final link yields a URI template again, which will be resolved with `{id: '4711'}` to `http://api.io/users/basti1302/things/4711`. Since both templates contained the placeholder `id` but required different values, this would not have been possible with a single object holding all template substitutions.

More information on URI templates: [RFC 6570](http://tools.ietf.org/html/rfc6570). Traverson uses the module [uri-templates](https://github.com/grncdr/uri-template) to resolve URI
templates.

### Headers, HTTP Basic Auth, OAuth and Whatnot

Traverson uses Mikeal Rogers' [request](https://github.com/mikeal/request) module for all HTTP requests. You can use all options that `request` provides with Traverson by passing an options object into the `withRequestOptions` method, like this:

    api.follow('link_one', 'link_two', 'link_three')
      .withRequestOptions({ headers: { 'x-my-special-header': 'foo' } })
      .getResource(function(error, document) {
        ...
    })

This would add the header `x-my-special-header` to all requests issued for this three link walk. Check out the [request docs](https://github.com/mikeal/request#requestoptions-callback) to see which options to use. Among other things, you can set custom headers, do HTTP basic authentication, [OAuth](https://github.com/mikeal/request#oauth-signing) and other cool stuff.

### HAL - hypertext application language

Traverson supports the JSON dialect of [HAL](http://tools.ietf.org/id/draft-kelly-json-hal-06.txt), the hypertext application language via [Halfred](https://github.com/basti1302/halfred). While in theory you could use Traverson even without special support for HAL by specifying each link relation with JSONPath (like `$._links.linkName`) that would be quite cumbersome. Instead, do the following:

    var traverson = require('traverson')
    var api = traverson.jsonHal.from('http://haltalk.herokuapp.com/')

    api.newRequest()
       .follow('ht:me', 'ht:posts')
       .withTemplateParameters({name: 'traverson'})
       .getResource(function(error, document) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log(JSON.stringify(document))
      }
    })

    http://haltalk.herokuapp.com/
    {
      "_links": {
        "self": {
          "href": "/"
        },
        "curies": [ ... ],
        "ht:users": {
          "href": "/users"
        },
        "ht:me": {
          "href": "/users/{name}",
          "templated": true
        }
      }
    }

    http://haltalk.herokuapp.com/users/traverson
    {
      "_links": {
        "self": {
          "href": "/users/traverson"
        },
        "curies": [ ... ],
        "ht:posts": {
          "href": "/users/traverson/posts"
        }
      },
      "username": "traverson",
      "real_name": "Bastian Krol"
    }

    http://haltalk.herokuapp.com/users/traverson/posts
    {
      "_links": {
        "self": { "href": "/users/traverson/posts" },
        "curies": [ ... ],
        "ht:author": { "href": "/users/traverson" }
      },
      "_embedded": {
        "ht:post": [
          {
            "_links": { "self": { "href": "/posts/526a56454136280002000015" },
              "ht:author": { "href": "/users/traverson", "title": "Bastian Krol" }
            },
            "content": "Hello! I'm Traverson, the Node.js module to work with hypermedia APIs. ...",
            "created_at": "2013-10-25T11:30:13+00:00"
          },
          {
            "_links": { "self": { "href": "/posts/526a58034136280002000016" },
              "ht:author": { "href": "/users/traverson", "title": "Bastian Krol" }
            },
            "content": "Hello! I'm Traverson, the Node.js module to work with hypermedia APIs. You can find out more about me at https://github.com/basti1302/traverson. This is just a test post. @mikekelly: Don't worry, this tests will only be run manually a few times here and there, I'll promise to not spam your haltalk server too much :-)",
            "created_at": "2013-10-25T11:37:39+00:00"
          },
          ...
        ]
      }
    }

This will give you all posts that the account `traverson` posted to Mike Kelly's haltalk server. Note that we used `traverson.jsonHal` when creating the `api` object, instead of the usual `traverson.json`. When called in this way, Traverson will assume the resources it receives comply with the HAL specification and looks for links in the `_links` property. If there is no such link, Traverson will also look for an embedded resource with the given name.

You can also pass strings like `'ht:post[name:foo]'` or `'ht:post[name:foo]'` to the `follow` method to select links which share the same link relation by a secondary key. Because multiple links with the same link relation type are represented as an array of link objects in HAL, you can also use an array indexing notation like `'ht:post[1]'` to select an individual elements from an array of link objects. However, this is not recommended and should only be used as a last resort if the API does not provide a secondary key to select the correct link, because it relies on the ordering of the links as returned from the server, which might not be guaranteed to be always the same.

You can also use the array indexing notation `'ht:post[1]'` to target individual elements in an array of embedded resources.

#### Embedded Documents

When working with HAL resources, for each link given to the `follow` method, Traverson checks the `_links` object. If the `_links` object does not have the property in question, Traverson also automatically checks the embedded document (the `_embedded` object). If there is an embedded document with the correct property key, this one will be used instead. If there is both a `_link` and an `_embedded` object with the same name, Traverson will always prefer the link, not the embedded object (reason: the spec says that an embedded resource may "be a full, partial, or inconsistent version of the representation served from the target URI", so to get the complete and up to date document your best bet is to follow the link to the actual resource, if available).

#### HAL and JSONPath

JSONPath is not supported when working with HAL resources. It would also make no sense because in a HAL resource there is only one place in the document that contains all the links.

Features From the Future
------------------------

This section describes some ideas, that are not yet implemented, but might be included in future versions of Traversion.

### Caching

Currently, there is no caching implemented. There will be some sort of caching in future versions. When calling Traverson with the same start URI and the same path array, we would likely end up at the same final URI. The intermediate steps might be cached and not actually fetched from the server every time.

### Customizing Traverson

#### Enabling/Disabling Features

There will be some simple on/off toggles for certain parts of Traverson behaviour. For example, it should be possible to
* disable URI templates,
* disable JSONPath,
* disable caching (a feature yet to be implemented in the first place)

### Other Media Types Besides JSON

In the far future, Traverson might also support HTML APIs and/or XML APIs.

Release Notes
-------------

* 0.8.1 2014-06-06:
    * Fix corrupted browser build (#10)
* 0.8.0 2014-04-30:
    * Support absolute URLs, absolute URL paths and relative URLs (#3)
    * Fix: Also resolve URI templates when no template params are given (makes sense for templates with optional components)
* 0.7.0 2013-12-05:
    * Select HAL links by secondary key
* 0.6.0 2013-11-25:
    * Further reduce browserified size
* 0.5.0 2013-11-23:
    * Make individual elements of HAL link arrays and embedded arrays available by using array indexing notation
* 0.4.0 2013-11-21:
    * Use Halfred instead of Halbert to parse HAL to reduce size of browser build.
* 0.3.0 2013-11-17:
    * Browser build in addition to Node.js module (by browserify)
* 0.2.1 2013-10-25:
    * Documentation fixes
* 0.2.0 2013-10-25:
    * Support for hypertext application language (HAL)
    * Add `getUri`
    * Add `withRequestOptions`
* 0.1.0 2013-10-11:
    * New fluent API
    * Add `get`, `post`, `put`, `patch` and `delete`
* 0.0.1 2013-10-02: Initial release

License
-------

MIT
