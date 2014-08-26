var gulp = require('gulp');


gulp.task('lint', function() {
    var jshint = require('gulp-jshint');

    gulp.src(['index.js', 'lib/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('watch', ['lint'], function() {
    gulp.watch(['index.js', 'lib/*.js'], ['lint']);
});
