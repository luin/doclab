require('./env');
var mount = require('koa-mount');
var koa = require('koa');


var parseurl = require('parseurl');

function match(prefix, path) {
  return path === prefix || path.indexOf(prefix + '/') === 0;
}

var api = require('./api');
var web = require('./web');

var app = require('http').createServer(function(req, res) {
  var url = parseurl(req);
  if (match('/api', url.pathname)) {
    api.callback()(req, res);
  } else {
    web.callback()(req, res);
  }
});

web.websocket(app);

if (require.main === module) {
  app.listen(require('config').site.port);
} else {
  module.exports = app;
}
