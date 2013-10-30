'use strict';

require(['traverson', 'lib/log'], function(traverson, log) {
    var rootUri = '/'
    //var api = traverson.json.from(rootUri)
    var api = traverson.jsonHal.from(rootUri)
    api.newRequest()
      .withRequestOptions({
        //headers: { 'accept': 'application/json' }
        headers: { 'accept': 'application/hal+json' }
      })

      // standard walk along some links
      //.walk('second', 'doc')

      // JSONPath
      //.walk('$.jsonpath.nested.key')

      // URI templates
      //.walk('uri_template')
      //.withTemplateParameters({param: 'foobar', id: 13})

      // HAL
      .walk('first', 'second', 'inside_second')

      .getResource(function(err, resource) {
        console.log('request returned')
        if (err) {
          console.log('request returned with error')
          console.error(err)
          return
        }
        console.log('request returned without error')
        console.log(resource)
  })
})
