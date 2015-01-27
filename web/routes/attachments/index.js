var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');
var request = require('request');

var path = require('path');
var fs = require('fs');
var os = require('os');

router.all('/avatar', function *() {
  var s3url = 'https://' + this.query.bucket + '.s3.amazonaws.com/' + this.query.key;

  var templateFile = path.join(os.tmpdir(), new Buffer(this.query.key).toString('base64'));

  yield new Promise(function(resolve, reject) {
    console.log(s3url, templateFile);

    var rq = request.get(s3url);
    rq.on('data', function(data) {
      data += data;
    });

    rq.on('end', function(data) {
      console.log(data);
    });

    rq.pipe(fs.createWriteStream(templateFile));
    rq.on('end', function() {
      console.log('end');
      resolve();
    });
  });

  this.body = templateFile;
});
