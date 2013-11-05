'use strict';

/* jshint -W106 */
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      files: [
        '**/*.js',
        'Gruntfile.js',
        '.jshintrc',
        '!node_modules/**/*',
        '!test/util/static.js',
        '!browser_lib/third-party/**/*',
        '!browser_test/lib/**/*',
        '!example/browser/jquery*.js'
      ],
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

  grunt.registerTask('default', ['jshint', 'mochaTest'])
}
/* jshint +W106 */
