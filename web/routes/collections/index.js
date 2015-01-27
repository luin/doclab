var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');

router.get('/new', middlewares.me(), function *() {
  yield this.render('/collections/new');
});

router.post('/:collectionId/_move', function *() {
  this.body = yield this.api.collections(this.params.collectionId)._move.post({
    order: parseInt(this.request.body.order, 10)
  });
});
