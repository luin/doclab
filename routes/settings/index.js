var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');

router.get('/', function *() {
  this.redirect('/settings/profile');
});

router.get('/profile', middlewares.me(), middlewares.currentProject(), function *() {
  yield this.render('settings/profile');
});
