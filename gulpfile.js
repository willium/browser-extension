var gulp        = require('gulp');
var del         = require('del');
var es          = require('event-stream');
var runSequence = require('run-sequence');
var zip         = require('gulp-zip');
var shell       = require('gulp-shell');
var chrome      = require('./vendor/chrome/manifest');
var firefox     = require('./vendor/firefox/package');
var sass 		= require('gulp-sass');
var sourcemaps 	= require('gulp-sourcemaps');
var prefix 		= require('gulp-autoprefixer');

var config = {
	name: "myextension",

	styles: {
		name: 'main',
		type: '.scss',
		sass: '/sass',
	 	css: './css'
	},
	build: './build',
	dist: 'dist'
}

function pipe(src, transforms, dest) {
	if (typeof transforms === 'string') {
		dest = transforms;
		transforms = null;
	}

	var stream = gulp.src(src);
	transforms && transforms.forEach(function(transform) {
		stream = stream.pipe(transform);
	});

	if (dest) {
		stream = stream.pipe(gulp.dest(dest));
	}

	return stream;
}

// Clean (pre)
gulp.task('clean', function (cb) {
	del([config.build], cb);
});

// Styles (pre)
gulp.task('styles', function () {
	gulp.src(config.styles.css + config.styles.sass + "/" + config.styles.name + config.styles.type)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(prefix('last 1 version'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(config.styles.css))
});

// Browsers
gulp.task('chrome', function() {
	return es.merge(
		pipe('./libs/**/*', config.build + '/chrome/libs'),
		pipe('./img/**/*', config.build + '/chrome/img'),
		pipe('./js/**/*', config.build + '/chrome/js'),
		pipe(config.styles.css + "/" + config.styles.name + ".css", config.build + '/chrome/css'),
		pipe('./vendor/chrome/browser.js', config.build + '/chrome/js'),
		pipe('./vendor/chrome/manifest.json', config.build + '/chrome/')
	);
});

gulp.task('firefox', function() {
	return es.merge(
		pipe('./libs/**/*', config.build + '/firefox/data/libs'),
		pipe('./img/**/*', config.build + '/firefox/data/img'),
		pipe('./js/**/*', config.build + '/firefox/data/js'),
		pipe(config.styles.css + "/" + config.styles.name + ".css", config.build + '/firefox/data/css'),
		pipe('./vendor/firefox/browser.js', config.build + '/firefox/data/js'),
		pipe('./vendor/firefox/main.js', config.build + '/firefox/data'),
		pipe('./vendor/firefox/package.json', config.build + '/firefox/')
	);
});

gulp.task('safari', function() {
	return es.merge(
		pipe('./libs/**/*', config.build + '/safari/' + config.name + '.safariextension/libs'),
		pipe('./img/**/*', config.build + '/safari/' + config.name + '.safariextension/img'),
		pipe('./js/**/*', config.build + '/safari/' + config.name + '.safariextension/js'),
		pipe(config.styles.css + "/" + config.styles.name + ".css", config.build + '/safari/' + config.name + '.safariextension/css'),
		pipe('./vendor/safari/browser.js', config.build + '/safari/' + config.name + '.safariextension/js'),
		pipe('./vendor/safari/Info.plist', config.build + '/safari/' + config.name + '.safariextension'),
		pipe('./vendor/safari/Settings.plist', config.build + '/safari/' + config.name + '.safariextension')
	);
});

gulp.task('chrome-dist', function () {
	gulp.src(config.build + '/chrome/**/*')
		.pipe(zip('chrome-extension-' + chrome.version + '.zip'))
		.pipe(gulp.dest('./' + config.dist + '/chrome'));
});

gulp.task('firefox-dist', shell.task([
	'mkdir -p ' + config.dist + '/firefox',
	'cd ' + config.build + '/firefox && ../../tools/addon-sdk-1.16/bin/cfx xpi --output-file=../../' + config.dist + '/firefox/firefox-extension-' + firefox.version + '.xpi > /dev/null',
]));

gulp.task('safari-dist', function () {
	pipe('./vendor/safari/Update.plist', './' + config.dist + '/safari');
});

gulp.task('firefox-run', shell.task([
	'cd ' + config.build + '/firefox && ../../tools/addon-sdk-1.16/bin/cfx run',
]));

gulp.task('dist', function(cb) {
	return runSequence('clean', ['styles'], ['chrome', 'firefox', 'safari'], ['chrome-dist', 'firefox-dist', 'safari-dist'], cb);
});

gulp.task('watch', function() {
	gulp.watch(['./js/**/*', config.src.styles, './vendor/**/*', './img/**/*'], ['default']);
});

gulp.task('run', function (cb) {
	return runSequence('firefox', 'firefox-run', cb);
});

gulp.task('addons', shell.task([
	'cp -R ./' + config.dist + ' ../addons'
]));

gulp.task('default', function(cb) {
	return runSequence('clean', 'styles', ['chrome', 'firefox', 'safari'], cb);
});
