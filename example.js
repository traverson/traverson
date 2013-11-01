'use strict';

var rootUri = '/'

window.onload = function () {
  document.getElementById('general').innerHTML =
    'var rootUri = ' + rootUri + '<br/>' +
    'var jsonApi = traverson.<i>json</i>.from(rootUri)<br/>' +
    'var jsonHalApi = traverson.<i>jsonHal</i>.from(rootUri)<br/>'
};

require(['traverson', 'lib/log'], function(traverson, log) {

  var jsonApi = traverson.json.from(rootUri)
  var jsonHalApi = traverson.jsonHal.from(rootUri)

  // plain vanilla link following
  document.getElementById('plain_vanilla_request').innerHTML =
    'jsonApi.newRequest()<br/>' +
    '.withRequestOptions({<br/>' +
    '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
    '})<br/>' +
    '.walk(\'second\', \'doc\')<br/>' +
    '.getResource(function(err, resource) {<br/>' +
    '&nbsp;&nbsp;// do something with the resource...<br/>' +
    '})<br/>'
  jsonApi.newRequest()
    .withRequestOptions({
      headers: { 'accept': 'application/json' }
    })
    .walk('second', 'doc')
    .getResource(function(err, resource) {
      console.log(err)
      if (err) {
        document.getElementById('plain_vanilla_response').innerHTML =
            JSON.stringify(err)
        return
      }
      console.log(resource)
      document.getElementById('plain_vanilla_response').innerHTML =
            JSON.stringify(resource)
  })

  // JSONPath
  document.getElementById('jsonpath_request').innerHTML =
    'jsonApi.newRequest()<br/>' +
    '.withRequestOptions({<br/>' +
    '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
    '})<br/>' +
    '.walk(\'$.jsonpath.nested.key\')<br/>' +
    '.getResource(function(err, resource) {<br/>' +
    '&nbsp;&nbsp;// do something with the resource...<br/>' +
    '})<br/>'
  jsonApi.newRequest()
    .withRequestOptions({
      headers: { 'accept': 'application/json' }
    })
    .walk('$.jsonpath.nested.key')
    .getResource(function(err, resource) {
      console.log(err)
      if (err) {
        document.getElementById('jsonpath_response').innerHTML =
            JSON.stringify(err)
        return
      }
      console.log(resource)
      document.getElementById('jsonpath_response').innerHTML =
            JSON.stringify(resource)
  })

  // URI templates
  document.getElementById('uri_template_request').innerHTML =
    'jsonApi.newRequest()<br/>' +
    '.withRequestOptions({<br/>' +
    '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
    '})<br/>' +
    '.walk(\'uri_template\')<br/>' +
    '.getResource(function(err, resource) {<br/>' +
    '&nbsp;&nbsp;// do something with the resource...<br/>' +
    '})<br/>'
  jsonApi.newRequest()
    .withRequestOptions({
      headers: { 'accept': 'application/json' }
    })
    .walk('uri_template')
    .withTemplateParameters({param: 'foobar', id: 13})
    .getResource(function(err, resource) {
      console.log(err)
      if (err) {
        document.getElementById('uri_template_response').innerHTML =
            JSON.stringify(err)
        return
      }
      console.log(resource)
      document.getElementById('uri_template_response').innerHTML =
            JSON.stringify(resource)
  })

  // HAL
  document.getElementById('json_hal_request').innerHTML =
    'jsonHalApi.newRequest()<br/>' +
    '.withRequestOptions({<br/>' +
    '&nbsp;&nbsp;headers: { \'accept\': \'application/hal+json\' }<br/>' +
    '})<br/>' +
    '.walk(\'first\', \'second\', \'inside_second\')<br/>' +
    '.getResource(function(err, resource) {<br/>' +
    '&nbsp;&nbsp;// do something with the resource...<br/>' +
    '})<br/>'
  jsonHalApi.newRequest()
    .withRequestOptions({
      headers: { 'accept': 'application/hal+json' }
    })
    .walk('first', 'second', 'inside_second')
    .getResource(function(err, resource) {
      if (err) {
        document.getElementById('json_hal_response').innerHTML =
            JSON.stringify(err)
        return
      }
      document.getElementById('json_hal_response').innerHTML =
            JSON.stringify(resource)
  })
})
