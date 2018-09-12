![Traverson Logo](https://raw.githubusercontent.com/traverson/traverson/master/misc/logo/traverson-logo.72dpi.png)

Traverson User Guide
====================

This documents explains the concepts behind Traverson and explains most of its features with examples. There is also the [API](https://github.com/traverson/traverson/blob/master/api.markdown) if you looking for something more concise.

Table of Contents
-----------------

* [Installation](#installation)
    * [Node.js](#nodejs)
    * [Browser](#browser)
    * [AngularJS](#angularjs)
* [Documentation](#documentation)
    * [Following Links](#following-links)
    * [Configuring Traverson](#configuring-traverson--the-request-builder-object)
    * [Get Full HTTP Response or URL](#more-control-receive-the-full-http-response-or-the-url)
    * [Pass Links as Array](#pass-a-link-array)
    * [POST, PUT, DELETE and PATCH](#post-put-delete-and-patch)
    * [Error Handling](#error-handling)
    * [Absolute Versus Relative URLs](#on-absolute-urls-absolute-url-paths-and-relative-url-paths)
    * [JSONPath](#jsonpath)
    * [URI Templates](#uri-templates)
    * [Headers, Query Strings and Authentication](#headers-query-strings-http-basic-auth-oauth-and-whatnot)
    * [Custom JSON parser](#custom-json-parser)
    * [Using Media Type Plug-ins](#using-media-type-plug-ins)
        * [Implementing Media Type Plug-ins](#implementing-media-type-plug-ins)
    * [Content Type Detection Versus Forcing Media Types](#content-type-detection-versus-forcing-media-types)
    * [Continuing a Link Traversal](#continuing-a-link-traversal)
    * [Aborting the Link Traversal](#aborting-the-link-traversal)
    * [Link Header](#link-header)
    * [Promise API](#promise-api)
    * [TypeScript Types](#typescript-types)
    * [Traverson Web Component](#traverson-web-component)
    * [Related Projects](#related-projects)
* [API](https://github.com/traverson/traverson/blob/master/api.markdown)
* [Release Notes](https://github.com/traverson/traverson/blob/master/release-notes.markdown)

Installation
------------

### Node.js

    npm install traverson --save

### Browser

* If you are using npm and [Browserify](http://browserify.org/): Just `npm install traverson --save` and `require('traverson')`, then browserify your module as usual - browserify will include Traverson and its dependencies for you and also use the shims defined in Traverson's package.json's `browser` property.
* If you are using [Bower](http://bower.io): `bower install traverson --save`
* Otherwise you can grab a download from the [latest release](https://github.com/traverson/traverson/releases/latest):
    * `traverson.min.js`: Minified build with UMD. This build can be used with an AMD loader like RequireJS or with a script tag (in which case it will register `traverson` in the global scope). **If in doubt, use this build.**
    * `traverson.js`: Non-minified build with UMD. Same as above, just larger :-)
    * `traverson.external.min.js`: Minified require/external build. Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson`. This build could be used if you use browserify but do not want to bundle Traverson with your own browserify build but keep it as a separate file.
    * `traverson.external.js`: Non-minified require/external build, same as before, just larger.

#### AngularJS

There's an [AngularJS plug-in for Traverson](https://github.com/traverson/traverson-angular) which makes it possible to integrate the Traverson API seamlessly into an AngularJS app. If you want to use Traverson in an AngularJS app, this is the way to go.

Breaking Change As Of Version 1.0.0
-----------------------------------

* From version 1.0.0 onwards, support for HAL is no longer included in Traverson. instead, it has been moved to a separate plug-in. If you have used Traverson to work with HAL APIs, you will need some (trivial) changes in your code. See [Using Plug-ins](#using-plug-ins) and [traverson-hal](https://github.com/traverson/traverson-hal).
* The properties `traverson.json` and `traverson.jsonHal` (that is, using *properties* `json`/`jsonHal` on the `traverson` object) are deprecated as of 1.0.0 (but they still work). Instead, use the methods `json()`/`jsonHal()` on the request builder object. Thus, `traverson.json.from(url)` becomes `traverson.from(url).json()` and `traverson.jsonHal.from(url)` becomes `traverson.from(url).jsonHal()`. You can also omit `json()`/`jsonHal()` completely and use content negotiation.
* See the [release notes](https://github.com/traverson/traverson/blob/master/release-notes.markdown) for more details on the changes in version 1.0.0.

Documentation
-------------

This section shows how to use Traverson's features, one example at a time. There is also the [API reference documentation](https://github.com/traverson/traverson/blob/master/api.markdown).

### Following Links

The most basic thing you can do with traverson is to let it start at the root URL of an API, follow some links and pass the resource that is found at the end of this journey back to you. We call this procedure a *"link traversal process"*. Here's how:

```javascript
var traverson = require('traverson');

traverson
.from('http://api.example.com')
.json()
.follow('link_to', 'resource')
.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached the target resource.')
    console.log(JSON.stringify(document))
  }
});
```

Given this call, Traverson first fetches `http://api.example.com` (because that's what we specified in the `from` method).

Let's say the response for this URL is

```
http://api.example.com
{
  "some": "stuff we do not care about",
  ...
  "link_to": "http://api.example.com/follow/me"
}
```

(To make the examples easier to read, we note the URL corresponding to the document above each document. The URL is of course not part of the JSON response body.)

By the way, we forced Traverson to interpret the response as `application/json` by using the `json()` method. We could have omitted the `json()` method and let Traverson figure out the content type. For this, the server would need to send the `Content-Type` header with the value `application/json`. (see [Content Type Detection](#content-type-detection-versus-forcing-media-types)).

After receiving the document from the start URL, Traverson starts to follow the link relations provided via the `follow` method. Since the first link relation is `link_to`, it looks for a property with this name in the JSON response. In this case, this yields the next URL to access: `http://api.example.com/follow/me`. Traverson will fetch the document from there now. Let's assume this document looks like to this:

```
https://api.example.com/follow/me
{
  "more_stuff": "that we ignore",
  ...
  "resource": "http://api.example.com/follow/me/to/the/stars"
}
```

Now, since the next link relation given to `follow` is `resource`, Traverson will look for the property `resource`. Finding that, Traverson will finally fetch the JSON document from `http://api.example.com/follow/me/to/the/stars`:

```
http://api.example.com/follow/me/to/the/stars
{
  "the_resource": "that we really wanted to have",
  "with": "lots of interesting and valuable content",
  ...
}
```

Because the list of link relations given to `follow` is exhausted now (`resource` was the last element), this document, called the *target resource*, will be passed into to the callback you provided when calling the `getResource` method. Coming back to the example from the top, the output would be

```
We have followed the path and reached the target resource.
{ "the_resource": "that we really wanted to have", "with": "lots of interesting and valuable content", ...  }
```

### Configuring Traverson &mdash; the Request Builder Object

Calling `traverson.newRequest()` gives you a new *request builder* instance, which you can use to configure how Traverson behaves during the link traversal. The convenience method `traverson.from(url)` (which we used in the example above) also gives you a new request builder which already has the root URL of your API configured. The request builder offers a number of configuration methods to prepare the link traversal, among others:

* `from`: Sets the API root URL. (You do not need to call this if you created the request builder with `traverson.from(url)`, that is, `traverson.from(url)` is equivalent to `traverson.newRequest().from(url)`.)
* `follow`: Sets the link relations to follow.
* `withTemplateParameters`: Sets parameters for URI template resolution.
* `withRequestOptions`: Sets options for the `request` library that is used to execute HTTP requests (like special HTTP headers or OAuth stuff).

There are more configuration options available. Most are explained in more detail in the remainder of this document. A comprehensive list can be found in the [API reference documentation](https://github.com/traverson/traverson/blob/master/api.markdown#configuration-methods).

#### Reusing Configuration Between Link Traversals

One request builder should only be used for one link traversal process. That is, after you called one of the methods that actually start the link traversal process (`get`, `getResource`, `getUrl`, `post`, `put`, `patch` or `delete`) on the request builder instance, you should not use it again for another link traversal process. If you want to set up a common configuration to be used in every link traversal, you can clone the request builder by calling `newRequest()` on it. Like this:

<pre lang="javascript">
// set some common configuration options for all link traversals
var api = traverson
.from('http://api.example.com') // set root URL
.json() // force media type to application/json
.withRequestOptions({ headers: { 'x-my-special-header': 'foo' } }); // set HTTP header

// first link traversal, using the configuration from above
api
<b>.newRequest()</b> // clone the request builder, to keep the original one pristine
.follow(<b>'first_link', 'second_link'</b>)
.getResource(...);

// second link traversal, root URL, media type and HTTP header are still configured
api
<b>.newRequest()</b> // clone the request builder again, to keep the original one pristine
.follow(<b>'another_link', 'yet_another_link'</b>) // this time we use different link relations
.getResource(...);
</pre>

### More Control: Receive the Full HTTP Response or the URL

The example above chained the `getResource` method to the `follow` method. For this method, Traverson will parse the JSON from the last HTTP response and pass the resulting JavaScript object to your callback. In certain situations you might want more control and would like to receive the full HTTP response object instead of the body, already parsed to an object. This is what the `get` method is for:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
<b>.get(function(error, response) {</b>
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached our destination.')
    console.log('HTTP status code: ' + response.statusCode)
    console.log('Response Body: ' + response.body)
  }
});
</pre>

Actually, `getResource` is just a shortcut for `get` combined with [`convertResponseToObject`](https://github.com/traverson/traverson/blob/master/api.markdown#builder-convertResponseToObject).

Or maybe you even want to execute the last HTTP request all by yourself. The method `getUrl` has you covered. It will only execute the HTTP GET requests until it has found the final link from `follow`, but will not request the resource that this last link leads to.

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
<b>.getUrl(function(error, url) {</b>
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path. The URL you are looking for is:' + url);
  }
});
</pre>

URI template resolution will take place before the URL is returned to your callback. So if the last URL is actually a template, make sure to provide the required template parameters via [`withTemplateParameters`](https://github.com/traverson/traverson/blob/master/api.markdown#builder-withTemplateParameters)

### Pass a Link Array

You can also pass an array of strings to the follow method. Makes no difference.

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow(<b>'first_link', 'second_link', 'third_link'</b>)
.getResource(callback);
</pre>
is equivalent to
<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow(<b>['first_link', 'second_link', 'third_link']</b>)
   .getResource(callback);
</pre>

If the first argument to `follow` is an array, all remaining arguments will be ignored, though.

### POST, PUT, DELETE and PATCH

So far we only have concerned ourselves with fetching information from a REST API. Of course, Traverson also supports the usual HTTP method verbs to modify data, that is, POST, PUT, DELETE and PATCH. HEAD and OPTIONS are currently not implemented, though.

This looks very similar to using the `get` method:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
.<b>post</b>({'some': 'data'}, function(error, response) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('POST request sucessful')
    console.log('HTTP status code: ' + response.statusCode)
  }
});
</pre>

The methods `get`, `post`, `put`, `delete` and `patch` pass the full http response into the provided callback, so the callback's method signature always looks like `function(error, response)`.

But same as with `get` versus `getResource`, you also have the choice of receiving just the parsed response body (converted to a JavaScript object) instead of the full HTTP Response. The configuration method `convertResponseToObject` switches to the former behaviour (the latter is the default). With `convertResponseToObject`, the signature of the provided callback is `function(error, doc)`.

The methods `post`, `put` and `patch` accept a body argument, `delete` does not. Some more examples, just for completenss' sake:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
<b>.convertResponseToObject()</b>
.post({'some': 'data'}, function(error, <b>doc</b>) {
  ...
});

traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
.<b>put</b>({'some': 'data'}, function(error, response) {
  ...
});

traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
.<b>patch</b>({'some': 'data'}, function(error, response) {
  ...
});

traverson
.from('http://api.example.com')
.follow('link_to', 'resource')
.<b>delete</b>(function(error, response) {
  ...
});
</pre>

### Error Handling

If anything goes wrong during this journey from resource to resource, Traverson will stop and call your callback with the appropriate error as the first parameter. In the examples above, the output would be

```
No luck :-)
```

Reasons for failure could be:

* The start URL, one of the intermediate URLs, or the final URL is not reachable (but see the section below for details on the handling of HTTP status codes).
* One of the documents can not be parsed as JSON, that is, it is not syntactically well formed.
* One of the intermediate documents does not contain the property (link relation) specified via `follow`.
* If JSONPath (see below) is used:
    * One of the JSONPath expressions in the path array does not yield a match for the corresponding document.
    * One of the JSONPath expressions in the path array yields more than one match for the corresponding document.

Traverson always adds the `name` property to the errors it creates. Also, all error names that Traverson uses are exported via `traverson.errors`. If you want to check for a particular error conditions, use the following pattern:

```javascript
var traverson = require('traverson');

traverson
.from('http://api.example.com')
.json()
.follow('link_to', 'resource')
.getResource(function(error, document) {
  if (error) {
    if (error.name === traverson.errors.HTTPError) {
      // special handling for HTTP issues goes here
    } else if (error.name === traverson.errors.JSONError) {
      // special handling for JSON parsing problems goes here
    } else if (error.name === traverson.errors.LinkError) {
      // special handling for invalid or missing links goes here
    } else {
      // not so special handling for all other error conditions goes here
    }
  } else {
    // link traversal has been successfull
  }
});
```

All error names and their resepective keys in the `traverson.errors` object are documented in the [API docs](https://github.com/traverson/traverson/blob/master/api.markdown#traverson-errors).


#### How HTTP Status Code Are Handled

In contrast to some other AJAX-related libraries, Traverson does not interpret status codes outside of the 2xx range as an error condition. Only network problems (host not reachable, timeouts, etc.) will result in Traverson calling the callback with an error. Completed HTTP requests, even those with status 4xx or 5xx are interpreted as a success. This applies only to the last request in a traversal, HTTP requests *during* the traversal that respond with 4xx/5xx are interpreted as an error (because the traversal can not continue). This design decision comes from Traverson's use of [request](https://github.com/request/request) internally, which behaves in the same way.

### On Absolute URLs, Absolute URL Paths and Relative URL Paths

Different APIs use different flavours of links in their responses. Traverson can handle the following cases:

* Absolute URLs (URLs that start with the a scheme/protocol, that is http(s)). Those are always used as is to retrieve the next resource representation (except for resolving URI templates).
* Absolute URL paths, that is, URLs that omit the http(s) part and start with a slash (`/`) and ought to be interpreted relative to the host part of the root URL. Example: If the root URL is `https://api.example.com/home` and a link contains `/customers/1302` this will be resolved to `https://api.example.com/customers/1302`. If following a link `/orders` from there, this would be resolved to `https://api.example.com/orders`. This is how most browsers behave and what node's `url.resolve` does, and also what most APIs expect you to do.
* Relative URL paths, that is, URLs that also omit the protocol, start with a slash (like absolute URL paths) but are to be interpreted relative to the current location. If you want this behaviour, you need to call `resolveRelative()` on the `api` object. Example: If the root URL is `https://api.example.com/home` and the first link contains `/customers/1302` this will be resolved to `https://api.example.com/home/customers/1302`. If this has a link `/orders`, this would be resolved to `https://api.example.com/home/customers/1302/orders`. This feature should be rarely needed.

### JSONPath

Traverson supports [JSONPath](http://goessner.net/articles/JsonPath/) expressions in the path array. This will come in handy if the link you want to follow from a given document is not a direct property of that document. Consider the following example:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow(<b>'$.deeply.nested.link'</b>)
.getResource(function(error, doc) {
   ...
});
</pre>

where the documents are

```
http://api.example.com
{
  "deeply": {
    "nested": {
      "link: "http://api.example.com/congrats/you/have/found/me"
    }
  }
}

http://api.example.com/congrats/you/have/found/me
{
  "the_document": "we wanted to have"
}
```

Upon loading the document from the start URL `http://api.example.com`, Traverson will recognize that the first (and only) link to `follow` is a JSONPath expression and evaluate it against the given document, which results in the URL `http://api.example.com/congrats/you/have/found/me`. Of course you can also call `follow` with more than one element with JSONPath and you can freely mix JSONPath expressions with plain vanilla properties.

Any element of the path array that begins with `$.` or `$[` is assumed to be a JSONPath expression, otherwise the element is interpreted as a plain object property.

More information on JSONPath can be found [here](http://goessner.net/articles/JsonPath/). Traverson uses the npm module [JSONPath](https://www.npmjs.com/package/jsonpath-plus) to evaluate JSONPath expressions.

If a JSONPath expressions yields no match or more than one match, an error will be passed to your callback.

### URI Templates

Traverson supports URI templates ([RFC 6570](http://tools.ietf.org/html/rfc6570)). Let's modify our inital example to make use of this feature:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('user_thing_lookup')
<b>.withTemplateParameters({ user_name: 'basti1302', thing_id: 4711 })</b>
.getResource(function(error, doc) {
  ...
});
</pre>

Again, Traverson first fetches `http://api.example.com`. This time, we assume a response with an URI template:

<pre>
http://api.example.com
{
  "user_thing_lookup": <b>"http://api.example.com/users/{user_name}/things{/thing_id}"</b>
}
</pre>

Traverson recognizes that this is an URI template and resolves the template with the template parameters provided via the `withTemplateParameters` method (`{user_name: "basti1302", thing_id: 4711}` in this case). The resulting URL is `http://api.example.com/users/basti1302/things/4711`. Traverson now fetches the document from this URL and passes the resulting document into the provided callback.

```
http://api.example.com/users/basti1302/things/4711
{
  "the_document": "we wanted to have"
}
```

To find out if template resolution is necessary, Traverson simply checks if the URL contains the character `{`.

Of course, URI templating also works if the path from the start URL to the target resource involves multiple hops.

Let's assume the following call

```javascript
traverson
.from('http://api.example.com')
.follow('user_lookup', 'thing_lookup')
.withTemplateParameters({ user_name: 'basti1302', thing_id: 4711 })
.getResource(function(error, doc) {
  ...
});
```

and the following documents, with their corresponding URLs:

```
http://api.example.com
{
  "user_lookup": "http://api.example.com/users/{user_name}"
}

http://api.example.com/users/basti1302
{
  "thing_lookup": "http://api.example.com/users/basti1302/things/{thing_id}"
}

http://api.example.com/users/basti1302/things/4711
{
  "the_document": "we wanted to have"
}
```

Traverson will resolve the URI templates in the first and second document and finally reach the document at `http://api.example.com/users/basti1302/things/4711`.

Instead of using a single object to provide the template parameters for each step, you can also provide an array of objects. Each element of the array will only be used for the corresponding step in the link traversal process. This is useful if there are template parameters with identical names which are to be used in different steps.

Let's look at an example

```javascript
traverson
.from('http://api.example.com')
.follow('user_lookup', 'things', 'thing_lookup')
.withTemplateParameters([null, {id: "basti1302"}, null, {id: 4711} ])
.getResource(function(error, doc) {
  ...
});
```

and the following documents, with their corresponding URLs:

```
http://api.example.com
{
  "user_lookup": "http://api.example.com/users/{id}"
}

http://api.example.com/users/basti1302
{
  "things": "http://api.example.com/users/basti1302/things
}

http://api.example.com/users/basti1302/things
{
  "thing_lookup": "http://api.example.com/users/basti1302/things{/id}"
}

http://api.example.com/users/basti1302/things/4711:
{
  "the_document": "we wanted to have"
}
```

The first element of the template parameter array (`null`) will actually be used for the start URL (the one you passed to the `from` method). Thus, if our start URL `http://api.example.com` would have been a URI template, we could provide template parameters for it. Since the start URL is fixed, we just use `null`. The second element `{id: "basti1302"}` will then be used to resolve `http://api.example.com/users/{id}` to `http://api.example.com/users/basti1302`. The next URL is not a template, so the template parameter array contains `null` at this position again. The final link yields a URI template again, which will be resolved with `{id: '4711'}` to `http://api.example.com/users/basti1302/things/4711`. Since both templates contained the placeholder `id` but required different values, this would not have been possible with a single object holding all template substitutions.

More information on URI templates: [RFC 6570](http://tools.ietf.org/html/rfc6570). Traverson uses the module [url-template](https://github.com/bramstein/url-template) to resolve URI templates.

### Headers, Query Strings, HTTP Basic Auth, OAuth and Whatnot

Traverson uses Mikeal Rogers' [request](https://github.com/request/request) module for all HTTP requests by default. You can use all options that `request` provides with Traverson by passing an options object into the `withRequestOptions` method, like this:

<pre lang="javascript">
traverson
.from('http://api.example.com')
.follow('link_one', 'link_two', 'link_three')
<b>.withRequestOptions({
  headers: { 'x-my-special-header': 'foo' },
  qs: { query: 'bar' },
})</b>
.getResource(function(error, doc) {
    ...
});
</pre>

This would add the header `x-my-special-header` and the query string `query` to all requests issued for this three link walk. Check out the [request docs](https://github.com/request/request#requestoptions-callback) to see which options can be used. Among other things, you can set custom headers, do HTTP basic authentication, [OAuth](https://github.com/request/request#oauth-signing) and other cool stuff. If you do not want to use the same options for every step of the link traversal you can pass an array into `withRequestOptions` where each array element represents the options for the corresponding step (similar to `withTemplateParameters`).

A word of warning: When running in the browser and not in Node.js, the request library is shimmed by [SuperAgent](https://github.com/visionmedia/superagent) to shim the request module. Most request options are mapped to appropriate superagent options. If you use Traverson in the browser and you notice odd behaviour regarding `withRequestOptions`, please file an [issue](https://github.com/traverson/traverson/issues).

You can also pass in a custom request library, as long as it conforms to the same interface as [request](https://github.com/request/request).

<pre lang="javascript">
var customRequestLibrary = require('custom-request');

traverson
.from('http://api.example.com')
.follow('link_one', 'link_two', 'link_three')
<b>.withRequestLibrary(customRequestLibrary)</b>
.getResource(function(error, doc) {
    ...
});
</pre>

### Custom JSON parser

JSON bodies are parsed with `JSON.parse` by default. If that does not suit you, you can inject your own custom parsing function with `parseResponseBodiesWith`. One use case for this would be if the server prepends some JSON vulnerability protection string to the JSON response (see for example the suggestion at <https://docs.angularjs.org/api/ng/service/$http>, section JSON Vulnerability Protection).

Here is an example.

<pre lang="javascript">
var jsonVulnerabilityProtection = ')]}\',\n';
var protectionLength = jsonVulnerabilityProtection.length;

traverson
.from('http://api.example.com')
.follow('link-rel')
<b>.parseResponseBodiesWith(function(body) {
  body = body.slice(protectionLength);
  return JSON.parse(body);
})</b>
.getResource(function(error, doc) {
  ...
});
</pre>

### Using Media Type Plug-ins

Out of the box, Traverson works with generic JSON APIs. There are a lot of media types out there that support hypermedia APIs better, among others

* [HAL (application/hal+json)](https://tools.ietf.org/html/draft-kelly-json-hal),
* [Mason (application/vnd.mason+json)](https://github.com/JornWildt/Mason/wiki/mason-format-specification),
* [Collection+JSON (application/vnd.collection+json)](http://amundsen.com/media-types/collection/),
* [Siren (application/vnd.siren+json)](https://github.com/kevinswiber/siren)
* [Uber (application/vnd.amundsen-uber+json)](https://rawgit.com/mamund/media-types/master/uber-hypermedia.html),

If you want to leverage the power of a specialized media type, you can use the concept of Traverson's media type plug-ins. As of now, there is a [media type plug-in for HAL](https://github.com/traverson/traverson-hal), other media type plug-ins could be implemented easily (see below).

Here is an example on how to register a media type plug-in with Traverson.

```javascript
var traverson = require('traverson');
traverson.registerMediaType('application/vnd.mason+json', MasonAdapter);
```

This would register `MasonAdapter` as a plug-in for the media type `application/vnd.mason+json`. `MasonAdapter` would need to be a constructor function adhering to the constraints given in [the next subsection](#implementing-media-type-plug-ins).

Once registered, a media type plug-in is automatically eligible for [content negotiation](#content-type-detection-versus-forcing-media-types). You can also force Traverson to use a media type by calling `setMediaType`. To force Traverson to use the `MasonAdapter` no matter which `Content-Type` header the server sets, you would call `setMediaType(application/vnd.mason+json)`.

Usually, a media type plug-in should also provide a `mediaType` property containing the registered media type it is intended for. Thus, the example above could be simplified to

```javascript
var traverson = require('traverson');
traverson.registerMediaType(MasonAdapter.mediaType, MasonAdapter);
```

The `setMediaType` call could be changed to `setMediaType(MasonAdapter.mediaType)`, accordingly.

(Note that there currently is no MasonAdapter, this is just an example. There is a [HAL adapter](https://github.com/traverson/traverson-hal), though.)

#### Implementing Media Type Plug-ins

Here is an implementation stub for new Traverson media type plug-ins:

```javascript
'use strict';

function MediaTypeAdapter(log) {
  this.log = log;
}

MediaTypeAdapter.mediaType = 'application/whatever+json';

MediaTypeAdapter.prototype.findNextStep = function(t, link) {
  // you can access the HTTP response that the last step yielded
  var lastHttpResponse = t.lastStep.response;
  // if you do not need the full HTTP response you can also access the parse
  // body of the last response
  var lastDocument = t.lastStep.doc;

  // The parameter link is an object that has a type and a value attribute like
  // this:
  // { type: 'link-rel', value: 'next' }

  // process the incoming response/document to determine the next step for
  // Traverson, for example, find the link 'next' in the document and read its
  // URL.
  var nextUrl = lastDocument.links.next.url;

  ...

  // return next step as an object
  return {
    url: nextUrl,
  };
}
```

A media type plug-in is always a constructor function. It is passed one argument, a log object. This log object can be used by the plug-in to log messages, if required (it offers the methods `debug(message)`, `info(message)`, `warn(message)` and `error(message)`).

Every media type plug-in *must* provide a propery `mediaType` that represents the registered content type for this plug-in. This property will also be used to set the `Accept` and `Content-Type` header (unless auto headers are disabled).

Every media type plug-in *must* provide a method `findNextStep`, which takes two parameters, `t` and `link`. `t` represents the traversal process and contains all information about the traversal and its current state. The `link` object represents the link relation that has been specified for this step in the `follow` method. The responsibility of the `findNextStep` method is to return a step object, that tells Traverson what to do next.

A step object can be as simple as this `{ url: '/next/url/to/call' }`. This would make Traverson make an HTTP request to the given URL. Some media types (like HAL) contain embeddeded resources. For those, the next step is not an HTTP request. Instead, you can put the part of `doc` that represents the embedded resource into the returned step object, like this: `{ doc: { ... } }`.

If you want to implement your own media type plug-in, having a look at the existing HAL plug-in might be helpful: <https://github.com/traverson/traverson-hal/blob/master/index.js>, another example is the [stock JSON adapter](https://github.com/traverson/traverson/blob/master/lib/json_adapter.js) that comes with Traverson.

### Content Type Detection Versus Forcing Media Types

In the examples so far, we never explicitly specified the media type the API would use. Traverson usually figures that out by itself by looking at the `Content-Type` header. If the `Content-Type` header of the server's response is `application/json`, Traverson will interpret the response as a plain JSON resource. However, you can force Traverson to interpret the server's response as a certain media type.

With <code>traverson.from('http://api.example.com').<b>json()</b></code>, Traverson assumes that the API uses a generic JSON media type. The server will probably set the `Content-Type` header to `application/json`, but because we forced the media type, this is not even checked by Traverson. With the [traverson-hal](https://github.com/traverson/traverson-hal) plug-in installed you can do <code>traverson.from('http://api.example.com').<b>jsonHal()</b></code>, to make Traverson assume that the API complies with the HAL specification. The server would probably set the `Content-Type` header to `application/hal+json`, again, this is not checked by Traverson. Finally, with <code>traverson.from('http://api.example.com').<b>setMediaType('application/whatever+json')</b></code> you can force Traverson to use an arbitrary media type (as long as a matching media type plug-in is registered).

When a specific media type has been set explicitly, Traverson automatically sets the appropriate `Accept` and `Content-Type` headers when making HTTP requests, unless these headers have been set explicitly via `.withRequestOptions({headers: {...}})` or `.addRequestOptions({headers: {...}})`, or unless this behaviour has been disabled via `.disableAutoHeaders()`.

Instead of forcing a specific media type, you can also let Traverson figure out the media by itself. Actually, as already mentioned, that is the default behaviour. Just omit the `json()`/`jsonHal()/setMediaType()` and Traverson will use the `Content-Type` header coming from the server to decide how to interpret each response. However, for each content type an appropriate media type plug-in needs to be registered. That is, if the server sets a `Content-Type` of `application/hal+json` and the HAL plug-in is registered, the response will automatically be interpreted as HAL.

Without any plug-ins, Traverson will only be able to process `application/json` and will fail if it receives a different content type header.

Content type detection happens for each request/response. If each response in a link traversal process has a different Content-Type header, Traverson will pick a different media type plug-in to process these responses.

Note that Traverson will not set `Accept` or `Content-Type` headers automatically when content type detection is used (that is, when no media type has been set explicitly).

Here is a complete example:
<pre lang="javascript">
var traverson = require('traverson');
var JsonHalAdapter = require('traverson-hal');
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

traverson
.from('http://api.example.com')
<b>// no call to json(), jsonHal() or setMediaType</b>
.follow('link_to', 'resource')
.getResource(function(error, doc) {
   // Traverson will interpret the responses as generic JSON or HAL, depending
   // on the Content-Type header.
});
</pre>

### Continuing a Link Traversal

The examples so far were all concerned with one link traversal process. It is not unusual though that, when a link traversal has finished, you want to start a second link traversal process right at the resource where the first link traversal finished. Traverson makes it possible to reuse a finished link traversal to start a new one at its end resource.

The callbacks given to the action methods (`get`, `getResource`, `getUrl`, `post`, `put`, `patch`, `delete`) are actually called with one more additional parameter (that hasn't been shown in the examples so far) which represents the traversal process that has just been finished. This object `traversal` offers only one method, `continue()` which gives you a request builder instance which can be used just as the standard [request builder](https://github.com/traverson/traverson/blob/master/api.markdown#request-builder). That is, it has the same configuration and action methods.

Using `traversal.continue()` to initiate a new traversal ensures that the new traversal is started right where the first traversal stopped and it makes use of the last HTTP response of the first traversal to do so.

Here is an example:


```javascript
traverson
.from(rootUrl)
.follow('link1', 'link2')
.getResource(function(err, firstResource, traversal) {
  if (err) { return done(err); }
  // do something with the first resource, maybe decide where to go from here.
  traversal
  .continue()
  .follow('link3', 'link3')
  .getResource(function(err, secondResource) {
    if (err) { return done(err); }
    // do something with the second resource
  });
});
```

This would first follow the links `link1` and `link2` from the root URL for the first link traversal and then call the first callback. Then, by calling `traversal.continue().follow(...).getResource`, a second link traversal is initiated which follows the links `link3` and `link4`, starting at the resource that `link2` linked to.

You can combine `traversal.continue()` with `newRequest()` to clons/split a continued link traversal and follow multiple link relations from a resource,

### Aborting the Link Traversal

In some situations you might want to abort or cancel the link traversal process before it has finished. The action methods (`get`, `getResource`, `post`, ...) actually return a handle to do just that:

<pre lang="javascript">
var traverson = require('traverson');

var traversal = traverson
.from('http://api.example.com')
.getResource(function(error, doc) {
  if (error) {
    console.log(error.message);
  } else {
    ...
  }
});

// ... for some reason you decide later that you are not interested at all in
// the result of this link traversal ...

<b>traversal.abort();</b>
</pre>

Given the call to `abort()` happens while the link traversal is still in process, it will be aborted immediately, that is, all outstanding HTTP requests for the link traversal process are not executed. If there is an HTTP request in progress when abort is called, this HTTP request is also aborted. (There usually is an HTTP request in progress as long as the link traversal is in progress because pretty much everything else in the link traversal process happens synchronously.) The result of aborting the link traversal is that the callback passed to the action method is called with an error which says `Link traversal process has been aborted.`.

### Link Header

Traverson is able to consume the links returned on the `Link` header based on [LinkHeader](https://www.w3.org/wiki/LinkHeader) specification.
Link header parsing is done using the library [parse-link-header](https://github.com/thlorenz/parse-link-header).
Additionaly link navigation could be done using link relations, the property `_linkHeaders` of the resource contains all the links of the response.
```javascript
var traverson = require('traverson');

traverson
.from('http://api.example.com')
.json()
.linkHeader()
.follow('link_to', 'resource')
.getResource(function(error, document) {
  if (error) {
    console.error('No luck :-)')
  } else {
    console.log('We have followed the path and reached the target resource following a link from Link header.')
    console.log('The property _linkHeaders contains the returned links.')
    console.log(document._linkHeaders)
  }
});
```

### Promise API

If you prefer a promise API instead of a callback based API, check out [traverson-promise](https://github.com/nie-xin/traverson-promise), a wrapper around traverson that uses [Bluebird](https://github.com/petkaantonov/bluebird) to expose it as a promise based API.

### TypeScript Types

If you use TypeScript, check out [traverson-tsd-ambient](https://github.com/retyped/traverson-tsd-ambient), which has type definitions for Traverson.

### Traverson Web Component

[traverson-traversal](https://github.com/traverson/traverson-traversal) exposes Traverson as a web component, in a similar fashion to [iron-ajax](https://www.webcomponents.org/element/PolymerElements/iron-ajax).

### Related Projects

A list of projects related to or inspired by Traverson:

* [traverson-hal](https://github.com/traverson/traverson-hal): a JSON-HAL media type plug-in for Traverson
* [traverson-angular](https://github.com/traverson/traverson-angular): a Traverson-wrapper for AngularJS (1.x)
* [Spring-HATEOAS-Traverson](http://docs.spring.io/autorepo/docs/spring-hateoas/current/api/org/springframework/hateoas/client/Traverson.html): a Java Spring component to ease traversing hypermedia APIs, inspired by Traverson
* [SwiftyTraverson](https://github.com/smoope/SwiftyTraverson): an implementation of Traverson in Swift
* A Java version of Traverson: <https://github.com/smoope/traverson>
* [restsharp.portable.hal](https://github.com/heartysoft/restsharp.portable.hal): a .NET HAL client inspired by Traverson

