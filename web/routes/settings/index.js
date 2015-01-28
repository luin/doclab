var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');
var attachments = require('../../libs/attachments');

router.get('/', function *() {
  this.redirect('/settings/profile');
});

router.get('/profile', middlewares.me(), middlewares.currentProject(), function *() {
  this.locals.sessiontoken = this.cookies.get('session-token');
  yield this.render('settings/profile');
});
