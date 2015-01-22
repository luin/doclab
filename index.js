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

app.use(mount('/build', require('koa-static')('build', { defer: true })));

app.use(require('koa-views')('views', { default: 'jade' }));
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
    if (err.body) {
      if (err.body.status === 401) {
        this.redirect('/account/signin');
      } else {
        this.body = err.body;
      }
    }
    console.error(err.stack || err);
  }
});

require('koa-mount-directory')(app, require('path').join(__dirname, 'routes'));

app.use(require('koa-mount')('/api', require('./api')));

if (require.main === module) {
  app.listen($config.port);
} else {
  module.exports = app;
}
