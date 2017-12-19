/*global module, require, process*/

module.exports = function (grunt) {
    'use strict';

    var autoprefixerBrowsers = ['last 3 versions', 'ie >= 9'],
        globalConfig = {
            src: 'src',
            dest: 'dev'
        },
        gruntConfig = {
            pkg: grunt.file.readJSON('package.json'),
            globalConfig: globalConfig
        },
        srcFiles = [
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
            'src/js/version.js'
        ],
        browsers = [{
            browserName: 'internet explorer',
            version: '9',
            platform: 'WIN7'
        }, {
            browserName: 'internet explorer',
            version: '10',
            platform: 'WIN8'
        }, {
            browserName: 'internet explorer',
            version: '11',
            platform: 'WIN8.1'
        }, {
            browserName: 'internet explorer',
            version: '11',
            platform: 'Windows 10'
        }, {
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10'
        }, {
            browserName: 'chrome',
            platform: 'WIN8.1'
        }, {
            browserName: 'chrome',
            platform: 'Windows 10'
        }, {
            browserName: 'googlechrome',
            platform: 'OS X 10.11'
        }, {
            browserName: 'firefox',
            platform: 'WIN8.1'
        }, {
            browserName: 'firefox',
            platform: 'Windows 10'
        }, {
            browserName: 'firefox',
            platform: 'OS X 10.11'
        }, {
            browserName: 'safari',
            platform: 'OS X 10.10'
        }, {
            browserName: 'safari',
            platform: 'OS X 10.11'
        }];

    gruntConfig.connect = {
        server: {
            options: {
                base: '',
                port: 9999
            }
        }
    };

    // TODO: build check with debug and devel false
    gruntConfig.jshint = {
        options: {
            ignores: ['src/js/polyfills.js'],
            jshintrc: true,
            reporter: require('jshint-stylish')
        },
        all: {
            src: [
                'src/js/**/*.js',
                'spec/*.spec.js',
                'Gruntfile.js'
            ]
        }
    };

    // TODO: "maximumLineLength": 120
    gruntConfig.jscs = {
        src: [
            'src/js/**/*.js',
            'spec/*.spec.js',
            'Gruntfile.js',
            '!src/js/polyfills.js'
        ],
        options: {
            config: '.jscsrc'
        }
    };

    gruntConfig.jasmine = {
        suite: {
            src: [srcFiles],
            options: {
                specs: ['spec/*.spec.js'],
                helpers: 'spec/helpers/*.js',
                vendor: [
                    'node_modules/lodash/index.js',
                    'spec/vendor/jasmine-jsreporter.js',
                    'spec/vendor/jasmine-jsreporter-script.js'
                ],
                polyfills: [
                    'src/js/polyfills.js'
                ],
                styles: 'dist/css/*.css',
                junit: {
                    path: 'reports/jasmine/',
                    consolidate: true
                },
                keepRunner: true,
                template: require('grunt-template-jasmine-istanbul'),
                templateOptions: {
                    coverage: 'reports/jasmine/coverage.json',
                    report: [{
                        type: 'lcov',
                        options: {
                            dir: 'reports/jasmine/lcov'
                        }
                    }],
                    files: srcFiles.concat('!src/js/extensions/deprecated/*')
                },
                summary: true
            }
        },
        spec: {
            src: 'src/js/**/*.js',
            options: {
                specs: ['spec/<%= globalConfig.file %>.spec.js'],
                helpers: 'spec/helpers/*.js'
            }
        }
    };

    gruntConfig.uglify = {
        options: {
            report: 'gzip'
        },
        build: {
            src: 'dist/js/medium-editor.js',
            dest: 'dist/js/<%= pkg.name %>.min.js'
        }
    };

    gruntConfig.csslint = {
        strict: {
            options: {
                'box-sizing': false,
                'compatible-vendor-prefixes': false,
                'fallback-colors': false,
                'gradients': false,
                'important': false,
                'import': 2,
                'outline-none': false,
                'adjoining-classes': false
            },
            src: 'dist/css/**/*.css'
        }
    };

    gruntConfig.sass = {
        dist: {
            options: {
                includePaths: ['src/sass/']
            },
            files: {
                'dist/css/medium-editor.css': 'src/sass/medium-editor.scss',
                'dist/css/themes/bootstrap.css': 'src/sass/themes/bootstrap.scss',
                'dist/css/themes/default.css': 'src/sass/themes/default.scss',
                'dist/css/themes/flat.css': 'src/sass/themes/flat.scss',
                'dist/css/themes/mani.css': 'src/sass/themes/mani.scss',
                'dist/css/themes/roman.css': 'src/sass/themes/roman.scss',
                'dist/css/themes/tim.css': 'src/sass/themes/tim.scss',
                'dist/css/themes/beagle.css': 'src/sass/themes/beagle.scss'
            }
        }
    };

    gruntConfig.cssmin = {
        main: {
            options: {
                noAdvanced: true
            },

            expand: true,
            cwd: 'dist/css/',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css/',
            ext: '.min.css'
        },
        themes: {
            options: {
                noAdvanced: true
            },

            expand: true,
            cwd: 'dist/css/themes/',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css/themes/',
            ext: '.min.css'
        }
    };

    gruntConfig.autoprefixer = {
        main: {
            expand: true,
            cwd: 'dist/css/',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css/',
            browsers: autoprefixerBrowsers
        },
        themes: {
            expand: true,
            cwd: 'dist/css/themes/',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css/themes/',
            browsers: autoprefixerBrowsers
        }
    };

    gruntConfig.watch = {
        scripts: {
            files: ['src/js/**/*.js', 'spec/**/*.js', 'Gruntfile.js'],
            tasks: ['js'],
            options: {
                debounceDelay: 250
            }
        },
        styles: {
            files: 'src/sass/**/*.scss',
            tasks: ['css'],
            options: {
                debounceDelay: 250
            }
        }
    };

    gruntConfig.concat = {
        options: {
            stripBanners: true
        },
        dist: {
            src: ['src/js/polyfills.js']
                .concat(['src/wrappers/start.js'])
                .concat(srcFiles)
                .concat(['src/wrappers/end.js']),
            dest: 'dist/js/<%= pkg.name %>.js',
            nonull: true
        }
    };

    gruntConfig.plato = {
        feed: {
            files: {
                'reports/plato': srcFiles
            }
        }
    };

    gruntConfig['saucelabs-jasmine'] = {
        all: {
            options: {
                urls: ['http://localhost:9999/_SpecRunner.html'],
                tunnelTimeout: 5,
                build: process.env.TRAVIS_JOB_ID,
                concurrency: 3,
                browsers: browsers,
                sauceConfig: {
                    public: 'public',
                    build: process.env.TRAVIS_JOB_ID,
                    name: 'medium-editor-tests',
                    maxDuration: 900,
                    idleTimeout: 600
                }
            }
        }
    };

    gruntConfig.coveralls = {
        dist: {
            src: 'reports/jasmine/lcov/lcov.info'
        }
    };

    gruntConfig.bump = {
        options: {
            files: ['package.json', 'src/js/version.js'],
            updateConfigs: [],
            commit: false,
            createTag: false,
            push: false
        }
    };

    grunt.initConfig(gruntConfig);

    require('time-grunt')(grunt);
    require('load-grunt-tasks')(grunt, {
        pattern: [
            'grunt-*',
            '!grunt-template-jasmine-istanbul'
        ]
    });

    if (parseInt(process.env.TRAVIS_PULL_REQUEST, 10) > 0) {
        grunt.registerTask('travis', ['jshint', 'jscs', 'jasmine:suite', 'csslint', 'coveralls']);
    } else {
        grunt.registerTask('travis', ['connect', 'jshint', 'jscs', 'jasmine:suite', 'csslint', 'saucelabs-jasmine', 'coveralls']);
    }

    grunt.registerTask('test', ['jshint', 'jscs', 'concat', 'jasmine:suite', 'csslint']);
    grunt.registerTask('sauce', ['connect', 'saucelabs-jasmine']);
    grunt.registerTask('js', ['jshint', 'jscs', 'concat', 'jasmine:suite', 'uglify']);
    grunt.registerTask('css', ['sass', 'autoprefixer', 'cssmin', 'csslint']);
    grunt.registerTask('default', ['js', 'css']);

    grunt.registerTask('spec', 'Runs a task on a specified file', function (taskName, fileName) {
        globalConfig.file = fileName;
        grunt.task.run(taskName + ':spec');
    });

    // release tasks
    grunt.registerTask('patch', ['bump', 'css', 'js']);
    grunt.registerTask('minor', ['bump:minor', 'css', 'js']);
    grunt.registerTask('major', ['bump:major', 'css', 'js']);
};
