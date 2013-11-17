'use strict';

(function() {
  var rootUri = 'https://api.github.com/'

  var api = traverson.json.from(rootUri)

  function executeAllRequests() {
    ['#commit_comment_response'].forEach(function(div) {
      $(div).html('<img src="assets/spinner.gif"/>')
    })
    executeCommitCommentRequest()
  }

  // find a commit comment
  function executeCommitCommentRequest() {
    $('#commit_comment_response').html('<img src="assets/spinner.gif"/>')

    api.newRequest()
      .follow('repository_url', 'commits_url', 'comments_url')
      .withTemplateParameters({
        owner: 'basti1302',
        repo: 'traverson',
        sha: '5c82c74583ee67eae727466179dd66c91592dd4a'
      }).getResource(function(err, resource) {
        if (err) {
          $('#commit_comment_response').html(JSON.stringify(err))
          return
        }
        $('#commit_comment_response').html(JSON.stringify(resource, null, 2))
      })
  }

  $(document).ready(function () {
    $('#btn-all').on('click', executeAllRequests)
    $('#btn-commit-comment').on('click', executeCommitCommentRequest)
    $('#general').html(
      'var rootUri = \'https://api.github.com/\'<br/>' +
      'var api = traverson.json.from(rootUri)<br/>'
    )

    // find a commit comment
    $('#commit_comment_request').html(
      'api.newRequest()<br/>' +
      '.follow(\'repository_url\', \'commits_url\', \'comments_url\')<br/>' +
      '.withTemplateParameters({<br/>' +
      '&nbsp;&nbsp;owner: \'basti1302\',<br/>' +
      '&nbsp;&nbsp;repo: \'traverson\',<br/>' +
      '&nbsp;&nbsp;sha: \'5c82c74583ee67eae727466179dd66c91592dd4a\'<br/>' +
      ')}.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '})<br/>'
    )
  })
})();
