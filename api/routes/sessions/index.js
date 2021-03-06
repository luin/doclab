var router = module.exports = new (require('koa-router'))();

router.post('/', function *() {
  this.assert(this.me.getDataValue('authScope') === 'basic-auth', new HTTP_ERROR.NoPermission());

  this.body = yield Session.create({
    ttl: this.request.body.ttl,
    UserId: this.me.id,
    ip: this.ip,
    userAgent: this.request.get('user-agent')
  });
});

router.delete('/current', function *() {
  this.assert(this.me.currentSession, new HTTP_ERROR.NoPermission());
  yield this.me.currentSession.destroy();
  this.body = 'ok';
});
