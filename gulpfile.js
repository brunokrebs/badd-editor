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

var development = false;

gulp.task('generate-templates', function () {
	return gulp.src('src/**/*.html')
		.pipe(templateCache({
			filename: 'badd-template.js',
			module: 'baddEditor'
		}))
		.pipe(gulp.dest('build'));
});

gulp.task('uglify-js', function() {
	var js = gulp.src('src/**/*.js');
	if (development == false) {
		js = js.pipe(uglify());
	}
	return js.pipe(gulp.dest('build'));
});

gulp.task('concat-js', ['uglify-js'], function() {
	return gulp.src([
			'./build/badd-editor.js',
			'./build/**/!(badd-editor)*.js'
		]).pipe(concat('badd-editor.js'))
		  .pipe(gulp.dest('./build/'));
});

gulp.task('minify-css', function() {
	return gulp.src('src/**/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('build'));
});

gulp.task('copy-images', function() {
	return gulp.src('src/**/*.png')
		.pipe(gulp.dest('dist'));
});

gulp.task('generate-dist', [
	'generate-templates',
	'concat-js',
	'minify-css',
	'copy-images'
], function() {
	return gulp.src(["./build/badd-editor.js", "./build/**/*.css"])
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
		development = true;
		gulp.start('default', done);
	}));
});

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver());
});
