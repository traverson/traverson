Traverson - Hypermedia API Consumer
============================
[![Build
Status](https://travis-ci.org/basti1302/traverson.png?branch=master)](https://travis-ci.org/basti1302/traverson)

Introduction
------------

Traverson comes in handy when consuming hypermedia APIs, that is, REST APIs that have links between their resources. A hypermedia API typically has a root resource/endpoint, which publishes links to other resources. These resources in turn might also have, as part of their metadata, links to related resources. Sometimes you need to follow multiple consecutive links to get to the resource you want. This pattern makes it unnecessary for the client to hardcode all endpoint URIs of the API it uses, which in turn makes it easier for the API provider to change the structure if necessary.

To follow a path of links you typically start at one URI (most often the root URI of the API), then look for the link you are interested in, fetch the document from there and repeat this process until you have reached the end of this path.

Traverson does that for you. You just need to tell Traverson where it can find the link to follow in each consecutive document and Traverson will happily execute the hops from document to document for you and when it's done, hand you the final document, the one you really wanted to have in the first place.

Currently only JSON APIs are supported.

Table of Contents
-----------------

* [Documentation by Example](#documentation-by-example)
    * [Error Handling](#error-handling)
    * [JSONPath](#jsonpath)
    * [URI Templates](#uri-templates)
* [Caching](#caching)
* [Customizing Traverson](#customizing-traverson)
    * [Enabling/Disabling Features](#enablingdisabling-features)
    * [Overriding](#overriding-parts-of-traversons-walk-behaviour)
* [Other Media Types](#other-formats-media-types-besides-json)

Documentation by Example
------------------------

    var traverson = require('../traverson')
    var jsonWalker = new traverson.JsonWalker()

When working with Traverson, you will mostly use the `walk` method, which takes four parameters and looks like this:

    walk = function(startUri, pathArray, templateParams, callback)

Let's see what happens when this method is called:

    jsonWalker.walk('http://api.io', ['link_to', 'resource'], null, function(error, document) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log('We have walked the path and reached the final resource.')
        console.log(JSON.stringify(document))
      }
    })

Given this call, Traverson first fetches `http://api.io`. Let's say the response for this URI is

    http://api.io
    {
      "some": "stuff we do not care about",
      ...
      "link_to": "http://api.io/follow/me"
    }

(To make the examples easier to read, we note the URI corresponding to the document above each document. The URI is of course not part of the JSON response body.)

After receiving the document from the start URI, Traverson starts to follow the path array given as the second parameter. Since the first element in the path array is `link_to`, it looks for a property with this name in the JSON response. In this case, this yields the next URI to access: `http://api.io/follow/me`. Traverson will fetch the document from there now. Let's assume this document looks like to this:

    https://api.io/follow/me
    {
      "more_stuff": "that we ignore",
      ...
      "resource": "http://api.io/follow/me/to/the/stars"
    }

Now, since the next element in the path array is `resource`, Traverson will look for the property `resource`. Finding that, Traverson will fetch the document from `http://api.io/follow/me/to/the/stars` next.

    http://api.io/follow/me/to/the/stars
    {
      "the_document": "that we really wanted to have",
      "with": "lots of interesting and valuable content",
      ...
    }

Because the path array is exhausted now (`resource` was the last element), this document will be passed into to the callback you provided when calling the `walk` method as the fourth parameter. Coming back to the example from the top, the output would be

    We have walked the path and reached the final resource.

    { "the_document": "that we really wanted to have", "with": "lots of interesting and valuable content", ...  }

### Error Handling

If anything goes wrong during this journey from resource to resource, Traverson will stop and call your callback with the appropriate error as the first parameter. In the example, the output would be

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

    jsonWalker.walk('http://api.io',
                   ['$.deeply.nested.link'],
                   null,
                   function(error, document) {
       ...
    }

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

Upon loading this document from the start URI `http://api.io`, Traverson will recognize that the first (and only) element in the path array is a JSONPath expression and evaluate it against the given document, which results in the URI `http://api.io/congrats/you/have/found/me`. Of course you can also use path arrays with more than one element with JSONPath and you can freely mix JSONPath expressions with plain vanilla properties.

Any element of the path array that begins with `$.` or `$[` is assumed to be a JSONPath expression, otherwise the element is interpreted as a plain object property.

More information on JSONPath can be found [here](http://goessner.net/articles/JsonPath/). Traverson uses the npm module [JSONPath](https://github.com/s3u/JSONPath) to evaluate JSONPath expressions.

### URI Templates

Traverson supports URI templates ([RFC 6570](http://tools.ietf.org/html/rfc6570)). Let's modify our inital example to make use of this feature:

    jsonWalker.walk('http://api.io',
                    ['user_thing_lookup'],
                    {user_name: "basti1302", thing_id: 4711},
                    function(error, document) {
       ...
    }

Again, Traverson first fetches `http://api.io`. This time, we assume a response with an URI template:

    http://api.io
    {
      "user_thing_lookup": "http://api.io/users/{user_name}/things{/thing_id}"
    }

Traverson recognizes that this is an URI template and resolves the template with the template parameters given as the third argument (`{user_name: "basti1302", thing_id: 4711}` in this case). The resulting URI is `http://api.io/users/basti1302/things/4711`. Traverson now fetches the document from this URI and passes the resulting document into the provided callback.

    http://api.io/users/basti1302/things/4711
    {
      "the_document": "we wanted to have"
    }

To find out if URI templating is necessary, Traverson simply checks if the URI contains the character `{` and if URI template parameters have been provided.

Of course, URI templating also works if the path from the start URI to the final document involves multiple hops.

Let's assume the following call

    jsonWalker.walk('http://api.io',
                    ['user_lookup', 'thing_lookup'],
                    {user_name: "basti1302", thing_id: 4711},
                    function(error, document) {
       ...
    }

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

    jsonWalker.walk('http://api.io',
                   ['user_lookup', 'things', 'thing_lookup'],
                   [null, {id: "basti1302"}, null, {id: 4711}],
                   function(error, document) {
       ...
    }

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

The first element of the template parameter array (`null`) will actually be used for the start URI. Thus, if our start URI `http://api.io` would have been a URI template, we could have provided template parameters for it. Since the start URI is fixed, we just use `null`. The second element `{id: "basti1302"}` will then be used to resolve `http://api.io/users/{id}` to `http://api.io/users/basti1302`. The next URI is not a template, so the template parameter array contains `null` at this position again. The final link yields a URI template again, which will be resolved with `{id: '4711'}` to `http://api.io/users/basti1302/things/4711`. Since both templates contained the placeholder `id` but required different values, this would not have been possible with a single object holding all template substitutions.

More information on URI templates: [RFC 6570](http://tools.ietf.org/html/rfc6570). Traverson uses the module [uri-templates](https://github.com/grncdr/uri-template) to resolve URI
templates.

Caching
-------

Currently, there is no caching implemented. There will be some sort of caching in future versions. When calling Traverson with the same start URI and the same path array, we would likely end up at the same final URI. The intermediate steps might be cached and not actually fetched from the server every time.

Customizing Traverson
---------------------

### Enabling/Disabling Features

There will be some simple on/off toggles for certain parts of Traverson behaviour. For example, it should be possible to
* disable URI templates,
* disable JSONPath,
* disable caching (a feature yet to be implemented in the first place)

### Overriding Parts of Traverson's `walk` Behaviour

TODO

Other Media Types Besides JSON
--------------------------------------

In the far future, Traverson might also support HTML APIs and/or XML APIs. [HAL](http://stateless.co/hal_specification.html) is also interesting, although you already can use Traverson with `application/hal+json`, but a specialized HalJsonWalker might make better use of the standardized HAL format.

