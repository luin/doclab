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

app.use(require('koa-mount')('/api', require('./api')));
app.use(mount('/build', require('koa-static')('build')));

app.use(function *(next) {
  this.api = API;
  var token = this.cookies.get('session-token');
  if (token) {
    this.api.$header('x-session-token', token);
  }
  yield next;
});

app.use(function *(next) {
  try {
    yield next;
  } catch (err) {
    if (err.statusCode) {
      if (err.statusCode === 401) {
        return this.redirect('/account/signin');
      }
      this.body = err.body;
      this.status = err.statusCode;
    } else {
      this.body = { err: 'server error' };
      this.status = 500;
      console.error(err.stack || err);
    }
  }
});

app.use(require('koa-views')('views/pages', { default: 'jade' }));

app.use(require('koa-session')({ signed: false }, app));
app.use(require('koa-flash')());
app.use(function *(next) {
  this.locals.flash = this.flash;
  yield next;
});

require('koa-mount-directory')(app, require('path').join(__dirname, 'routes'));

if (require.main === module) {
  app.listen($config.port);
} else {
  module.exports = app;
}
