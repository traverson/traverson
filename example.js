'use strict';

require(['traverson', 'lib/log'], function(traverson, log) {
    var rootUri = '/'
    var api = traverson.json.from(rootUri)
    api.newRequest()
      .withRequestOptions({
        headers: { 'accept': 'application/json' }
      })
      //.walk('second', 'doc')
      .walk('$.jsonpath.nested.key')
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
