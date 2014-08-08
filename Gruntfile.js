/*global module, require*/

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
            src: 'src/js/medium-editor.js',
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
                'import': 2
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
                'dist/css/themes/roman.css': 'src/sass/themes/roman.scss'
            }
        }
    };

    gruntConfig.cssmin = {
        main: {
            expand: true,
            cwd: 'dist/css/',
            src: ['*.css', '!*.min.css'],
            dest: 'dist/css/',
            ext: '.min.css'
        },
        themes: {
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
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('test', ['jslint', 'jasmine:suite', 'csslint']);
    grunt.registerTask('js', ['jslint', 'jasmine:suite', 'uglify', 'concat']);
    grunt.registerTask('css', ['sass', 'autoprefixer', 'cssmin', 'csslint']);
    grunt.registerTask('default', ['js', 'css']);

    grunt.registerTask('spec', 'Runs a task on a specified file', function (taskName, fileName) {
        globalConfig.file = fileName;
        grunt.task.run(taskName + ':spec');
    });

};
