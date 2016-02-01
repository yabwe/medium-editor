## STEPS TO RELEASE:

1. Find the last release commit in log history. Look through all the commits or PR history and see all the stuff that has happened since the last release.
2. Add a row describing each high-level change into `CHANGES.md`. Looking at `CHANGES.md` would be a good stepping off point.
3. Depending upon the changes, decide if it is a major/minor/patch release. _Read more about [semantic versioning](http://semver.org/)_.
4. Depending upon the type of release, run `grunt major`, `grunt minor`, `grunt patch` to update the version number and generate all the dist files.
5. Commit all your changes (**including `CHANGES.md`**) into your commit. Add the new release number into your commit message. And push it up to the remote master branch.
6. Go [here](https://github.com/yabwe/medium-editor/releases) and ‘Draft a new release’. Title the release as the new release number (ex: `5.11.0`). Copy/paste the entries you made in `CHANGES.md` into the release summary. **Make sure the release is against the master branch.**
7. Once the release is created, go back to your git and run `npm publish`.
