module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      files: ['src/js/**/*.js', 'spec/*.js'],
      directives: {
        browser: true,
        unparam: true,
        todo: true,
        debug: true
      }
    },
    jasmine: {
      suite: {
        src: 'src/js/**/*.js',
        options: {
          specs: 'spec/*.spec.js',
          helpers: 'spec/helpers/*.js',
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
    },
    uglify: {
      build: {
        src: 'src/js/medium.editor.js',
        dest: 'dist/js/<%= pkg.name %>.min.js'
      }
    },
    compass: {
      dist: {
        options: {
          sassDir: 'src/sass',
          cssDir: 'dist/css',
          outputStyle: 'compressed',
          noLineComments: true
        }
      },
    },
    csslint: {
      strict: {
        options: {
          'box-sizing': false,
          import: 2
        },
        src: 'dist/css/**/*.css'
      }
    },
    watch: {
      scripts: {
        files: ['src/js/**/*.js', 'spec/*.js'],
        tasks: ['js'],
        options: {
          debounceDelay: 250,
        }
      },
      styles: {
        files: 'src/sass/**/*.scss',
        tasks: ['css'],
        options: {
          debounceDelay: 250,
        },
      }
    },
    concat: {
      options: {
        stripBanners: true
      },
      dist: {
        src: 'src/js/medium.editor.js',
        dest: 'dist/js/<%= pkg.name %>.js'
      }
    },
    plato: {
      feed: {
        files: {
          'reports/plato': ['src/js/medium.editor.js'],
        }
      },
    }
  });

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
  grunt.registerTask('css', ['compass', 'csslint'])
  grunt.registerTask('default', ['js', 'css']);

};
