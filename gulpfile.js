var gulp = require('gulp');
var templateCache = require('gulp-angular-templatecache');
var uglify = require('gulp-uglify');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
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

gulp.task('uglify-js', function() {
	return gulp.src('src/**/*.js')
		.pipe(uglify())
		.pipe(gulp.dest('dist'));
});

gulp.task('minify-css', function() {
	return gulp.src('src/**/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('dist'));
});

gulp.task('rename-js', function() {
	return gulp.src("./dist/**/*.js")
		.pipe(rename(function (path) {
			path.basename += ".min";
			return path;
		}))
		.pipe(gulp.dest("./dist"));
});

gulp.task('rename-css', function() {
	return gulp.src("./dist/**/*.css")
		.pipe(rename(function (path) {
			path.basename += ".min";
			return path;
		}))
		.pipe(gulp.dest("./dist"));
});

gulp.task('default', [
	'generate-templates',
	'uglify-js',
	'minify-css',
	'rename-js',
	'rename-css'
]);

gulp.task('watch', function () {
	watch('./src/**/*', batch(function (events, done) {
		gulp.start('default', done);
	}));
});

gulp.task('webserver', function() {
	gulp.src(['demo', 'dist'])
		.pipe(webserver());
});
