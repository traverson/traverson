After a full build, this folder contains the browserified single-file builds that can be used in the browser in production.

* traverson.js: Standalone with UMD, not minified. Can be used by script tag or with an AMD module loader.
* traverson.min.js: Standalone with UMD, minified. Can be used by script tag or with an AMD module loader.
* traverson.external.js: Created with browserify's `--require` parameter and intended to be used (required) from other browserified modules, which were created with `--external traverson`. Not minified.
* traverson.external.min.js: Same as above, but minified.
