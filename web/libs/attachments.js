var randomFileName = function() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var chars = [];
  for (var i = 0; i < 20; ++i) {
    chars.push(possible[Math.floor(Math.random() * possible.length)]);
  }
  return chars.join('');
};

exports.generateUploadForm = function(resource) {
  var filename = randomFileName();

  var policy = new Buffer(JSON.stringify({
    expiration: (new Date(Date.now() + 3600 * 1000)).toISOString(),
    conditions: [
      { resource: resource },
      { filename: filename }
    ]
  })).toString('base64');

  var signature = crypto.createHmac('sha1', settings.secret).update(policy).digest('base64');

  return {
    url: '/api/attachments/' + resource + '/files',
    fields: {
      resource: resource,
      filename: filename,
      policy: policy,
      signature: signature
    }
  };
};
