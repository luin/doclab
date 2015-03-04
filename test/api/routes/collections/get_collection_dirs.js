describe('GET /collections/:collectionId/dirs', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.reader = fixtures.users[1];
    this.guest = fixtures.users[2];
    yield this.reader.addTeam(fixtures.teams[0]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.get(`/collections/${fixtures.collections[0].id}/dirs`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield route.get('/collections/1993/dirs', {
        auth: [this.reader.email, this.reader.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have read permission', function *() {
    var collection = fixtures.collections[0];
    try {
      yield route.get(`/collections/${collection.id}/dirs`, {
        auth: [this.guest.email, this.guest.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return the collection\'s dirs', function *() {
    var collection = fixtures.collections[0];
    yield fixtures.collections[0].addDocs(fixtures.docs.slice(0, 4));
    yield fixtures.docs[1].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[2].setParent(fixtures.docs[0].UUID);
    yield fixtures.docs[3].setParent(fixtures.docs[2].UUID);
    var dirs = yield route.get(`/collections/${collection.id}/dirs`, {
      auth: [this.reader.email, this.reader.password]
    });
    expect(dirs).to.have.length(1);
    expect(dirs[0].children).to.have.length(2);
  });
});
