Traverson - Hypermedia API Consumer
============================
[![Build
Status](https://travis-ci.org/basti1302/traverson.png?branch=master)](https://travis-ci.org/basti1302/traverson)

Santa's little helper for consuming hypermedia APIs with ease. Currently only JSON APIs are supported

TODO: Explain what this module does :-)

Documentation by Example
------------------------

    var traverson = require('../traverson')
    var jsonWalker = new traverson.JsonWalker()

When working with Traverson, you will mostly use the `walk` method, which takes four parameters and looks like this:

    walk = function(startUri, path, templateParams, callback)

Let's see what happens when this method is called.

    jsonWalker.walk('https://api.io', ['path_to', 'resource'], null, callback)

Given this call, Traverson would first fetch https://api.io. Let's say the response for this URI is

    {
      "some": "stuff we do not care about",
      ...
      "path_to": "https://api.io/follow/me"
    }

After receiving the document from the start URI, Traverson starts to follow the path array given as the second parameter. Since the first element in the path array is `path_to`, it would look for a property with this name in the JSON response. In this case, this yields the next URI to access: `https://api.io/follow/me`. Traverson will fetch the document from there now. Let's assume this document looks like to this:

    {
      "more_stuff": "that we ignore",
      ...
      "resource": "https://api.io/follow/me/to/the/stars"
    }

Now, since the next element in the path array is `resource`, Traverson will look for the property `resource`. Finding that, Traverson will fetch the document from `https://api.io/follow/me/to/the/stars` next.

    {
      "the_document": "that we really wanted to have",
      "with": "lots of interesting and valuable content",
      ...
    }

Because the path array is exhausted now (`resource` was the last element), this document will be passed into to the callback you provided when calling the walk method as the second parameter. The first parameter of your callback would be the usual error parameter which will be used if anything goes wrong during the process described above.

### URI Templates

Traverson supports URI templates.

TODO: Document the usage of URI templates and link general URI templates documentation as well as the uri-template npm module.

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
