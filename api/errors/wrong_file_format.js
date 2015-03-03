var format = require('util').format;
exports.status = 400;
exports.message = function(format) {
  if (format) {
    return 'File type is not supported';
  }
  if (Array.isArray(format)) {
    format = format.join(', ');
  }
  return 'Only support file types of ' + format;
};
