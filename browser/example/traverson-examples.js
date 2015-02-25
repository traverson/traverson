'use strict';

(function() {
  var api = traverson.from('/');

  function executeAllRequests() {
    ['#plain_vanilla_response',
     '#jsonpath_response',
     '#uri_template_response'].forEach(function(div) {
      $(div).html('<img src="assets/spinner.gif"/>');
    });
    executePlainVanillaRequest();
    executeJsonPathRequest();
    executeUriTemplateRequest();
  }

  // plain vanilla link following
  function executePlainVanillaRequest() {
    $('#plain_vanilla_response').html('<img src="assets/spinner.gif"/>');
    api
    .newRequest()
    .follow('second', 'doc')
    .getResource(function(err, resource) {
      if (err) {
        $('#plain_vanilla_response').html(JSON.stringify(err));
        return;
      }
      $('#plain_vanilla_response').html(JSON.stringify(resource, null, 2));
    });
  }

  // JSONPath
  function executeJsonPathRequest() {
    $('#jsonpath_response').html('<img src="assets/spinner.gif"/>');
    api
    .newRequest()
    .follow('$.jsonpath.nested.key')
    .getResource(function(err, resource) {
      if (err) {
        $('#jsonpath_response').html(JSON.stringify(err));
        return;
      }
      $('#jsonpath_response').html(JSON.stringify(resource, null, 2));
    });
  }

  // URI templates
  function executeUriTemplateRequest() {
    $('#uri_template_response').html('<img src="assets/spinner.gif"/>');
    api
    .newRequest()
    .follow('uri_template')
    .withTemplateParameters({param: 'foobar', id: 13})
    .getResource(function(err, resource) {
      if (err) {
        $('#uri_template_response').html(JSON.stringify(err));
        return;
      }
      $('#uri_template_response').html(JSON.stringify(resource, null, 2));
    });
  }

  $(document).ready(function () {
    $('#btn-all').on('click', executeAllRequests);
    $('#btn-plain-vanilla').on('click', executePlainVanillaRequest);
    $('#btn-jsonpath').on('click', executeJsonPathRequest);
    $('#btn-uri-template').on('click', executeUriTemplateRequest);
    $('#general').html(
      'var api = traverson.from(\'/\');<br/>'
    );

    // plain vanilla link following
    $('#plain_vanilla_request').html(
      'api<br/>' +
      'newRequest()<br/>' +
      '.follow(\'second\', \'doc\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '});<br/>'
    );

    // JSONPath
    $('#jsonpath_request').html(
      'api<br/>' +
      'newRequest()<br/>' +
      '.follow(\'$.jsonpath.nested.key\')<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '});<br/>'
    );

    // URI templates
    $('#uri_template_request').html(
      'api<br/>' +
      'newRequest()<br/>' +
      '.follow(\'uri_template\')<br/>' +
      '.withTemplateParameters({param: \'foobar\', id: 13})<br/>' +
      '.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '});<br/>'
    );
  });
})();
