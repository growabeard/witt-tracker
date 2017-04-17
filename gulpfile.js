// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var fs = require('fs');
var historyApiFallback = require('connect-history-api-fallback');
var merge = require('merge-stream');
var componentName = 'tracker';
var proxy = require('proxy-middleware');
var url = require('url');
var vulcanize = require('gulp-vulcanize');


// Clean Output Directory
gulp.task('clean', function(cb) {
   del(['eslint_results.xml', '.tmp', 'coverage', 'test_results.xml'], cb);
});

// CleanAll Output and Dependencies Directories
gulp.task('cleanAll', ['clean'], function(cb) {
  del(['node_modules', 'bower_components'], cb);
});

// Copy directory to format for polyserve
gulp.task('copy', function() {
  var tmp = gulp.src(['index.html']).pipe(gulp.dest('.tmp'));

  var component = gulp.src([
    '*.html'
  ]).pipe(gulp.dest('.tmp/components/' + componentName));

  var demo = gulp.src([
    'demo/index.html'
  ]).pipe(gulp.dest('.tmp/components/' + componentName + '/demo'));

  var src = gulp.src([
    'src/*.html'
  ]).pipe(gulp.dest('.tmp/components/' + componentName + '/src'));

  var test = gulp.src([
    'test/*.html'
  ]).pipe(gulp.dest('.tmp/components/' + componentName + '/test'));

  var bower = gulp.src(['bower_components/**/*.*']).pipe(gulp.dest('.tmp/components'));

  return merge(tmp, component, demo, test, src, bower);
});

// Watch Files For Changes & Reload
gulp.task('serve', ['default'], function() {
  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp'],
      middleware: [historyApiFallback()],
      routes: {
        '/.tmp/components': 'components'
      }
    }
  });

  gulp.watch(['*.html', '*.js', '*.css', 'demo/*.html', 'src/*.html', 'test/*.html'], ['default:noclean'], reload);
});

// Watch Files For Changes & Reload
gulp.task('mock', ['default'], function() {
  var foodlist = url.parse('https://witt-meal-track.herokuapp.com/foodlist');
  foodlist.route = '/foodlist';
  foodlist.via = true;
  var save = url.parse('https://witt-meal-track.herokuapp.com/save');
  save.route = '/save';
  save.via = true;

  browserSync({
    port: 5000,
    notify: false,
    logPrefix: 'PSK',
    snippetOptions: {
      rule: {
        match: '<span id="browser-sync-binding"></span>',
        fn: function(snippet) {
          return snippet;
        }
      }
    },
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: {
      baseDir: ['.tmp'],
      middleware: [proxy(save, foodlist)],
      routes: {
        '/.tmp/components': 'components'
      }
    }
  });

  gulp.watch(['*.html', '*.js', '*.css', 'demo/*.html', 'src/*.html', 'test/*.html'], ['default:noclean'], reload);
});

// Build Production Files, the Default Task
gulp.task('default', ['clean'], function(cb) {
  runSequence(
    ['default:noclean'],
    cb
  );
});

// Build Production Files, the Default Task
gulp.task('default:noclean', function(cb) {
  runSequence(
    ['copy'],// 'eslint'],
    cb
  );
});


// Load custom tasks from the `tasks` directory
try { require('require-dir')('tasks'); } catch (err) {}



gulp.task('vulcanize', function() {
  return gulp.src('app/elements/elements.html')
    .pipe(vulcanize())
    .pipe(gulp.dest('dist/elements'));
});

gulp.task('default', ['vulcanize']);
