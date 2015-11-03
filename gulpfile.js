var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var watch = require('gulp-watch');
var batch = require('gulp-batch');

gulp.task('generate-templates', function () {
	return gulp.src('src/**/*.html')
		.pipe(templateCache({
			filename: 'bootstrap-editor.tpls.js',
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

gulp.task('watch', function () {
	watch('./src/**/*', batch(function (events, done) {
		gulp.start('default', done);
	}));
});

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver());
});
