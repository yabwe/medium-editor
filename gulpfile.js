var jshint = require('gulp-jshint');
var gulp   = require('gulp');

gulp.task('lint', function() {
    return gulp.src('./src/js/editor.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});
