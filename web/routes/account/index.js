var router = module.exports = new (require('koa-router'))();

router.get('/signin', function *() {
  this.cookies.set('session-token');
  yield this.render('account/signin');
});

router.post('/signout', function *() {
  this.cookies.set('session-token');
  this.redirect(this.query.next || '/');

  this.api.delete('/sessions/current').then(function() {});
});

router.post('/signin', function *() {
  var remember = this.request.body.remember === 'on';
  var result = yield this.api.post('/sessions', {
    ttl: remember ? 86400 : 1209600
  }, {
    auth: [this.request.body.email, this.request.body.password]
  });

  var cookieOptions = {
    expires: remember ? new Date(Date.now() + result.ttl * 1000) : undefined
  };
  this.cookies.set('session-token', result.token, cookieOptions);

  this.redirect(this.query.next ? this.query.next : '/');
});
