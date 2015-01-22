var router = module.exports = new (require('koa-router'))();
var middlewares = require('../middlewares');

router.get('/', middlewares.me(), middlewares.currentProject({ fetch: true }), function *() {
  yield this.render('index');
});

router.get('/launchpad', function *() {
  this.locals.projects = yield this.api.projects.get();
  yield this.render('launchpad');
});

router.post('/launchpad', function *() {
  var project = yield this.api.projects(this.request.body.projectId).get();
  console.log(project);
  middlewares.currentProject.select.call(this, project);
  this.redirect('/');
});
