pkg    = require('./package.json')
argv   = require('minimist')(process.argv.slice(2))

gulp   = require('gulp')
util   = require('gulp-util')
coffee = require('gulp-coffee')
header = require('gulp-header')
concat = require('gulp-concat')
uglify = require('gulp-uglify')
bump   = require('gulp-bump')
mocha  = require('gulp-mocha-phantomjs')

source = [
  'src/rivets.coffee',
  'src/util.coffee',
  'src/parsers.coffee',
  'src/observer.coffee',
  'src/view.coffee',
  'src/bindings.coffee',
  'src/binders.coffee',
  'src/formatters.coffee',
  'src/adapter.coffee',
  'src/export.coffee'
]

manifests = [
  './package.json',
  './bower.json',
  './component.json'
]

banner = function(bundled) {
  return [
    '// Rivets.js' + (bundled ? ' + Sightglass.js' : ''),
    '// version: ' + pkg.version,
    '// author: ' + pkg.author,
    '// license: ' + pkg.licenses[0].type
  ].join('\n') + '\n'
}

gulp.task('build', function() {
  rivets = gulp.src(source)
    .pipe(concat('rivets.js'))
    .pipe(coffee().on('error', util.log))
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))

  rivetsMin = rivets.pipe(concat('rivets.min.js'))
    .pipe(uglify())
    .pipe(header(banner()))
    .pipe(gulp.dest('dist'))

  rivets.on('end', function() {
    sightglass = 'node_modules/sightglass/index.js'
    rivets = 'dist/rivets.js'

    gulp.src([sightglass, rivets])
      .pipe(uglify())
      .pipe(concat('rivets.bundled.min.js'))
      .pipe(header(banner(true)))
      .pipe(gulp.dest('dist'))
  })
})

gulp.task('spec', function() {
  gulp.src('spec/runner.html')
    .pipe(mocha({reporter: 'dot'}))
})

gulp.task('bump', function() {
  gulp.src(manifests)
    .pipe(bump({type: argv.t, version: argv.v}))
    .pipe(gulp.dest('./'))
})
