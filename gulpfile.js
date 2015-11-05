var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var del = require('del');
var es = require('event-stream');
var webserver = require('gulp-webserver');
var watch = require('gulp-watch');
var batch = require('gulp-batch');

gulp.task('generate-templates', function () {
	return gulp.src('src/**/*.html')
		.pipe(templateCache({
			filename: 'badd-editor.tpls.js',
			module: 'baddEditor'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('uglify-js', function() {
	return gulp.src('src/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('build'));
});

gulp.task('minify-css', function() {
	return gulp.src('src/**/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('build'));
});

gulp.task('generate-dist', [
	'generate-templates',
	'uglify-js',
	'minify-css'
], function() {
	return gulp.src(["./build/**/*.js", "./build/**/*.css"])
		.pipe(rename(function (path) {
			path.basename += ".min";
			return path;
		}))
		.pipe(gulp.dest("./dist"));
});

gulp.task('clean', function () {
	return del('./build');
});

gulp.task('default', ['generate-dist'], function() {
	gulp.start('clean');
});

gulp.task('watch', function () {
	watch('./src/**/*', batch(function (events, done) {
		gulp.start('default', done);
	}));
});

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver());
});
