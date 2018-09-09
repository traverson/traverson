# Contributing to Traverson

We'd love for you to contribute to our project and to make Traverson even better than it is today! Here are the guidelines we'd like you to follow:

* [Code of Conduct](#coc)
* [Questions and Problems](#question)
* [Issues and Bugs](#issue)
* [Feature Requests](#feature)
* [Improving Documentation](#docs)
* [Issue Submission Guidelines](#submit)
* [Pull Request Submission Guidelines](#submit-pr)
    * [Code Style](#code-style)


## <a name="coc"></a> Code of Conduct

Help us keep Traverson open and inclusive. Please read and follow our [code of conduct][coc].

## <a name="requests"></a> Questions, Bugs, Features

### <a name="question"></a> Got a Question or Problem?

Feel free to open a GitHub issue for it, describing the problem and what you want to achieve as understandable as possible. Include comprehensive code snippets of what you tried and the error message you received or the unexpected behaviour you observed.

### <a name="issue"></a> Found an Issue or Bug?

If you find a bug in the source code, you can help us by submitting an issue to our [GitHub repository][github]. Even better, you could also consider submitting a pull request with a fix. But just reporting the bug also already helps a lot, so that's fine, too.

**Please see the [submission guidelines](#submit) below.**

### <a name="docs"></a> Want a Doc Fix?

Should you have a suggestion for the documentation, you can open an issue and outline the problem or improvement you have or create the doc fix yourself. Please make sure that your commit message follows the **[commit message guidelines](#commits)**.

### <a name="feature"></a> Missing a Feature?

You can request a new feature by submitting an issue to our [GitHub repository][github-issues].

If you would like to implement a new feature then consider what kind of change it is:

* **Small Changes** can directly be crafted and submitted to the [GitHub repository][github] as a pull request. See the section about [pull request submission guidelines](#submit-pr) and the [coding guidelines](#coding-guidelines) in particular.
* **Larger Changes** (like adding a completely new feature, changing the API, ...) that you wish to contribute to the project should be discussed first in a [GitHub issue][github-issues] that clearly outlines the changes and benefits of the feature.

## <a name="submit"></a> Issue Submission Guidelines

Before you submit your issue, search the archive, maybe your question was already answered.

If your issue appears to be a bug and hasn't been reported, open a new issue. Help us to maximize the effort we can spend fixing issues and adding new features by not reporting duplicate issues.

The [new issue][github-new-issue] template contains a number of prompts that you should fill out to make it easier to understand and categorize the issue.

In general, providing the following information will increase the chances of your issue being dealt with quickly:

* **Overview of the Issue** - if an error is being thrown, please include the full error message and a non-minified stack trace
* **Motivation/Use Case** - explain why this is a bug for you
* **Traverson Version(s)** - is it a regression?
* **Node.js version or Browser version** - is this a problem with all runtime environments (Node.js, Browser, React Native, whatever) or only specific ones?
* **Reproduce the Error** - provide a code snippet or a live example (using [Plunker][plunker] or [JSFiddle][jsfiddle]) that reproduces the problem. See [SSCCE][sscce] for an awesome guideline for such reproducing examples.
* **Related Issues** - has a similar issue been reported before?
* **Suggest a Fix** (optional) - if you can't fix the bug yourself, perhaps you can point to what might be causing the problem (line of code or commit)

Here are two examples of reasonably well defined issues:
- https://github.com/traverson/traverson/issues/95 and
- https://github.com/traverson/traverson/issues/82.

## <a name="submit-pr"></a> Pull Request Submission Guidelines

Before you submit your pull request, consider the following guidelines:

* Search [GitHub][pull-requests] for an open or closed Pull Request that relates to your submission. You don't want to duplicate effort.
* Seriously, let's talk before you put hours or days into an implementation. Especially if you plan a new feature or if your change includes an API change. Just open an issue, state what you plan to do, indicate that you are willing to put together a PR and ask for feedback. This will greatly enhance the probability to get your PR merged. Since we maintain Traverson in our free time, it might take a while to get a reaction sometimes. Be patient, we will respond eventually. If you desparately need a new feature *right now* to support your use case, feel free to implement it in a prototypcial way in a clone of this repository and use your [clone/branch in your package.json][npm-github-urls].
* Fork this repo, clone your fork, optionally create a dedicated branch for your changes.
* Run `npm install` in your project directory. This will also install some pre-commit hooks.
* Make sure to
* Please add tests for all non-trivial changes.
* Run `npm test` to run all tests and JSHint on the code.
* If your changes touch the public API or add new API, please also need to add the corresponding documentation. At the very least, [api.markdown][api.markdown] (the comprehensive reference documentation) needs to be updated. For most new features, an explanation with examples should also be added to [user-guide.markdown][user-guide.markdown].
* Create your commit(s), **including appropriate test cases**:
    * <a name="commits"></a> The commit message need to conform to our commit message conventions - all Traverson projects use the popular [Angular.js commit message conventions][angular-commit]. The commit message will also become the CHANGELOG entry, so please try to make sure it is comprehensible in the release notes context. Pre-commit hooks will check the commit message format. You can also use [commitizen][commitizen].
* In GitHub, send a pull request to `traverson:master`. This will trigger the Travis integration.
* If you find that the Travis integration has failed, look into the logs on Travis to find out if your changes caused test failures, the commit message was malformed etc. If you find that the tests failed or times out for unrelated reasons, you can ping a team member so that the build can be restarted.
* If we suggest changes, then:
    * Make the required updates.
    * Re-run the test suite (`npm test`) to ensure tests are still passing.
    * Commit your changes to your branch or amend the initial commit.
    * Push the changes to your fork (this will update your pull request).

That's it. Thank you for your contribution!

### <a name="code-style"></a> Code Style

Traverson does not have a comprehensive formal JavaScript code style guide. Please try to adhere to the existing code conventions.  Here are a few code style rules:

* Max line length: 80 characters
* Indentation: 2 spaces, no tabs
* Semicolons
* ES5 compatible JavaScript
* `'`, not `"`

There is also an `.editorconfig` in the repository's top level, for editors that support it.




Note: This guidelines have been partially inspired by the excellent [Angular.js contribution guidelines][angular-contrib-guide].

[angular-commit]: https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#commits
[angular-contrib-guide]: https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md
[api.markdown]: https://github.com/traverson/traverson/blob/master/api.markdown
[coc]: https://github.com/traverson/traverson/blob/master/CODE_OF_CONDUCT.md
[commitizen]: https://github.com/commitizen/cz-cli
[github-issues]: https://github.com/traverson/traverson/issues
[github-new-issue]: https://github.com/traverson/traverson/issues/new/choose
[github]: https://github.com/traverson/traverson
[jsfiddle]: http://jsfiddle.net/
[plunker]: http://plnkr.co/edit
[pull-requests]: https://github.com/traverson/traverson/pulls
[sscce]: http://sscce.org
[npm-github-urls]: https://docs.npmjs.com/files/package.json#github-urls
[user-guide.markdown]: https://github.com/traverson/traverson/blob/master/user-guide.markdown

