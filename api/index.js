require('./env');
var config = require('config');
var http = require('http');
var koa = require('koa');
var app = koa();

app.use(require('koa-mount')('/api/upload', require('koa-static')(require('path').join(__dirname, '..', config.upload.dir))));

app.use(require('koa-logger')());
// Error handling
app.use(function *(next) {
  this.createError = function(err) {
    this.status = err.status || 500;
    this.body = {
      error: err.message,
      type: err.name,
      status: this.status
    };
  };
  try {
    yield next;
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      this.createError(new HTTP_ERROR.InvalidParameter(err.errors.map(function(err) {
        return err.message;
      })));
    } else {
      if (err.expose) {
        this.createError(err);
      } else {
        this.status = err.status || 500;
        this.body = { status: this.status };
        console.error(err, err.stack);
      }
    }
  }
});

// Basic auth
var auth = require('basic-auth');
app.use(function *(next) {
  var token = this.request.get('x-session-token');
  if (token) {
    this.me = yield Session.getUser(token);
    this.assert(this.me, new HTTP_ERROR.InvalidToken());
    this.me.setDataValue('authScope', 'session');
    return yield next;
  }
  if (typeof this.query.sessiontoken === 'string' && this.request.is('multipart/*')) {
    this.me = yield Session.getUser(this.query.sessiontoken);
    this.assert(this.me, new HTTP_ERROR.InvalidToken());
    this.me.setDataValue('authScope', 'session');
    return yield next;
  }

  var user = auth(this.req);
  if (user) {
    this.me = yield User.find({ where: { email: user.name } });
    this.assert(this.me, new HTTP_ERROR.UnregisteredEmail());
    this.assert(yield this.me.comparePassword(user.pass), new HTTP_ERROR.WrongPassword());
    this.me.setDataValue('authScope', 'basic-auth');
    return yield next;
  }
  Object.defineProperty(this, 'me', {
    get: function() {
      this.throw(new HTTP_ERROR.Unauthorized());
    }
  });
  yield next;
});

app.use(require('koa-bodyparser')());
app.use(function *(next) {
  if (typeof this.request.body === 'undefined' || this.request.body === null) {
    this.request.body = {};
  }
  yield next;
});
require('koa-mount-directory')(app, '/api', require('path').join(__dirname, 'routes'));

module.exports = app;
