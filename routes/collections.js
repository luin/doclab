var router = module.exports = new (require('koa-router'))();

router.param('collectionId', function *(id, next) {
  this.collection = yield Collection.find(id);
  this.assert(this.collection, new HTTP_ERROR.NotFound('Collection %s', id));

  this.project = yield this.collection.getProject();
  this.assert(this.project, 409);

  this.permission = yield this.me.getPermission(this.project);

  this.checkPermission = function(permission) {
    return ProjectTeam.higherPermission(permission, this.permission) === this.permission;
  };
  yield next;
});

router.get('/:collectionId', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  this.collection.setDataValue('project', this.project);

  this.body = this.collection;
});

router.get('/:collectionId/dirs', function *() {
  this.assert(this.checkPermission('read'), new HTTP_ERROR.NoPermission());
  this.body = yield this.collection.getDirs();
});

router.post('/:collectionId/dirs/_move', function *() {
  this.assert(this.checkPermission('write'), new HTTP_ERROR.NoPermission());

  var body = this.request.body;
  this.assert(body && body.UUID, new HTTP_ERROR.InvalidParameter('UUID is required'));
  if (typeof body.order !== 'undefined') {
    this.assert(typeof body.order === 'number', new HTTP_ERROR.InvalidParameter('order should be a number'));
  }
  this.assert(typeof body.parentUUID !== 'undefined' || typeof body.order !== 'undefined',
             new HTTP_ERROR.InvalidParameter('You should at least specified either parentUUID or order'));

  var doc = yield Doc.find({ where: { UUID: this.request.body.UUID } });
  this.assert(doc.CollectionId === this.collection.id, new HTTP_ERROR.NoPermission());

  if (typeof body.parentUUID !== 'undefined') {
    try {
      yield doc.setParent(body.parentUUID);
    } catch (err) {
      this.throw(new HTTP_ERROR.InvalidParameter(err.message));
    }
  }
  if (typeof body.order !== 'undefined') {
    console.log(body.order);
    yield doc.setOrder(body.order);
  }
  this.body = 'ok';
});
