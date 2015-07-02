// package metadata file for Meteor.js
'use strict';

var packageName = 'mediumeditor:mediumeditor';  // https://atmospherejs.com/medium-editor/medium-editor
var where = 'client';  // where to install: 'client' or 'server'. For both, pass nothing.

var packageJson = JSON.parse(Npm.require("fs").readFileSync('package.json'));

Package.describe({
  name: packageName,
  summary: 'MediumEditor (official) - A clone of medium.com inline editor toolbar.',
  version: packageJson.version,
  git: 'https://github.com/yabwe/medium-editor.git'
});

Package.onUse(function (api) {
  api.versionsFrom(['METEOR@0.9.0', 'METEOR@1.0']);
  api.export('MediumEditor');
  api.addFiles([
    'dist/js/medium-editor.js',
    'dist/css/medium-editor.css',
    'dist/css/themes/default.css',
    'meteor/export.js'
  ], where
  );
});

Package.onTest(function (api) {
  api.use(packageName, where);
  api.use('tinytest', where);

  api.addFiles('meteor/test.js', where);
});
