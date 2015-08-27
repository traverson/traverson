# Checklist For Publishing a New Release

To release version x.y.z:

- Update release notes and/or change the next/unreleased bullet point in the release notes to the version number.
- bump version in package.json to x.y.z
- bump version in bower.json to x.y.z
- `grunt` (to create a fresh browser build, also make sure all tests pass etc.)
- First release? Then `bower register package-name git://github.com/user/repo.git`
- `git commit -am"release x.y.z" && git push`
- `npm publish`
- `git checkout -b release-x.y.z` (to create the release branch, required for bower)
- `git add -f browser/dist/traverson.*` (to add the build artifacts to the release branch)
- `git commit -m"add build artifacts for release"`
- `git push origin release-x.y.z`
- [create a new release on github](https://github.com/basti1302/traverson/releases/new)
  - Tag version: `x.y.z` (without any prefix or suffix)
  - Target: The release branch that hast just been created
  - Release title === Tag version
  - empty description
  - add all four JS files from browser/dist as "binaries" to the release
  - Publish release
- Why not just create a tag from the branch via git? Because we want to add the build artifacts to the GitHub relase as attachments (for users neither using npm or bower). This is only possible if the release was created via GitHub's web interface. Normal git tags show up as releases there too, but you can't add attachments or edit the release afterwards. Releases created via the web interface create a git tag automatically, however.
- `git checkout master`
- `git branch -D release-x.y.z`
- `git push origin :release-x.y.z`
- Release a new, matching version of traverson-angular and traverson-hal, if required
