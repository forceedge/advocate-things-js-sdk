var gulp = require('gulp');
var inject = require('gulp-inject');
var karma = require('karma').server;
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var del = require('del');

/**
 * Clean up the dist folder.
 */
gulp.task('clean', function () {
    del(['./dist/*']);
});

/**
 * Build distributable JS file by injecting extra libraries.
 */
gulp.task('build', function () {
    var target = gulp.src('./src/sdk.js');
    var sources = gulp.src(
        [
            // './bower_components/fingerprint/fingerprint.js',
            // './lib/moz-object.keys.js',
            // './lib/moz-foreach.js',
            './bower_components/json2/json2.js'
            // './bower_components/history.js/scripts/bundled/html4+html5/native.history.js',
            // './bower_components/cookie/cookie.js',
            // './lib/cookieStorage.js', // requires cookie.js
            // './lib/localStorage.js',
            // './lib/moz-object.keys.js',
            // './lib/moz-foreach.js'
        ]
    );

    var options = {
        starttag: '/* inject */',
        endtag:   '/* endinject */',
        transform: function (filePath, file) {
            return file.contents.toString('utf-8');
        }
    };

    return target.pipe(inject(sources, options))
                 .pipe(gulp.dest('./dist/'));
});

/**
 * Watch the ./src and ./lib directories, so the distributable JS can be rebuilt
 * whenever a change occurs.
 */
gulp.task('watch-src-files', function () {
    var toWatch = ['./src/*.js', './lib/*.js'];
    gulp.watch(toWatch, ['build']);
});

/**
 * Minify the compiled JS.
 */
gulp.task('uglify', ['build'], function () {
    return gulp.src('./dist/sdk.js')
               .pipe(uglify())
               .pipe(rename('sdk.min.js'))
               .pipe(gulp.dest('./dist'));
});
gulp.task('minify', ['uglify']); // alias

/**
 * Used on CI. Run the tests once and exit Karma.
 */
gulp.task('test', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js'
    }, done);
});

gulp.task('test-minified-file', ['uglify'], function (done) {
    // This isn't pleasant.
    var files = [
        './dist/sdk.min.js',
        './test/*.js'
    ];

    karma.start({
        configFile: __dirname + '/karma.conf.js',
        files: files
    }, done);
});

/**
 * Starts the KarmaJS server in the background and prepares it for testing.
 */
gulp.task('karma-bg', function (done) {
    karma.start({
        configFile: __dirname + '/karma.conf.js',
        autoWatch: true,
        singleRun: false
    }, done);
});

gulp.task('default', ['watch']);
gulp.task('watch', ['karma-bg', 'watch-src-files']);
gulp.task('test-min', ['uglify', 'test-minified-file']);
