![Traverson Logo](https://raw.githubusercontent.com/traverson/traverson/master/misc/logo/traverson-logo.72dpi.png)

Traverson API
=============

This is the reference documenation for the Traverson API. It is rather technical and concise. Also see the [user guide](https://github.com/traverson/traverson/blob/master/user-guide.markdown), which explains the concepts behind Traverson in greater depths and has a lot of examples for the various features.

Traverson
---------

Traverson is all about link traversal. It is intended to be used with Hypermedia APIs, APIs that are composed of representations of linked resources. Traverson uses the link relations between the resources to find its way to the target resource. Without Traverson, your API client would have to make an HTTP request to each resource, look for the link relation you want to follow and make another HTTP request to the link behind that link relation, multiple times until you find your target resource. With Traverson, you only specify the link relations you want to follow and Traverson executes all required HTTP requests and handles the process of following the link relations. This process is called the *link traversal process* in the remainder of this document and it is the central concept of Traverson.

### Methods

This methods are available on the Traverson object - the object acquired by `var traverson = require('traverson')` or the global `traverson` object when using the browser build with a script tag.

<a name="traverson-newRequest"></a>`newRequest()`: Returns a new [request builder](#request-builder) instance.

<a name="traverson-from"></a>`from(url)`: Returns a new [request builder](#request-builder) instance with the given root URL. Thus, `traverson.from(url)` is equivalent to newRequest().from(url)`.

<a name="traverson-registerMediaType"></a>`registerMediaType(contentType, constructor)`: Registers a new media type plug-in. `contentType` should be the RFC2046 media type and `constructor` is ought to be a constructor function that can be used to create new instances of the plug-in.

### Properties

This properties are available on the Traverson object - the object acquired by `var traverson = require('traverson')` or the global `traverson` object when using the browser build with a script tag.

<a name="traverson-mediaTypes"></a>`mediaTypes`: A map of media types that can be used with `setMediaType` (see below).

<a name="traverson-errors"></a>`errors`: A map of error names that are used by Traverson. Whenever Traverson creates an `Error` object, the `name` property of the `Error` object will be set to one of the values of this map. The following error keys and values will be used:
* `HTTPError: 'HTTPError'`: When an HTTP request fails. This includes HTTP errors on an intermediate request during the traversal process.
* `InvalidArgumentError: 'InvalidArgumentError'`: When an invalid argument is passed to a Traverson method.
* `InvalidStateError: 'InvalidStateError'`: When Traverson encounters an invalid state during the traversal.
* `JSONError: 'JSONError'`: When a JSON respons can not be parsed (that is, when Traverson receives invalid JSON from in an HTTP response).
* `JSONPathError: 'JSONPathError'`: When the evaluation of a JSONPath expression against a document fails or the value referenced by a JSONPath expression is not a valid link.
* `LinkError: 'LinkError'`: When a link given to Traverson for the link traversal process can not be found or is invalid.
* `TraversalAbortedError: 'TraversalAbortedError'`: When the link traversal process is aborted by the client before it has completed.
* `UnsupportedMediaType: 'UnsupportedMediaTypeError'`: When a client tries to use a media type that is not supported.

Client code that wants to check for a particular error type is encouraged to use the pattern given in the [user guide](https://github.com/traverson/traverson/blob/master/user-guide.markdown#error-handling).

<a name="traverson-json"></a>`json`: *Deprecated* An object that only has one method, `from(url)`, which in turn creates a new [request builder](#request-builder). Use `traverson.from(url).json()` instead of `traverson.json.from(url)`. Or use `traverson.from(url)` and let Traverson figure out the media type by using the Content-Type header send by the server.

<a name="traverson-jsonHal"></a>`jsonHal`: *Deprecated* An object that only has one method, `from(url)`, which in turn creates a new [request builder](#request-builder). Use `traverson.from(url).jsonHal()` instead of `traverson.jsonHal.from(url)`. Or use `traverson.from(url)` and let Traverson figure out the media type by using the Content-Type header send by the server. The media type plug-in `traverson-hal` has to be installed for HAL support as of version 1.0.0.

Request Builder
---------------

A request builder can be obtained by `traverson.newRequest()` or `traverson.from(url)`. It is used to prepare and execute a single link traversal process. The request builder offers two types of methods: configuration methods and action methods. You can call any number of configuration methods on request builder instance to prepare the link traversal process. You can also chain configuration method calls because they return the request builder instance. When you are done configuring it is time to call one of the action methods. They tell Traverson what to do at the end of the link traversal process. In contrast to the configuration methods you must only call one of the action methods on any request builder instance and should not call a configuration methods after you have called an action method.

### Configuration Methods

<a name="builder-setMediaType"></a>`setMediaType(mediaType)`: Disables content negotiation and forces Traverson to assume the given media type when parsing and interpreting the response bodies from the server. This method returns the request builder instance to allow for method chaining. The `mediaType` parameter should be a registered media type, like `application/json`, `application/hal+json`, and so on. Some media types are available as constants via the object `traverson.mediaTypes`. A media type plug-in needs to be registered for all media types except `application/json`.

<a name="builder-json"></a>`json()`: Shortcut for `setMediaType(application/json)`. Disables content negotiation and forces Traverson to assume the media type `application/json` when parsing and interpreting the response bodies from the server. Returns the request builder instance to allow for method chaining.

<a name="builder-jsonHal"></a>`jsonHal()`: Shortcut for `setMediaType(application/hal+json)`. Disables content negotiation and forces Traverson to assume the media type `application/hal+json` when parsing and interpreting the response bodies from the server. The media type plug-in `traverson-hal` has to be installed for HAL support as of version 1.0.0. This method returns the request builder instance to allow for method chaining.

<a name="builder-useContentNegotiation"></a>`useContentNegotiation()`: Enables content negotiation, that is, the server's response bodies are parsed and interpreted according to the Content-Type header. This is the default behaviour. Calling `useContentNegotiation` reverses the effect of a former call to `setMediaType`, `json` or `jsonHal`. This method returns the request builder instance to allow for method chaining.

<a name="builder-disableAutoHeaders"></a>`disableAutoHeaders()`: Disables automatic Accept and Content-Type headers. See `useAutoHeaders()`.

<a name="builder-enableAutoHeaders"></a>`enableAutoHeaders()`: Enables automatic Accept and Content-Type headers. See `useAutoHeaders()`.

<a name="builder-useAutoHeaders"></a>`useAutoHeaders(flag)`: Enables or disables
automatic headers. With automatic headers enabled,
traverson will set default Accept and the Content-Type headers for HTTP
requests, unless you provide these headers explicitly with withRequestOptions
or addRequestOptions.

The header values depend on the media type (see setMediaType()). For example,
for plain vanilla JSON (that is, when using setMediaType('application/json')
or the corresponding shortcut .json()), both headers will be send with the
value 'application/json'. For HAL (that is, when using
setMediaType('application/hal+json') or the corresponding shortcut
jsonHal()), both headers will be send with the value 'application/hal+json'.

If the method is called without arguments (or the first argument is undefined
or null), automatic headers are turned on, otherwise the argument is
interpreted as a boolean flag. If it is a truthy value, auto headers
are enabled, if it is a falsy value (but not null or undefined), auto headers
are disabled.

A note about the condition "unless you provide these headers explicitly with
withRequestOptions or addRequestOptions" in the first paragraph: Traverson
with automatic headers enabled will only check for the header option
"Accept" and "Content-Type", not for "accept" or "Content-type" or any other
variation regarding upper case/lower case letters. So to be on the safe
side, if you mix auto headers with explicitly specified headers, make sure
to specify your explicit headers with this exact same combination of upper
case and lower case letters.

<a name="builder-linkHeader"></a>`linkHeader()`: It establishes that the links that are going to follow come from the server's response header `Link`.

<a name="builder-from"></a>`from(url)`: Set the root URL of the API, that is, where the link traversal begins. If you created the request builder instance with `traverson.from(url)` you don't need to call `from` on the request builder instance. This method returns the request builder instance to allow for method chaining.

<a name="builder-follow"></a>`follow(links)`: Provides the list of link relations to follow. Multiple strings can be used as well as an array of strings. For multiple consecutive calls to `follow` the arguments of all calls are aggregated into a single list of links.

That is all of the following snippets are equivalent:
```
.follow('one', 'two', 'three')
```

```
.follow(['one', 'two', 'three'])
```

```
.follow('one', 'two').follow('three')
```

```
.follow(['one', 'two']).follow('three')
```
This method returns the request builder instance to allow for method chaining.

<a name="builder-walk"></a>`walk(links)`: A deprecated alias for `follow`. Returns the request builder instance to allow for method chaining.

<a name="builder-follow-location-header"></a>`followLocationHeader()`: Similar to calling `follow` with a single link, this adds one step to the link traversal but in contrast to `follow('link')`, this will not look for a link in the body but use the URL from `Location` HTTP header for the next step. Returns the request builder instance to allow for method chaining.

<a name="builder-withTemplateParameters"></a>`withTemplateParameters(parameters)`: Provide template parameters for URI template substitution. Returns the request builder instance to allow for method chaining.

<a name="builder-withRequestOptions"></a>`withRequestOptions(options)`: Provide options for HTTP requests (additional HTTP headers, for example). This function resets any request options, that had been set previously, that is, multiple calls to `withRequestOptions` are not cumulative. Use `addRequestOptions` to add request options in a cumulative way.

Options can either be passed as an object or an array. If an object is passed, the options will be used for each HTTP request. If an array is passed, each element should be an options object and the first array element will be used for the first request, the second element for the second request and so on. `null` elements are allowed. Traverson (on node.js) uses the [request](https://github.com/request/request) internally to execute HTTP requests and this method just exposes the configuration options of request. Refer to the [request documentation about the options object](https://github.com/request/request#requestoptions-callback) for possible configuration options. Among the most common configuration parameters you might want to use are `headers` (additional HTTP headers, `qs` (query parameters), `auth`, `oauth`).

A word of warning: When running in the browser and not in Node.js, the request library is shimmed by [SuperAgent](https://github.com/visionmedia/superagent) to shim the request module. Most request options are mapped to appropriate superagent options including [withCredentials()](https://visionmedia.github.io/superagent/#cors) from CORS. If you use Traverson in the browser and you notice odd behaviour regarding `withRequestOptions`, please file an [issue](https://github.com/traverson/traverson/issues).

Returns the request builder instance to allow for method chaining.

<a name="builder-addRequestOptions"></a>`addRequestOptions(options)`: Adds options for HTTP requests (additional HTTP headers, for example) on top of existing options, if any. To reset all request options and set new ones without keeping the old ones, you can use `withRequestOptions`.  Refer to `withRequestOptions` to see which options can be passed.

Options can either be passed as an object or an array. If an object is passed, the options will be used for each HTTP request. If an array is passed, each element should be an options object and the first array element will be used for the first request, the second element for the second request and so on. null elements are allowed.

When called after a call to `withRequestOptions` or when combining multiple `addRequestOptions` calls, some with objects and some with arrays, a multitude of interesting situations can occur:

1. The existing request options are an object and the new options passed into this method are also an object. Outcome: Both objects are merged and all options are applied to all requests.
1. The existing options are an array and the new options passed into this method are also an array. Outcome: Each array element is merged individually.  The combined options from the n-th array element in the existing options array and the n-th array element in the given array are applied to the n-th request.
1. The existing options are an object and the new options passed into this method are an array. Outcome: A new options array will be created. For each element, a clone of the existing options object will be merged with an element from the given options array.
Note that if the given array has less elements than the number of steps in the link traversal (usually the number of steps is derived from the number of link relations given to the follow method), only the first n http requests will use options at all, where n is the number of elements in the given array. HTTP request n + 1 and all following HTTP requests will use an empty options object. This is due to the fact, that at the time of creating the new options array, we can not know with certainty how many steps the link traversal will have.
1. The existing options are an array and the new options passed into this method are an object. Outcome: A clone of the given options object will be merged into into each array element of the existing options.

Returns the request builder instance to allow for method chaining.

<a name="builder-withRequestLibrary"></a>`withRequestLibrary(request)`: Injects a custom request library. Returns the request builder instance to allow for method chaining.

<a name="builder-parseResponseBodiesWith"></a>`parseResponseBodiesWith(parser)`: Injects a custom JSON parser. Returns the request builder instance to allow for method chaining.

<a name="builder-convertResponseToObject"></a>`convertResponseToObject(flag)`: With this option enabled, the body of the response at the end of the traversal will be converted into a JavaScript object (for example by passing it into JSON.parse) and passing the resulting object into the callback. The default is false, which means the full response is handed to the callback.

When response body conversion is enabled, you will not get the full response, so you won't have access to the HTTP status code or headers. Instead only the converted object will be passed into the callback.

Note that the body of any intermediary responses during the traversal is always converted by Traverson (to find the next link).

If the method is called without arguments (or the first argument is undefined or null), response body conversion is switched on, otherwise the argument is interpreted as a boolean flag. If it is a truthy value, response body
conversion is switched to on, if it is a falsy value (but not null or undefined), response body conversion is switched off.


<a name="builder-resolveRelative"></a>`resolveRelative(flag)`: Switches URL resolution to relative (default is absolute). This is for relative URL paths, that is, URLs that omit the protocol (http/https), but start with a slash and that need to be interpreted relative to the current location. Example: If the root URL is `https://api.example.com/home` and the first link contains `/customers/1302` this would usually (without `resolveRelative()`) be resolved to `https://api.example.com/customers/1302`. If this has a link `/orders`, this would be resolved to `https://api.example.com/orders`. When `resolveRelative()` has been called on the request builder instance, the URLs will be resolved differently: From `https://api.example.com/home` the link `/customers/1302` will be resolved to `https://api.example.com/home/customers/1302`. From there, the link `/orders` will be resolved to `https://api.example.com/home/customers/1302/orders`. This feature should be rarely needed. This method returns the request builder instance to allow for method chaining.

If the method is called without arguments (or the first argument is undefined or null), URL resolution is switched to relative, otherwise the argument is interpreted as a boolean flag. If it is a truthy value, URL resolution is switched to relative, if it is a falsy value, URL resolution is switched to absolute.

<a name="builder-preferEmbeddedResources"></a>`preferEmbeddedResources(flag)`: Makes Traverson prefer embedded resources over traversing a link or vice versa. This only applies to media types which support embedded resources (like HAL). It has no effect when using a media type that does not support embedded resources.

It also only takes effect when a resource contains both a link _and_ an embedded resource with the name that is to be followed at this step in the link traversal process.

If the method is called without arguments (or the first argument is undefined or null), embedded resources will be preferred over fetching linked resources with an additional HTTP request. Otherwise the argument is interpreted as a boolean flag. If it is a truthy value, embedded resources will be preferred, if it is a falsy value, traversing the link relation will be preferred.

<a name="builder-newRequest"></a>`newRequest()`: Returns a clone of the request builder with the same configuration. This method can be called before or after any of the action methods. All configuration options that have been set on the original request builder will also be set on the returned instance, with the exception of the parameter(s) given to the `follow` method which are not copied to the new instance. Also, if an action method has called before calling `newRequest()` on the original request builder, no state from the execution of the action method will be known to the new request builder instance.

<a name="builder-"></a>`getMediaType()`:  Returns the current media type. If no media type is enforced but content type detection is used, the string `content-negotiation` is returned.

<a name="builder-getFrom"></a>`getFrom()`: Returns the URL set by the `from(url)` method, that is, the root URL of the API.

<a name="builder-getTemplateParameters"></a>`getTemplateParameters()`: Returns the template parameters set by the `withTemplateParameters`.

<a name="builder-getRequestOptions"></a>`getRequestOptions()`: Returns the request options set by the `withRequestOptions` or `addRequestOptions`.

<a name="builder-getRequestLibrary"></a>`getRequestLibrary()`: Returns the custom request library instance set by `withRequestLibrary` or the standard request library instance, if a custom one has not been set.

<a name="builder-getJsonParser"></a>`getJsonParser()`: Returns the custom JSON parser function set by `parseResponseBodiesWith` or the standard parser function, if a custom one has not been set.

<a name="builder-convertsResponseToObject"></a>`convertsResponseToObject()`: Returns true if the body of the last response will be converted to a JavaScript before passing the result back to the callback.

<a name="builder-doesResolveRelative"></a>`doesResolveRelative`: Returns the flag controlling if URLs are resolved relative or absolute. A return value of `true` means that URLs are resolved relative, `false` means absolute.

### Action Methods

Calling one of this methods finishes the configuration phase and starts the link traversal process. The link traversal process works exactly the same for each of the action methods, with the exception of the last request and how the response of the last response is processed before handing it back to the callback.

Exactly one of this methods should be called after calling zero or more configuration methods. Once one of these methods has been called, the request builder instance should not be used anymore.

Each action method returns a handle for the link traversal process, which can be used to abort the link traversal (see below).

<a name="builder-getResource"></a>`getResource(callback)`: This method is what you probably want to call if you want to retrieve information from the remote API. It will parse the JSON body from the last HTTP response and pass the resulting JavaScript object to your callback. The callback signature is `callback(err, resource, traversal)`.

<a name="builder-get"></a>`get(callback)`: This method is similar to `getResource`, but it does not parse the HTTP response body for you. Instead, it gives you the response object, including the HTTP status code and the raw body. The callback signature is `callback(err, response, traversal)`.

<a name="builder-getUrl"></a>`getUrl(callback)`: This method is similar to `getResource` and `get`, but it will actually not execute the last HTTP request in the link traversal process. Instead it will pass the URL it has discovered for the last HTTP request back to the client so that the client can execute the HTTP request itself. The callback signature is `callback(err, url, traversal)`. URI template resolution will take place before the URL is returned to your callback. So if the last URL is actually a template, make sure to provide the required template parameters via [`withTemplateParameters`](https://github.com/traverson/traverson/blob/master/api.markdown#builder-withTemplateParameters).

<a name="builder-getUri"></a>`getUri(callback)`: An alias for `getUrl`.

<a name="builder-post"></a>`post(body, callback)`: Instead of sending a GET request to the last URL in the link traversal process, Traverson will send a POST request with the given `body`. The callback signature is `callback(err, response, traversal)`.

<a name="builder-put"></a>`put(body, callback)`: Instead of sending a GET request to the last URL in the link traversal process, Traverson will send a PUT request with the given `body`. The callback signature is `callback(err, response, traversal)`.

<a name="builder-patch"></a>`patch(body, callback)`: Instead of sending a GET request to the last URL in the link traversal process, Traverson will send a PATCH request with the given `body`. The callback signature is `callback(err, response, traversal)`.

<a name="builder-delete"></a>`delete(callback)`: Instead of sending a GET request to the last URL in the link traversal process, Traverson will send a DELETE request. The callback signature is `callback(err, response, traversal)`.

<a name="builder-del"></a>`del(callback)`: An alias for `delete`.

The handle returned from these methods only has one method:

<a name="handle-abort"></a>`abort()`: Aborts the current link traversal. If a HTTP request is in progress, this request is also aborted. The callback given to the action method is called with an error with the message `Link traversal process has been aborted.`.

The parameter `traversal` that is passed to the callbacks given to the action methods is an object with only one method, `traversal.continue()`:

<a name="traversal-continue"></a>`continue()`: Returns a request builder that can be used to continue the traversal process right where it finished (that is, at the last URL/resource the former traversal promise visited).
