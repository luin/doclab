describe('POST /collections/:collectionId/dirs/_move', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.writer = fixtures.users[1];
    this.reader = fixtures.users[2];
    yield this.writer.addTeam(fixtures.teams[0]);
    yield this.reader.addTeam(fixtures.teams[1]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'write' });
    yield fixtures.teams[1].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.post(`/collections/${fixtures.collections[0].id}/dirs/_move`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield route.post('/collections/1993/dirs/_move', null, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    var collection = fixtures.collections[0];
    try {
      yield route.post(`/collections/${collection.id}/dirs/_move`, null, {
        auth: [this.reader.email, this.reader.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    var collection = fixtures.collections[0];
    var url = `/collections/${collection.id}/dirs/_move`;
    try {
      yield route.post(url, null, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield route.post(url, { UUID: '123' }, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should set parent and order', function *() {
    var collection = fixtures.collections[0];
    var doc = fixtures.docs[3];
    var parentDoc = fixtures.docs[0];
    yield collection.addDocs(fixtures.docs.slice(0, 4));
    yield fixtures.docs[1].setParent(parentDoc.UUID);
    yield fixtures.docs[2].setParent(parentDoc.UUID);
    yield doc.setParent(fixtures.docs[2].UUID);
    yield route.post(`/collections/${collection.id}/dirs/_move`, {
      UUID: doc.UUID,
      parentUUID: parentDoc.UUID,
      order: 1
    }, {
      auth: [this.writer.email, this.writer.password]
    });
    var dirs = yield collection.getDirs();
    expect(dirs).to.have.length(1);
    expect(dirs[0].children).to.have.length(3);
    expect(dirs[0].children[1].UUID).to.eql(doc.UUID);
  });
});
