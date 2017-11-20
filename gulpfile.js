var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var autoprefixer = require('gulp-autoprefixer');
var fileinclude = require('gulp-file-include');
var gulpRemoveHtml = require('gulp-remove-html');
var cache = require('gulp-cache');
var del = require('del');
var bourbon = require('node-bourbon');
// var ftp = require('vinyl-ftp');
var runSequence = require('run-sequence');

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		}
	});
});

gulp.task('sass', ['headersass'], function() {
	return gulp.src('app/sass/**/*.sass')
		.pipe(sass({
				includePaths: bourbon.includePaths
			}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('headersass', function() {
	return gulp.src('app/header.sass')
		.pipe(sass({
			includePaths: bourbon.includePaths
		}).on('error', sass.logError))
		.pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(autoprefixer(['last 15 versions']))
		.pipe(cleanCSS())
		.pipe(gulp.dest('app'))
		.pipe(browserSync.reload({stream: true}))
});

gulp.task('libs', function() {
	return gulp.src([
			'app/libs/jquery/dist/jquery.min.js'
		])
		.pipe(concat('libs.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('app/js'));
});

gulp.task('watch', ['sass', 'libs', 'browser-sync'], function(){
	gulp.watch('app/header.sass', ['headersass']);
	gulp.watch('app/sass/**/*.sass', ['sass']); 
	// другие ресурсы
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('imagemin', function(){
	return gulp.src('app/img/**.*+(png|jpg|jpeg|gif|svg)')
		// кэширование изображений, прошедших через imagemin
		.pipe(cache(imagemin({
			interlaced: true,
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngquant()]
		})))
		.pipe(gulp.dest('dist/img'));
});

gulp.task('buildhtml', function() {
	gulp.src(['app/*.html'])
	.pipe(fileinclude({
		prefix: '@@'
	}))
	.pipe(gulpRemoveHtml())
	.pipe(gulp.dest('dist/'));
});

gulp.task('removedist', function() { return del.sync('dist'); });

// gulp.task('default', function (callback) {
// 	runSequence(['sass','browserSync', 'watch'], callback);
// });

// gulp.task('build', function (callback) {
// 	runSequence(
// 		'clean:dist',
// 		'sass', 
// 		['minify-css', 'imagemin', 'fonts'],
// 		callback
// 	);
// });

gulp.task('build', ['removedist', 'buildhtml'/*, 'imagemin'*/, 'sass', 'libs'], function() {

	var buildCss = gulp.src([
		'app/css/headersass.min.css',
		'app/css/style.min.css',
		'app/css/media.min.css',
		]).pipe(gulp.dest('dist/css'));

	var buildFiles = gulp.src(['app/.htaccess']).pipe(gulp.dest('dist'));

	var buildFonts = gulp.src('app/fonts/**/*').pipe(gulp.dest('dist/fonts'));

	var buildJs = gulp.src('app/js/**/*').pipe(gulp.dest('dist/js'));

});

gulp.task('deploy', function() {

	var conn = ftp.create({
		host:      'hostname.com',
		user:      'username',
		password:  'userpassword',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest('/path/to/folder/on/server'));

});

gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
