require('./env');
var mount = require('koa-mount');
var koa = require('koa');
var app = koa();
app.use(require('koa-logger')());

app.use(require('koa-bodyparser')());
app.use(function *(next) {
  if (typeof this.request.body === 'undefined' || this.request.body === null) {
    this.request.body = {};
  }
  yield next;
});

app.use(mount('/api', require('./api')));
app.use(mount('/', require('./web')));

if (require.main === module) {
  app.listen(require('config').site.port);
} else {
  module.exports = app;
}
