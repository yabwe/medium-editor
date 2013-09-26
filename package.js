Package.describe({
    summary: "Medium editor repackaged for Meteor"
});

Package.on_use(function (api) {
    api.export('MediumEditor', 'client');
    api.add_files(['dist/css/medium.editor.css'], 'client');
    api.add_files(['dist/js/medium.editor.js'], 'client');
});
