Traverson
=========

A Hypermedia API/HATEOAS Client for Node.js and the Browser
-----------------------------------------------------------

[![Build Status](https://travis-ci.org/basti1302/traverson.png?branch=master)](https://travis-ci.org/basti1302/traverson)

[![NPM](https://nodei.co/npm/traverson.png?downloads=true&stars=true)](https://nodei.co/npm/traverson/)

| File Size (browser build) | KB |
|---------------------------|---:|
| minified & gzipped        | 13 |
| minified                  | 44 |


Quick Links
-----------

* [API reference documentation](https://github.com/basti1302/traverson/blob/master/api.markdown)
* [User Guide](#documentation)
* [Release Notes](#release-notes)


Introduction
------------

Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. Such an API (also sometimes referred to as hypermedia or hypertext-driven API) typically has a root resource/endpoint, which publishes links to other resources. These resources in turn might also have, as part of their metadata, links to related resources. Sometimes you need to follow multiple consecutive links to get to the resource you want. This pattern makes it unnecessary for the client to hardcode all endpoint URLs of the API it uses, which in turn reduces the coupling between the API provider and the API consumer. This makes it easier for the API provider to change the structure of the API without breaking existing client implementations.

To follow a path of links you typically start at one URL (most often the root URL of the API), then look for the link you are interested in, fetch the document from there and repeat this process until you have reached the end of this path.

Traverson does that for you. You just need to tell Traverson where it can find the link to follow in each consecutive document and Traverson will happily execute the hops from document to document for you and when it's done, hand you the final http response or document, the one you really wanted to have in the first place.

Traverson works in Node.js and in the browser. For now, Traverson only supports JSON APIs. Support for other specialized JSON hypermedia types can be added with plug-ins (for example JSON-HAL).

Breaking Change As Of Version 1.0.0
-----------------------------------

* From version 1.0.0 onwards, support for HAL is no longer included in Traverson. instead, it has been moved to a separate plug-in. If you have used Traverson to work with HAL APIs, you will need some (trivial) changes in your code. See [Using Plug-ins](#using-plug-ins) and [traverson-hal](https://github.com/basti1302/traverson-hal).
* The properties `traverson.json` and `traverson.jsonHal` (that is, using *properties* `json`/`jsonHal` on the `traverson` object) are deprecated as of 1.0.0 (but they still work). Instead, use the methods `json()`/`jsonHal()` on the request builder object. Thus, `traverson.json.from(url)` becomes `traverson.from(url).json()` and `traverson.jsonHal.from(url)` becomes `traverson.from(url).jsonHal()`. You can also omit `json()`/`jsonHal()` completely and use content negotiation.
* See the [release notes](#release-notes) for more details on the changes in version 1.0.0.

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
* [Release Notes](#release-notes)

Installation
------------

### Node.js

    npm install traverson --save

### Browser

* If you are using npm and [Browserify](http://browserify.org/): Just `npm install traverson --save` and `require('traverson')`, then browserify your module as usual - browserify will include Traverson and its dependencies for you and also use the shims defined in Traverson's package.json's `browser` property.
* If you are using [Bower](http://bower.io): `bower install traverson --save`
* Otherwise you can grab a download from the [latest release](https://github.com/basti1302/traverson/releases/latest):
    * `traverson.min.js`: Minified build with UMD. This build can be used with an AMD loader like RequireJS or with a script tag (in which case it will register `traverson` in the global scope). **If in doubt, use this build.**
    * `traverson.js`: Non-minified build with UMD. Same as above, just larger :-)
    * `traverson.external.min.js`: Minified require/external build. Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson`. This build could be used if you use browserify but do not want to bundle Traverson with your own browserify build but keep it as a separate file.
    * `traverson.external.js`: Non-minified require/external build, same as before, just larger.

#### AngularJS

There's an [AngularJS plug-in for Traverson](https://github.com/basti1302/traverson-angular) which makes it possible to integrate the Traverson API seamlessly into an AngularJS app. If you want to use Traverson in an AngularJS app, this is the way to go.

Documentation
-------------

This section shows how to use Traverson's features, one example at a time. There is also the [API reference documentation](https://github.com/basti1302/traverson/blob/master/api.markdown).

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
{ "the_document": "that we really wanted to have", "with": "lots of interesting and valuable content", ...  }
```

### Configuring Traverson &mdash; the Request Builder Object

Calling `traverson.newRequest()` gives you a new *request builder* instance, which you can use to configure how Traverson behaves during the link traversal. The convenience method `traverson.from(url)` (which we used in the example above) also gives you a new request builder which already has the root URL of your API configured. The request builder offers a number of configuration methods to prepare the link traversal, among others:

* `from`: Sets the API root URL. (You do not need to call this if you created the request builder with `traverson.from(url)`, that is, `traverson.from(url)` is equivalent to `traverson.newRequest().from(url)`.)
* `follow`: Sets the link relations to follow.
* `withTemplateParameters`: Sets parameters for URI template resolution.
* `withRequestOptions`: Sets options for the `request` library that is used to execute HTTP requests (like special HTTP headers or OAuth stuff).

There are more configuration options available. Most are explained in more detail in the remainder of this document. A comprehensive list can be found in the [API reference documentation](https://github.com/basti1302/traverson/blob/master/api.markdown#configuration-methods).

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

Or maybe you even want to execute the last HTTP request all by yourself. The method `getUrl` has you covered. It will only execute the HTTP GET requests until it has find the final link from `follow`, but will not request the resource that this last link leads to.

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

All methods except `getResource` (that is `get`, `post`, `put`, `delete` and `patch` pass the full http response into the provided callback, so the callback's method signature always looks like `function(error, response)`.

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

More information on JSONPath can be found [here](http://goessner.net/articles/JsonPath/). Traverson uses the npm module [JSONPath](https://github.com/s3u/JSONPath) to evaluate JSONPath expressions.

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

A word of warning: When running in the browser and not in Node.js, the request library is shimmed by [SuperAgent](https://github.com/visionmedia/superagent) to shim the request module. Most request options are mapped to appropriate superagent options. If you use Traverson in the browser and you notice odd behaviour regarding `withRequestOptions`, please file an [issue](https://github.com/basti1302/traverson/issues).

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

* [HAL (application/hal+json)](),
* [Mason (application/vnd.mason+json)](),
* [Collection+JSON (application/vnd.collection+json)](http://amundsen.com/media-types/collection/),
* [Siren (application/vnd.siren+json)](https://github.com/kevinswiber/siren)
* [Uber (application/vnd.amundsen-uber+json)](https://rawgit.com/mamund/media-types/master/uber-hypermedia.html),

If you want to leverage the power of a specialized media type, you can use the concept of Traverson's media type plug-ins.

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

(Note that there currently is no MasonAdapter, this is just an example.)

#### Implementing Media Type Plug-ins

Here is an implementation stub for new Traverson media type plug-ins:

```javascript
'use strict';

function MediaTypeAdapter(log) {
  this.log = log;
}

MediaTypeAdapter.mediaType = 'application/whatever+json';

MediaTypeAdapter.prototype.findNextStep = function(doc, key) {
  // parse incoming doc to determine the next step for Traverson
  ...

  // return next step as an object
  return {
    url: ...,


  };
}
```

A media type plug-in is always a constructor function. It is passed one argument, a log object. This log object can be used by the plug-in to log messages, if required (it offers the methods `debug(message)`, `info(message)`, `warn(message)` and `error(message)`).

Every media type plug-in *should* provide a propery `mediaType` that represents the registered content type for this plug-in.

Every media type plug-in *must* provide a method `findNextStep`, which takes two parameters, `doc` and `key`. The incoming `doc` is the resource retrieved from the response of the last HTTP request. This is already a parsed JavaScript object, not raw JSON content. The `key` is the link relation that has been specified for this step in the `follow` method. The responsibility of the `findNextStep` method is to return a step object, that tells Traverson what to do next.

A step object can be as simple as this `{ url: '/next/url/to/call' }`. This would make Traverson make an HTTP request to the given URL. Some media types (like HAL) contain embeddeded resources. For those, the next step is not an HTTP request. Instead, you can put the part of `doc` that represents the embedded resource into the returned step object, like this: `{ doc: { ... } }`.

If you want to implement your own media type plug-in, having a look at the existing HAL plug-in might be helpful: <https://github.com/basti1302/traverson-hal/blob/master/index.js>

### Content Type Detection Versus Forcing Media Types

In the examples so far, we never explicitly specified the media type the API would use. Traverson usually figures that out by itself by looking at the `Content-Type` header. If the `Content-Type` header of the server's response is `application/json`, Traverson will interpret the response as a plain JSON resource. However, you can force Traverson to interpret the server's response as a certain media type.

With <code>traverson.from('http://api.example.com').<b>json()</b></code>, Traverson assumes that the API uses a generic JSON media type. The server will probably set the `Content-Type` header to `application/json`, but because we forced the media type, this is not even checked by Traverson. With the [traverson-hal](https://github.com/basti1302/traverson-hal) plug-in installed you can do <code>traverson.from('http://api.example.com').<b>jsonHal()</b></code>, to make Traverson assume that the API complies with the HAL specification. The server would probably set the `Content-Type` header to `application/hal+json`, again, this is not checked by Traverson. Finally, with <code>traverson.from('http://api.example.com').<b>setMediaType('application/whatever+json')</b></code> you can force Traverson to use an arbitrary media type (as long as a matching media type plug-in is registered).

Instead of forcing a specific media type, you can also let Traverson figure out the media by itself. Actually, as already mentioned, that is the default behaviour. Just omit the `json()`/`jsonHal()/setMediaType()` and Traverson will use the `Content-Type` header coming from the server to decide how to interpret each response. However, for each content type an appropriate media type plug-in needs to be registered. That is, if the server sets a `Content-Type` of `application/hal+json` and the HAL plug-in is registered, the response will automatically be interpreted as HAL.

Without any plug-ins, Traverson will only be able to process `application/json` and will fail if it receives a different content type header.

Content type detection happens for each request/response. If each response in a link traversal process has a different Content-Type header, Traverson will pick a different media type plug-in to process these responses.

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

The callbacks given to the action methods (`get`, `getResource`, `getUrl`, `post`, `put`, `patch`, `delete`) are actually called with one more additional parameter (that hasn't been shown in the examples so far) which represents the traversal process that has just been finished. This object `traversal` offers only one method, `continue()` which gives you a request builder instance which can be used just as the standard [request builder](https://github.com/basti1302/traverson/blob/master/api.markdown#request-builder). That is, it has the same configuration and action methods.

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

Release Notes
-------------

* 2.1.0:
    * Ability to convert response bodies to JavaScript objects at the end of the traversal is now also available for POST/PUT/PATCH/DELETE, not only for GET. ([#44](https://github.com/basti1302/traverson/issues/44), thanks to @jinder for the suggestion).
    * Improved error message when a JSONPath expression denotes a property that does not have type string; for example, if the property has type object. ([#43](https://github.com/basti1302/traverson/issues/43), thanks to @Baiteman for reporting).
* 2.0.1 2015-05-04:
    * Fixes a [bug](https://github.com/basti1302/traverson-angular/issues/11) when cloning a continued traversal (via `continue`) with `newRequest`.
* 2.0.0 2015-04-07:
    * Continue link traversals with `continue` (see [API docs](https://github.com/basti1302/traverson/blob/master/api.markdown#traversal-continue), also see GitHub issues [#7](https://github.com/basti1302/traverson/issues/7), [#24](https://github.com/basti1302/traverson/issues/24), [#40](https://github.com/basti1302/traverson/issues/40) and [traverson-hal/#4](https://github.com/basti1302/traverson-hal/issues/4)).
    * Fix for wrong resolution of URLs for HAL and root URLs with path ([#38](https://github.com/basti1302/traverson/issues/38), thanks to @xogeny)
    * Breaking changes (_probably_ irrelevant for most users):
        * The methods callback passed to `post`, `put`, `patch` and `delete` no longer receive the URL that had been visited last as their third parameter. The callback signature is now `callback(err, response, traversal)` for these methods.
* 1.2.1 2015-03-15:
    * Include browser build in npm release (for users using npm for client side packages but not using Browserify but script tags or RequireJS).
* 1.2.0 2015-03-15:
    * Huge refactoring of Traverson's internals. To the best of my knowledge, this did not break anything (the test coverage on Traverson is pretty good). You probably should take this version for a test ride before pushing it to production, though.
    * The method `getUri` has been renamed to `getUrl`. `getUri` is now deprecated, but is kept as an alias for `getUrl`.
    * The API for media type plug-ins has changed. The property `uri` in the step object that media type plug-ins return has been renamed to `url`. Media type plug-ins that return a step object with an `uri` attribute still work, but this attribute is considered to be deprecated. Support for it will be removed in version 2.0.0.
    * An undocumented behaviour has been removed: In case of an error, the callback has sometimes been called with more than one argument (the error), namely with the last response and the last URL that had been accessed before the error occured. If you relied on this behaviour, then this is a breaking change for you.
    * Added `preferEmbeddedResources()`.
* 1.1.0 2015-03-02:
    * Abort link traversals (and HTTP requests) ([#27](https://github.com/basti1302/traverson/issues/27)). This feature is to be considered experimental in this version.
    * Specify request options per step by passing in an array to `withRequestOptions` or `addRequestOptions` ([#25](https://github.com/basti1302/traverson/issues/25)).
    * Fix for subsequent error that ate the original error if a problem occured before or during the first HTTP request ([#23](https://github.com/basti1302/traverson/issues/23)).
    * Fix: Copy contentNegotiation flag correctly to cloned request builder (`newRequest()`).
    * Add methods to request builder to query the current configuration.
    * Posting with content type application/x-www-form-urlencoded works now ([#31](https://github.com/basti1302/traverson/issues/31)).
* 1.0.0 2015-02-27:
    * Media Type Plug-ins. You can now register your own media types and plug-ins to process them.
    * HAL is no longer supported by Traverson out of the box. If you want to use HAL, you now have to use the [traverson-hal](https://github.com/basti1302/traverson-hal) plug-in.
    * Traverson uses content type detection by default now. You can still force media types by calling `setMediaType` or shortcuts like `json()`/`jsonHal()` on the request builder.
    * New method `setMediaType` to force arbitrary media types (as long as a matching media type plug-in is registered).
    * New methods `json()`/`jsonHal()` as shortcuts for `setMediaType('application/json')`/`setMediaType('application/hal+json')`.
    * The properties `traverson.json` and `traverson.jsonHal` (that is, using *properties* `json`/`jsonHal` on the `traverson` object) are deprecated as of 1.0.0 (but they still work). Instead, use the methods `json()`/`jsonHal()` on the request builder object. Thus, `traverson.json.from(url)` becomes `traverson.from(url).json()` and `traverson.jsonHal.from(url)` becomes `traverson.from(url).jsonHal()`. You can also omit `json()`/`jsonHal()` completely and use content negotiation.
    * Entry points (methods on the traverson object) have been restructured (see api.markdown for details).
    * Cloning a request builder (to share configuration between link traversals) is now more explicit (method `newRequest()` on a request builder instance).
    * `del()` has been renamed to `delete()`. `del()` is kept as an alias for backward compatibility.
    * New method `addRequestOptions` to add request options (HTTP headers etc.) without resetting the ones that have been set already ([#33](https://github.com/basti1302/traverson/issues/33)) (thanks to @xogeny)
    * Lots of documenation updates. Also new [API reference documentation](https://github.com/basti1302/traverson/blob/master/api.markdown).
* 0.15.0 2014-12-06:
    * Content type detection ([#6](https://github.com/basti1302/traverson/issues/6))
* 0.14.0 2014-12-05:
    * `'link[$all]'` to retrieve the complete array of `_embedded` HAL resources instead of an individual resource ([#14](https://github.com/basti1302/traverson/issues/14))
    * Add ability to use a custom JSON parsing method ([#13](https://github.com/basti1302/traverson/issues/13))
* 0.13.0 2014-12-01:
    * Reduce size of browser build by 33%. The minified version now has 37k instead of 55k (still too much, but also much better than before)
* 0.12.0 2014-11-29:
    * Deal with cases where body comes as arg but not in response ([#19](https://github.com/basti1302/traverson/issues/19)) (thanks to @subvertnormality/@bbc-contentdiscovery)
* 0.11.0 2014-11-14:
    * Add ability to set a custom request library ([#18](https://github.com/basti1302/traverson/issues/18)) (thanks to @subvertnormality/@bbc-contentdiscovery)
* 0.10.0 2014-10-01:
    * Add query string handling for client side ([#16](https://github.com/basti1302/traverson/issues/16)) (thanks to @craigspaeth)
* 0.9.0 2014-06-27:
    *  Add HAL curie resolution ([#12](https://github.com/basti1302/traverson/issues/12))
* 0.8.3 2014-06-19:
    * Fix bower release ([#11](https://github.com/basti1302/traverson/issues/11))
* 0.8.2 2014-06-12:
    * Fix corrupted browser build ([#10](https://github.com/basti1302/traverson/issues/10))
    * Can now be installed via bower (thanks to @chadly)
* 0.8.0 2014-04-30:
    * Support absolute URLs, absolute URL paths and relative URLs ([#3](https://github.com/basti1302/traverson/issues/3))
    * Fix: Also resolve URI templates when no template params are given (makes sense for templates with optional components)
    * Fix: Now works for cases where the entry point has a pathname other than `/`. (thanks to @eins78)
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
