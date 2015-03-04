var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');
var config = require('config');
var ot = require('ot-server').createClient(config.redis);

router.param('collectionId', function *(id, next) {
  this.locals.collection = yield this.api.get(`/collections/${id}`);
  this.locals.dirs = yield this.api.get(`/collections/${id}/dirs`);
  yield next;
});

router.get('/:collectionId', function *() {
  if (this.locals.dirs.length > 0) {
    this.redirect(`/collections/${this.params.collectionId}/docs/${this.locals.dirs[0].UUID}`);
  } else {
    yield this.render('/collections/empty');
  }
});

router.get('/:collectionId/docs/new', middlewares.me(), function *() {
  yield this.render('/collections/editor');
});

router.get('/:collectionId/docs/:docUUID', function *() {
  this.locals.doc = yield this.api.get(`/docs/${this.params.docUUID}`);
  yield this.render('/collections/show');
});

router.post('/:collectionId/_move', function *() {
  this.body = yield this.api.post(`/collections/${this.params.collectionId}/_move`, {
    order: parseInt(this.request.body.order, 10)
  });
});

router.post('/:collectionId/docs', function *() {
  this.body = yield this.api.post(`/collections/${this.params/collectionId}/docs`, this.request.body);
});
