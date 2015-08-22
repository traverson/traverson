'use strict';

var request = require('request')
  , testServerRootUri = 'http://127.0.0.1:2808'
  , testServerStatusUri = testServerRootUri + '/status'
  , testServerKillUri = testServerRootUri + '/quit'
  , mochaPhantomJsTestRunner = testServerRootUri +
    '/static/browser/test/index.html'
  , serverWasAlreadyRunning = false;

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
        '!browser/dist/**/*',
        '!browser/example/assets/**/*',
        '!browser/lib/third-party/**/*',
        '!browser/lib/shim/underscore-string-reduced.js',
        '!browser/test/browserified_tests.js',
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // run the mocha tests via Node.js
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

    // remove all previous browserified builds
    clean: {
      dist: ['./browser/dist/**/*.js'],
      tests: ['./browser/test/browserified_tests.js']
    },

    // browserify everything
    browserify: {
      // This browserify build can be used by users of the module. It contains a
      // UMD (universal module definition) and can be used via an AMD module
      // loader like RequireJS or by simply placing a script tag in the page,
      // which registers the module as a global var. Look at the example in
      // in browser/example/index.html.
      standalone: {
        src: [ '<%= pkg.name %>.js' ],
        dest: './browser/dist/<%= pkg.name %>.js',
        options: {
          browserifyOptions: {
            standalone: '<%= pkg.name %>'
          }
        }
      },
      // With this browserify build, Traverson can be required by other
      // browserify modules that have been created with an --external parameter.
      // See browser/test/index.html for an example.
      external: {
        src: [ '<%= pkg.name %>.js' ],
        dest: './browser/dist/<%= pkg.name %>.external.js',
        options: {
          require: ['./traverson.js']
        }
      },
      // Browserify the tests
      tests: {
        src: [ 'test/browser_suite.js' ],
        dest: './browser/test/browserified_tests.js',
        options: {
          // use the external bundle created above, do not bundle traverson
          // into the tests
          external: [ './traverson.js' ],
          browserifyOptions: {
            // Embed source map for tests
            debug: true
          },
          plugin: [
            'proxyquire-universal'
          ],
        }
      }
    },

    // Uglify browser libs
    uglify: {
      dist: {
        files: {
          'browser/dist/<%= pkg.name %>.min.js':
              ['<%= browserify.standalone.dest %>'],
          'browser/dist/<%= pkg.name %>.external.min.js':
              ['<%= browserify.external.dest %>']
        }
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
      tasks: ['dev']
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('start-test-server', 'Start the test server.',
      function() {
    var done = this.async();

    function pingTestServer(callback) {
      request.get(testServerRootUri, function(error, response) {
        if (error) {
          callback(error);
        } else if (response.statusCode === 200) {
          callback();
        } else {
          callback(new Error('HTTP status code was not 200 (as expected), ' +
              'but ' + response.statusCode));
        }
      });
    }

    grunt.log.writeln('Starting test server from grunt.');
    pingTestServer(function(error) {
      // Only start a test server instance if none is running. Rationale:
      // If an instance is running via supervisor while watching changed files,
      // we do not need to (and can not due to port conflicts) start a second
      // instance.
      if (error) {
        if (error.message !== 'connect ECONNREFUSED') {
          grunt.log.writeln('(Message from ping was: ' + error.message + ')');
        }
        grunt.log.writeln('It seems the test server is currently not ' +
            'running, will start a new instance to run mocha-phantomjs tests.');
        require('./bin/start-test-server');
        done();
      } else {
        serverWasAlreadyRunning = true;
        grunt.log.writeln('Test server is already running.');
        done();
      }
    });
  });

  grunt.registerTask('stop-test-server', 'Stops the test server.',
      function() {
    var done = this.async();
    if (serverWasAlreadyRunning) {
      grunt.log.writeln('Server was already running when Grunt build started,' +
          ' thus it will not be shut down now from Grunt.');
      return done();
    } else {
      grunt.log.writeln('Stopping test server from grunt.');
    }
    request.get(testServerKillUri, function(error, response) {
      if (error) {
        if (error.message !== 'connect ECONNREFUSED') {
          grunt.log.writeln('(Message from stop request was: ' + error.message +
              ')');
        }
        grunt.log.writeln('It seems the test server is not running at all, ' +
            'doing nothing');
        return done();
      } else {
        grunt.log.writeln('Poison pill request has been send to test server, ' +
            'test server should have been shut down.');
        grunt.log.writeln('');
        return done();
      }
    });
  });

  grunt.registerTask('dev', [
    'jshint',
    'mochaTest',
  ]);

  grunt.registerTask('default', [
    'dev',
    'clean',
    'browserify',
    'uglify',
    'start-test-server',
    'mocha_phantomjs',
    'stop-test-server',
  ]);
};
/* jshint +W106 */
