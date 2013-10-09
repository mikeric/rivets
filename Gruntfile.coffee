module.exports = (grunt) ->
  grunt.initConfig
    connect:
      server:
        options:
          port: 9001
          keepalive: true

    dusthtml:
      dist:
        src: "dst/index.dust"
        dest: "index.html"

        options:
          basePath: 'dst/sections'
          context: 'dst/sections.json'
          whitespace: true

  grunt.loadNpmTasks "grunt-dust-html"
  grunt.loadNpmTasks "grunt-contrib-connect"
