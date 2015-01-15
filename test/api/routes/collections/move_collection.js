describe.only('POST /collections/:collectionId/_move', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.writer = fixtures.users[1];
    this.reader = fixtures.users[2];
    yield this.writer.addTeam(fixtures.teams[0]);
    yield this.reader.addTeam(fixtures.teams[1]);
    yield fixtures.teams[0].addProject(fixtures.projects[0], { permission: 'write' });
    yield fixtures.teams[1].addProject(fixtures.projects[0], { permission: 'read' });
    yield fixtures.projects[0].addCollection(fixtures.collections);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.collections(fixtures.collections[0].id)._move.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when collection is not found', function *() {
    try {
      yield API.$auth(this.writer.email, this.writer.password).collections(1993)._move.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    var collection = fixtures.collections[0];
    try {
      yield API.$auth(this.reader.email, this.reader.password).collections(collection.id)._move.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should move the collections', function *() {
    var project = fixtures.projects[0];
    var collections = fixtures.collections;
    var result = yield API.$auth(this.writer.email, this.writer.password).collections(collections[1].id)._move.post({
      order: 0
    });
    expect(result).to.eql('ok');
    expect(yield collections[1].reload()).to.have.property('order', 0);
  });
});
