require('./env');
var http = require('http');
var koa = require('koa');
var app = koa();

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
  }
  var user = auth(this.req);
  if (user) {
    this.me = yield User.find({ where: { email: user.name } });
    this.assert(this.me, new HTTP_ERROR.UnregisteredEmail());
    this.assert(yield this.me.comparePassword(user.pass), new HTTP_ERROR.WrongPassword());
    this.me.setDataValue('authScope', 'basic-auth');
  }
  if (!this.me) {
    Object.defineProperty(this, 'me', {
      get: function() {
        this.throw(new HTTP_ERROR.Unauthorized());
      }
    });
  }
  yield next;
});

var path = require('path');
require('koa-mount-directory')(app, path.join(__dirname, 'routes'));

module.exports = app;
