Traverson - Hypermedia API Consumer
============================
[![Build
Status](https://travis-ci.org/basti1302/traverson.png?branch=master)](https://travis-ci.org/basti1302/traverson)

Santa's little helper for consuming hypermedia APIs with ease. Currently only JSON APIs are supported

Documentation by Example
------------------------

    var traverson = require('../traverson')
    var jsonWalker = new traverson.JsonWalker()

When working with Traverson, you will mostly use the `walk` method, which takes four parameters and looks like this:

    walk = function(startUri, path, templateParams, callback)

Let's see what happens when this method is called.

    jsonWalker.walk('http://api.io', ['link_to', 'resource'], null, function(error, document) {
      if (error) {
        console.error('No luck :-)')
      } else {
        console.log('We have walked the path and reached the final resource.')
        console.log(JSON.stringify(document))
      }
    })

Given this call, Traverson first fetches http://api.io. Let's say the response for this URI is

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

Because the path array is exhausted now (`resource` was the last element), this document will be passed into to the callback you provided when calling the walk method as the second parameter. Coming back to the example from the top, the output would be

    We have walked the path and reached the final resource.

    { "the_document": "that we really wanted to have", "with": "lots of interesting and valuable content", ...  }

### Error Handling

If anything goes wrong during this journey from resource to resource, your
callback would be called with the appropriate error as the first parameter and
the output would be

    No luck :-)

Reasons for failure could be:

* The start URI, one of the intermediate URIs, or the final URI is not reachable.
* One of the documents can not be parsed as JSON, that is, it is not syntactically well formed.
* One of the intermediate documents does not contain the property given in the path array.
* If JSONPath (see below) is used:
    * One of the JSONPath expressions in the path array does not yield a match for the corresponding document.
    * One of the JSONPath expressions in the path array yields more than one match for the corresponding document.

### URI Templates

Traverson supports URI templates ([RFC 6570](http://tools.ietf.org/html/rfc6570)). Let's modify our inital example to make use of this feature:

    jsonWalker.walk('http://api.io',
                    ['user_thing_lookup'],
                    {user_name: "basti1302", thing_id: 4711},
                    function(error, document) {
       ...
    }

Again, Traverson first fetches http://api.io. This time, we assume a response with an URI template:

    http://api.io
    {
      "user_thing_lookup": "http://api.io/users/{user_name}/things{/thing_id}"
    }

    http://api.io/users/basti1302/things/4711
    {
      "the_document": "we wanted to have"
    }

Traverson recognizes that this is an URI template and resolves the template with the template parameters given as the third argument (`{user_name: "basti1302", thing_id: 4711}` in this case). The resulting URI is `http://api.io/users/basti1302/things/4711`. Traverson now fetches the document from this URI and passes the resulting document into the provided callback.

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

Traverson will resolve the URI templates in the first and second document and finally reach the document at http://api.io/users/basti1302/things/4711.

Instead of using an object to provide the template parameters for each step, you can also provide an array of objects. Each element of the array will only be used for the corresponding step in the path array. This is useful if there are template parameters with identical names which are to be used in different steps.

Let's look at an example:

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

### JSONPath

Traverson supports JSONPath expressions in the path array.

TODO: Document the usage of JSONPath expressions and link general JSONPath documentation as well as the JSONPath npm module.

### Caching

TODO

Customizing Traverson
---------------------

### Enabling/Disabling Features

TODO

### Overriding Parts of Traverson's `walk` Behaviour

TODO
