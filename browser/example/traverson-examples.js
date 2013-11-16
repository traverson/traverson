'use strict';

(function() {
  var rootUri = '/'

  var jsonApi = traverson.json.from(rootUri)
  var jsonHalApi = traverson.jsonHal.from(rootUri)

  function executeAllRequests() {
    ['#plain_vanilla_response',
     '#jsonpath_response',
     '#uri_template_response',
     '#json_hal_response'].forEach(function(div) {
      $(div).html('<img src="assets/spinner.gif"/>')
    })
    executePlainVanillaRequest()
    executeJsonPathRequest()
    executeUriTemplateRequest()
    executeHalRequest()
  }

  // plain vanilla link following
  function executePlainVanillaRequest() {
    $('#plain_vanilla_response').html('<img src="assets/spinner.gif"/>')
    jsonApi
        .newRequest()
        .withRequestOptions({ headers: { 'accept': 'application/json' } })
        .follow('second', 'doc')
        .getResource(function(err, resource) {
      if (err) {
        $('#plain_vanilla_response').html(JSON.stringify(err))
        return
      }
      $('#plain_vanilla_response').html(JSON.stringify(resource, null, 2))
    })
  }

  // JSONPath
  function executeJsonPathRequest() {
    $('#jsonpath_response').html('<img src="assets/spinner.gif"/>')
    jsonApi
        .newRequest()
        .withRequestOptions({ headers: { 'accept': 'application/json' } })
        .follow('$.jsonpath.nested.key')
        .getResource(function(err, resource) {
      if (err) {
        $('#jsonpath_response').html(JSON.stringify(err))
        return
      }
      $('#jsonpath_response').html(JSON.stringify(resource, null, 2))
    })
  }

  // URI templates
  function executeUriTemplateRequest() {
    $('#uri_template_response').html('<img src="assets/spinner.gif"/>')
    jsonApi
        .newRequest()
        .withRequestOptions({ headers: { 'accept': 'application/json' } })
        .follow('uri_template')
        .withTemplateParameters({param: 'foobar', id: 13})
        .getResource(function(err, resource) {
      if (err) {
        $('#uri_template_response').html(JSON.stringify(err))
        return
      }
      $('#uri_template_response').html(JSON.stringify(resource, null, 2))
    })
  }

  // HAL
  function executeHalRequest() {
    $('#json_hal_response').html('<img src="assets/spinner.gif"/>')
    jsonHalApi
        .newRequest()
        .withRequestOptions({ headers: { 'accept': 'application/hal+json' } })
        .follow('first', 'second', 'inside_second')
        .getResource(function(err, resource) {
      if (err) {
        $('#json_hal_response').html(JSON.stringify(err))
        return
      }
      $('#json_hal_response').html(JSON.stringify(resource, null, 2))
    })
  }

  $(document).ready(function () {
    $('#btn-all').on('click', executeAllRequests)
    $('#btn-plain-vanilla').on('click', executePlainVanillaRequest)
    $('#btn-jsonpath').on('click', executeJsonPathRequest)
    $('#btn-uri-template').on('click', executeUriTemplateRequest)
    $('#btn-hal').on('click', executeHalRequest)
    $('#general').html(
      'var rootUri = \'' + rootUri + '\'<br/>' +
      'var jsonApi = traverson.<i>json</i>.from(rootUri)<br/>' +
      'var jsonHalApi = traverson.<i>jsonHal</i>.from(rootUri)<br/>'
    )

    // plain vanilla link following
    $('#plain_vanilla_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'second\', \'doc\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    )

    // JSONPath
    $('#jsonpath_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'$.jsonpath.nested.key\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    )

    // URI templates
    $('#uri_template_request').html(
      'jsonApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/json\' }<br/>' +
      '})<br/>' +
      '.follow(\'uri_template\')<br/>' +
      '.withTemplateParameters({param: \'foobar\', id: 13})<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    )

    // HAL
    $('#json_hal_request').html(
      'jsonHalApi.newRequest()<br/>' +
      '.withRequestOptions({<br/>' +
      '&nbsp;&nbsp;headers: { \'accept\': \'application/hal+json\' }<br/>' +
      '})<br/>' +
      '.follow(\'first\', \'second\', \'inside_second\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    )
  })
})();
