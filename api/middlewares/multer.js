var parse = require('co-busboy');
var path = require('path');
var fs = require('fs');

var randomFileName = function() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var chars = [];
  for (var i = 0; i < 20; ++i) {
    chars.push(possible[Math.floor(Math.random() * possible.length)]);
  }
  return chars.join('');
};

module.exports = function(dir, maxFileSize) {
  return function *(next) {
    if (!this.request.is('multipart/*')) {
      return yield next;
    }

    var parts = parse(this, {
      autoFields: true,
      limits: {
        fileSize: maxFileSize
      }
    });

    // TODO policy
    this.filename = randomFileName();
    var tempFile = path.join(dir, this.filename);
    var part = yield parts;
    while (part) {
      part.pipe(fs.createWriteStream(tempFile));
      part = yield parts;
    }

    yield next;
  };
};
