'use strict';

var request = require('request')

var testServerRootUri = 'http://127.0.0.1:2808'
var mochaPhantomJsTestRunner = testServerRootUri +
    '/static/browser/test/index.html'



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
        '!browser/lib/third-party/**/*',
        '!browser/test/lib/**/*',
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
          timeout: 100
        },
        src: ['test/**/*.js', '!test/haltalk.js']
      }
    },
    'mocha_phantomjs': {
      all: {
        options: {
          urls: [
            mochaPhantomJsTestRunner
          ]
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['default']
    },
  })

  grunt.loadNpmTasks('grunt-contrib-jshint')
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-mocha-phantomjs')
  grunt.loadNpmTasks('grunt-contrib-watch')

  grunt.registerTask('start-test-server', 'Start the test server.',
      function() {
    var done = this.async()

    function pingTestServer(callback) {
      request.get(testServerRootUri, function(error, response) {
        if (error) {
          callback(error)
        } else if (response.statusCode === 200) {
          callback()
        } else {
          callback(new Error('HTTP status code was not 200 (as expected), ' +
              'but ' + response.statusCode))
        }
      })
    }

    grunt.log.writeln('Starting test server from grunt.')
    pingTestServer(function(error) {
      // Only start a test server instance if none is running. Rationale:
      // If an instance is running via supervisor while watching changed files,
      // we do not need to (and can not due to port conflicts) start a second
      // instance.
      if (error) {
        if (error.message !== 'connect ECONNREFUSED') {
          grunt.log.writeln('(Message from ping was: ' + error.message + ')')
        }
        grunt.log.writeln('It seems the test server is currently not ' +
            'running, will start a new instance to run mocha-phantomjs tests.')
        require('./bin/start-test-server')
        done()
      } else {
        grunt.log.writeln('Test server is already running.')
        done()
      }
    })
  })

  grunt.registerTask('stop-test-server', 'Stops the test server.',
      function() {
    var done = this.async()
    grunt.log.writeln('Stopping test server from grunt.')
    request.get(testServerRootUri + '/quit', function(error, response) {
      if (error) {
        if (error.message !== 'connect ECONNREFUSED') {
          grunt.log.writeln('(Message from stop request was: ' + error.message +
              ')')
        }
        grunt.log.writeln('It seems the test server is not running at all, ' +
            'doing nothing')
        done()
      } else {
        grunt.log.writeln('Poison pill request has been send to test server, ' +
            'test server should have been shut down.')
        grunt.log.writeln('')
        done()
      }
    })
  })

  grunt.registerTask('default', [
    'jshint',
    'mochaTest',
    'start-test-server',
    'mocha_phantomjs',
    'stop-test-server'
  ])
}
/* jshint +W106 */
