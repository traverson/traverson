# Checklist For Publishing a New Release

To release version x.y.z:

- `grunt` (to make sure all tests pass etc.)
- bump version in package.json to x.y.z
- bump version in bower.json to x.y.z
- `git commit -am"release x.y.z" && git push`
- `npm publish`
- `git checkout -b release-branch-x.y.z` (to create the release branch, required for bower)
- `grunt` (to create a fresh build)
- `git add -f browser/dist/traverson*` (to add the build artifacts to the release branch)
- `git commit -m"add build artifacts for release"`
- `git push origin release-branch-x.y.z`
- [create a new release on github](https://github.com/basti1302/traverson/releases/new)
  - Target: The release branch that hast just been created
  - Tag version: `x.y.z` (without any prefix or suffix)
  - Release title === Tag version
  - empty description
  - add all four JS files from browser/dist as "binaries" to the release
  - Publish release
- Why not just create a tag from the branch via git? Because we want to add the build artifacts to the GitHub relase as attachments (for users neither using npm or bower). This is only possible if the release was created via GitHub's web interface. Normal git tags show up as releases there too, but you can't add attachments or edit the release afterwards. Releases created via the web interface create a git tag automatically, however.
