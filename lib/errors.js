'use strict';

module.exports = {
  errors: {
    HTTPError: 'HTTPError',
    InvalidArgumentError: 'InvalidArgumentError',
    InvalidStateError: 'InvalidStateError',
    JSONError: 'JSONError',
    JSONPathError: 'JSONPathError',
    LinkError: 'LinkError',
    TraversalAbortedError: 'TraversalAbortedError',
    UnsupportedMediaType: 'UnsupportedMediaTypeError',
  },

  createError: function(message, name, data) {
    var error = new Error(message);
    error.name = name;
    if (data) {
      error.data = data;
    }
    return error;
  },

};
