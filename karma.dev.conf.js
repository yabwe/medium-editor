/* global module */

module.exports = function (config) {
    config.set({

        basePath: '',
        frameworks: ['jasmine'],

        files: [
            'dist/css/*.css',
            'node_modules/lodash/lodash.js',
            'src/js/polyfills.js',
            'src/js/globals.js',
            'src/js/util.js',
            'src/js/extension.js',
            'src/js/selection.js',
            'src/js/events.js',
            'src/js/extensions/button.js',
            'src/js/defaults/buttons.js',
            'src/js/extensions/form.js',
            'src/js/extensions/anchor.js',
            'src/js/extensions/anchor-preview.js',
            'src/js/extensions/auto-link.js',
            'src/js/extensions/file-dragging.js',
            'src/js/extensions/keyboard-commands.js',
            'src/js/extensions/fontname.js',
            'src/js/extensions/fontsize.js',
            'src/js/extensions/paste.js',
            'src/js/extensions/placeholder.js',
            'src/js/extensions/toolbar.js',
            'src/js/extensions/deprecated/image-dragging.js',
            'src/js/core.js',
            'src/js/defaults/options.js',
            'src/js/version.js',
            'spec/helpers/util.js',
            'spec/*.spec.js'
        ],

        exclude: [
            'src/js/extensions/deprecated/*'
        ],

        preprocessors: {
        },

        browsers: [
            'Chrome'
        ],
        plugins: [
            'karma-jasmine',
            'karma-spec-reporter',
            'karma-jasmine-html-reporter',
            'karma-browserstack-launcher',
            'karma-phantomjs-launcher',
            'karma-chrome-launcher'
        ],
        reporters: ['progress', 'BrowserStack', 'dots', 'spec', 'kjhtml'],

        port: 9876,

        logLevel: config.LOG_INFO,
        colors: true,

        autoWatch: false,

        client: {
            clearContext: false
        },

        singleRun: true,

        concurrency: Infinity
    });
};