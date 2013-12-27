module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    config:
      coffeeFiles: [
        'src/rivets.coffee'
        'src/util.coffee'
        'src/view.coffee'
        'src/bindings.coffee'
        'src/parsers.coffee'
        'src/keypath_observer.coffee'
        'src/binders.coffee'
        'src/adapters.coffee'
        'src/export.coffee'
      ]

    meta:
      banner:
        '// Rivets.js\n' +
        '// version: <%= pkg.version %>\n' +
        '// author: <%= pkg.author %>\n' +
        '// license: <%= pkg.licenses[0].type %>\n'

    coffee:
      all:
        options:
          join: true
        files:
          'dist/rivets.js': '<%= config.coffeeFiles %>'

    concat:
      all:
        options:
          banner: '<%= meta.banner %>'
        files:
          'dist/rivets.js': 'dist/rivets.js'
      coffee:
        files:
          'dist/rivets.coffee': '<%= config.coffeeFiles %>'

    uglify:
      all:
        options:
          banner: '<%= meta.banner %>'
          report: 'gzip'
        files:
          'dist/rivets.min.js': 'dist/rivets.js'

    jasmine:
      all:
        src: 'dist/rivets.js'
        options:
          specs: 'spec/rivets/**/*.js'
          helpers: 'spec/lib/**/*.js'

    watch:
      all:
        files: 'src/rivets.coffee'
        tasks: ['build', 'spec']

  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-jasmine'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask 'default', ['watch']
  grunt.registerTask 'spec',    ['jasmine']
  grunt.registerTask 'build',   ['coffee', 'concat:all', 'uglify']
  grunt.registerTask 'build-coffee', ['concat:coffee']
