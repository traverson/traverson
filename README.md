![Traverson Logo](https://raw.githubusercontent.com/traverson/traverson/master/misc/logo/traverson-logo.72dpi.png)

Traverson
=========

A Hypermedia API/HATEOAS Client for Node.js and the Browser
-----------------------------------------------------------

[![Node CI Workflow Status][github-actions-ci-badge]][github-actions-ci-link]
![node][node-badge]
[![NPM](https://nodei.co/npm/traverson.png?downloads=true&stars=true)](https://nodei.co/npm/traverson/)
[![Greenkeeper badge](https://badges.greenkeeper.io/traverson/traverson.svg)](https://greenkeeper.io/)

| File Size (browser build) | KB |
|---------------------------|---:|
| minified & gzipped        | 17 |
| minified                  | 61 |


Quick Links
-----------

* [Installation](https://github.com/traverson/traverson/blob/master/user-guide.markdown#installation)
* [User Guide](https://github.com/traverson/traverson/blob/master/user-guide.markdown)
* [API reference documentation](https://github.com/traverson/traverson/blob/master/api.markdown)
* [Release Notes](https://github.com/traverson/traverson/blob/master/CHANGELOG.md)
* [Contributing to Traverson](https://github.com/traverson/traverson/blob/master/CONTRIBUTING.md)
* [Code of Conduct](https://github.com/traverson/traverson/blob/master/CODE_OF_CONDUCT.md)

Introduction
------------

Traverson comes in handy when consuming REST APIs that follow the HATEOAS principle, that is, REST APIs that have links between their resources. Such an API (also sometimes referred to as hypermedia or hypertext-driven API) typically has a root resource/endpoint, which publishes links to other resources. These resources in turn might also have, as part of their metadata, links to related resources. Sometimes you need to follow multiple consecutive links to get to the resource you want. This pattern makes it unnecessary for the client to hardcode all endpoint URLs of the API it uses, which in turn reduces the coupling between the API provider and the API consumer. This makes it easier for the API provider to change the structure of the API without breaking existing client implementations.

To follow a path of links you typically start at one URL (most often the root URL of the API), then look for the link you are interested in, fetch the document from there and repeat this process until you have reached the end of this path.

Traverson does that for you. You just need to tell Traverson where it can find the link to follow in each consecutive document and Traverson will happily execute the hops from document to document for you and when it's done, hand you the final http response or document, the one you really wanted to have in the first place.

Traverson works in Node.js and in the browser. For now, Traverson only supports JSON APIs. Support for other specialized JSON hypermedia types can be added with plug-ins (for example JSON-HAL).


The most basic thing you can do with traverson is to let it start at the root URL of an API, follow some links and pass the resource that is found at the end of this journey back to you. We call this procedure a *"link traversal process"*. Here's how:

```javascript
var traverson = require('traverson');

traverson
.from('http://api.example.com')
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

The [User Guide](https://github.com/traverson/traverson/blob/master/user-guide.markdown) has a ton of examples of what else Traverson can do for you. Here are some highlights:

* resolve URI Templates
* use JSONPath
* manage headers, query strings and authentication (including OAuth)
* content type detection
* work with different media types by using plug-ins
* use a custom JSON parser
* continuing link traversals

License
-------

MIT

[github-actions-ci-link]: https://github.com/traverson/traverson/actions?query=workflow%3A%22Node.js+CI%22+branch%3Amaster

[github-actions-ci-badge]: https://github.com/traverson/traverson/workflows/Node.js%20CI/badge.svg

[node-badge]: https://img.shields.io/node/v/traverson.svg?logo=node.js