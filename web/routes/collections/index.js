var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');
var config = require('config');
var ot = require('ot-server').createClient(config.redis);

router.get('/:collectionId', function *() {
  this.locals.collection = yield this.api.collections(this.params.collectionId).get();
  var dirs = yield this.api.collections(this.params.collectionId).dirs.get();
  if (dirs.length > 0) {
    this.redirect('/collections/' + this.params.collectionId + '/docs/' + dirs[0].UUID);
  } else {
    yield this.render('/collections/empty');
  }
});

router.get('/:collectionId/docs/new', middlewares.me(), function *() {
  yield this.render('/collections/editor');
});

router.post('/:collectionId/_move', function *() {
  this.body = yield this.api.collections(this.params.collectionId)._move.post({
    order: parseInt(this.request.body.order, 10)
  });
});
