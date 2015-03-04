describe('POST /collections/:collectionId/docs', function() {
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
      yield route.post(`/collections/${fixtures.collections[0].id}/docs`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield route.post('/collections/1993/docs', null, {
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
      yield route.post(`/collections/${collection.id}/docs`, null, {
        auth: [this.reader.email, this.reader.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    var collection = fixtures.collections[0];
    var url = `/collections/${collection.id}/docs`;
    try {
      yield route.post(url, null, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield route.post(url, { title: '123' }, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create a new doc', function *() {
    var collection = fixtures.collections[0];
    var doc = yield route.post(`/collections/${collection.id}/docs`, {
      title: 'new title',
      content: 'new content'
    }, {
      auth: [this.writer.email, this.writer.password]
    });
    expect(doc.title).to.eql('new title');
    expect(doc.content).to.eql('new content');
    expect(doc.current).to.eql(true);
    expect(doc.distance).to.eql(0);
    expect(doc.CollectionId).to.eql(collection.id);
    /* jshint expr:true */
    expect(doc.parentUUID).to.not.exist;
  });

  it('should set parentUUID if specified', function *() {
    var collection = fixtures.collections[0];
    var parentDoc = fixtures.docs[0];
    yield collection.addDocs(parentDoc);
    var doc = yield route.post(`/collections/${collection.id}/docs`, {
      title: 'new title',
      content: 'new content',
      parentUUID: parentDoc.UUID
    }, {
      auth: [this.writer.email, this.writer.password]
    });
    expect(doc.parentUUID).to.eql(parentDoc.UUID);
  });

  it('should return InvalidParameter and rollback when parentUUID is invalid', function *() {
    var collection = fixtures.collections[0];
    try {
      yield route.post(`/collections/${collection.id}/docs`, {
        title: 'new title',
        content: 'new content',
        parentUUID: 'invalid uuid'
      }, {
        auth: [this.writer.email, this.writer.password]
      });
    } catch(err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });
});
