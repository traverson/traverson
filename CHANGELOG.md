## [7.0.1](https://github.com/traverson/traverson/compare/v7.0.0...v7.0.1) (2020-06-05)


### Bug Fixes

* **browser:** included the browser files in the published package ([904efb2](https://github.com/traverson/traverson/commit/904efb24134bb0e0963525eb71bd0b3dde2f9517)), closes [#157](https://github.com/traverson/traverson/issues/157)

# [7.0.0](https://github.com/traverson/traverson/compare/v6.1.1...v7.0.0) (2020-02-28)


### Bug Fixes

* **build:** split the gruntfile to enable running the build separately ([c487b18](https://github.com/traverson/traverson/commit/c487b181179274a3e6f25c3a599561835c21acfd))
* **dependencies:** bumped to the latest version of several packages ([f03ef4b](https://github.com/traverson/traverson/commit/f03ef4b1b3075695c15ae839942f52dfd0462202))


### Build System

* **node-version:** dropped support for node v8, which has reached EOL ([14b6b44](https://github.com/traverson/traverson/commit/14b6b44c35def0f80765a033f5e15fb3db66e163))


### chore

* **engines:** defined `engines` to match tested node versions ([6f0f108](https://github.com/traverson/traverson/commit/6f0f108a9e555a500d5edf1490c7c0a73c1eaa1a))


### Code Refactoring

* limited the files included in the build to minimum required ([b59a7b3](https://github.com/traverson/traverson/commit/b59a7b320d6cc443a2a346c52769c567f8a7a844))


### Continuous Integration

* **node-versions:** stopped building against unsupported node versions ([b36aa83](https://github.com/traverson/traverson/commit/b36aa83d142d1fe5e94241579019eb5f435f7d22))
* **publish:** dropped bower support ([2915d6d](https://github.com/traverson/traverson/commit/2915d6dd1b8f00ad85a22e098bd888fe1dd4467f))


### BREAKING CHANGES

* limited the published files to those used by the public api. use of private files
could break with this change
* **node-version:** node v8 has reached EOL and is no longer supported
* **engines:** the engines property now limits supported node versions to v8 and above
* **publish:** bower is being dropped as a supported platform
* **node-versions:** dropped support for end-of-life'ed versions of node

# [7.0.0-alpha.7](https://github.com/traverson/traverson/compare/v7.0.0-alpha.6...v7.0.0-alpha.7) (2020-02-21)


### Code Refactoring

* limited the files included in the build to minimum required ([b59a7b3](https://github.com/traverson/traverson/commit/b59a7b320d6cc443a2a346c52769c567f8a7a844))


### BREAKING CHANGES

* limited the published files to those used by the public api. use of private files
could break with this change

# [7.0.0-alpha.6](https://github.com/traverson/traverson/compare/v7.0.0-alpha.5...v7.0.0-alpha.6) (2020-02-11)


### Build System

* **node-version:** dropped support for node v8, which has reached EOL ([14b6b44](https://github.com/traverson/traverson/commit/14b6b44c35def0f80765a033f5e15fb3db66e163))


### BREAKING CHANGES

* **node-version:** node v8 has reached EOL and is no longer supported

# [7.0.0-alpha.5](https://github.com/traverson/traverson/compare/v7.0.0-alpha.4@alpha...v7.0.0-alpha.5@alpha) (2019-06-15)


### chore

* **engines:** defined `engines` to match tested node versions ([6f0f108](https://github.com/traverson/traverson/commit/6f0f108))


### BREAKING CHANGES

* **engines:** the engines property now limits supported node versions to v8 and above

# [7.0.0-alpha.4](https://github.com/traverson/traverson/compare/v7.0.0-alpha.3@alpha...v7.0.0-alpha.4@alpha) (2019-06-15)


### Bug Fixes

* **build:** split the gruntfile to enable running the build separately ([c487b18](https://github.com/traverson/traverson/commit/c487b18))

# [7.0.0-alpha.3](https://github.com/traverson/traverson/compare/v7.0.0-alpha.2@alpha...v7.0.0-alpha.3@alpha) (2019-06-15)


### Bug Fixes

* **dependencies:** bumped to the latest version of several packages ([f03ef4b](https://github.com/traverson/traverson/commit/f03ef4b))

# [7.0.0-alpha.2](https://github.com/traverson/traverson/compare/v7.0.0-alpha.1@alpha...v7.0.0-alpha.2@alpha) (2019-06-15)


### Continuous Integration

* **publish:** dropped bower support ([2915d6d](https://github.com/traverson/traverson/commit/2915d6d))


### BREAKING CHANGES

* **publish:** bower is being dropped as a supported platform

# [7.0.0-alpha.1](https://github.com/traverson/traverson/compare/v6.1.1...v7.0.0-alpha.1@alpha) (2019-06-15)


### Continuous Integration

* **node-versions:** stopped building against unsupported node versions ([b36aa83](https://github.com/traverson/traverson/commit/b36aa83))


### BREAKING CHANGES

* **node-versions:** dropped support for end-of-life'ed versions of node

Release Notes
-------------

* 0.0.1 2013-10-02: Initial release
* 0.1.0 2013-10-11:
    * New fluent API
    * Add `get`, `post`, `put`, `patch` and `delete`
* 0.2.0 2013-10-25:
    * Support for hypertext application language (HAL)
    * Add `getUri`
    * Add `withRequestOptions`
* 0.2.1 2013-10-25:
    * Documentation fixes
* 0.3.0 2013-11-17:
    * Browser build in addition to Node.js module (by browserify)
* 0.4.0 2013-11-21:
    * Use Halfred instead of Halbert to parse HAL to reduce size of browser build.
* 0.5.0 2013-11-23:
    * Make individual elements of HAL link arrays and embedded arrays available by using array indexing notation
* 0.6.0 2013-11-25:
    * Further reduce browserified size
* 0.7.0 2013-12-05:
    * Select HAL links by secondary key
* 0.8.0 2014-04-30:
    * Support absolute URLs, absolute URL paths and relative URLs ([#3](https://github.com/traverson/traverson/issues/3))
    * Fix: Also resolve URI templates when no template params are given (makes sense for templates with optional components)
    * Fix: Now works for cases where the entry point has a pathname other than `/`. (thanks to @eins78)
* 0.8.2 2014-06-12:
    * Fix corrupted browser build ([#10](https://github.com/traverson/traverson/issues/10))
    * Can now be installed via bower (thanks to @chadly)
* 0.8.3 2014-06-19:
    * Fix bower release ([#11](https://github.com/traverson/traverson/issues/11))
* 0.9.0 2014-06-27:
    *  Add HAL curie resolution ([#12](https://github.com/traverson/traverson/issues/12))
* 0.10.0 2014-10-01:
    * Add query string handling for client side ([#16](https://github.com/traverson/traverson/issues/16)) (thanks to @craigspaeth)
* 0.11.0 2014-11-14:
    * Add ability to set a custom request library ([#18](https://github.com/traverson/traverson/issues/18)) (thanks to @subvertnormality/@bbc-contentdiscovery)
* 0.12.0 2014-11-29:
    * Deal with cases where body comes as arg but not in response ([#19](https://github.com/traverson/traverson/issues/19)) (thanks to @subvertnormality/@bbc-contentdiscovery)
* 0.13.0 2014-12-01:
    * Reduce size of browser build by 33%. The minified version now has 37k instead of 55k (still too much, but also much better than before)
* 0.14.0 2014-12-05:
    * `'link[$all]'` to retrieve the complete array of `_embedded` HAL resources instead of an individual resource ([#14](https://github.com/traverson/traverson/issues/14))
    * Add ability to use a custom JSON parsing method ([#13](https://github.com/traverson/traverson/issues/13))
* 0.15.0 2014-12-06:
    * Content type detection ([#6](https://github.com/traverson/traverson/issues/6))
* 1.0.0 2015-02-27:
    * Media Type Plug-ins. You can now register your own media types and plug-ins to process them.
    * HAL is no longer supported by Traverson out of the box. If you want to use HAL, you now have to use the [traverson-hal](https://github.com/traverson/traverson-hal) plug-in.
    * Traverson uses content type detection by default now. You can still force media types by calling `setMediaType` or shortcuts like `json()`/`jsonHal()` on the request builder.
    * New method `setMediaType` to force arbitrary media types (as long as a matching media type plug-in is registered).
    * New methods `json()`/`jsonHal()` as shortcuts for `setMediaType('application/json')`/`setMediaType('application/hal+json')`.
    * The properties `traverson.json` and `traverson.jsonHal` (that is, using *properties* `json`/`jsonHal` on the `traverson` object) are deprecated as of 1.0.0 (but they still work). Instead, use the methods `json()`/`jsonHal()` on the request builder object. Thus, `traverson.json.from(url)` becomes `traverson.from(url).json()` and `traverson.jsonHal.from(url)` becomes `traverson.from(url).jsonHal()`. You can also omit `json()`/`jsonHal()` completely and use content negotiation.
    * Entry points (methods on the traverson object) have been restructured (see api.markdown for details).
    * Cloning a request builder (to share configuration between link traversals) is now more explicit (method `newRequest()` on a request builder instance).
    * `del()` has been renamed to `delete()`. `del()` is kept as an alias for backward compatibility.
    * New method `addRequestOptions` to add request options (HTTP headers etc.) without resetting the ones that have been set already ([#33](https://github.com/traverson/traverson/issues/33)) (thanks to @xogeny)
    * Lots of documenation updates. Also new [API reference documentation](https://github.com/traverson/traverson/blob/master/api.markdown).
* 1.1.0 2015-03-02:
    * Abort link traversals (and HTTP requests) ([#27](https://github.com/traverson/traverson/issues/27)). This feature is to be considered experimental in this version.
    * Specify request options per step by passing in an array to `withRequestOptions` or `addRequestOptions` ([#25](https://github.com/traverson/traverson/issues/25)).
    * Fix for subsequent error that ate the original error if a problem occured before or during the first HTTP request ([#23](https://github.com/traverson/traverson/issues/23)).
    * Fix: Copy contentNegotiation flag correctly to cloned request builder (`newRequest()`).
    * Add methods to request builder to query the current configuration.
    * Posting with content type application/x-www-form-urlencoded works now ([#31](https://github.com/traverson/traverson/issues/31)).
* 1.2.0 2015-03-15:
    * Huge refactoring of Traverson's internals. To the best of my knowledge, this did not break anything (the test coverage on Traverson is pretty good). You probably should take this version for a test ride before pushing it to production, though.
    * The method `getUri` has been renamed to `getUrl`. `getUri` is now deprecated, but is kept as an alias for `getUrl`.
    * The API for media type plug-ins has changed. The property `uri` in the step object that media type plug-ins return has been renamed to `url`. Media type plug-ins that return a step object with an `uri` attribute still work, but this attribute is considered to be deprecated. Support for it will be removed in version 2.0.0.
    * An undocumented behaviour has been removed: In case of an error, the callback has sometimes been called with more than one argument (the error), namely with the last response and the last URL that had been accessed before the error occured. If you relied on this behaviour, then this is a breaking change for you.
    * Added `preferEmbeddedResources()`.
* 1.2.1 2015-03-15:
    * Include browser build in npm release (for users using npm for client side packages but not using Browserify but script tags or RequireJS).
* 2.0.0 2015-04-07:
    * Continue link traversals with `continue` (see [API docs](https://github.com/traverson/traverson/blob/master/api.markdown#traversal-continue), also see GitHub issues [#7](https://github.com/traverson/traverson/issues/7), [#24](https://github.com/traverson/traverson/issues/24), [#40](https://github.com/traverson/traverson/issues/40) and [traverson-hal/#4](https://github.com/traverson/traverson-hal/issues/4)).
    * Fix for wrong resolution of URLs for HAL and root URLs with path ([#38](https://github.com/traverson/traverson/issues/38), thanks to @xogeny)
    * Breaking changes (_probably_ irrelevant for most users):
        * The methods callback passed to `post`, `put`, `patch` and `delete` no longer receive the URL that had been visited last as their third parameter. The callback signature is now `callback(err, response, traversal)` for these methods.
* 2.0.1 2015-05-04:
    * Fixes a [bug](https://github.com/traverson/traverson-angular/issues/11) when cloning a continued traversal (via `continue`) with `newRequest`.
* 2.1.0 2015-08-27:
    * Ability to convert response bodies to JavaScript objects at the end of the traversal is now also available for `post()/put()/patch()/delete()` via configuration method `convertResponseToObject()`, not only for `get()`. ([#44](https://github.com/traverson/traverson/issues/44), thanks to @jinder for the suggestion).
    * Improved error message when a JSONPath expression denotes a property that does not have type string; for example, if the property has type object. ([#43](https://github.com/traverson/traverson/issues/43), thanks to @Baiteman for reporting).
* 3.0.0 2015-09-15:
    * *Breaking change* for media type plug-ins: the API for media type plug-ins has changed. The `findNextStep` method takes different parameters now:
    `XyzAdapter.prototype.findNextStep = function(t, link) { ... }` where `t` represents the link traversal process and `link` is always an object that represents what to do in the next step in the traversal. See [Implementing Media Type Plug-ins](https://github.com/traverson/traverson/blob/master/user-guide.markdown#implementing-media-type-plug-ins) in the user guide for details.
    * *Breaking change*: Multiple consecutive calls to `follow(...)` for the same traversal now add links to the list of link relations instead of overwriting the old list with a new list. This is probably irrelevant because until now, there was no reason to call follow multiple times for one traversal.
    * Ability to follow the location header instead of a link relation in the body, method `followLocationHeader` ([#45](https://github.com/traverson/traverson/issues/45), thanks to @xogeny for the idea)
* 3.1.0 2015-11-10:
    * Support for setting `withCrendentials` flag on XHR object (only in browser) ([#48](https://github.com/traverson/traverson/issues/48), thanks to @ricardoecosta)
* 3.1.1 2015-12-21:
    * Update from JSONPath 0.10 to jsonpath-plus 0.13. (See [traverson-angular/#20](https://github.com/traverson/traverson-angular/issues/20))
* 3.1.2 2016-01-22:
    * Fix `Cannot read property 'step' of undefined` in case a step of the traversal can not be processed ([#52](https://github.com/traverson/traverson/issues/52)).
* 3.1.3 2016-02-01:
    * Do not mutate original link array ([#53](https://github.com/traverson/traverson/issues/53), thanks to @dimik).
* 3.2.0 2016-09-02:
    * Fix: Do not discard `requestOption` of type `function`.
      ([#65](https://github.com/traverson/traverson/issues/65), thanks to @JulienYo)
    * Support for jsonReplacer and jsonReviver in `requestOption` (in Node.js, this is not supported by Traverson in the browser)
      ([#68](https://github.com/traverson/traverson/issues/68) and
       [#69](https://github.com/traverson/traverson/issues/69),
       thanks to @JulienYo)
* 5.0.0 2016-12-20:
    * Drop support for Node.js 0.10 and 0.12. Node.js versions 4 to 7 are tested and officially supported.
    * All `Error` objects created by Traverson now have the `name` property set, see [API docs on error names](https://github.com/traverson/traverson/blob/master/api.markdown#traverson-errors). ([traverson-hal/#21](https://github.com/traverson/traverson-hal/issues/21) and [traverson-hal/#22](https://github.com/traverson/traverson-hal/issues/22), thanks to @mimol91)
    * Remark: There is no version 4.x of Traverson. We skipped from version 3.x to 5.0.0 to align version numbers of Traverson and traverson-hal.
* 6.0.0 2017-02-10:
    * *Breaking change*: Traverson now sets `Accept` and `Content-Type` headers automatically when the media type has been set explicitly ([#37](https://github.com/traverson/traverson/issues/37)). This might be a breaking change for users that
        * *do* set the media type via `.setMediaType('...')`, `.json()` or `.jsonHal()`,
        * *do not* set headers explicitly (via `.withRequestOptions` or `.addRequestOptions`) and
        * whose backends do not cope well when `Accept` and/or `Content-Type` headers are set to `application/json` or `application/hal+json` respectively.
    * Support for link headers ([#84](https://github.com/traverson/traverson/issues/84) and [#85](https://github.com/traverson/traverson/pull/85), thanks to @iunanua and @anderruiz)
    * Fix an error where content negotiation would fail with the wrong error message when receiving an unknown media type ([#82](https://github.com/traverson/traverson/issues/82), thanks to @Malax for the report and the analysis)
* 6.0.1 2017-02-10:
    * Reduce file size of browser build ([#86](https://github.com/traverson/traverson/pull/86), [#87](https://github.com/traverson/traverson/pull/87), thanks to @iunanua).
* 6.0.2 2017-04-05:
    * Fix bogus character in source code breaking browserify build ([#94](https://github.com/traverson/traverson/pull/94), thanks to @simon-scherzinger).
* 6.0.3 2017-04-21:
    * Allow falsy values as payload in HTTP POST/PUT/PATCH requests ([#95](https://github.com/traverson/traverson/issues/95)).
* 6.0.4 2018-07-19:
    * Update to latest version of `request` ([#104](https://github.com/traverson/traverson/pull/104), thanks to @travi).
* 6.1.0 2018-09-10:
    * Add option `sendRawPayload` to skip payload stringification for non-JSON MIME types ([#103](https://github.com/traverson/traverson/issues/103).
* 6.1.1 2018-09-14:
    * Enable usage of Traverson in React Native (without JSONPath support) ([#114](https://github.com/traverson/traverson/pull/114), thanks to @simon-scherzinger)
    * Fix wrong HTTP method in error message for convertResponseToObject case.
