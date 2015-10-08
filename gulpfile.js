'use strict';

var gulp = require('gulp');

var autoprefixer = require('gulp-autoprefixer');
var batch = require('gulp-batch');
var connect = require('gulp-connect');
var less = require('gulp-less');
var livereload = require('gulp-livereload');
var jade = require('gulp-jade');
var sourcemaps = require('gulp-sourcemaps');
var path = require('path');
var watchLess = require('gulp-watch-less');

var LessPluginCleanCSS = require('less-plugin-clean-css'),
		cleancss = new LessPluginCleanCSS({ advanced: true });

gulp.task('jade', function () {
	// jade
	gulp.src('./index.jade')
		.pipe(jade())
		.pipe(gulp.dest('./'))
		.pipe(livereload());
});

gulp.task('less', function () {
	return gulp.src('./screen.less')
		.pipe(sourcemaps.init())
		.pipe(less({
			paths: [
				path.join(__dirname, 'less', 'global'),
				path.join(__dirname, 'less', 'sections'),
				path.join(__dirname, 'less', 'components')
			],
			plugins: [cleancss]
		}))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false
     }))
		.pipe(gulp.dest('./'))
		.pipe(livereload());
});

gulp.task('connect', function() {
  connect.server();
});

gulp.task('default', ['jade', 'less']);

gulp.task('watch', function () {
	livereload.listen();
  watchLess('./screen.less', batch(function (events, done) {
    gulp.start('less', done);
  }));
	gulp.watch('**/*.jade', ['jade']);
});
