module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    meta:
      banner:
        '// rivets.js\n' +
        '// version: <%= pkg.version %>\n' +
        '// author: <%= pkg.author %>\n' +
        '// license: <%= pkg.licenses[0].type %>\n'

    coffee:
      all:
        files:
          'lib/rivets.js': 'src/rivets.coffee'

    concat:
      all:
        options:
          banner: '<%= meta.banner %>'
        files:
          'lib/rivets.js': 'lib/rivets.js'

    uglify:
      all:
        options:
          banner: '<%= meta.banner %>'
        files:
          'lib/rivets.min.js': 'lib/rivets.js'

    jasmine:
      all:
        src: 'lib/rivets.js'
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
  grunt.registerTask 'build',   ['coffee', 'concat', 'uglify']
