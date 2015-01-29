var router = module.exports = new (require('koa-router'))();
var middlewares = require('../middlewares');

router.get('/', middlewares.me(), middlewares.currentProject(), function *() {
  this.redirect('/projects/' + this.locals.currentProject.id);
});

router.get('/launchpad', middlewares.me(), function *() {
  this.locals.projects = yield this.api.projects.get();
  yield this.render('launchpad');
});

router.post('/launchpad', function *() {
  var project = yield this.api.projects(this.request.body.projectId).get();
  middlewares.currentProject.select.call(this, project);
  this.redirect('/');
});
