/*global MediumEditor */

MediumEditor.version = (function (major, minor, revision) {
    return {
        major: parseInt(major, 10),
        minor: parseInt(minor, 10),
        revision: parseInt(revision, 10),
        toString: function () {
            return [major, minor, revision].join('.');
        }
    };
}).apply(this, ({
    // grunt-bump looks for this:
    'version': '4.12.12'
}).version.split('.'));
