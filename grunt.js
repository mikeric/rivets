module.exports = function(grunt) {
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner:
        '// rivets.js\n' +
        '// version: <%= pkg.version %>\n' +
        '// author: <%= pkg.author %>\n' +
        '// license: <%= pkg.licenses[0].type %>'
    },
    jasmine: {
      all: ['spec/index.html']
    },
    lint: {
      files: ['grunt.js', 'lib/**/*.js', 'spec/**/*.js']
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', 'lib/rivets.js'],
        dest: 'lib/rivets.min.js'
      }
    },
    watch: {
      files: 'src/rivets.coffee',
      tasks: 'build spec'
    },
  });

  grunt.loadNpmTasks('grunt-jasmine-task');

  grunt.registerTask('compile', 'Compiles CoffeeScript source into JavaScript.', function(){
    var coffee = require('coffee-script');
    var js = coffee.compile(grunt.file.read('src/rivets.coffee'));
    var banner = grunt.task.directive('<banner:meta.banner>', function() { return null; });
    if (js) grunt.file.write('lib/rivets.js', banner + js);
  });

  grunt.registerTask('default', 'watch');
  grunt.registerTask('spec', 'jasmine');
  grunt.registerTask('build', 'compile min');
};
