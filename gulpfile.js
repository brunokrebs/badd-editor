var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');

gulp.task('generate-templates', function () {
	return gulp.src('src/**/*.html')
		.pipe(templateCache({
			module: 'bootstrapEditor'
		}))
		.pipe(gulp.dest('dist'));
});

gulp.task('compress', function() {
	return gulp.src('src/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('default', ['generate-templates', 'compress']);

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver({
			livereload: true,
			directoryListing: false,
			open: false
		}));
});