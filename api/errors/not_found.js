var format = require('util').format;
exports.status = 404;
exports.message = function(resourceName) {
  return format('%s is not found', resourceName || 'The resource');
};
