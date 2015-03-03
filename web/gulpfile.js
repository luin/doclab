var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');

var argv = require('yargs').argv;
// less
var less = require('gulp-less');
var LessPluginCleanCSS = require("less-plugin-clean-css");
var cleancss = new LessPluginCleanCSS({ advanced: true });
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix= new LessPluginAutoPrefix({ browsers: ['last 2 versions'] });
var sourcemaps = require('gulp-sourcemaps');
// js
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// gulp build --production
var production = !!argv.production;
// determine if we're doing a build
var build = argv._.length ? argv._[0] === 'build' : false;
var watch = argv._.length ? argv._[0] === 'watch' : true;

// ----------------------------
// Error notification methods
// ----------------------------
var beep = function() {
  var os = require('os');
  var file = 'gulp/error.wav';
  var exec = require('child_process').exec;
  if (os.platform() === 'linux') {
    // linux
    exec('aplay ' + file);
  } else {
    // mac
    console.log('afplay ' + file);
    exec('afplay ' + file);
  }
};
var handleError = function(task) {
  var notify = require('gulp-notify');
  return function(err) {
    beep();
    notify.onError({
      message: task + ' failed, check the logs..',
      sound: false
    })(err);
    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
  };
};

gulp.task('clean', function(cb) {
  require('del')(['build/'], cb);
});

gulp.task('assets', function() {
  return gulp.src('./client/assets/**/*')
    .pipe(gulp.dest('build/assets/'));
});
gulp.task('editor', function() {
  return gulp.src('./client/editor/**/*')
    .pipe(gulp.dest('build/editor/'));
});
gulp.task('less', function() {
  var plugins = [autoprefix];
  if (production) {
    plugins.push(cleancss);
  }
  return gulp.src('./client/styles/index.less')
    // sourcemaps + less + error handling
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(less({
      plugins: plugins
    }))
    .on('error', handleError('LESS'))
    // generate .maps
    .pipe(gulpif(!production, sourcemaps.write({
      'includeContent': false,
      'sourceRoot': '.'
    })))
    // autoprefixer
    .pipe(gulpif(!production, sourcemaps.init({
      'loadMaps': true
    })))
    .pipe(gulp.dest('build/styles'));
});

gulp.task('browserify', function() {
  ['base.js', 'app.js', 'editor.js'].forEach(function(filename) {
    var bundler = browserify('./client/scripts/' + filename, {
      debug: !production,
      cache: {},
      paths: ['client/editor/scripts']
    });
    if (watch) {
      bundler = watchify(bundler);
    }
    var rebundle = function() {
      gutil.log('Starting ' + gutil.colors.blue('rebundle') + '...');
      return bundler.bundle()
        .on('error', handleError('Browserify'))
        .pipe(source(filename))
        .pipe(gulpif(production, require('vinyl-buffer')()))
        .pipe(gulpif(production, require('gulp-uglify')()))
        .pipe(gulp.dest('build/scripts/'))
        .on('end', function() {
          gutil.log('Finished ' + gutil.colors.blue('rebundle'));
        });
    };
    bundler.on('update', rebundle);
    rebundle();
  });
});

gulp.task('watch', ['assets', 'editor', 'less', 'browserify'], function() {
  gulp.watch('./client/styles/**/*.less', ['less']);
  gulp.watch('./client/assets/**/*', ['assets']);
  gulp.watch('./client/editor/**/*', ['editor']);
  gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

// build task
gulp.task('build', [
  'clean',
  'assets',
  'editor',
  'less',
  'browserify'
]);

gulp.task('default', ['watch']);

// gulp (watch) : for development
// gulp build : for a one off development build
// gulp build --production : for a minified production build
