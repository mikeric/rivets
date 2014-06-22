pkg    = require('./package.json')
gulp   = require('gulp')
util   = require('gulp-util')
coffee = require('gulp-coffee')
header = require('gulp-header')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
mocha  = require('gulp-mocha-phantomjs')

source = [
  'src/rivets.coffee',
  'src/util.coffee',
  'src/parsers.coffee',
  'src/observer.coffee',
  'src/view.coffee',
  'src/bindings.coffee',
  'src/adapters.coffee',
  'src/binders.coffee',
  'src/export.coffee'
]

banner = function() {
  return [
    '// Rivets.js',
    '// version: ' + pkg.version,
    '// author: ' + pkg.author,
    '// license: ' + pkg.licenses[0].type
  ].join('\n') + '\n'
}

gulp.task('build', function() {
  compiled = gulp.src(source)
    .pipe(concat('rivets.js'))
    .pipe(coffee().on('error', util.log))
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))

  compiled.pipe(concat('rivets.min.js'))
    .pipe(uglify())
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))
})

gulp.task('spec', function() {
  gulp.src('spec/runner.html')
    .pipe(mocha({reporter: 'dot'}))
})
