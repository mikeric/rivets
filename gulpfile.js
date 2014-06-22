pkg    = require('./package.json')
gulp   = require('gulp')
util   = require('gulp-util')
coffee = require('gulp-coffee')
header = require('gulp-header')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
insert = require('gulp-insert')
mocha  = require('gulp-mocha-phantomjs')

banner = function() {
  return [
    '// Rivets.js',
    '// version: ' + pkg.version,
    '// author: ' + pkg.author,
    '// license: ' + pkg.licenses[0].type
  ].join('\n') + '\n'
}

safety = function() {
  return insert.wrap('(function() {\n', '}).call(this);')
}

gulp.task('build', function() {
  compiled = gulp.src('src/*.coffee')
    .pipe(coffee({bare: true}).on('error', util.log))
    .pipe(concat('rivets.js'))
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))

  compiled.pipe(concat('rivets.min.js'))
    .pipe(uglify())
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))
})

gulp.task('spec', function() {
  gulp.src('spec/runner.html')
    .pipe(mocha())
})
