module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      files: 'src/js/**/*.js',
      directives: {
        browser: true,
        unparam: true,
        todo: true
      }
    },
    jasmine: {
      feed: {
        src: 'src/js/**/*.js',
        options: {
          specs: 'spec/*.spec.js',
          helpers: 'spec/helpers/*.js'
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/js/**/*.js',
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
        files: 'src/js/**/*.js',
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
      },
      specs: {
        files: 'spec/**/*.js',
        tasks: ['jasmine'],
        options: {
          debounceDelay: 250,
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['jslint', 'jasmine', 'csslint']);
  grunt.registerTask('js', ['jslint', 'jasmine', 'uglify']);
  grunt.registerTask('css', ['compass', 'csslint'])
  grunt.registerTask('default', ['js', 'css']);

};
