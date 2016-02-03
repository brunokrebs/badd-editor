var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var del = require('del');
var concat = require('gulp-concat');
var webserver = require('gulp-webserver');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var gulpIf = require('gulp-if');

var development = false;

gulp.task('generate-templates', function () {
	return gulp.src('./src/html/**/*.html')
		.pipe(templateCache({
			filename: 'badd-template.js',
			module: 'baddEditor'
		}))
		.pipe(gulp.dest('./build/concat/'));
});

gulp.task('uglify-js', function() {
	return gulp.src('./src/js/**/*.js')
		.pipe(gulpIf(development == false, uglify()))
		.pipe(gulp.dest('./build/concat/'));
});

gulp.task('concat-js', ['uglify-js'], function() {
	return gulp.src([
			'./build/concat/badd-editor.js',
			'./build/concat/**/!(badd-editor)*.js'
		])
		.pipe(concat('badd-editor.js'))
		.pipe(gulp.dest('./build/min/'));
});

gulp.task('minify-css', function() {
	return gulp.src('./src/css/**/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('./build/css/'));
});

function getDestination() {
	if (development) {
		return './demo';
	}
	return './dist';
}

function renameMin(path) {
	path.basename += '.min';
	return path;
}

gulp.task('generate-dist', [
	'generate-templates',
	'concat-js',
	'minify-css'
], function() {
	return gulp.src(['./build/min/badd-editor.js', './build/css/**/*.css'])
		.pipe(rename(renameMin))
		.pipe(gulp.dest(getDestination()));
});

gulp.task('clean', function () {
	return del('./build');
});

gulp.task('default', ['generate-dist'], function() {
	gulp.start('clean');
});

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver());
});

gulp.task('set-development-mode', function() {
	development = true;
});

gulp.task('develop', ['set-development-mode', 'generate-dist'], function () {
	gulp.watch(['./src/**/*'], ['generate-dist']);
	gulp.src('./demo').pipe(webserver({host: '0.0.0.0'}));
});