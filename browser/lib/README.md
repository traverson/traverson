This folder contains special libraries that are used by Traverson in the browser, but are not used for Traverson on Node.js. If you use the build from the `dist` folder, you do not need the contents of this folder, because the `dist` builds already include every required library.

Here is a short description of what each subfolder contains:

* shim: Replacements for node modules that are used by Traverson but do not work or are too big for the browser. (These are written especially for Traverson and might use third party libs to do their work.)
* third-party: Third party libs used by Traverson in the browser.
