var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');

router.get('/:projectId', middlewares.me(), middlewares.currentProject({ fetch: true }), function *() {
  yield this.render('projects/show');
});

router.get('/:projectId/collections/:collectionId', function *() {
  yield this.render('index');
});

router.post('/:projectId/collections', function *() {
  var collection = yield this.api.projects(this.params.projectId).collections.post({
    name: this.request.body.name,
    description: this.request.body.description
  });
  this.flash = { msgs: 'Create successfully.' };
  this.redirect('/projects/' + this.params.projectId);
});

router.post('/', function *() {
  yield this.api.projects.post({
    name: this.request.body.name
  });

  this.redirect('/');
});

