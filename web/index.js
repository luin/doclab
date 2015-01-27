var koa = require('koa');
var app = koa();

app.use(require('koa-mount')('/build', require('koa-static')('build')));

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
  this.locals.req = this.request;

  var _this = this;
  this.locals.url = function(path) {
    return _this.host + path;
  };
  yield next;
});

app.use(require('koa-methodoverride')());

require('koa-mount-directory')(app, require('path').join(__dirname, 'routes'));

module.exports = app;
