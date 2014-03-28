/*global module, require*/

module.exports = function (grunt) {
    'use strict';

    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json')
    },
        autoprefixerBrowsers = ['last 3 versions', 'ie >= 9'];

    gruntConfig.jsbeautifier = {
        files: ['src/js/**/*.js', 'spec/*.js', 'Gruntfile.js'],
        options: {
            js: {
                braceStyle: "collapse",
                breakChainedMethods: false,
                e4x: false,
                evalCode: false,
                indentChar: " ",
                indentLevel: 0,
                indentSize: 4,
                indentWithTabs: false,
                jslintHappy: true,
                keepArrayIndentation: true,
                keepFunctionIndentation: true,
                maxPreserveNewlines: 5,
                preserveNewlines: true,
                spaceBeforeConditional: true,
                spaceInParen: false,
                unescapeStrings: false,
                wrapLineLength: 0
            }
        }
    };

    gruntConfig.jslint = {
        client: {
            src: ['src/js/**/*.js', 'spec/*.js', 'Gruntfile.js'],
            directives: {
                browser: true,
                unparam: true,
                todo: true,
                debug: true,
                white: true
            }
        }
    };

    gruntConfig.jasmine = {
        suite: {
            src: 'src/js/**/*.js',
            options: {
                specs: 'spec/*.spec.js',
                helpers: 'spec/helpers/*.js',
                styles: 'dist/css/*.css',
                junit: {
                    path: "reports/jasmine/",
                    consolidate: true
                },
                keepRunner: true,
                template: require('grunt-template-jasmine-istanbul'),
                templateOptions: {
                    coverage: 'reports/jasmine/coverage.json',
                    report: 'coverage'
                },
                summary: true
            }
        }
    };

    gruntConfig.uglify = {
        options: {
            report: 'gzip'
        },
        build: {
            src: 'src/js/medium-editor.js',
            dest: 'dist/js/<%= pkg.name %>.min.js'
        }
    };

    gruntConfig.csslint = {
        strict: {
            options: {
                'box-sizing': false,
                'import': 2,
                'compatible-vendor-prefixes': false,
                'gradients': false
            },
            src: 'dist/css/**/*.css'
        }
    };

    gruntConfig.sass = {
        dist: {
            options: {
                outputStyle: 'compressed',
                includePaths: ['src/sass/']
            },
            files: {
                'dist/css/medium-editor.css': 'src/sass/medium-editor.scss',
                'dist/css/themes/bootstrap.css': 'src/sass/themes/bootstrap.scss',
                'dist/css/themes/default.css': 'src/sass/themes/default.scss',
                'dist/css/themes/flat.css': 'src/sass/themes/flat.scss',
                'dist/css/themes/mani.css': 'src/sass/themes/mani.scss',
                'dist/css/themes/roman.css': 'src/sass/themes/roman.scss'
            }
        }
    };

    gruntConfig.autoprefixer = {
        singleFile: {
            src: 'dist/css/medium-editor.css',
            browsers: autoprefixerBrowsers
        },
        multipleFiles: {
            expand: true,
            flatten: true,
            src: 'dist/css/themes/*.css',
            dest: 'dist/css/themes/',
            browsers: autoprefixerBrowsers
        }
    };

    gruntConfig.watch = {
        scripts: {
            files: ['src/js/**/*.js', 'spec/*.js', 'Gruntfile.js'],
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
            src: 'src/js/medium-editor.js',
            dest: 'dist/js/<%= pkg.name %>.js'
        }
    };

    gruntConfig.plato = {
        feed: {
            files: {
                'reports/plato': ['src/js/medium-editor.js']
            }
        }
    };

    grunt.initConfig(gruntConfig);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-plato');

    grunt.registerTask('test', ['jsbeautifier', 'jslint', 'jasmine', 'csslint']);
    grunt.registerTask('js', ['jsbeautifier', 'jslint', 'jasmine', 'uglify', 'concat']);
    grunt.registerTask('css', ['sass', 'autoprefixer', 'csslint']);
    grunt.registerTask('default', ['js', 'css']);

};
