var router = module.exports = new (require('koa-router'))();
var config = require('config');

router.patch('/me', function *() {
  yield this.api.patch('/users/me', this.request.body);
  this.flash = { msgs: 'Updated successfully' };
  this.redirect(this.request.get('referer') || '/');
});
