## STEPS TO RELEASE:

1. Find the last release commit in log history. Look through all the commits or PR history and see all the stuff that has happened since the last release.
2. Add a row describing each high-level change into `CHANGES.md`. Looking at `CHANGES.md` would be a good stepping off point.
3. Depending upon the changes, decide if it is a major/minor/patch release. _Read more about [semantic versioning](http://semver.org/)_.
4. Depending upon the type of release, run `grunt major`, `grunt minor`, `grunt patch` to update the version number and generate all the dist files.
5. Commit all your changes (**including `CHANGES.md`**) into your commit. Add the new release number into your commit message. And push it up to the remote master branch.
6. Go [here](https://github.com/yabwe/medium-editor/releases) and ‘Draft a new release’. Title the release as the new release number (ex: `5.11.0`). Copy/paste the entries you made in `CHANGES.md` into the release summary. **Make sure the release is against the master branch.**
7. Once the release is created, go back to your git and run `npm publish`.


## RUNNING TESTS FOR FORK BRANCHES IN SAUCELABS:

For pull requests submitted from a forked version of the repo, the test suite won't run in Saucelabs so we haven't been able to know if tests fail in various browsers until after the PR is merged into master.  This is deliberate by Saucelabs as a security measure to prevent external forks from doing malicious things to the repo.

There is a workaround however, so when a PR is submitted from an external fork, follow these steps to verify the tests don't fail in Saucelabs before merging the PR into master.

For this example, let's assume there's a new pull request (#123) from a branch of an external user's fork (external-user/new-branch)

1. Create a new local branch for the pull request
  * ```git checkout -b integration-123```
2. Add a remote that points to the external fork
  * ```git remote add external-user git@github.com:external-user/medium-editor.git```
3. Fetch the remote repo
  * ```git fetch external-user```
4. Merge the external branch into your local branch
  * ```git merge external-user/new-branch```
5. Push your local branch up to the main repo
  * ```git push```

That's it.  Pushing the branch up should kick off a travis build, which will cause the tests to run in Saucelabs.  Github is smart enough to link the existing pull request to that build and reflect the status of the build (including the results from Saucelabs) on the PR summary page!


