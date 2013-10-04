/*global module, require*/

module.exports = function(grunt) {
    'use strict';

    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json')
    };

    gruntConfig.jslint = {
        files: ['src/js/**/*.js', 'spec/*.js', 'Gruntfile.js'],
        directives: {
            browser: true,
            unparam: true,
            todo: true,
            debug: true
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
                }
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
                'import': 2
            },
            src: 'dist/css/**/*.css'
        }
    };

    gruntConfig.compass = {
        dist: {
            options: {
                sassDir: 'src/sass',
                cssDir: 'dist/css',
                outputStyle: 'compressed',
                noLineComments: true
            }
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
    grunt.loadNpmTasks('grunt-jslint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-plato');

    grunt.registerTask('test', ['jslint', 'jasmine', 'csslint']);
    grunt.registerTask('js', ['jslint', 'jasmine', 'uglify', 'concat']);
    grunt.registerTask('css', ['compass', 'csslint']);
    grunt.registerTask('default', ['js', 'css']);

};
