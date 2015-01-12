var router = module.exports = new (require('koa-router'))();

router.get('/:projectId/collections/:collectionId', function *() {
  yield this.render('index');
});

router.post('/', function *() {
  yield this.api.projects.post({
    name: this.request.body.name
  });

  this.redirect('/');
});
