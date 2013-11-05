'use strict';

/* jshint -W106 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: ['**/*.js', '.jshintrc', '!node_modules/**/*'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          slow: 300,
          timeout: 1000
        },
        src: ['test/**/*.js']
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    },
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-contrib-watch')

  // don't jshint until merged with master again
  //grunt.registerTask('default', ['jshint', 'mochaTest'])
  grunt.registerTask('default', ['mochaTest'])
}
/* jshint +W106 */
