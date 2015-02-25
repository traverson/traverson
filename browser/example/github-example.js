'use strict';

(function() {
  var rootUri = 'https://api.github.com/';

  // find a commit comment
  function executeCommitCommentRequest() {
    $('#commit_comment_response').html('<img src="assets/spinner.gif"/>');

    traverson
    .from(rootUri)
    .follow('repository_url', 'commits_url', 'comments_url')
    .withTemplateParameters({
      owner: 'basti1302',
      repo: 'traverson',
      sha: '5c82c74583ee67eae727466179dd66c91592dd4a'
    }).getResource(function(err, resource) {
      if (err) {
        $('#commit_comment_response').html(JSON.stringify(err));
        return;
      }
      $('#commit_comment_response').html(JSON.stringify(resource, null, 2));
    });
  }

  $(document).ready(function () {
    $('#btn-commit-comment').on('click', executeCommitCommentRequest);

    // find a commit comment
    $('#commit_comment_request').html(
      'traverson<br/>' +
      '.from(\'https://api.github.com/\')<br/>' +
      '.follow(\'repository_url\', \'commits_url\', \'comments_url\')<br/>' +
      '.withTemplateParameters({<br/>' +
      '&nbsp;&nbsp;owner: \'basti1302\',<br/>' +
      '&nbsp;&nbsp;repo: \'traverson\',<br/>' +
      '&nbsp;&nbsp;sha: \'5c82c74583ee67eae727466179dd66c91592dd4a\'<br/>' +
      ')}.getResource(function(err, resource) {<br/>' +
      '&nbsp;&nbsp;// do something with the resource...<br/>' +
      '});<br/>'
    );
  });
})();
